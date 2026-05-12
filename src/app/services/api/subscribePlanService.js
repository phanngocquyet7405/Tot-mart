import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

export const createPlanApi = (data) => {
  return axiosConfig.post(API_ENDPOINTS.SUBSCRIBE_PLANS.CREATE, data);
};

export const getAllPlansApi = () => {
  return axiosConfig.get(API_ENDPOINTS.SUBSCRIBE_PLANS.GET_ALL);
};

export const getPlanByIdApi = (id) => {
  return axiosConfig.get(API_ENDPOINTS.SUBSCRIBE_PLANS.GET_BY_ID(id));
};

export const getPlansByUserApi = (userId) => {
  return axiosConfig.get(API_ENDPOINTS.SUBSCRIBE_PLANS.GET_BY_USER(userId));
};

export const cancelPlanApi = (id) => {
  return axiosConfig.patch(API_ENDPOINTS.SUBSCRIBE_PLANS.CANCEL(id));
};

export const cancelImmediatelyApi = (id) => {
  return axiosConfig.patch(
    API_ENDPOINTS.SUBSCRIBE_PLANS.CANCEL_IMMEDIATELY(id),
  );
};

export const triggerDeliveryApi = () => {
  return axiosConfig.post(API_ENDPOINTS.SUBSCRIBE_PLANS.PROCESS_DELIVERIES);
};
