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
export const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng",
    icon: "💵",
    desc: "COD - Trả tiền mặt khi nhận",
    available: true,
  },
  {
    id: "vnpay",
    label: "VNPay",
    icon: "💳",
    desc: "ATM nội địa / Visa / QR / Internet Banking",
    available: true,
  },
  {
    id: "bank",
    label: "Chuyển khoản ngân hàng",
    icon: "🏦",
    desc: "VietQR / Internet Banking",
    available: false,
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
    const addresses = data?.addreses ?? [];

    return { success: true, user: data, addresses };
  } catch (err) {
    logger.error("[checkoutPageService] loadCheckoutUser:", err);
    return { success: false, user: null, addresses: [], error: err.message };
  }
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

/**
 * Validate coupon và tính discount
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
 * Tính phí ship — subscribe luôn free, product < 500k mới tính
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
 * Với phương thức online (vnpay), đơn hàng tạo ra ở BE nên ở trạng thái
 * "pending_payment" chứ không confirm ngay — orderId trả về được dùng
 * tiếp ở bước initiateVnpayPayment().
 *
 * @returns {{ success: boolean, orderId?: string, error?: string }}
 */
export async function placeOrder({
  cartItems,
  deliveryAddress,
  paymentMethod,
  note,
  shippingFee,
  cartTotal,
  discount,
}) {
  try {
    const productPayload = {
      items: cartItems.map((item) => ({
        productId: item._id || item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      address: deliveryAddress,
      paymentMethod,
      note,
      shippingFee,
      totalPrice: cartTotal - discount + shippingFee,
    };

    const res = await checkoutService.createOrder(productPayload);
    if (!res?.data?.success) {
      return {
        success: false,
        error: res?.data?.message || "Đặt hàng sản phẩm thất bại",
      };
    }

    // TODO xác nhận với BE field chính xác trả về id đơn hàng.
    // Đang defensive-check vài khả năng phổ biến (_id / orderId).
    const orderId =
      res.data?.data?._id ?? res.data?.data?.orderId ?? res.data?.orderId;

    return { success: true, orderId };
  } catch (err) {
    logger.error("[checkoutPageService] placeOrder:", err);
    return {
      success: false,
      error: err?.response?.data?.message || err.message,
    };
  }
}

// ─── VNPay ────────────────────────────────────────────────────────────────────

/**
 * Gọi BE tạo URL thanh toán VNPay cho đơn hàng vừa tạo, để redirect user sang đó.
 * @param {string} orderId
 * @param {number} amount
 * @returns {{ success: boolean, paymentUrl?: string, error?: string }}
 */
export async function initiateVnpayPayment(orderId, amount) {
  try {
    if (!orderId) {
      return { success: false, error: "Thiếu mã đơn hàng để tạo thanh toán" };
    }

    const res = await paymentGatewayService.createVnpayUrl(orderId, amount);
    const paymentUrl = res.data?.data?.paymentUrl ?? res.data?.paymentUrl;

    if (!paymentUrl) {
      return {
        success: false,
        error: "Không tạo được liên kết thanh toán VNPay",
      };
    }

    return { success: true, paymentUrl };
  } catch (err) {
    logger.error("[checkoutPageService] initiateVnpayPayment:", err);
    return {
      success: false,
      error: err?.response?.data?.message || err.message,
    };
  }
}
