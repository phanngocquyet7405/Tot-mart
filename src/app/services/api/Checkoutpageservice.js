// @ts-check
import { readAttempt, storeAttempt, clearAttempt, withAttemptLock, maskedAddress, referenceScope, startNewPurchase, createdReferenceByCode } from '@/app/util/purchaseAttempt.mjs';
import { userService } from '@/app/services/api/userService';
import { resolveAttempt } from '@/app/util/attemptLifecycle.mjs';
import { syncCartApi } from '@/app/services/api/productServices';
import { paymentGatewayService } from '@/app/services/api/paymentGatewayService';
import { getTokenUserId } from '@/app/middleware/tokenMiddleware';
import { axiosConfig } from './axiosConfig';

/**
 * @typedef {Object} CartItemInput
 * @property {string} [_id]
 * @property {string} [id]
 * @property {string} [itemType]
 * @property {number} quantity
 * @property {{ wrap?: string, message?: string }} [gift]
 * @property {string} [name]
 */

/**
 * @typedef {Object} PlaceOrderParams
 * @property {string} [addressId]
 * @property {string} paymentMethod
 * @property {string} [note]
 * @property {string} [couponCode]
 * @property {CartItemInput[]} [cartItems]
 * @property {number} [cartVersion]
 * @property {any} [address]
 * @property {boolean} [confirm]
 * @property {boolean} [terminate]
 * @property {string} [expectedKey]
 * @property {number[]} [backoffDelays]
 */

export const STEPS = [{ id: 'address', label: 'Địa chỉ', icon: 'MapPin' }, { id: 'review', label: 'Kiểm tra', icon: 'Package' }, { id: 'payment', label: 'Thanh toán', icon: 'CreditCard' }];
export const PAYMENT_METHODS = [{ id: 'cod', label: 'Thanh toán khi nhận hàng', desc: 'Trả tiền mặt khi nhận', available: true }, { id: 'online', label: 'Chuyển khoản QR (SePay)', desc: 'Xác nhận tự động qua ngân hàng', available: true }];
export const EMPTY_NEW_ADDRESS = { fullName: '', phone: '', street: '', ward: '', district: '', province: '' };

/**
 * Transform UI cart items to API cart payload.
 * @param {CartItemInput[]} items
 * @returns {Array<any>}
 */
export function toCartPayload(items) { return items.map(item => ({ [item.itemType === 'box' ? 'boxId' : 'productId']: item._id || item.id, quantity: item.quantity, gift: {wrap: item.gift?.wrap || 'none', message: item.gift?.message || ''} })); }

/**
 * Load authenticated user and their saved addresses for checkout.
 * @returns {Promise<{ success: boolean, user?: any, addresses?: any[], error?: string }>}
 */
export async function loadCheckoutUser() {
  try { const id = getTokenUserId(); if (!id) return { success: false, error: 'NO_TOKEN' }; const response = await userService.getUserById(id); return { success: true, user: response.data, addresses: response.data.addresses || [] }; }
  catch (/** @type {any} */ err) { return { success: false, error: err.message }; }
}

/**
 * Request checkout price quotation from backend.
 * @param {CartItemInput[]} items
 * @param {string} [couponCode]
 * @param {string} [userId]
 * @returns {Promise<any>}
 */
export async function quoteCart(items, couponCode, userId = getTokenUserId()) {
  const response = await axiosConfig.post(
    '/checkout/quote',
    { items: toCartPayload(items), ...(couponCode?.trim() ? { couponCode: couponCode.trim().toUpperCase() } : {}) },
    /** @type {any} */ ({ _requestUserId: userId })
  );
  return response.data;
}

/**
 * Validate coupon code against current cart items.
 * @param {string} code
 * @param {CartItemInput[]} items
 * @returns {Promise<{ valid: boolean, discount: number, quote?: any, message: string }>}
 */
export async function validateCoupon(code, items) {
  try { const quote = await quoteCart(items, code); return { valid: true, discount: quote.discountAmount, quote, message: 'Đã áp dụng mã giảm giá' }; }
  catch (/** @type {any} */ err) { return { valid: false, discount: 0, message: err.response?.data?.message || 'Không kiểm tra được mã giảm giá' }; }
}

// Delivery charge is agreed separately, never part of the new checkout total.
export function calcShippingFee() { return 0; }

/**
 * Retrieve pending checkout attempt if one exists.
 * @param {string} [key]
 * @param {string} [code]
 * @returns {import('@/app/util/purchaseAttempt.mjs').AttemptRecord | null}
 */
export function getPendingCheckout(key, code) {
  const scope = `totmart_checkout_attempt_${getTokenUserId() || 'guest'}`;
  const active = readAttempt(scope);
  if (code && active?.result?.orderCode !== code) return createdReferenceByCode(scope, code);
  return key && active?.key !== key ? readAttempt(referenceScope(scope, key)) : active;
}

/**
 * Check whether current session has an active pending checkout.
 * @returns {boolean}
 */
