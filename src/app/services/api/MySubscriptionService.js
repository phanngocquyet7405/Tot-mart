/**
 * mySubscriptionService.js
 * Service layer cho Client — Quản lý gói đăng ký cá nhân
 */

import { subscriptionApi } from "@/app/services/api/subscribePlanService";
import logger from "@/app/util/Logger";

export const STATUS_CONFIG = {
  pending_payment: {
    label: "Chờ thanh toán",
    color: "warning",
    dot: "var(--warning)",
    bg: "color-mix(in oklch, var(--warning) 12%, transparent)",
    text: "var(--warning-text)",
    border: "color-mix(in oklch, var(--warning) 25%, transparent)",
    badgeClass: "bg-warning/15 text-warning-text border-warning/25",
    dotClass: "bg-warning",
  },
  expired: {
    label: "Hoàn thành",
    color: "primary",
    dot: "var(--primary)",
    bg: "color-mix(in oklch, var(--primary) 12%, transparent)",
    text: "var(--primary)",
    border: "color-mix(in oklch, var(--primary) 25%, transparent)",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    dotClass: "bg-primary",
  },
  active: {
    label: "Đang hoạt động",
    color: "success",
    dot: "var(--success)",
    bg: "color-mix(in oklch, var(--success) 12%, transparent)",
    text: "var(--success-text)",
    border: "color-mix(in oklch, var(--success) 25%, transparent)",
    badgeClass: "bg-success/15 text-success-text border-success/25",
    dotClass: "bg-success",
  },
  cancelled: {
    label: "Đã hủy",
    color: "destructive",
    dot: "var(--destructive)",
    bg: "color-mix(in oklch, var(--destructive) 12%, transparent)",
    text: "var(--destructive-text)",
    border: "color-mix(in oklch, var(--destructive) 25%, transparent)",
    badgeClass: "bg-destructive/10 text-destructive-text border-destructive/20",
    dotClass: "bg-destructive",
  },
  paused: {
    label: "Tạm dừng",
    color: "warning",
    dot: "var(--warning)",
    bg: "color-mix(in oklch, var(--warning) 12%, transparent)",
    text: "var(--warning-text)",
    border: "color-mix(in oklch, var(--warning) 25%, transparent)",
    badgeClass: "bg-warning/15 text-warning-text border-warning/25",
    dotClass: "bg-warning",
  },
  completed: {
    label: "Hoàn thành",
    color: "primary",
    dot: "var(--primary)",
    bg: "color-mix(in oklch, var(--primary) 12%, transparent)",
    text: "var(--primary)",
    border: "color-mix(in oklch, var(--primary) 25%, transparent)",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    dotClass: "bg-primary",
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
