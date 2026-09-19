/**
 * ordersAdminService.js
 * Service layer cho admin-orders — wrap orderService (raw API), chuẩn hoá
 * shape đơn hàng, và định nghĩa cấu hình trạng thái.
 *
 * Khớp đúng enum + field thật của Order model (TotMartAPI/src/models/Order.js).
 * status và paymentStatus là 2 field TÁCH BIỆT — status là vòng đời giao
 * hàng (pending/processing/shipped/delivered/cancelled/returned/on_hold),
 * paymentStatus là trạng thái tiền (pending/paid/failed). Không gộp 2 field
 * này làm một như bản cũ (từng có "pending_payment" là 1 giá trị của status,
 * SAI — đó thực ra là paymentStatus = "pending").
 */

import { orderService } from "@/app/services/api/orderService";
import { parseApiResponse, parseApiItem } from "../../utils/parseApiResponse";

// ─── Trạng thái đơn hàng (khớp enum thật ở Order.js) ────────────────────────

export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
  ON_HOLD: "on_hold",
};

export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS.PENDING]: {
    label: "Chờ xác nhận",
    bg: "#FEF3E2",
    text: "#B45309",
    border: "#FDE1B0",
    dot: "#D97706",
  },
  [ORDER_STATUS.PROCESSING]: {
    label: "Đang chuẩn bị hàng",
    bg: "#F5F3FF",
    text: "#6D28D9",
    border: "#DDD6FE",
    dot: "#7C3AED",
  },
  [ORDER_STATUS.SHIPPED]: {
    label: "Đang giao hàng",
    bg: "#ECFEFF",
    text: "#0E7490",
    border: "#A5F3FC",
    dot: "#0891B2",
  },
  [ORDER_STATUS.DELIVERED]: {
    label: "Đã giao hàng",
    bg: "#F0FDF4",
    text: "#15803D",
    border: "#BBF7D0",
    dot: "#16A34A",
  },
  [ORDER_STATUS.CANCELLED]: {
    label: "Đã huỷ",
    bg: "#F8FAFC",
    text: "#64748B",
    border: "#E2E8F0",
    dot: "#94A3B8",
  },
  [ORDER_STATUS.RETURNED]: {
    label: "Đã hoàn trả",
    bg: "#FFF1F2",
    text: "#BE123C",
    border: "#FECDD3",
    dot: "#E11D48",
  },
  [ORDER_STATUS.ON_HOLD]: {
    label: "Cần xử lý (thiếu hàng)",
    bg: "#FEF2F2",
    text: "#B91C1C",
    border: "#FECACA",
    dot: "#DC2626",
  },
};

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_CONFIG).map(
  ([value, cfg]) => ({ value, label: cfg.label }),
);

/**
 * Danh sách action khả dụng cho đơn hiện tại — mỗi action gắn với ĐÚNG 1
 * route BE (xem updateAdminOrderStatus bên dưới). Một số transition có
 * side-effect (hoàn kho, hoàn coupon, hoàn tiền, hoặc set paymentStatus)
 * nên KHÔNG đi qua route "status" chung — nếu sửa transition ở đây, nhớ
 * đối chiếu lại orderAdminController.GENERIC_TRANSITIONS ở BE cho khớp.
 */
