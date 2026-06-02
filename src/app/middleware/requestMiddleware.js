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
      // FIX Chú ý quan trọng: Ép gán undefined để Axios chủ động xóa bỏ
      // header "application/json" mặc định trong config, giúp trình duyệt tự điền boundary.
      headers["Content-Type"] = undefined;
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

// ─── sanitizeParams ───────────────────────────────────────────────────────────

/**
 * Làm sạch object query params:
 *  - Bỏ undefined, null, empty string
 *  - Trim string values
 *  - Chuyển boolean thành string ('true'/'false') để URL encode đúng
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
 * Hỗ trợ: string, number, boolean, File/Blob, Array (nhiều file kèm chỉ mục index).
 *
 * @param {object} data
 * @returns {FormData}
 */
export function buildFormData(data = {}) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      // FIX Chú ý quan trọng:
      // Nếu trường dữ liệu là mảng ảnh 'images', ta cần bọc kèm chỉ mục index ví dụ: images[0], images[1]...
      // Điều này giúp Backend (multer) nhận diện chính xác tên trường fieldname có chứa số để xử lý update/ghi đè.
      value.forEach((item, index) => {
        if (key === "images") {
          formData.append(`images[${index}]`, item);
        } else {
          // Các loại mảng text/id thông thường khác giữ nguyên cấu trúc trùng key
          formData.append(key, item);
        }
      });
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
