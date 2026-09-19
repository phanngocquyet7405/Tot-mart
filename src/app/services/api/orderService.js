import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

/**
 * orderService.js
 * Service layer thô — gọi API quản lý đơn hàng (Admin).
 *
 * Có 2 nhóm route khác nhau, KHÔNG gộp chung:
 * - ORDERS.* (/admin/orders) — đọc dữ liệu + đổi trạng thái cho các bước
 *   KHÔNG có side-effect nguy hiểm.
 * - CHECKOUT.* (/checkout) — các action CÓ side-effect thật (hoàn kho, hoàn
 *   coupon, hoàn tiền, hoặc đồng thời set paymentStatus khi giao COD). Đây
 *   là route đã có sẵn từ trước cho customer tự huỷ đơn, giờ admin dùng lại
 *   luôn thay vì viết lại logic đó lần 2.
 *
 * Việc chọn gọi hàm nào cho transition nào nằm ở
 * getNextStatusOptions()/updateAdminOrderStatus() trong ordersAdminService.js
 * — orderService chỉ là lớp gọi HTTP thuần, không tự quyết định gì.
 */
export const orderService = {
  /** Lấy danh sách đơn hàng (Admin). params: { page, limit, status, paymentMethod, search } */
  getAllOrders: (params = {}) =>
    axiosConfig.get(API_ENDPOINTS.ORDERS.GET_ALL, { params }),

  /** Lấy chi tiết 1 đơn hàng theo ID (Admin) */
  getOrderById: (id) => axiosConfig.get(API_ENDPOINTS.ORDERS.GET_BY_ID(id)),

  /**
   * Đổi trạng thái — CHỈ dùng cho bước không có side-effect (processing→shipped,
   * shipped→delivered đơn online, on_hold→processing). Validate transition
   * thật nằm ở BE (orderAdminController.updateOrderStatus).
   */
  updateOrderStatus: (id, status) =>
    axiosConfig.post(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status }),

  /** Huỷ đơn — hoàn kho + hoàn coupon + đánh dấu hoàn tiền nếu đã paid */
  cancelOrder: (id, reason) =>
    axiosConfig.post(API_ENDPOINTS.CHECKOUT.CANCEL(id), { reason }),

  /** Xác nhận đơn COD trước khi giao (pending → processing) */
  confirmCod: (id) => axiosConfig.post(API_ENDPOINTS.CHECKOUT.CONFIRM_COD(id)),

  /** Xác nhận đã giao COD — đồng thời ghi nhận đã thu tiền mặt */
  markCodDelivered: (id) =>
    axiosConfig.post(API_ENDPOINTS.CHECKOUT.MARK_COD_DELIVERED(id)),
};
