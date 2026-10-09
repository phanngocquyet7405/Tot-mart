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
  if (typeof window !== 'undefined') { localStorage.removeItem('token'); localStorage.removeItem('user'); sessionStorage.removeItem('token'); sessionStorage.removeItem('user'); }
}
export function clearSession() { accessToken = null; sessionUser = null; }
export function handleExpiredToken() {
  clearSession();
  if (typeof window !== 'undefined' && !['/login', '/register', '/forgot-password', '/reset-password'].includes(window.location.pathname)) window.location.href = '/login?session=expired';
}
