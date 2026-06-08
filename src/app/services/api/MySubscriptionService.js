/**
 * mySubscriptionService.js
 * Service layer cho Client — Quản lý gói đăng ký cá nhân
 */

import { subscriptionApi } from "@/app/services/api/subscribePlanService";
import logger from "@/app/util/Logger";

export const STATUS_CONFIG = {
  active: {
    label: "Đang hoạt động",
    dot: "#22C55E",
    bg: "#F0FDF4",
    text: "#166534",
    border: "#BBF7D0",
  },
  cancelled: {
    label: "Đã hủy",
    dot: "#EF4444",
    bg: "#FEF2F2",
    text: "#991B1B",
    border: "#FECACA",
  },
  paused: {
    label: "Tạm dừng",
    dot: "#F59E0B",
    bg: "#FFFBEB",
    text: "#92400E",
    border: "#FDE68A",
  },
  completed: {
    label: "Hoàn thành",
    dot: "#3B82F6",
    bg: "#EFF6FF",
    text: "#1E40AF",
    border: "#BFDBFE",
  },
};

export const PLAN_LABEL = {
  "1_month": "1 Tháng",
  "3_month": "3 Tháng",
  "6_month": "6 Tháng",
  "12_month": "12 Tháng",
};

/**
 * Lấy tất cả gói đăng ký của user hiện tại
 */
export async function fetchMySubscriptions() {
  try {
    const res = await subscriptionApi.getMine();
    return { success: true, data: res.data ?? [] };
  } catch (err) {
    logger.error("[mySubscriptionService] fetchMySubscriptions:", err);
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Hủy đăng ký vào cuối kỳ
 */
export async function cancelSubscriptionAtEnd(id) {
  try {
    const res = await subscriptionApi.cancelAtEnd(id);
    return { success: true, data: res.data, message: res.message };
  } catch (err) {
    logger.error("[mySubscriptionService] cancelAtEnd:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Hủy đăng ký ngay lập tức
 */
export async function cancelSubscriptionImmediately(id) {
  try {
    const res = await subscriptionApi.cancelImmediately(id);
    return { success: true, data: res.data, message: res.message };
  } catch (err) {
    logger.error("[mySubscriptionService] cancelImmediately:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Lấy đơn hàng cần giao hôm nay của user
 */
export async function fetchMyTodayDeliveries() {
  try {
    const res = await subscriptionApi.myTodayDeliveries();
    return { success: true, data: res.data ?? [], count: res.count ?? 0 };
  } catch (err) {
    logger.error("[mySubscriptionService] fetchMyTodayDeliveries:", err);
    return { success: false, data: [], count: 0, error: err.message };
  }
}

/**
 * Tính số ngày còn lại trong chu kỳ
 */
export function getDaysRemaining(periodEnd) {
  if (!periodEnd) return null;
  const diff = new Date(periodEnd) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Tính % tiến trình giao hàng đã hoàn thành
 */
export function getDeliveryProgress(remain, total) {
  if (!total) return 0;
  const done = total - remain;
  return Math.round((done / total) * 100);
}
