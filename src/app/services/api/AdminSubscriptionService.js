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
  active: {
    label: "Đang hoạt động",
    color: "green",
    dot: "#22C55E",
    bg: "#F0FDF4",
    text: "#166534",
    border: "#BBF7D0",
  },
  cancelled: {
    label: "Đã hủy",
    color: "red",
    dot: "#EF4444",
    bg: "#FEF2F2",
    text: "#991B1B",
    border: "#FECACA",
  },
  paused: {
    label: "Tạm dừng",
    color: "yellow",
    dot: "#F59E0B",
    bg: "#FFFBEB",
    text: "#92400E",
    border: "#FDE68A",
  },
  completed: {
    label: "Hoàn thành",
    color: "blue",
    dot: "#3B82F6",
    bg: "#EFF6FF",
    text: "#1E40AF",
    border: "#BFDBFE",
  },
  pending: {
    label: "Chờ xử lý",
    color: "gray",
    dot: "#6B7280",
    bg: "#F9FAFB",
    text: "#374151",
    border: "#D1D5DB",
  },
};
