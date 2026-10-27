// @ts-check
// Transport is injected so recovery behavior is exercised independently of React.

/**
 * @typedef {Object} ResolveAttemptParams
 * @property {import('./purchaseAttempt.mjs').AttemptRecord} attempt
 * @property {string} kind
 * @property {any} api
 * @property {(data: any) => Promise<boolean> | boolean} save
 * @property {() => string} currentUser
 * @property {boolean} [terminate]
 * @property {boolean} [confirm]
 * @property {number} [timeoutMs]
 * @property {number[]} [backoffDelays]
 */

/**
 * @typedef {Object} ResolveAttemptResult
 * @property {boolean} [success]
 * @property {any} [data]
 * @property {boolean} [invalidated]
 * @property {boolean} [prepared]
 * @property {boolean} [confirming]
 * @property {string} [state]
 * @property {string} [error]
 * @property {boolean} [createdNow]
 * @property {import('./purchaseAttempt.mjs').AttemptRecord} [attempt]
 */

export const ATTEMPT_CLIENT_TIMEOUT_MS = 35000;
export const LOOKUP_BACKOFF_DELAYS = [2000, 4000, 8000, 12000];

/**
 * Detect ambiguous errors (timeout, 5xx, network drops) that require confirming lookup.
 * @param {any} err
 * @returns {boolean}
 */
export function isAmbiguousError(err) {
  if (!err) return false;
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT' || err.name === 'TimeoutError') return true;
  const status = err.response?.status;
  if (status && status >= 500 && status <= 599) return true;
  const msg = String(err.message || '').toLowerCase();
  if (msg.includes('timeout') || msg.includes('network error') || msg.includes('econnreset') || msg.includes('client timeout')) return true;
  return false;
}

/**
 * Resolves or transitions an attempt through the backend recovery contract.
 * @param {ResolveAttemptParams} params
 * @returns {Promise<ResolveAttemptResult>}
 */
