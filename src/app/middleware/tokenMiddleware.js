import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";

function getRawToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function clearStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("user");
}

export function getDecodedToken() {
  const token = getRawToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    // DEBUG: Giúp bạn nhìn thấy cấu trúc thực tế của Token trong Console
    console.log("DEBUG [Token] Decoded payload:", decoded);
    return decoded;
  } catch (err) {
    console.error("DEBUG [Token] Lỗi decode:", err);
    clearStorage();
    return null;
  }
}

export function checkTokenValid() {
  const decoded = getDecodedToken();
  if (!decoded || !decoded.exp) {
    console.warn("DEBUG [checkTokenValid] Token hỏng hoặc thiếu exp");
    return false;
  }

  const BUFFER_MS = 30 * 1000;
  const isExpired = decoded.exp * 1000 - BUFFER_MS < Date.now();

  if (isExpired) {
    console.warn("DEBUG [checkTokenValid] Token đã hết hạn");
  }

  return !isExpired;
}

export function getTokenRole() {
  const decoded = getDecodedToken();
  return decoded?.role ?? null;
}

export function getTokenUserId() {
  const decoded = getDecodedToken();
  if (!decoded) return null;
  // Tìm kiếm ID ở mọi "ngóc ngách" có thể có trong JWT
  return decoded._id || decoded.id || decoded.userId || null;
}

export function handleExpiredToken() {
  clearStorage();
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;
  const isAuthPage = ["/login", "/register"].includes(currentPath);
  if (isAuthPage) return;

  // Tránh vòng lặp redirect
  window.location.href = "/login?session=expired";
}

export function saveToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}
