/**
 * paymentGatewayService.js
 * Service layer — giao tiếp API liên quan xác nhận thanh toán (SePay).
 * Chỉ gọi API thô + chuẩn hoá request, KHÔNG xử lý logic nghiệp vụ
 * (logic nghiệp vụ nằm ở Checkoutpageservice.js, theo đúng convention hiện tại).
 *
 * Khác với VNPay: SePay không có bước "tạo URL thanh toán" riêng bằng API —
 * qrUrl được BE trả về NGAY trong response của checkoutService.createOrder()
 * (xem placeOrder() ở Checkoutpageservice.js). Service này chỉ còn nhiệm vụ
 * hỏi BE xem thanh toán đã về chưa, dùng cho polling khi đang hiển thị QR.
 *
 * ⚠️ CHƯA DÙNG ĐƯỢC — endpoint bên dưới hiện CHƯA tồn tại ở TotMartAPI.
 * Cần bổ sung ở BE trước:
 *   GET /checkout/order-status/:paymentCode  (authMiddleware, check order.userId === req.userId)
 *   → { success: true, data: { paymentStatus: "pending" | "paid", orders: [...] } }
 * Một paymentCode có thể tách thành nhiều Order theo merchantId (xem
 * checkOutController.js) — paymentStatus trả về nên là "paid" chỉ khi TẤT CẢ
 * order con cùng paymentCode đã paid.
 */

import { axiosConfig } from "./axiosConfig";
import { API_ENDPOINTS } from "./apiEndpoints";

export const paymentGatewayService = {
  /**
   * Kiểm tra trạng thái thanh toán của một paymentCode.
   * @param {string} paymentCode
   */
  getOrderStatus: (paymentCode) =>
    axiosConfig.get(API_ENDPOINTS.CHECKOUT.ORDER_STATUS(paymentCode)),
};
