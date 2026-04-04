import { axiosConfig } from "@/app/util/axiosConfig";
import { API_ENDPOINTS } from "@/app/util/apiEndpoints";

export const loginApi = (data) => {
    return axiosConfig.post(API_ENDPOINTS.AUTH.LOGIN, data);
};

export const registerApi = (data) => {
    return axiosConfig.post(API_ENDPOINTS.AUTH.REGISTER, data);
};