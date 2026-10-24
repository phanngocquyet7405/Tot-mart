import { jwtDecode } from 'jwt-decode';
let accessToken = null;
let sessionUser = null;
export function getAccessToken() { return accessToken; }
export function saveSessionUser(user) { sessionUser = user; }
export function getDecodedToken() {
  if (!accessToken) return sessionUser;
  try { return jwtDecode(accessToken); } catch { accessToken = null; return sessionUser; }
}
export function checkTokenValid() { return Boolean(sessionUser || (getDecodedToken()?.exp * 1000 > Date.now())); }
export function getTokenRole() { return sessionUser?.role || getDecodedToken()?.role || null; }
export function getTokenUserId() { const user = sessionUser || getDecodedToken(); return user?._id || user?.userId || null; }
export function getStoredUser() { return sessionUser; }
export function saveToken(token) {
  accessToken = token;
  if (typeof window !== 'undefined') {
    for (const name of ['localStorage', 'sessionStorage']) {
      try { globalThis[name]?.removeItem('token'); globalThis[name]?.removeItem('user'); } catch { /* Storage may be disabled; authentication stays in memory. */ }
    }
  }
}
const PURGEABLE_UNCOMMITTED_STATES = new Set(['invalidated', 'rejected']);
const AMBIGUOUS_OR_COMMITTED_STATES = new Set([
  'created',
  'confirming',
  'processing',
  'unknown',
  'terminationRequested',
]);

export function cleanupUncommittedAttempts() {
  if (typeof window === 'undefined') return;
  for (const storageName of ['localStorage', 'sessionStorage']) {
    try {
      const storage = globalThis[storageName];
      if (!storage) continue;
      const keys = Object.keys(storage).filter(k => k.startsWith('totmart_checkout_attempt_'));
      for (const k of keys) {
        try {
          const item = JSON.parse(storage.getItem(k));
          if (!item) continue;
          // GIỮ các trạng thái có thể đã commit hoặc đang xử lý ở BE
          if (AMBIGUOUS_OR_COMMITTED_STATES.has(item.state) || item.terminationRequested === true) {
            continue;
          }
          // CHỈ xóa trạng thái chắc chắn chưa commit:
          // 1. invalidated, rejected
          // 2. prepare lỗi trước hash (không có hash và không có result)
          if (PURGEABLE_UNCOMMITTED_STATES.has(item.state) || (!item.hash && !item.result)) {
            storage.removeItem(k);
          }
        } catch {}
      }
    } catch {}
  }
}
export function clearSession() {
  accessToken = null;
  sessionUser = null;
  cleanupUncommittedAttempts();
}
export function handleExpiredToken() {
  clearSession();
  if (typeof window !== 'undefined' && !['/login', '/register', '/forgot-password', '/reset-password'].includes(window.location.pathname)) window.location.href = '/login?session=expired';
}
