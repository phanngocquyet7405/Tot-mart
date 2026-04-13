import axios from "axios";
import { BASE_URL, API_ENDPOINTS } from "./apiEndpoints";
const axiosConfig = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

const excludeEndpoints = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.USERS.REGISTER,
  API_ENDPOINTS.AUTH.HEALTH,
];

//Request
axiosConfig.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const shouldSkipToken = excludeEndpoints.some(
        (endpoint) => config.url === endpoint,
      );

      if (!shouldSkipToken) {
        const accessToken = localStorage.getItem("token");
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

//Respone
axiosConfig.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");

        const currentPath = window.location.pathname;
        const isAuthPage =
          currentPath === "/login" || currentPath === "/register";

        const mustLoginPages = ["/checkout", "/profile", "/order-history"];
        const isProtectedPage = mustLoginPages.some((path) =>
          currentPath.startsWith(path),
        );

        if (!isAuthPage && isProtectedPage) {
          window.location.href = "/login?session=expired";
        } else {
          console.warn(
            "Phiên làm việc hết hạn, bạn đang xem với tư cách khách.",
          );
        }
      }
    }
    return Promise.reject(error);
  },
);
export { axiosConfig };
