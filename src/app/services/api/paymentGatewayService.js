import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

export const paymentGatewayService = {
  /**
   * Kiểm tra trạng thái thanh toán (và lấy qrUrl) của một paymentCode.
   * @param {string} paymentCode
   */
  getOrderStatus: (paymentCode) =>
    axiosConfig.get(
      API_ENDPOINTS.CHECKOUT.ORDER_STATUS(encodeURIComponent(paymentCode)),
    ),
};