export function getNextStatusOptions(order) {
  if (!order) return [];
  const { status, paymentMethod } = order;
  const options = [];

  if (status === ORDER_STATUS.PENDING) {
    if (paymentMethod === "cod") {
      options.push({
        value: ORDER_STATUS.PROCESSING,
        label: "Xác nhận đơn (COD)",
        action: "confirm-cod",
      });
    }
    // Đơn online "pending" nghĩa là chưa thanh toán — tự động chuyển
    // "processing" qua webhook SePay khi khách chuyển khoản, không có action
    // thủ công nào cho admin ở trạng thái này ngoài huỷ.
    options.push({
      value: ORDER_STATUS.CANCELLED,
      label: "Huỷ đơn",
      action: "cancel",
    });
  }

  if (status === ORDER_STATUS.PROCESSING) {
    options.push({
      value: ORDER_STATUS.SHIPPED,
      label: "Chuyển sang đang giao",
      action: "status",
    });
    options.push({
      value: ORDER_STATUS.CANCELLED,
      label: "Huỷ đơn",
      action: "cancel",
    });
  }

  if (status === ORDER_STATUS.SHIPPED) {
    options.push(
      paymentMethod === "cod"
        ? {
            value: ORDER_STATUS.DELIVERED,
            label: "Xác nhận đã giao (thu tiền COD)",
            action: "mark-cod-delivered",
          }
        : {
            value: ORDER_STATUS.DELIVERED,
            label: "Xác nhận đã giao",
            action: "status",
          },
    );
  }

  if (status === ORDER_STATUS.ON_HOLD) {
    options.push({
      value: ORDER_STATUS.PROCESSING,
      label: "Xử lý tiếp (đã bổ sung hàng)",
      action: "status",
    });
  }

  // "delivered", "cancelled", "returned" — trạng thái cuối, không có action
  // tiếp theo.
  return options;
}

// ─── Chuẩn hoá dữ liệu ──────────────────────────────────────────────────────

function normalizeOrder(raw) {
  if (!raw) return null;

  const id = raw._id ?? raw.id;
  const addr = raw.shippingAddress ?? {};

  return {
    id,
    code: raw.orderId ?? (id ? `#${String(id).slice(-6).toUpperCase()}` : "—"),
    status: raw.status ?? ORDER_STATUS.PENDING,
    // Tách riêng khỏi status — xem ghi chú đầu file.
    paymentStatus: raw.paymentStatus ?? "pending",
    paymentMethod: raw.paymentMethod ?? "cod",
    items: Array.isArray(raw.products)
      ? raw.products.map((p) => ({
          productId: p.productId,
          name: p.name,
          quantity: p.quantity ?? 1,
          price: p.unitPrice ?? 0,
        }))
      : [],
    // Reshape từ shippingAddress thật (fullName/phone/address/district/city)
    // sang shape mà AddressBlock (OrderDetailDialog.jsx) đang dùng
    // (fullName/phone/street/district/province).
    address: {
      fullName: addr.fullName ?? "—",
      phone: addr.phone ?? "—",
      street: addr.address ?? "",
      district: addr.district ?? "",
      province: addr.city ?? "",
    },
    note: raw.note ?? "",
    shippingFee: raw.shippingFee ?? 0,
    discount: raw.discountAmount ?? 0,
    totalPrice: raw.totalAmount ?? 0,
    customer: {
      // raw.userId đã được BE populate("userId", "name email phone")
      name: raw.userId?.name ?? addr.fullName ?? "—",
      phone: raw.userId?.phone ?? addr.phone ?? "—",
      email: raw.userId?.email ?? raw.customerEmail ?? null,
    },
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
}

export function getOrderItemsCount(order) {
  return (order?.items ?? []).reduce(
    (sum, item) => sum + (item.quantity ?? 1),
    0,
  );
}

// ─── API calls ──────────────────────────────────────────────────────────────

export async function fetchAdminOrders(params = {}) {
  const res = await orderService.getAllOrders(params);
  const list = parseApiResponse(res);
  return list.map(normalizeOrder).filter(Boolean);
}

export async function fetchAdminOrderById(id) {
  const res = await orderService.getOrderById(id);
  return normalizeOrder(parseApiItem(res?.data ?? res));
}

/**
 * Đổi trạng thái — nhận cả `order` (cần paymentMethod để chọn đúng action)
 * và `opt` (option user vừa bấm, lấy từ getNextStatusOptions() ở trên, đã
 * có sẵn `action`). Route đúng action tới đúng API — KHÔNG tự suy luận lại
 * transition ở đây để tránh lệch với getNextStatusOptions().
 */
export async function updateAdminOrderStatus(order, opt) {
  switch (opt.action) {
    case "confirm-cod":
      return orderService.confirmCod(order.id);
    case "cancel":
      return orderService.cancelOrder(order.id);
    case "mark-cod-delivered":
      return orderService.markCodDelivered(order.id);
    default:
      return orderService.updateOrderStatus(order.id, opt.value);
  }
}
