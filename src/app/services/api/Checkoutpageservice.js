/**
 * checkoutPageService.js
 * Service layer cho trang Checkout
 * Wrap tất cả API calls, chuẩn hoá payload + response
 */

import { userService } from "@/app/services/api/userService";
import { checkoutService } from "@/app/services/api/checkoutService";
import { paymentGatewayService } from "@/app/services/api/paymentGatewayService";
import { getTokenUserId } from "@/app/middleware/tokenMiddleware";
import logger from "@/app/util/Logger";

// ─── Constants ────────────────────────────────────────────────────────────────

export const STEPS = [
  { id: "address", label: "Địa chỉ", icon: "MapPin" },
  { id: "review", label: "Kiểm tra", icon: "Package" },
  { id: "payment", label: "Thanh toán", icon: "CreditCard" },
];

// `available: false` = UI vẫn hiện nhưng disable + gắn nhãn "Sắp ra mắt",
// tránh tình trạng chọn được nhưng không có gì xảy ra (như trước đây).
//
// "online" = SePay (quét QR chuyển khoản, xác nhận qua webhook) — thay thế
// hoàn toàn "vnpay" cũ. Đã bỏ entry "bank" placeholder vì SePay chính là
// chuyển khoản ngân hàng qua QR, để 2 lựa chọn cùng ý nghĩa sẽ gây nhầm lẫn.
export const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng",
    icon: "💵",
    desc: "COD - Trả tiền mặt khi nhận",
    available: true,
  },
  {
    id: "online",
    label: "Chuyển khoản QR (SePay)",
    icon: "🏦",
    desc: "Quét mã QR, xác nhận tự động qua ngân hàng",
    available: true,
  },
  {
    id: "momo",
    label: "Ví MoMo",
    icon: "📱",
    desc: "Thanh toán qua app MoMo",
    available: false,
  },
];

export const EMPTY_NEW_ADDRESS = {
  fullName: "",
  phone: "",
  street: "",
  ward: "",
  district: "",
  province: "",
};

// TODO: mock tạm để demo UI — chưa gọi BE để validate coupon thật.
// Lưu ý: số discount hiển thị ở đây CHỈ để ước lượng cho user xem trước khi
// đặt hàng. Số thật do BE tính lại (couponSchema/applyCoupon trong
// checkOutController.js) và đó mới là số quyết định grandTotalAmount / số
// tiền yêu cầu trong QR SePay — hai bên có thể lệch nếu coupon thật không
// khớp mock này.
export const COUPON_MOCK = {
  TOTMART10: 0.1, // 10%
};

// ─── User ─────────────────────────────────────────────────────────────────────

/**
 * Load user profile + địa chỉ
 * @returns {{ success: boolean, user: object|null, addresses: Array, error?: string }}
 */
