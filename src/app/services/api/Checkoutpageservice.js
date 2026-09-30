import { userService } from "@/app/services/api/userService";
import { checkoutService } from "@/app/services/api/checkoutService";
import { syncCartApi } from "@/app/services/api/productServices";
import { paymentGatewayService } from "@/app/services/api/paymentGatewayService";
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

export function calcShippingFee(cartTotal, hasProducts) {
  return hasProducts && cartTotal < 500_000 ? 30_000 : 0;
}

export async function placeOrder({
  addressId,
  paymentMethod,
  note,
  couponCode,
  cartItems = [],
}) {
  try {
    if (!addressId) {
      return { success: false, error: "Thiếu địa chỉ giao hàng (addressId)" };
    }
    const syncRes = await syncCartApi(
      cartItems.map((item) => ({
        productId: item._id || item.id,
        quantity: item.quantity,
      })),
    );
    const skipped = syncRes?.skipped ?? [];
    if (skipped.length > 0) {
      return {
        success: false,
        skipped,
        error:
          "Một số sản phẩm trong giỏ không còn bán, đã được gỡ khỏi giỏ. Vui lòng kiểm tra lại.",
      };
    }

    const payload = {
      addressId,
      paymentMethod, // "cod" | "online" — KHÔNG còn "vnpay"
      ...(note && { note }),
      ...(couponCode && { couponCode: couponCode.trim().toUpperCase() }),
    };

    const res = await checkoutService.createOrder(payload);
    if (!res?.success) {
      return {
        success: false,
        error: res?.message || "Đặt hàng thất bại",
      };
    }

    const data = res.data ?? {};
    return {
      success: true,
      orderId: data.orderId,
      orderCode: data.orderCode,
      totalAmount: data.totalAmount,
    };
  } catch (err) {
    logger.error("[checkoutPageService] placeOrder:", err);
    return {
      success: false,
      error: err?.response?.data?.message || err.message,
    };
  }
}

function readOrderStatus(res) {
  const data = res?.data ?? {};
  const orders = data.orders ?? [];
  return {
    status: data.paymentStatus === "paid" ? "paid" : "pending",
    // BE vẫn trả paymentStatus "pending" cho đơn đã huỷ/hết hạn → tự nhận diện ở FE
    cancelled:
      orders.length > 0 &&
      orders.every((order) => order.status === "cancelled"),
    qrUrl: data.qrUrl,
    totalAmount: orders.reduce(
      (sum, order) => sum + (order.totalAmount ?? 0),
      0,
    ),
  };
}

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
      if (cancelled) return;
      const info = readOrderStatus(res);

      if (info.status === "paid") {
        onStatusChange?.({ status: "paid" });
        return;
      }
      if (info.cancelled) {
        onStatusChange?.({ status: "cancelled" });
        return;
      }
    } catch (err) {
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

export async function checkPaymentNow(paymentCode) {
  try {
    const res = await paymentGatewayService.getOrderStatus(paymentCode);
    return readOrderStatus(res);
  } catch (err) {
    logger.error("[checkoutPageService] checkPaymentNow:", err);
    return {
      status: "error",
      error:
        err?.response?.data?.message ||
        err?.message ||
        "Không kiểm tra được thanh toán",
    };
  }
}
