import { handleExpiredToken, checkTokenValid } from "./tokenMiddleware";
import { API_ENDPOINTS } from "../services/api/apiEndpoints";
import axios from "axios";

const PUBLIC_ENDPOINTS = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.HEALTH,
  API_ENDPOINTS.USERS.REGISTER,
  API_ENDPOINTS.PRODUCTS.GET_ALL,
  API_ENDPOINTS.BRANDS.GET_ALL,
  API_ENDPOINTS.CATEGORIES.GET_ALL,
  API_ENDPOINTS.CATEGORIES.GET_ROOT,
];

function isPublicEndpoint(url = "") {
  return PUBLIC_ENDPOINTS.some((endpoint) => {
    if (typeof endpoint === "string") {
      return url.includes(endpoint);
    }
    return false;
  });
}

export function setupAxiosMiddleware(axiosInstance) {
  // ── REQUEST MIDDLEWARE ────────────────────────────────────────────────────

  axiosInstance.interceptors.request.use(
    (config) => {
      if (typeof window === "undefined") return config; // SSR: bỏ qua

      const shouldSkipToken = isPublicEndpoint(config.url);

      if (!shouldSkipToken) {
        // Kiểm tra token còn hạn trước khi gửi
        const tokenOk = checkTokenValid();

        if (!tokenOk) {
          // Token hết hạn → dừng request, redirect luôn
          handleExpiredToken();
          // Cancel request bằng cách throw CanceledError
          const cancelToken = new axios.CanceledError(
            "Token expired before request",
          );
          return Promise.reject(cancelToken);
        }

        const accessToken = localStorage.getItem("token");
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }

      return config;
    },
    (error) => Promise.reject(error),
  );
  axiosInstance.interceptors.response.use(
    (response) => response.data,

    (error) => {
      if (error?.code === "ERR_CANCELED") {
        return Promise.reject(error);
      }

      const status = error.response?.status;
      const message = error.response?.data?.message || "Lỗi không xác định";
      const requestUrl = error.config?.url || "";

      switch (status) {
        case 401:
          console.warn(`[401] Unauthorized tại ${requestUrl}: ${message}`);
          if (typeof window !== "undefined") {
            handleExpiredToken();
          }
          break;

        case 403:
          console.warn(`[403] Forbidden tại ${requestUrl}: ${message}`);
          if (typeof window !== "undefined") {
            const isLocked = message.toLowerCase().includes("locked");
            if (isLocked) {
              // Tài khoản bị khóa → logout hoàn toàn
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login?error=account_locked";
            } else {
              const currentPath = window.location.pathname;
              if (currentPath !== "/homepage") {
                window.location.href = "/homepage?error=forbidden";
              }
            }
          }
          break;

        case 404:
          console.warn(`[404] Not Found tại ${requestUrl}: ${message}`);
          break;

        case 422:
          console.warn(
            `[422] Validation Error tại ${requestUrl}:`,
            error.response?.data,
          );
          break;

        case 500:
          console.error(`[500] Server Error tại ${requestUrl}: ${message}`);
          break;

        default:
          if (!status) {
            if (error.code === "ECONNABORTED") {
              console.error(
                "[Timeout] Request quá thời gian, vui lòng thử lại.",
              );
            } else {
              console.error(
                "[Network Error] Không thể kết nối server. Kiểm tra internet.",
              );
            }
          }
      }

      return Promise.reject(error);
    },
  );
}
