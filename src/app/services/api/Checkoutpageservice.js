import { userService } from '@/app/services/api/userService';
import { checkoutService } from '@/app/services/api/checkoutService';
import { syncCartApi } from '@/app/services/api/productServices';
import { paymentGatewayService } from '@/app/services/api/paymentGatewayService';
import { getTokenUserId } from '@/app/middleware/tokenMiddleware';
import { axiosConfig } from './axiosConfig';
export const STEPS = [{ id: 'address', label: 'Địa chỉ', icon: 'MapPin' }, { id: 'review', label: 'Kiểm tra', icon: 'Package' }, { id: 'payment', label: 'Thanh toán', icon: 'CreditCard' }];
export const PAYMENT_METHODS = [{ id: 'cod', label: 'Thanh toán khi nhận hàng', desc: 'Trả tiền mặt khi nhận', available: true }, { id: 'online', label: 'Chuyển khoản QR (SePay)', desc: 'Xác nhận tự động qua ngân hàng', available: true }];
export const EMPTY_NEW_ADDRESS = { fullName: '', phone: '', street: '', ward: '', district: '', province: '' };
export function toCartPayload(items) { return items.map(item => ({ [item.itemType === 'box' ? 'boxId' : 'productId']: item._id || item.id, quantity: item.quantity })); }
export async function loadCheckoutUser() {
  try { const id = getTokenUserId(); if (!id) return { success: false, error: 'NO_TOKEN' }; const response = await userService.getUserById(id); return { success: true, user: response.data, addresses: response.data.addresses || [] }; }
  catch (err) { return { success: false, error: err.message }; }
}
export async function quoteCart(items, couponCode) {
  const response = await axiosConfig.post('/checkout/quote', { items: toCartPayload(items), ...(couponCode?.trim() ? { couponCode: couponCode.trim().toUpperCase() } : {}) });
  return response.data;
}
export async function validateCoupon(code, items) {
  try { const quote = await quoteCart(items, code); return { valid: true, discount: quote.discountAmount, quote, message: 'Đã áp dụng mã giảm giá' }; }
  catch (err) { return { valid: false, discount: 0, message: err.response?.data?.message || 'Không kiểm tra được mã giảm giá' }; }
}
export function calcShippingFee(total, hasProducts) { return hasProducts && total < 500000 ? 30000 : 0; }
export async function placeOrder({ addressId, paymentMethod, note, couponCode, cartItems = [], quoteFingerprint, cartVersion }) {
  const payload = { addressId, paymentMethod, ...(note ? { note } : {}), ...(couponCode ? { couponCode: couponCode.trim().toUpperCase() } : {}), ...(quoteFingerprint ? { quoteFingerprint } : {}) };
  const scope = `totmart_checkout_attempt_${getTokenUserId() || 'guest'}`;
  const signature = JSON.stringify({ payload, items: toCartPayload(cartItems) });
  let attempt, syncedVersion;
  try {
    if (!addressId) return { success: false, error: 'Thiếu địa chỉ giao hàng' };
    if (typeof window !== 'undefined') { try { attempt = JSON.parse(sessionStorage.getItem(scope) || 'null'); } catch { attempt = null; } }
    if (!attempt || attempt.signature !== signature) {
      attempt = { key: globalThis.crypto.randomUUID(), signature };
      const synced = await syncCartApi(toCartPayload(cartItems), cartVersion);
      syncedVersion = synced.version;
      attempt.cartVersion = syncedVersion;
      if (synced.skipped?.length) return { success: false, skipped: synced.skipped, error: 'Sản phẩm không còn tồn tại. Vui lòng kiểm tra giỏ hàng.' };
      if (typeof window !== 'undefined') sessionStorage.setItem(scope, JSON.stringify(attempt));
    }
    const response = await checkoutService.createOrder(payload, attempt.key);
    if (!response.success) return { success: false, error: response.message };
    if (typeof window !== 'undefined') sessionStorage.removeItem(scope);
    return { success: true, ...response.data };
  } catch (err) {
    // Keep the key on ambiguous network/5xx failures; retry the same attempt.
    const status = err.response?.status;
    if (status && status < 500 && typeof window !== 'undefined') sessionStorage.removeItem(scope);
    return { success: false, status, cartVersion: syncedVersion ?? attempt?.cartVersion, error: err.response?.data?.message || err.message };
  }
}
export function readOrderStatus(response) {
  const data = response.data || {};
  return { status: data.paymentStatus === 'paid' ? 'paid' : data.paymentStatus === 'cancelled' ? 'cancelled' : 'pending', cancelled: data.paymentStatus === 'cancelled' || (data.orders?.some(order => order.status === 'cancelled') ?? false), qrUrl: data.payable ? data.qrUrl : undefined, totalAmount: data.totalAmount ?? data.orders?.reduce((sum, order) => sum + order.totalAmount, 0) ?? 0, kind: data.kind, expiresAt: data.expiresAt };
}
export function pollPaymentStatus(paymentCode, { intervalMs = 4000, timeoutMs = 600000, onStatusChange } = {}) {
  const controller = new AbortController(); let stopped = false, timer;
  const stop = () => { stopped = true; clearTimeout(timer); clearTimeout(deadline); controller.abort(); };
  const deadline = setTimeout(() => { if (!stopped) { stop(); onStatusChange?.({ status: 'timeout' }); } }, timeoutMs);
  const tick = async () => {
    try { const response = await paymentGatewayService.getOrderStatus(paymentCode, controller.signal); if (stopped) return; const info = readOrderStatus(response); if (info.status === 'paid' || info.cancelled) { stop(); onStatusChange?.({ status: info.cancelled ? 'cancelled' : 'paid' }); return; } }
    catch { if (stopped) return; } // A transient network error is retried until the wall-clock deadline.
    if (!stopped) timer = setTimeout(tick, intervalMs);
  };
  void tick(); return stop;
}
export async function checkPaymentNow(code) { try { return readOrderStatus(await paymentGatewayService.getOrderStatus(code)); } catch (err) { return { status: 'error', error: err.response?.data?.message || err.message }; } }
