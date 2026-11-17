/**
 * Logger.js
 *
 * Tiện ích logging an toàn cho TotMart FE (Phase F04).
 * - Production: log bị ẩn hoàn toàn (trừ trường hợp khẩn cấp).
 * - Development: tự động lọc (mask) toàn bộ trường dữ liệu nhạy cảm
 *   (token, password, cookie, qrUrl, authorization, secret).
 */

const isDev = process.env.NODE_ENV === "development";

const SENSITIVE_KEYS = new Set([
  "token",
  "accesstoken",
  "refreshtoken",
  "password",
  "cookie",
  "secret",
  "authorization",
  "qrurl",
  "credentials",
]);

export function redactSensitive(val, depth = 0) {
  if (depth > 4 || val === null || val === undefined) return val;
  if (typeof val === "string") {
    if (val.startsWith("Bearer ") || (val.startsWith("eyJ") && val.length > 30)) {
      return "[REDACTED_TOKEN]";
    }
    if (val.includes("qr.sepay.vn") || val.includes("vietqr.io")) {
      return "[REDACTED_QR_URL]";
    }
    return val;
  }
  if (Array.isArray(val)) {
    return val.map((item) => redactSensitive(item, depth + 1));
  }
  if (typeof val === "object") {
    if (val instanceof Error) {
      return {
        name: val.name,
        message: val.message,
        requestId: val.response?.data?.requestId || val.requestId,
      };
    }
    const clean = {};
    for (const [k, v] of Object.entries(val)) {
      if (SENSITIVE_KEYS.has(k.toLowerCase())) {
        clean[k] = "[REDACTED]";
      } else {
        clean[k] = redactSensitive(v, depth + 1);
      }
    }
    return clean;
  }
  return val;
}

function sanitizeArgs(args) {
  return args.map((arg) => redactSensitive(arg));
}

const logger = {
  log: (...args) => {
    if (isDev) console.log(...sanitizeArgs(args));
  },
  warn: (...args) => {
    if (isDev) console.warn(...sanitizeArgs(args));
  },
  error: (...args) => {
    if (isDev) console.error(...sanitizeArgs(args));
  },
  info: (...args) => {
    if (isDev) console.info(...sanitizeArgs(args));
  },
  debug: (...args) => {
    if (isDev) console.debug(...sanitizeArgs(args));
  },
  group: (...args) => {
    if (isDev) console.group(...sanitizeArgs(args));
  },
  groupEnd: () => {
    if (isDev) console.groupEnd();
  },
  table: (...args) => {
    if (isDev) console.table(...sanitizeArgs(args));
  },
};

export default logger;
