import axios from "axios";
import { BASE_URL } from "./apiEndpoints";

const axiosConfig = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

const excludeEndpoints = ["/login", "/register"];

axiosConfig.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const shouldSkipToken = excludeEndpoints.some(
        (endpoint) => config.url === endpoint || config.url?.endsWith(endpoint),
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

axiosConfig.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } else if (status === 500) {
        console.error("500 Server Error:", error.response.data);
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Timeout");
    }
    return Promise.reject(error);
  },
);

export { axiosConfig };
