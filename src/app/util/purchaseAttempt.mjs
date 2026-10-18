// Keep an unresolved purchase immutable across retries, even if the draft changes.
const memory = new Map();
export function readAttempt(scope) {
  if (memory.has(scope)) return memory.get(scope);
  try {
    const value = JSON.parse(globalThis.sessionStorage?.getItem(scope) || 'null');
    // Older FE releases persisted the request inside signature instead of payload.
    if (value?.key && !value.payload && value.signature) {
      const old = JSON.parse(value.signature);
      const payload = old.payload || old;
      if (payload.addressId || payload.templateId) value.payload = payload;
    }
    if (value?.key && value.payload) { memory.set(scope, value); return value; }
  } catch { /* Browser storage may be disabled. Memory still protects this tab. */ }
  return null;
}
export function storeAttempt(scope, value) {
  const serialized = JSON.stringify(value);
  memory.set(scope, JSON.parse(serialized));
  try {
    if (!globalThis.sessionStorage) return false;
    globalThis.sessionStorage.setItem(scope, serialized);
    return globalThis.sessionStorage.getItem(scope) === serialized;
  } catch { return false; }
}
export function clearAttempt(scope) {
  memory.delete(scope);
  try { globalThis.sessionStorage?.removeItem(scope); } catch { /* Best effort. */ }
}
// HTTP status alone cannot prove that an earlier ambiguous request did not commit.
export function definitiveFailure() { return false; }
export const ATTEMPT_TTL_MS = 24 * 60 * 60 * 1000;
export function needsReconciliation(attempt, now = Date.now()) {
  return !attempt?.sentAt || now - attempt.sentAt >= ATTEMPT_TTL_MS;
}
export function maskedAddress(address) {
  return address ? [address.district, address.city || address.province, address.phone ? '***' + address.phone.slice(-3) : ''].filter(Boolean).join(', ') : 'Chưa lưu tóm tắt địa chỉ';
}
