import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";

function getRawToken() {
  if (typeof window === "undefined") return null;
  // Chỉ đọc localStorage — không dùng sessionStorage nữa
  // sessionStorage bị xóa khi tab đóng hoặc bị clearStorage() vô tình gọi
  return localStorage.getItem(TOKEN_KEY);
}

// ── Xóa token ────────────────────────────────────────────────────────────────
function clearStorage() {
  console.warn("DEBUG [clearStorage] ← XÓA TOKEN, gọi từ:", new Error().stack);
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("user");
  // Xóa luôn sessionStorage phòng token cũ còn sót
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem("user");
}

export function getDecodedToken() {
  const token = getRawToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
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

  if (!decoded) {
    console.warn("DEBUG [checkTokenValid] Không decode được token");
    return false;
  }

  // Token không có exp → BE không set expiresIn → vẫn hợp lệ
  if (!decoded.exp) {
    console.warn("DEBUG [checkTokenValid] Token không có exp — coi là hợp lệ");
    return true; // ← QUAN TRỌNG: phải là true
  }

  const BUFFER_MS = 30 * 1000;
  const isExpired = decoded.exp * 1000 - BUFFER_MS < Date.now();
  if (isExpired) console.warn("DEBUG [checkTokenValid] Token đã hết hạn");
  return !isExpired;
}

export function getTokenRole() {
  const decoded = getDecodedToken();
  return decoded?.role ?? null;
}

export function getTokenUserId() {
  const decoded = getDecodedToken();
  if (!decoded) return null;
  return decoded._id || decoded.id || decoded.userId || null;
}

export function handleExpiredToken() {
  console.error("DEBUG [handleExpiredToken] fired! Stack:", new Error().stack);
  clearStorage();
  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;
  const isAuthPage = ["/login", "/register"].includes(currentPath);
  if (isAuthPage) return;

  window.location.href = "/login?session=expired";
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  const userStr =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    return null;
  }
}

export function saveToken(token, options = {}) {
  if (typeof window === "undefined") return;
  // Xóa sessionStorage phòng có token cũ còn sót từ trước
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem("user");
  // Luôn lưu vào localStorage
  localStorage.setItem(TOKEN_KEY, token);
}
