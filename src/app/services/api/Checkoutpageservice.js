/**
 * checkoutPageService.js
 * Service layer cho trang Checkout
 * Wrap tất cả API calls, chuẩn hoá payload + response
 */

import { userService } from "@/app/services/api/userService";
import { checkoutService } from "@/app/services/api/checkoutService";
import { subscriptionApi } from "@/app/services/api/subscribePlanService";
import { getTokenUserId } from "@/app/middleware/tokenMiddleware";
import logger from "@/app/util/Logger";

// ─── Constants ────────────────────────────────────────────────────────────────

export const STEPS = [
  { id: "address", label: "Địa chỉ", icon: "MapPin" },
  { id: "review", label: "Kiểm tra", icon: "Package" },
  { id: "payment", label: "Thanh toán", icon: "CreditCard" },
];

export const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng",
    icon: "💵",
    desc: "COD - Trả tiền mặt khi nhận",
  },
  {
    id: "bank",
    label: "Chuyển khoản ngân hàng",
    icon: "🏦",
    desc: "VietQR / Internet Banking",
  },
  { id: "momo", label: "Ví MoMo", icon: "📱", desc: "Thanh toán qua app MoMo" },
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
 * Đặt hàng: product + subscribe trong cùng một lần gọi
 * @returns {{ success: boolean, error?: string }}
 */
export async function placeOrder({
  cartItems,
  subscribeItems,
  deliveryAddress,
  paymentMethod,
  note,
  shippingFee,
  cartTotal,
  discount,
}) {
  const userId = getTokenUserId();

  try {
    // 1. Sản phẩm thường
    if (cartItems.length > 0) {
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
    }

    // 2. Gói subscribe
    if (subscribeItems.length > 0) {
      const subResults = await Promise.allSettled(
        subscribeItems.map((sub) =>
          subscriptionApi.subscribe({
            userId,
            templateId: sub.templateId,
            shippingAddress: deliveryAddress,
          }),
        ),
      );

      const failed = subResults.filter((r) => r.status === "rejected");
      if (failed.length > 0) {
        logger.warn(
          `[checkoutPageService] ${failed.length} subscribe thất bại`,
        );
        // Không block — sản phẩm thường đã xong
      }
    }

    return { success: true };
  } catch (err) {
    logger.error("[checkoutPageService] placeOrder:", err);
    return {
      success: false,
      error: err?.response?.data?.message || err.message,
    };
  }
}