export function hasPendingCheckout() {
  return Boolean(readAttempt(`totmart_checkout_attempt_${getTokenUserId() || 'guest'}`));
}

/**
 * Start a new checkout transaction under attempt lock.
 * @param {string} key
 * @returns {Promise<any>}
 */
export function startNewCheckout(key) {
  const userId = getTokenUserId();
  if (!userId) throw new Error('Vui lòng đăng nhập.');
  return startNewPurchase(`totmart_checkout_attempt_${userId}`, key, () => getTokenUserId() || '', userId);
}

/**
 * Prepare, confirm, or recover order creation according to idempotent recovery contract.
 * @param {PlaceOrderParams} params
 * @returns {Promise<any>}
 */
export async function placeOrder({ addressId, paymentMethod, note, couponCode, cartItems = [], cartVersion, address, confirm = false, terminate = false, expectedKey, backoffDelays }) {
  const userId = getTokenUserId();
  if (!userId) return { success: false, error: 'Vui lòng đăng nhập.' };
  const scope = `totmart_checkout_attempt_${userId}`;
  let syncedVersion;
  try {
    return await withAttemptLock(scope, async () => {
      if (getTokenUserId() !== userId) throw new Error('Tài khoản đã thay đổi trong khi chờ khóa giao dịch.');
      let attempt = expectedKey ? (readAttempt(scope)?.key === expectedKey ? readAttempt(scope) : readAttempt(referenceScope(scope, expectedKey))) : readAttempt(scope);
      if (expectedKey && !attempt) throw new Error('Reference của tab này không còn khả dụng. Không gửi giao dịch khác.');
      const targetScope = attempt && attempt.key && readAttempt(scope)?.key !== attempt.key ? referenceScope(scope, attempt.key) : scope;
      if (attempt?.blocked) throw new Error('Dữ liệu khôi phục bị lỗi. Liên hệ TotMart để đối chiếu; không tạo đơn thay thế.');
      if (!attempt) {
        if (terminate || confirm) throw new Error('Không tìm thấy yêu cầu cũ. Kiểm tra lại dữ liệu trước khi bắt đầu.');
        if (!addressId || !['cod', 'online'].includes(paymentMethod)) throw new Error('Chọn địa chỉ và phương thức thanh toán hợp lệ.');
        if (note != null && (typeof note !== 'string' || note.length > 500)) throw new Error('Ghi chú tối đa 500 ký tự.');
        if (couponCode != null && (typeof couponCode !== 'string' || (couponCode && (couponCode.trim().length < 3 || couponCode.trim().length > 30)))) throw new Error('Mã giảm giá dài từ 3 đến 30 ký tự.');
        const synced = /** @type {any} */ (await syncCartApi(toCartPayload(cartItems), cartVersion, userId));
        syncedVersion = synced.version;
        if (synced.skipped?.length) throw new Error('Giỏ hàng có sản phẩm không còn bán. Kiểm tra lại giỏ hàng.');
        if (getTokenUserId() !== userId) throw new Error('Tài khoản đã thay đổi.');
        const quote = await quoteCart(cartItems, couponCode, userId);
        if (getTokenUserId() !== userId) throw new Error('Tài khoản đã thay đổi.');
        const payload = { addressId, paymentMethod, ...(note ? { note } : {}), ...(couponCode ? { couponCode: couponCode.trim().toUpperCase() } : {}), quoteFingerprint: quote.fingerprint };
        attempt = { userId, kind: 'products', key: crypto.randomUUID(), payload, serializedBody: JSON.stringify(payload), sentAt: Date.now(), summary: { items: cartItems.map(item => ({ name: item.name, quantity: item.quantity })), totalAmount: quote.totalAmount, address: maskedAddress(address), cart: JSON.stringify(toCartPayload(cartItems)) } };
      }
      attempt.userId ||= userId;
      attempt.kind ||= 'products';
      if (!storeAttempt(targetScope, attempt)) throw new Error('Hãy bật lưu trữ trình duyệt trước khi gửi yêu cầu.');
      const response = await resolveAttempt({ attempt, kind: 'products', api: axiosConfig, save: value => storeAttempt(targetScope, value), currentUser: () => getTokenUserId() || '', confirm, terminate, ...(backoffDelays ? { backoffDelays } : {}) });
      if (response.invalidated) { clearAttempt(targetScope); return { success: false, invalidated: true, error: 'Đã kết thúc lần thử. Kiểm tra lại thông tin trước khi chuẩn bị yêu cầu mới.' }; }
      if (response.prepared) return { success: false, prepared: true, error: 'Đã chuẩn bị. Kiểm tra địa chỉ BE xác nhận và tổng tiền, rồi bấm xác nhận.' };
      if (response.confirming) return { success: false, confirming: true, error: response.error || 'Hệ thống đang xác nhận kết quả giao dịch. Bấm kiểm tra lại để cập nhật.' };
      return { success: true, ...response.data, consumeCart: response.createdNow === true, paymentMethod: attempt.paymentMethod || attempt.payload?.paymentMethod || (attempt.serializedBody ? JSON.parse(attempt.serializedBody).paymentMethod : undefined) };
    });
  } catch (/** @type {any} */ err) {
    if (err.name === 'TimeoutError' || err.code === 'ECONNABORTED' || (err.response?.status >= 500 && err.response?.status <= 599)) {
      return { success: false, confirming: true, status: err.response?.status, cartVersion: err.response?.data?.version ?? syncedVersion,
        error: 'Hệ thống đang xác nhận kết quả giao dịch. Vui lòng bấm kiểm tra lại.' };
    }
    return { success: false, status: err.response?.status, cartVersion: err.response?.data?.version ?? syncedVersion,
      error: err.response?.data?.errors?.map((/** @type {any} */ error) => `${error.field}: ${error.message}`).join(' | ') || err.response?.data?.message || err.response?.data?.code || err.message || 'Chưa rõ kết quả. Kiểm tra lại yêu cầu cũ.' };
  }
}
export async function saveCheckoutAddress(/** @type {any} */ user, /** @type {any} */ draft) {
  const fields = ['street', 'ward', 'district', 'province'];
  if (!draft.fullName?.trim() || fields.some(key => !draft[key]?.trim()) || !/^(?:0\d{9}|\+[1-9]\d{7,14})$/.test(draft.phone?.trim() || ''))
    throw new Error('Điền đầy đủ địa chỉ và số điện thoại hợp lệ.');
  const payload = { fullName: draft.fullName.trim(), country: 'Việt Nam', city: draft.province.trim(), district: draft.district.trim(),
    address: `${draft.street.trim()}, ${draft.ward.trim()}`, phone: draft.phone.trim() };
  if (payload.address.length > 255 || payload.city.length > 100 || payload.district.length > 100)
    throw new Error('Địa chỉ quá dài. Vui lòng rút gọn.');
  const response = await userService.addAddress(user._id || user.id, payload);
  const addresses = response.data?.addresses;
  const previous = new Set((user.addresses || []).map((/** @type {any} */ item) => item._id));
  const selected = (/** @type {any} */ (addresses))?.findLast((/** @type {any} */ item) => !previous.has(item._id));
  if (!selected?._id) throw new Error('Chưa xác nhận được địa chỉ đã lưu. Hãy tải lại danh sách địa chỉ.');
  user.addresses = addresses;
  return { addresses, selected };
}

