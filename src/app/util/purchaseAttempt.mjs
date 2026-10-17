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
  memory.set(scope, value);
  try { globalThis.sessionStorage?.setItem(scope, JSON.stringify(value)); } catch { /* Best effort. */ }
}
export function clearAttempt(scope) {
  memory.delete(scope);
  try { globalThis.sessionStorage?.removeItem(scope); } catch { /* Best effort. */ }
}
export function definitiveFailure(error) {
  const status = error.response?.status;
  return status >= 400 && status < 500 && ![408, 425, 429].includes(status);
}
