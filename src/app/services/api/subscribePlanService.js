import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

// Lấy tất cả danh sách gói đăng ký
export const getAllPlansApi = () =>
  axiosConfig.get(API_ENDPOINTS.SUBSCRIBE_PLANS.GET_ALL);

// Huỷ vào cuối kỳ hiện tại (Chuyển trạng thái cancelAtPeriodEnd)
export const cancelPlanApi = (id) =>
  axiosConfig.patch(API_ENDPOINTS.SUBSCRIBE_PLANS.CANCEL(id));

// Huỷ ngay lập tức
export const cancelImmediatelyApi = (id) =>
  axiosConfig.patch(API_ENDPOINTS.SUBSCRIBE_PLANS.CANCEL_IMMEDIATELY(id));

// Kích hoạt xử lý giao hàng thủ công
export const triggerDeliveryApi = () =>
  axiosConfig.post(API_ENDPOINTS.SUBSCRIBE_PLANS.PROCESS_DELIVERIES);

// Các hàm bổ sung (giữ lại nếu cần dùng sau này)
export const getPlanByIdApi = (id) =>
  axiosConfig.get(API_ENDPOINTS.SUBSCRIBE_PLANS.GET_BY_ID(id));

export const createPlanApi = (data) =>
  axiosConfig.post(API_ENDPOINTS.SUBSCRIBE_PLANS.CREATE, data);