export function readOrderStatus(/** @type {any} */ response) {
  const data = response.data || {};
  const totalAmount = data.totalAmount ?? data.orders?.reduce((/** @type {number} */ sum, /** @type {any} */ order) => sum + order.totalAmount, 0) ?? 0;
  const remainingAmount = data.remainingAmount ?? (data.paymentStatus === 'paid' ? 0 : totalAmount);
  return { status: data.paymentStatus === 'paid' ? 'paid' : data.paymentStatus === 'cancelled' ? 'cancelled' : 'pending',
    cancelled: data.paymentStatus === 'cancelled' || (data.orders?.some((/** @type {any} */ order) => order.status === 'cancelled') ?? false),
    payable: Boolean(data.payable), qrUrl: data.payable && remainingAmount > 0 ? data.qrUrl : undefined,
    totalAmount, receivedAmount: data.receivedAmount ?? 0, remainingAmount, kind: data.kind, expiresAt: data.expiresAt };

}

/**
 * @param {string} paymentCode
 * @param {{ intervalMs?: number, timeoutMs?: number, onStatusChange?: (info: any) => void }} [options]
 */
export function pollPaymentStatus(paymentCode, { intervalMs = 4000, timeoutMs = 600000, onStatusChange } = {}) {
  const controller = new AbortController();
  let stopped = false;
  /** @type {any} */
  let timer;
  const stop = () => { stopped = true; clearTimeout(timer); clearTimeout(deadline); controller.abort(); };
  const deadline = setTimeout(() => { if (!stopped) { stop(); onStatusChange?.({ status: 'timeout' }); } }, timeoutMs);
  const tick = async () => {
    try { const response = await paymentGatewayService.getOrderStatus(paymentCode, controller.signal); if (stopped) return; const info = readOrderStatus(response); if (info.status === 'paid' || info.cancelled) { stop(); onStatusChange?.({ ...info, status: info.cancelled ? 'cancelled' : 'paid' }); return; } onStatusChange?.(info); }
    catch { if (stopped) return; } // A transient network error is retried until the wall-clock deadline.
    if (!stopped) timer = setTimeout(tick, intervalMs);
  };
  void tick(); return stop;
}

/**
 * @param {string} code
 */
export async function checkPaymentNow(code) {
  try {
    return readOrderStatus(await paymentGatewayService.getOrderStatus(code, undefined));
  } catch (/** @type {any} */ err) {
    return { status: 'error', error: err.response?.data?.message || err.message };
  }
}