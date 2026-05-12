import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

export const planApi = {
  // Tạo mới gói
  create: (data) =>
    axiosConfig.post(API_ENDPOINTS.SUBSCRIBE_PLANS.CREATE, data),

  // Lấy tất cả danh sách
  getAll: () => axiosConfig.get(API_ENDPOINTS.SUBSCRIBE_PLANS.GET_ALL),

  // Lấy chi tiết theo ID
  getById: (id) => axiosConfig.get(API_ENDPOINTS.SUBSCRIBE_PLANS.GET_BY_ID(id)),

  // Lấy danh sách theo User
  getByUser: (userId) =>
    axiosConfig.get(API_ENDPOINTS.SUBSCRIBE_PLANS.GET_BY_USER(userId)),

  // Huỷ vào cuối kỳ (Patch)
  cancel: (id) => axiosConfig.patch(API_ENDPOINTS.SUBSCRIBE_PLANS.CANCEL(id)),

  // Huỷ ngay lập tức (Patch)
  cancelImmediately: (id) =>
    axiosConfig.patch(API_ENDPOINTS.SUBSCRIBE_PLANS.CANCEL_IMMEDIATELY(id)),

  // Xoá vĩnh viễn (Delete)
  // Đảm bảo API_ENDPOINTS của bạn có định nghĩa DELETE(id)
  delete: (id) => axiosConfig.delete(API_ENDPOINTS.SUBSCRIBE_PLANS.DELETE(id)),

  // Kích hoạt giao hàng thủ công
  triggerDelivery: () =>
    axiosConfig.post(API_ENDPOINTS.SUBSCRIBE_PLANS.PROCESS_DELIVERIES),
};