export async function resolveAttempt({
  attempt,
  kind,
  api,
  save,
  currentUser,
  terminate = false,
  confirm = false,
  timeoutMs = ATTEMPT_CLIENT_TIMEOUT_MS,
  backoffDelays = LOOKUP_BACKOFF_DELAYS,
}) {
  const checkUser = () => {
    if (String(currentUser()) !== attempt.userId) throw new Error('Đăng nhập lại đúng tài khoản của yêu cầu cũ.');
  };
  checkUser();
  if (attempt.kind && attempt.kind !== kind) throw new Error('Loại giao dịch cũ không khớp. Liên hệ TotMart để đối chiếu.');
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(attempt.key || '')) throw new Error('Reference cũ thiếu hoặc không hợp lệ. Liên hệ TotMart để đối chiếu, không tạo key thay thế.');
  const body = attempt.serializedBody || (attempt.payload && JSON.stringify(attempt.payload));
  // Bind transport as well as response persistence to the attempt owner. Axios
  // dispatch/refresh may run after the synchronous identity check above.
  const transport = api;
  api = {
    post: (/** @type {string} */ url, /** @type {any} */ data, /** @type {any} */ options) => transport.post(url, data, { ...options, _requestUserId: attempt.userId }),
    get: (/** @type {string} */ url, /** @type {any} */ options) => transport.get(url, { ...options, _requestUserId: attempt.userId }),
  };
  const persist = async (/** @type {any} */ data) => {
    checkUser();
    if (data.key && data.key !== attempt.key) throw new Error('Reference trả về không khớp yêu cầu cũ. Giữ nguyên lần thử để đối chiếu.');
    if (data.hash && attempt.hash && data.hash !== attempt.hash) throw new Error('Hash trả về không khớp reference cũ.');
    if (data.result) {
      // Replay subscriptions contain shipping details; retain only recovery identifiers.
      const result = data.result;
      data = { ...data, result: { _id: result._id, orderId: result.orderId, orderCode: result.orderCode || result.paymentCode, paymentCode: result.paymentCode, totalAmount: result.totalAmount, shippingPayment: result.shippingPayment } };
    }
    attempt = { ...attempt, ...data, serializedBody: body };
    delete attempt.address; // Keep a single authoritative snapshot, not a duplicate.
    if (!await save(attempt)) throw new Error('Không lưu được kết quả. Giữ yêu cầu cũ và thử kiểm tra lại.');
  };
  const base = `/checkout/attempts/${kind}`;
  // Without a server hash, termination must not depend on prepare/address lookup.
  // A lost response is recovered by retrying these exact bytes and path.
  terminate ||= attempt.terminationRequested === true && !attempt.hash;
  if (terminate && !attempt.hash && attempt.state !== 'created') {
    if (!body) throw new Error('Thiếu body gốc để kết thúc yêu cầu. Liên hệ TotMart để đối chiếu.');
    await persist({ terminationRequested: true });
    checkUser();
    let response;
    try {
      response = await api.post(`${base}/${attempt.key}/terminate-with-body`, body);
    } catch (/** @type {any} */ err) {
      if (isAmbiguousError(err)) {
        await persist({ state: 'confirming', ambiguousError: { status: err.response?.status, message: err.message } });
        return { success: false, confirming: true, state: 'confirming', error: 'Đang xác nhận kết thúc yêu cầu. Vui lòng bấm thử lại.' };
      }
      throw err;
    }
    if (!response.success || response.data?.key !== attempt.key || !/^[a-f0-9]{64}$/.test(response.data?.hash || '') || !['invalidated', 'created'].includes(response.data?.state)) throw new Error('Chưa xác nhận kết thúc yêu cầu. Giữ nguyên reference và thử lại.');
    await persist(response.data);
    if (attempt.state === 'invalidated' && attempt.canRestart === true) return { invalidated: true };
    if (attempt.state === 'created' && attempt.result?.orderCode) return { success: true, data: attempt.result };
    throw new Error('Chưa có xác nhận cho phép bắt đầu lần thử mới.');
  }
  let preparedNow = false;
  if (!attempt.hash) {
    if (!body) throw new Error('Yêu cầu cũ thiếu nội dung và hash. Liên hệ TotMart để đối chiếu; không tạo đơn thay thế.');
    let response;
    try {
      response = await api.post(`${base}/prepare`, body, { headers: { 'Idempotency-Key': attempt.key } });
    } catch (/** @type {any} */ err) {
      if (isAmbiguousError(err)) {
        await persist({ state: 'confirming', ambiguousError: { status: err.response?.status, message: err.message } });
        return { success: false, confirming: true, state: 'confirming', error: 'Đang xác nhận trạng thái chuẩn bị. Vui lòng bấm thử lại.' };
      }
      throw err;
    }
    if (!response.success || !/^[a-f0-9]{64}$/.test(response.data?.hash || '')) throw new Error('Chưa nhận được hash xác nhận. Giữ yêu cầu cũ để kiểm tra lại.');
    await persist({ ...response.data, snapshot: response.data.address, confirmed: false });
    preparedNow = true;
  }
  const headers = { 'Attempt-Payload-Hash': attempt.hash };
  checkUser();
  if (!/^[a-f0-9]{64}$/.test(attempt.hash || '')) throw new Error('Hash cũ không hợp lệ. Liên hệ TotMart để đối chiếu.');
  let response;
  try {
    response = terminate && attempt.state !== 'created'
      ? await api.post(`${base}/${attempt.key}/terminate`, undefined, { headers })
      : await api.get(`${base}/${attempt.key}`, { headers });
  } catch (/** @type {any} */ err) {
    if (isAmbiguousError(err)) {
      await persist({ state: 'confirming', ambiguousError: { status: err.response?.status, message: err.message } });
      return { success: false, confirming: true, state: 'confirming', error: 'Đang kiểm tra trạng thái giao dịch. Vui lòng bấm thử lại.' };
    }
    throw err;
  }
  if (!response.success || !['unknown', 'processing', 'created', 'rejected', 'invalidated'].includes(response.data?.state)) throw new Error('Chưa xác nhận được trạng thái yêu cầu.');
  await persist(response.data);
  if (attempt.state === 'created') {
    if (!attempt.result?.orderCode) throw new Error('Giao dịch đã tạo nhưng thiếu mã đối chiếu. Liên hệ TotMart; không tạo đơn thay thế.');
    return { success: true, data: attempt.result };
  }
  if (attempt.state === 'invalidated' && attempt.canRestart === true) return { invalidated: true };
  if (terminate) throw new Error('Chưa thể kết thúc yêu cầu. Hãy kiểm tra lại.');
  if (attempt.state === 'invalidated') throw new Error('Chưa có xác nhận canRestart. Kiểm tra lại lần thử cũ.');
  if (attempt.state === 'rejected') throw new Error(attempt.error?.message || 'Yêu cầu bị từ chối. Kết thúc lần thử trước khi thay đổi.');
  if (preparedNow || !confirm) return { prepared: true, attempt };
  if (!body) throw new Error('Thiếu nội dung yêu cầu cũ. Có thể kiểm tra hoặc kết thúc lần thử, không thể gửi create.');
  if (kind === 'products' && !attempt.snapshot) throw new Error('Thiếu địa chỉ đã xác nhận. Kết thúc lần thử trước khi chọn lại địa chỉ.');
  checkUser();
  await persist({ confirmed: true });
  let created;
  try {
    created = await api.post(kind === 'products' ? '/checkout/check-out' : '/subcribe-plans/user-subscribe', body, { headers: { 'Idempotency-Key': attempt.key } });
  } catch (/** @type {any} */ err) {
    if (isAmbiguousError(err)) {
      // KẾT QUẢ CHƯA RÕ: timeout, 5xx hoặc 503
      // Cập nhật trạng thái "confirming", giữ nguyên key/body
      await persist({ state: 'confirming', ambiguousError: { status: err.response?.status, message: err.message } });
      // Lookup với backoff bằng cùng key và hash
      if (attempt.hash) {
        for (const delay of backoffDelays) {
          if (delay > 0) await new Promise(r => setTimeout(r, delay));
          try {
            const lookup = await api.get(`${base}/${attempt.key}`, { headers: { 'Attempt-Payload-Hash': attempt.hash } });
            if (lookup.success && lookup.data) {
              if (['created', 'invalidated', 'rejected'].includes(lookup.data.state)) {
                await persist(lookup.data);
                if (attempt.state === 'created' && attempt.result?.orderCode) {
                  return { success: true, data: attempt.result, createdNow: true };
                }
                if (attempt.state === 'invalidated') {
                  if (attempt.canRestart === true) return { invalidated: true };
                  throw new Error('Chưa có xác nhận canRestart. Kiểm tra lại lần thử cũ.');
                }
              }
            }
          } catch {
            // Tiếp tục chuỗi backoff
          }
        }
      }
      return {
        success: false,
        confirming: true,
        state: 'confirming',
        error: 'Hệ thống đang xác nhận kết quả giao dịch. Vui lòng bấm "Kiểm tra lại" để cập nhật trạng thái đơn hàng.'
      };
    }
    throw err;
  }
  if (!created.success || !created.data?.orderCode) throw new Error('Chưa xác nhận mã giao dịch. Kiểm tra lại yêu cầu cũ.');
  await persist({ state: 'created', result: created.data, canRestart: false });
  return { ...created, createdNow: true };
}