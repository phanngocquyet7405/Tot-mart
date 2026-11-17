/**
 * adminSubscriptionService.js
 * Service layer cho Admin — Quản lý danh sách người đăng ký
 * Wrap các API call từ adminSubscriptionApi, chuẩn hoá data trả về
 */

import {
  adminSubscriptionApi,
  subscriptionApi,
} from "@/app/services/api/subscribePlanService";
import logger from "@/app/util/Logger";

/**
 * Lấy toàn bộ danh sách đăng ký (admin)
 * @returns {{ success: boolean, data: Array, count: number, error?: string }}
 */
export async function fetchAllSubscriptions() {
  try {
    const res = await adminSubscriptionApi.getAll();
    return {
      success: true,
      data: res.data ?? [],
      count: res.count ?? 0,
    };
  } catch (err) {
    logger.error("[adminSubscriptionService] fetchAllSubscriptions:", err);
    return { success: false, data: [], count: 0, error: err.message };
  }
}

/**
 * Lấy danh sách đăng ký theo userId cụ thể
 * @param {string} userId
 * @returns {{ success: boolean, data: Array, error?: string }}
 */
export async function fetchSubscriptionsByUser(userId) {
  try {
    const res = await adminSubscriptionApi.getByUser(userId);
    return { success: true, data: res.data ?? [] };
  } catch (err) {
    logger.error("[adminSubscriptionService] fetchSubscriptionsByUser:", err);
    return { success: false, data: [], error: err.message };
  }
}

/**
 * Lấy danh sách đơn hàng cần giao hôm nay (toàn hệ thống)
 * @returns {{ success: boolean, data: Array, count: number, date: string, error?: string }}
 */
export async function fetchTodayDeliveries() {
  try {
    const res = await adminSubscriptionApi.getTodayDeliveries();
    return {
      success: true,
      data: res.data ?? [],
      count: res.count ?? 0,
      date: res.date ?? "",
    };
  } catch (err) {
    logger.error("[adminSubscriptionService] fetchTodayDeliveries:", err);
    return { success: false, data: [], count: 0, date: "", error: err.message };
  }
}

/**
 * Trigger xử lý giao hàng thủ công
 * @returns {{ success: boolean, message: string, error?: string }}
 */
export async function triggerDeliveryProcessing() {
  try {
    const res = await adminSubscriptionApi.triggerDelivery();
    return { success: true, message: res.message ?? "Đã kích hoạt thành công" };
  } catch (err) {
    logger.error("[adminSubscriptionService] triggerDeliveryProcessing:", err);
    return { success: false, message: "", error: err.message };
  }
}

/**
 * Map status sang Vietnamese label + color token
 */
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
  pending: {
    label: "Chờ xử lý",
    color: "muted",
    dot: "var(--muted-foreground)",
    bg: "color-mix(in oklch, var(--muted) 50%, transparent)",
    text: "var(--muted-foreground)",
    border: "var(--border)",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  },
};
