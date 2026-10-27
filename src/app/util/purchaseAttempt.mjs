// @ts-check
// Keep an unresolved purchase immutable across retries, even if the draft changes.

/**
 * @typedef {Object} AttemptResult
 * @property {string} [orderId]
 * @property {string} [_id]
 * @property {string} [orderCode]
 * @property {string} [paymentCode]
 * @property {number} [totalAmount]
 * @property {any} [shippingPayment]
 */

/**
 * @typedef {Object} AttemptRecord
 * @property {string} [userId]
 * @property {string} [kind]
 * @property {string} [key]
 * @property {string} [state]
 * @property {string} [hash]
 * @property {any} [payload]
 * @property {string} [serializedBody]
 * @property {string} [signature]
 * @property {any} [summary]
 * @property {AttemptResult} [result]
 * @property {string} [paymentMethod]
 * @property {number} [sentAt]
 * @property {string} [legacyScope]
 * @property {boolean} [blocked]
 * @property {boolean} [confirmed]
 * @property {boolean} [terminationRequested]
 * @property {boolean} [canRestart]
 * @property {any} [address]
 * @property {any} [error]
 * @property {any} [snapshot]
 * @property {any} [ambiguousError]
 */

/** @type {Map<string, any>} */
const memory = new Map();

/**
 * Read the current attempt from localStorage/sessionStorage with fallback to in-memory cache.
 * @param {string} scope
 * @returns {AttemptRecord | null}
 */
export function readAttempt(scope) {
  let raw;
  try {
    raw = globalThis.localStorage?.getItem(scope) || globalThis.sessionStorage?.getItem(scope);
    const value = JSON.parse(raw || 'null');
    // Older FE releases persisted the request inside signature instead of payload.
    if (value?.key && !value.payload && value.signature) {
      const old = JSON.parse(value.signature);
      const payload = old.payload || old;
      if (payload.addressId || payload.templateId) value.payload = payload;
    }
    if (value?.key) { memory.set(scope, value); return value; }
    if (value) return { blocked: true };
    memory.delete(scope);
  } catch {
    if (raw) return { blocked: true, summary: { address: 'Dữ liệu khôi phục bị lỗi. Liên hệ TotMart để đối chiếu.' } };
    // Browser storage may be disabled. Memory still protects this tab.
  }
  return memory.get(scope) || null;
}
/**
 * Store an attempt snapshot in memory and browser storage.
 * @param {string} scope
 * @param {AttemptRecord|any} value
 * @returns {boolean}
 */
export function storeAttempt(scope, value) {
  const serialized = JSON.stringify(value);
  let targetScope = scope;
  try {
    // If saving to the primary active scope, verify that another tab hasn't already allocated a newer attempt with a different key.
    if (!scope.includes(':created:') && value?.key) {
      const activeRaw = globalThis.localStorage?.getItem(scope) || globalThis.sessionStorage?.getItem(scope);
      if (activeRaw) {
        try {
          const activeObj = JSON.parse(activeRaw);
          if (activeObj?.key && activeObj.key !== value.key) {
            targetScope = referenceScope(scope, value.key);
          }
        } catch { /* parse failure; fall through */ }
      }
    }
  } catch { /* storage access error */ }

  memory.set(targetScope, JSON.parse(serialized));
  try {
    if (!globalThis.localStorage) return false;
    globalThis.localStorage.setItem(targetScope, serialized);
    globalThis.dispatchEvent?.(new Event('totmart:attempt-changed'));
    return globalThis.localStorage.getItem(targetScope) === serialized;
  } catch { return false; }
}
/**
 * Clear attempt from in-memory cache and browser storage.
 * @param {string} scope
 */
export function clearAttempt(scope) {
  memory.delete(scope);
  try { globalThis.localStorage?.removeItem(scope); globalThis.sessionStorage?.removeItem(scope); globalThis.dispatchEvent?.(new Event('totmart:attempt-changed')); } catch { /* Best effort. */ }
}

/**
 * Read subscription attempt with legacy fallback support.
 * @param {string} scope
 * @returns {AttemptRecord | null}
 */
