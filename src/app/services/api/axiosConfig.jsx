import axios from "axios";
import { BASE_URL } from "./apiEndpoints";
import { setupAxiosMiddleware } from "@/app/middleware/axiosMiddleware";

const axiosConfig = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 10000,
});

setupAxiosMiddleware(axiosConfig);

export { axiosConfig };
