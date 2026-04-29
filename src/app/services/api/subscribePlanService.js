import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

// ✅ POST /subscribe-plan/create-subcribe-plan — tạo gói (admin only)
export const createPlanApi = (data) => {
  return axiosConfig.post(API_ENDPOINTS.SUBSCRIBE_PLANS.CREATE, data);
};

// ✅ GET /subscribe-plan/get-all-subcribe-plans — lấy tất cả (admin only)
export const getAllPlansApi = () => {
  return axiosConfig.get(API_ENDPOINTS.SUBSCRIBE_PLANS.GET_ALL);
};

// ✅ GET /subscribe-plan/:id — lấy theo ID (admin only)
export const getPlanByIdApi = (id) => {
  return axiosConfig.get(API_ENDPOINTS.SUBSCRIBE_PLANS.GET_BY_ID(id));
};

// ✅ GET /subscribe-plan/user/:userId — lấy theo user (admin only)
export const getPlansByUserApi = (userId) => {
  return axiosConfig.get(API_ENDPOINTS.SUBSCRIBE_PLANS.GET_BY_USER(userId));
};

// ✅ PATCH /subscribe-plan/:id/cancel — hủy cuối kỳ (user + admin)
export const cancelPlanApi = (id) => {
  return axiosConfig.patch(API_ENDPOINTS.SUBSCRIBE_PLANS.CANCEL(id));
};

// ✅ PATCH /subscribe-plan/:id/cancel-immediately — hủy ngay (user + admin)
export const cancelImmediatelyApi = (id) => {
  return axiosConfig.patch(
    API_ENDPOINTS.SUBSCRIBE_PLANS.CANCEL_IMMEDIATELY(id),
  );
};

// ✅ POST /subscribe-plan/process-deliveries — trigger giao hàng thủ công
export const triggerDeliveryApi = () => {
  return axiosConfig.post(API_ENDPOINTS.SUBSCRIBE_PLANS.PROCESS_DELIVERIES);
};