export async function loadCheckoutUser() {
  try {
    const userId = getTokenUserId();
    if (!userId)
      return { success: false, user: null, addresses: [], error: "NO_TOKEN" };

    const res = await userService.getUserById(userId);
    const data = res.data?.data ?? res.data;
    const addresses = data?.addresses ?? [];

    return { success: true, user: data, addresses };
  } catch (err) {
    logger.error("[checkoutPageService] loadCheckoutUser:", err);
    return { success: false, user: null, addresses: [], error: err.message };
  }
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

/**
 * Validate coupon và tính discount (ước lượng phía client — xem cảnh báo ở
 * COUPON_MOCK phía trên).
 * @param {string} code
 * @param {number} subtotal
 * @returns {{ valid: boolean, discount: number, message: string }}
 */
export function validateCoupon(code, subtotal) {
  const rate = COUPON_MOCK[code.trim().toUpperCase()];
  if (!rate)
    return { valid: false, discount: 0, message: "Mã giảm giá không hợp lệ" };
  const discount = Math.round(subtotal * rate);
  return {
    valid: true,
    discount,
    message: `Áp mã thành công! Giảm ${Math.round(rate * 100)}%`,
  };
}

// ─── Shipping ─────────────────────────────────────────────────────────────────

/**
 * Tính phí ship — subscribe luôn free, product < 500k mới tính.
 *
 * ⚠️ Lưu ý quan trọng cho luồng online (SePay): checkOutController.js hiện
 * KHÔNG cộng shippingFee vào totalAmount của Order — grandTotalAmount BE trả
 * về (và số tiền encode trong qrUrl) chỉ tính từ giá sản phẩm trừ coupon.
 * Nghĩa là nếu tiếp tục hiển thị finalTotal (có cộng shippingFee) cho user
 * như số "phải chuyển khoản", user sẽ chuyển THỪA so với số BE yêu cầu và bị
 * flag "Underpaid"... à nhầm — chuyển thừa thì không bị flag thiếu tiền, BE
 * chỉ chặn khi transferAmount < totalRequiredAmount, nhưng phần dư sẽ không
 * được ghi nhận vào order nào cả. Cần BE cộng shippingFee vào Order thật
 * trước khi FE hiển thị đúng số tiền cần chuyển ở màn QR — không tự vá bằng
 * cách chỉnh số ở FE vì sẽ lệch với transferAmount thật BE kiểm tra.
 */
export function calcShippingFee(cartTotal, hasProducts) {
  return hasProducts && cartTotal < 500_000 ? 30_000 : 0;
}

// ─── Place order ──────────────────────────────────────────────────────────────

/**
 * Đặt hàng sản phẩm thường. Gói subscribe đi qua luồng riêng
 * (ChoosePlanModal → subscriptionApi.subscribe trực tiếp), không qua
 * CartContext/checkout — nên hàm này chỉ còn xử lý cartItems.
 *
 * Payload gửi lên khớp đúng checkoutSchema thật ở BE (validationSchemas.js):
 * { addressId, paymentMethod, note?, couponCode? } — CHỈ vậy. Giỏ hàng được
 * BE đọc thẳng từ Cart collection theo userId, và totalAmount được BE tính
 * lại từ giá sản phẩm hiện tại + coupon; các con số FE tự tính (cartTotal,
 * shippingFee, discount) không được gửi lên và không quyết định số tiền thật.
 *
 * ⚠️ addressId PHẢI là id của một địa chỉ ĐÃ TỒN TẠI trong user.addresses.
 * Nếu user chọn "thêm địa chỉ mới" ngay tại bước checkout (addingNew ở
 * useCheckout.js), phải gọi userService lưu địa chỉ đó trước
 * (API_ENDPOINTS.USERS.ADDRESS.ADD) để lấy addressId thật, RỒI mới gọi hàm
 * này — hàm này không tự làm việc đó.
 *
 * Với paymentMethod "online" (SePay), response trả về ngay qrUrl để hiển thị
 * — không có bước "khởi tạo thanh toán" riêng như initiateVnpayPayment() cũ.
 *
 * @returns {{
 *   success: boolean,
 *   paymentCode?: string,
 *   grandTotalAmount?: number,
 *   orderIds?: string[],
 *   qrUrl?: string,
 *   error?: string,
 * }}
 */
export async function placeOrder({ addressId, paymentMethod, note, couponCode }) {
  try {
    if (!addressId) {
      return { success: false, error: "Thiếu địa chỉ giao hàng (addressId)" };
    }

    const payload = {
      addressId,
      paymentMethod, // "cod" | "online" — KHÔNG còn "vnpay"
      ...(note && { note }),
      ...(couponCode && { couponCode: couponCode.trim().toUpperCase() }),
    };

    const res = await checkoutService.createOrder(payload);
    if (!res?.data?.success) {
      return {
        success: false,
        error: res?.data?.message || "Đặt hàng thất bại",
      };
    }

    const data = res.data.data ?? {};
    return {
      success: true,
      paymentCode: data.paymentCode,
      grandTotalAmount: data.grandTotalAmount,
      orderIds: data.orders,
      qrUrl: data.qrUrl, // chỉ có khi paymentMethod === "online"
    };
  } catch (err) {
    logger.error("[checkoutPageService] placeOrder:", err);
    return {
      success: false,
      error: err?.response?.data?.message || err.message,
    };
  }
}

// ─── SePay ────────────────────────────────────────────────────────────────────

/**
 * Polling trạng thái thanh toán sau khi đã hiển thị QR cho user.
 *
 * ⚠️ Phụ thuộc endpoint CHƯA tồn tại ở BE — xem ghi chú trong
 * paymentGatewayService.js. Gọi hàm này trước khi BE bổ sung endpoint sẽ
 * luôn rơi vào nhánh lỗi mạng và tự retry cho tới khi timeout.
 *
 * @param {string} paymentCode
 * @param {{ intervalMs?: number, timeoutMs?: number, onStatusChange?: (e: {status: "paid"|"timeout"}) => void }} options
 * @returns {() => void} stop - gọi để huỷ polling (cleanup khi unmount / user rời trang)
 */
export function pollPaymentStatus(
  paymentCode,
  { intervalMs = 4000, timeoutMs = 10 * 60 * 1000, onStatusChange } = {},
) {
  let cancelled = false;
  let timer = null;

  const stop = () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
  };

  const tick = async (elapsed) => {
    if (cancelled) return;

    try {
      const res = await paymentGatewayService.getOrderStatus(paymentCode);
      const status = res.data?.data?.paymentStatus ?? res.data?.paymentStatus;

      if (status === "paid") {
        onStatusChange?.({ status: "paid" });
        return;
      }
    } catch (err) {
      // Lỗi mạng tạm thời (hoặc endpoint chưa tồn tại) — không dừng polling
      // ngay, để timeout tự nhiên xử lý.
      logger.error("[checkoutPageService] pollPaymentStatus:", err);
    }

    if (cancelled) return;
    if (elapsed + intervalMs >= timeoutMs) {
      onStatusChange?.({ status: "timeout" });
      return;
    }

    timer = setTimeout(() => tick(elapsed + intervalMs), intervalMs);
  };

  tick(0);
  return stop;
}

/**
 * Check 1 lần duy nhất (không lặp) — dùng cho 2 việc:
 * 1. Nút "Tôi đã chuyển khoản, kiểm tra lại" ở Payment_step.jsx (chỉ đọc `status`)
 * 2. Resume sau khi refresh trang (đọc thêm `qrUrl` + `totalAmount` để vẽ lại
 *    màn QR — xem useCheckout.js, effect đọc query param `code`)
 *
 * `qrUrl` chỉ có khi BE trả về (đơn còn "pending" và là "online" — xem
 * getOrderStatus() ở checkOutController.js), nên luôn kiểm tra trước khi dùng.
 * @param {string} paymentCode
 * @returns {{ status: "paid" | "pending", qrUrl?: string, totalAmount?: number, error?: string }}
 */
export async function checkPaymentNow(paymentCode) {
  try {
    const res = await paymentGatewayService.getOrderStatus(paymentCode);
    const data = res.data?.data ?? {};
    const orders = data.orders ?? [];
    return {
      status: data.paymentStatus === "paid" ? "paid" : "pending",
      qrUrl: data.qrUrl,
      totalAmount: orders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0),
    };
  } catch (err) {
    logger.error("[checkoutPageService] checkPaymentNow:", err);
    return {
      status: "pending",
      error: err?.response?.data?.message || err.message,
    };
  }
}
