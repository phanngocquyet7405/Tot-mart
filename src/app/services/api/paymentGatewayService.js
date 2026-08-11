/**
 * paymentGatewayService.js
 * Service layer — giao tiếp API cổng thanh toán (VNPay).
 * Chỉ gọi API thô + chuẩn hoá request, KHÔNG xử lý logic nghiệp vụ
 * (logic nghiệp vụ nằm ở Checkoutpageservice.js, theo đúng convention hiện tại).
 */

import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

export const paymentGatewayService = {
  /**
   * Yêu cầu BE tạo URL thanh toán VNPay cho MỘT đơn hàng đã tồn tại
   * (đơn phải ở trạng thái "pending_payment" — được tạo trước đó qua checkoutApi).
   * @param {string} orderId
   * @param {number} amount - số tiền VND, số nguyên, không có dấu phẩy/chấm
   */
  createVnpayUrl: (orderId, amount) =>
    axiosConfig.post(API_ENDPOINTS.CHECKOUT.CREATE_VNPAY_URL, {
      orderId,
      amount,
    }),

  /**
   * Xác thực kết quả trả về từ VNPay (toàn bộ query params trên returnUrl).
   *
   * Lưu ý: hàm này CHỈ phục vụ hiển thị kết quả cho user ngay lúc đó.
   * Nguồn xác nhận chính thức để chốt trạng thái đơn hàng là IPN
   * (VNPay gọi thẳng server-to-server tới BE) — vì user có thể tắt trình
   * duyệt/mất mạng giữa chừng trước khi redirect về được.
   * @param {URLSearchParams} params
   */
  verifyVnpayReturn: (params) =>
    axiosConfig.get(
      `${API_ENDPOINTS.CHECKOUT.VERIFY_VNPAY_RETURN}?${params.toString()}`,
    ),
};
