/**
 * ordersAdminService.js
 * Service layer cho admin-orders — wrap orderService (raw API), chuẩn hoá
 * shape đơn hàng, và định nghĩa cấu hình trạng thái.
 *
 * LƯU Ý: BE cho module orders CHƯA tồn tại (xem TODO trong apiEndpoints.js).
 * normalizeOrder() dùng optional-chaining + fallback field name theo đúng
 * tinh thần defensive-check đã áp dụng ở Checkoutpageservice.js (placeOrder),
 * vì chưa biết chắc BE sẽ trả field tên gì (_id/orderId, status, v.v).
 * Khi BE xong, chỉ cần chỉnh lại các fallback trong normalizeOrder().
 */

import { orderService } from "@/app/services/api/orderService";
import { parseApiResponse, parseApiItem } from "../../utils/parseApiResponse";

// ─── Trạng thái đơn hàng ────────────────────────────────────────────────────

export const ORDER_STATUS = {
  PENDING: "pending",
  PENDING_PAYMENT: "pending_payment", // riêng cho VNPay, trước khi IPN xác nhận
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPING: "shipping",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_CONFIG = {
  [ORDER_STATUS.PENDING]: {
    label: "Chờ xác nhận",
    bg: "#FEF3E2",
    text: "#B45309",
    border: "#FDE1B0",
    dot: "#D97706",
  },
  [ORDER_STATUS.PENDING_PAYMENT]: {
    label: "Chờ thanh toán",
    bg: "#FEF2F2",
    text: "#B91C1C",
    border: "#FECACA",
    dot: "#DC2626",
  },
  [ORDER_STATUS.CONFIRMED]: {
    label: "Đã xác nhận",
    bg: "#EFF6FF",
    text: "#1D4ED8",
    border: "#BFDBFE",
    dot: "#2563EB",
  },
  [ORDER_STATUS.PROCESSING]: {
    label: "Đang chuẩn bị hàng",
    bg: "#F5F3FF",
    text: "#6D28D9",
    border: "#DDD6FE",
    dot: "#7C3AED",
  },
  [ORDER_STATUS.SHIPPING]: {
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
};

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_CONFIG).map(
  ([value, cfg]) => ({ value, label: cfg.label }),
);

// Các bước chuyển trạng thái hợp lệ — chặn admin đổi lung tung (vd đã giao
// thì không lùi lại pending). Chỉnh lại nếu BE có rule nghiệp vụ khác.
export const ORDER_STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PENDING_PAYMENT]: [ORDER_STATUS.CANCELLED], // confirm tự động qua VNPay IPN
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.SHIPPING]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

export function getNextStatusOptions(currentStatus) {
  const next = ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];
  return next.map((value) => ({
    value,
    label: ORDER_STATUS_CONFIG[value]?.label ?? value,
  }));
}

// ─── Chuẩn hoá dữ liệu ──────────────────────────────────────────────────────

function normalizeOrder(raw) {
  if (!raw) return null;

  const id = raw._id ?? raw.id ?? raw.orderId;

  return {
    id,
    code: raw.code ?? raw.orderCode ?? (id ? `#${String(id).slice(-6).toUpperCase()}` : "—"),
    status: raw.status ?? ORDER_STATUS.PENDING,
    items: Array.isArray(raw.items) ? raw.items : [],
    address: raw.address ?? raw.deliveryAddress ?? null,
    paymentMethod: raw.paymentMethod ?? "cod",
    note: raw.note ?? "",
    shippingFee: raw.shippingFee ?? 0,
    discount: raw.discount ?? 0,
    totalPrice: raw.totalPrice ?? raw.total ?? 0,
    customer: {
      name:
        raw.user?.name ?? raw.customer?.name ?? raw.address?.fullName ?? "—",
      phone:
        raw.user?.phone ?? raw.customer?.phone ?? raw.address?.phone ?? "—",
      email: raw.user?.email ?? raw.customer?.email ?? null,
    },
    createdAt: raw.createdAt ?? raw.created_at ?? null,
    updatedAt: raw.updatedAt ?? raw.updated_at ?? null,
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

export async function updateAdminOrderStatus(id, status) {
  return orderService.updateOrderStatus(id, status);
}

export async function deleteAdminOrder(id) {
  return orderService.deleteOrder(id);
}
