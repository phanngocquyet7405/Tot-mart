import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

// Timeout mặc định 10s quá ngắn khi API Render đang cold start (30–60s).
export const loginApi = (email, password, rememberMe = false) =>
  axiosConfig.post(
    API_ENDPOINTS.AUTH.LOGIN,
    { email, password, rememberMe },
    { timeout: 60000 },
  );

// Đánh thức server (endpoint công khai)
export const pingApi = () =>
  axiosConfig.get(API_ENDPOINTS.AUTH.HEALTH, { timeout: 60000 });

export const logoutApi = () => axiosConfig.post(API_ENDPOINTS.AUTH.LOGOUT);

export const registerApi = (data) =>
  axiosConfig.post(API_ENDPOINTS.USERS.REGISTER, data);

// Gửi email chứa mã/link đặt lại mật khẩu
export const forgotPasswordApi = (email) =>
  axiosConfig.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });

// Đặt lại mật khẩu với token nhận từ email
export const resetPasswordApi = (token, newPassword) =>
  axiosConfig.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { password: newPassword }, { params: { token } });
