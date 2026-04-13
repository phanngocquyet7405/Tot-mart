import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

export const loginApi = (email,password) => {
    return axiosConfig.post(API_ENDPOINTS.AUTH.LOGIN, {email,password});
};

export const registerApi = (data) => {
    return axiosConfig.post(API_ENDPOINTS.USERS.REGISTER, data);
};