export function readSubscriptionAttempt(scope) {
  const current = readAttempt(scope);
  if (current) return current;
  for (const storageName of ['localStorage', 'sessionStorage']) {
    try {
      const storage = storageName === 'localStorage' ? globalThis.localStorage : globalThis.sessionStorage;
      for (let i = 0; storage && i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(scope + '_')) {
          const attempt = readAttempt(key);
          if (attempt) return { ...attempt, legacyScope: key };
        }
      }
    } catch { /* Leave unavailable legacy references intact. */ }
  }
  return null;
}

/**
 * Check if attempt lacks key or content needed for resolution.
 * @param {AttemptRecord|null} attempt
 * @returns {boolean}
 */
export function needsReconciliation(attempt) {
  return !attempt?.key || !(attempt.hash || attempt.serializedBody || attempt.payload);
}

/**
 * Execute action within a Web Lock to prevent multi-tab race conditions.
 * @template T
 * @param {string} scope
 * @param {() => Promise<T>} action
 * @returns {Promise<T>}
 */
export async function withAttemptLock(scope, action) {
  if (!globalThis.navigator?.locks) throw new Error('Trình duyệt cần hỗ trợ khóa giao dịch nhiều tab. Vui lòng dùng trình duyệt mới.');
  return globalThis.navigator.locks.request(scope, action);
}

/**
 * Format address summary masking sensitive parts.
 * @param {any} address
 * @returns {string}
 */
export function maskedAddress(address) {
  return address ? [address.district, address.city || address.province, address.phone ? '***' + address.phone.slice(-3) : ''].filter(Boolean).join(', ') : 'Chưa lưu tóm tắt địa chỉ';
}

/**
 * Generate historical reference storage key for an attempt.
 * @param {string} scope
 * @param {string} key
 * @returns {string}
 */
export function referenceScope(scope, key) { return `${scope}:created:${key}`; }

/**
 * Find historical reference by orderCode.
 * @param {string} scope
 * @param {string} code
 * @returns {AttemptRecord | null}
 */
export function createdReferenceByCode(scope, code) {
  try {
    const storage = globalThis.localStorage;
    for (let i = 0; storage && i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(`${scope}:created:`)) {
        const value = readAttempt(key);
        if (value?.state === 'created' && value.result?.orderCode === code) return value;
      }
    }
  } catch { /* A payment URL can still recover through the authenticated BE. */ }
  return null;
}

/**
 * Archive confirmed attempt to history and initialize a new purchase.
 * @param {string} scope
 * @param {string} expectedKey
 * @param {() => string} currentUser
 * @param {string} userId
 * @returns {Promise<any>}
 */
export async function startNewPurchase(scope, expectedKey, currentUser, userId) {
  return withAttemptLock(scope, async () => {
    if (!userId || currentUser() !== userId) throw new Error('Tài khoản đã thay đổi.');
    const attempt = readAttempt(scope);
    if (!expectedKey || attempt?.key !== expectedKey || attempt.state !== 'created' || !attempt.result?.orderCode || !attempt.hash) throw new Error('Cần xác nhận giao dịch cũ đã tồn tại trước khi bắt đầu giao dịch mới.');
    const result = attempt.result;
    const reference = { userId, kind: attempt.kind, key: attempt.key, hash: attempt.hash, state: 'created', result: { orderId: result.orderId, _id: result._id, orderCode: result.orderCode, paymentCode: result.paymentCode, totalAmount: result.totalAmount }, paymentMethod: attempt.payload?.paymentMethod || attempt.paymentMethod, sentAt: attempt.sentAt };
    if (!storeAttempt(referenceScope(scope, attempt.key), reference)) throw new Error('Không lưu được reference cũ. Chưa thể bắt đầu giao dịch mới.');
    // Remove the active pointer only after a durable minimal history reference exists.
    globalThis.localStorage.removeItem(scope);
    globalThis.sessionStorage?.removeItem(scope);
    if (globalThis.localStorage.getItem(scope)) throw new Error('Không thể giải phóng reference cũ.');
    memory.delete(scope);
    if (attempt.legacyScope) clearAttempt(attempt.legacyScope);
    globalThis.dispatchEvent?.(new Event('totmart:attempt-changed'));
    return reference;
  });
}
