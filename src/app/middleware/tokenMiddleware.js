import { tr } from "framer-motion/client";
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
    return jwtDecode(token);
  } catch {
    clearStorage();
    return null;
  }
}

export function checkTokenValid() {
  const decoded = getDecodedToken();
  if (!decoded) return false;

  if (!decoded.exp) return false;

  const BUFFER_MS = 30 * 1000;
  const isExpired = decoded.exp * 1000 - BUFFER_MS < Date.now();

  return !isExpired;
}

export function getTokenRole() {
  const decoded = getDecodedToken();
  return decoded?.role ?? null;
}

export function handleExpiredToken() {
  clearStorage();

  if (typeof window === "undefined") return;

  const currentPath = window.location.pathname;

  const isAuthPage = ["/login", "/register"].includes(currentPath);

  if (isAuthPage) return;

  window.location.href = "/login?session=expixed";
}

export function saveToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}
