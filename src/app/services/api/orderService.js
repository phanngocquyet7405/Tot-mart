import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

export const orderService = {
  /** Lấy danh sách đơn hàng (Admin). params: { page, limit, status, search } */
  getAllOrders: (params = {}) =>
    axiosConfig.get(API_ENDPOINTS.ORDERS.GET_ALL, { params }),

  /** Lấy chi tiết 1 đơn hàng theo ID (Admin) */
  getOrderById: (id) => axiosConfig.get(API_ENDPOINTS.ORDERS.GET_BY_ID(id)),

  /** Cập nhật trạng thái đơn hàng (Admin) */
  updateOrderStatus: (id, status) =>
    axiosConfig.patch(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), { status }),

  /** Xoá đơn hàng (Admin) — hiếm dùng, ưu tiên chuyển status "cancelled" */
  deleteOrder: (id) => axiosConfig.delete(API_ENDPOINTS.ORDERS.DELETE(id)),
};
