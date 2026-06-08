import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

export const checkoutApi = (payload) =>
  axiosConfig.post(API_ENDPOINTS.CHECKOUT.CREATE, payload);

// Object export (giữ lại pattern cũ nếu đang dùng ở nơi khác)
export const checkoutService = {
  createOrder: (payload) =>
    axiosConfig.post(API_ENDPOINTS.CHECKOUT.CREATE, payload),
};
