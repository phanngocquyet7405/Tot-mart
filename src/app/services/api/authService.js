import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

export const loginApi = (email, password) =>
  axiosConfig.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });

export const logoutApi = () => axiosConfig.post(API_ENDPOINTS.AUTH.LOGOUT);

export const registerApi = (data) =>
  axiosConfig.post(API_ENDPOINTS.USERS.REGISTER, data);

// Gửi email chứa mã/link đặt lại mật khẩu
export const forgotPasswordApi = (email) =>
  axiosConfig.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });

// Đặt lại mật khẩu với token nhận từ email
export const resetPasswordApi = (token, newPassword) =>
  axiosConfig.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword });
