// Keep an unresolved purchase immutable across retries, even if the draft changes.
const memory = new Map();
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
export function storeAttempt(scope, value) {
  const serialized = JSON.stringify(value);
  memory.set(scope, JSON.parse(serialized));
  try {
    if (!globalThis.localStorage) return false;
    globalThis.localStorage.setItem(scope, serialized);
    globalThis.dispatchEvent?.(new Event('totmart:attempt-changed'));
    return globalThis.localStorage.getItem(scope) === serialized;
  } catch { return false; }
}
export function clearAttempt(scope) {
  memory.delete(scope);
  try { globalThis.localStorage?.removeItem(scope); globalThis.sessionStorage?.removeItem(scope); globalThis.dispatchEvent?.(new Event('totmart:attempt-changed')); } catch { /* Best effort. */ }
}
export function readSubscriptionAttempt(scope) {
  const current = readAttempt(scope);
  if (current) return current;
  for (const storageName of ['localStorage', 'sessionStorage']) {
    try {
      const storage = globalThis[storageName];
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
export function needsReconciliation(attempt) {
  return !attempt?.key || !(attempt.hash || attempt.serializedBody || attempt.payload);
}
// A browser-wide lock prevents two tabs allocating different keys for one scope.
export async function withAttemptLock(scope, action) {
  if (!globalThis.navigator?.locks) throw new Error('Trình duyệt cần hỗ trợ khóa giao dịch nhiều tab. Vui lòng dùng trình duyệt mới.');
  return globalThis.navigator.locks.request(scope, action);
}
export function maskedAddress(address) {
  return address ? [address.district, address.city || address.province, address.phone ? '***' + address.phone.slice(-3) : ''].filter(Boolean).join(', ') : 'Chưa lưu tóm tắt địa chỉ';
}
