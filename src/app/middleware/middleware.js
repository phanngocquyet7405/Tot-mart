/**
 * middleware.js - Entry point cho toàn bộ hệ thống Middleware FE
 *
 * Kiến trúc:
 *  tokenMiddleware   → Kiểm tra JWT còn hạn, tự động logout nếu hết hạn
 *  authMiddleware    → Bảo vệ các route yêu cầu đăng nhập
 *  roleMiddleware    → Phân quyền theo role (admin / user)
 *  axiosMiddleware   → Cấu hình Axios interceptors (gắn token, xử lý lỗi 401/403)
 *  requestMiddleware → Chuẩn hóa request (timeout, headers chung)
 *
 * Cách dùng trong Next.js (app router):
 *   import { withAuth, withAdmin } from '@/middleware/middleware';
 */

export {
  checkTokenValid,
  getDecodedToken,
  handleExpiredToken,
} from "./tokenMiddleware";
export { withAuth, withGuest } from "./authMiddleware";
export { withAdmin, withRole, useRoleGuard } from "./roleMiddleware";
export { setupAxiosMiddleware } from "./axiosMiddleware";
export { buildHeaders, sanitizeParams } from "./requestMiddleware";
