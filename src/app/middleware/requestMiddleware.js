import { checkTokenValid } from "./tokenMiddleware";

// ─── buildHeaders ─────────────────────────────────────────────────────────────

/**
 * Tạo headers cho request, tự động gắn token nếu có.
 *
 * @param {'json'|'multipart'|'urlencoded'} [contentType='json']
 * @param {boolean} [requireAuth=true] - false → không gắn Authorization
 * @returns {object} Headers object
 *
 * Ví dụ dùng với axiosConfig:
 *   axiosConfig.post(ENDPOINTS.PRODUCTS.CREATE, data, {
 *     headers: buildHeaders('multipart')
 *   });
 */
export function buildHeaders(contentType = "json", requireAuth = true) {
  const headers = {};

  // Content-Type
  switch (contentType) {
    case "multipart":
      // Không set Content-Type cho multipart → axios tự thêm boundary
      break;
    case "urlencoded":
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      break;
    case "json":
    default:
      headers["Content-Type"] = "application/json";
      headers["Accept"] = "application/json";
  }

  // Authorization
  if (requireAuth && typeof window !== "undefined") {
    if (checkTokenValid()) {
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
  }

  return headers;
}

// ─── sanitizeParams

/**
 * Làm sạch object query params:
 *  - Bỏ undefined, null, empty string
 *  - Trim string values
 *  - Chuyển boolean thành string ('true'/'false') để URL encode đúng
 *
 * Ví dụ:
 *   sanitizeParams({ page: 1, search: '', active: true, deleted: null })
 *   → { page: 1, active: 'true' }
 *
 * @param {object} params
 * @returns {object}
 */
export function sanitizeParams(params = {}) {
  return Object.entries(params).reduce((acc, [key, value]) => {
    // Bỏ null / undefined
    if (value === null || value === undefined) return acc;

    // Bỏ string rỗng
    if (typeof value === "string" && value.trim() === "") return acc;

    // Trim string
    if (typeof value === "string") {
      acc[key] = value.trim();
      return acc;
    }

    acc[key] = value;
    return acc;
  }, {});
}

// ─── buildFormData ─────────────────────────────────────────────────────────────

/**
 * Chuyển object JavaScript thành FormData để upload file.
 * Hỗ trợ: string, number, boolean, File/Blob, Array (nhiều file).
 *
 * Ví dụ (upload ảnh sản phẩm):
 *   const fd = buildFormData({ name: 'Áo', price: 100000, images: [file1, file2] });
 *   axiosConfig.post(ENDPOINTS.PRODUCTS.CREATE, fd, {
 *     headers: buildHeaders('multipart')
 *   });
 *
 * @param {object} data
 * @returns {FormData}
 */
export function buildFormData(data = {}) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      // Nhiều file: append cùng key nhiều lần
      value.forEach((item) => formData.append(key, item));
    } else if (typeof value === "boolean" || typeof value === "number") {
      formData.append(key, String(value));
    } else {
      formData.append(key, value);
    }
  });

  return formData;
}

export function withTimeout(ms) {
  return { timeout: ms };
}

// ─── createPaginationParams ───────────────────────────────────────────────────

/**
 * @param {object} [options]
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 * @param {string} [options.search='']
 * @param {string} [options.sortBy='createdAt']
 * @param {'asc'|'desc'} [options.order='desc']
 * @returns {object}
 */
export function createPaginationParams({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  order = "desc",
} = {}) {
  return sanitizeParams({ page, limit, search, sortBy, order });
}
