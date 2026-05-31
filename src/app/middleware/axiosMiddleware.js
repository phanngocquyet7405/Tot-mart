import { handleExpiredToken, checkTokenValid } from "./tokenMiddleware";
import { API_ENDPOINTS } from "../services/api/apiEndpoints";
import axios from "axios";
import logger from "../util/Logger";

const PUBLIC_ENDPOINTS = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.HEALTH,
  API_ENDPOINTS.USERS.REGISTER,
  API_ENDPOINTS.PRODUCTS.GET_ALL,
  API_ENDPOINTS.BRANDS.GET_ALL,
  API_ENDPOINTS.CATEGORIES.GET_ALL,
  API_ENDPOINTS.CATEGORIES.GET_ROOT,
  API_ENDPOINTS.BOXES.GET_ALL,
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
      console.log("DEBUG: [Axios Request] URL:", config.url);
      console.log("DEBUG: [Axios Request] Data:", config.data);

      if (typeof window === "undefined") return config; // SSR: bỏ qua

      const shouldSkipToken = isPublicEndpoint(config.url);

      if (!shouldSkipToken) {
        const tokenOk = checkTokenValid();

        if (!tokenOk) {
          handleExpiredToken();
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
          logger.warn(`[401] Unauthorized tại ${requestUrl}:`, message);
          if (typeof window !== "undefined") {
            const hasToken =
              localStorage.getItem("token") || sessionStorage.getItem("token");
            if (!isPublicEndpoint(requestUrl) && hasToken) {
              handleExpiredToken();
            } else if (!hasToken) {
              logger.warn(
                "[401] Token không có trong storage, bỏ qua handleExpiredToken",
              );
            }
          }
          break;
        case 403:
          logger.warn(`[403] Forbidden tại ${requestUrl}:`, message);
          if (typeof window !== "undefined") {
            const isLocked = message.toLowerCase().includes("locked");
            if (isLocked) {
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
          logger.warn(`[404] Not Found tại ${requestUrl}:`, message);
          break;

        case 422:
          logger.warn(
            `[422] Validation Error tại ${requestUrl}:`,
            error.response?.data,
          );
          break;

        case 500:
          logger.error(`[500] Server Error tại ${requestUrl}:`, message);
          break;

        default:
          if (!status) {
            if (error.code === "ECONNABORTED") {
              logger.error(
                "[Timeout] Request quá thời gian, vui lòng thử lại.",
              );
            } else {
              logger.error(
                "[Network Error] Không thể kết nối server. Kiểm tra internet.",
              );
            }
          }
      }

      return Promise.reject(error);
    },
  );
}
