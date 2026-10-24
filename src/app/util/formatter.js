// @ts-check
// utils/formatter.js

import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

/* =============================
   MONEY
============================= */

/**
 * Format number into Vietnamese currency (VND).
 * @param {number|null|undefined} n
 * @returns {string}
 */
export const formatCurrency = (n) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(n ?? 0)
    .replace("₫", "đ");

/* =============================
   DATE
============================= */

/**
 * Format date to dd/MM/yyyy string.
 * @param {Date|string|number|null|undefined} d
 * @returns {string}
 */
export const formatDate = (d) => {
  if (!d) return "—";

  try {
    return format(new Date(d), "dd/MM/yyyy", {
      locale: vi,
    });
  } catch {
    return "—";
  }
};

/**
 * Format date to HH:mm dd/MM/yyyy string.
 * @param {Date|string|number|null|undefined} d
 * @returns {string}
 */
export const formatDateTime = (d) => {
  if (!d) return "—";

  try {
    return format(new Date(d), "HH:mm dd/MM/yyyy", { locale: vi });
  } catch {
    return "—";
  }
};

/**
 * Format date to relative distance string (e.g., '3 ngày trước').
 * @param {Date|string|number|null|undefined} d
 * @returns {string}
 */
export const formatRelative = (d) => {
  if (!d) return "—";

  try {
    return formatDistanceToNow(new Date(d), {
      addSuffix: true,
      locale: vi,
    });
  } catch {
    return "—";
  }
};

/* =============================
   SUBSCRIPTION
============================= */

export const PLAN_TYPE_LABELS = {
  "1_month": "1 tháng",
  "3_month": "3 tháng",
  "6_month": "6 tháng",
  "12_month": "12 tháng",
};

export const DEFAULT_DELIVERIES = {
  "1_month": 1,
  "3_month": 3,
  "6_month": 6,
  "12_month": 12,
};

/**
 * @type {Record<string, { id: string, label: string, months: number, planType: string, totalDeliveries: number, discountPercent: number, badge: string|null, highlight?: boolean }>}
 */
export const PLAN_MAP = {
  "1m": {
    id: "1m",

    label: "1 tháng",

    months: 1,

    planType: "1_month",

    totalDeliveries: 1,

    discountPercent: 0,

    badge: null,
  },

  "3m": {
    id: "3m",

    label: "3 tháng",

    months: 3,

    planType: "3_month",

    totalDeliveries: 3,

    discountPercent: 10,

    badge: null,
  },

  "6m": {
    id: "6m",

    label: "6 tháng",

    months: 6,

    planType: "6_month",

    totalDeliveries: 6,

    discountPercent: 15,

    badge: "PHỔ BIẾN",

    highlight: true,
  },

  "12m": {
    id: "12m",

    label: "12 tháng",

    months: 12,

    planType: "12_month",

    totalDeliveries: 12,

    discountPercent: 20,

    badge: "BEST VALUE",
  },
};

/* cho render map UI */

export const SUBSCRIBE_PLANS = Object.values(PLAN_MAP);

/* =============================
   CALCULATOR
============================= */

/**
 * @typedef {Object} PlanPriceCalculation
 * @property {number} monthlyPrice
 * @property {number} total
 * @property {number} save
 */

/**
 * Calculate pricing for a subscription plan based on base price and plan ID.
 * @param {number} basePrice
 * @param {string} planId
 * @returns {PlanPriceCalculation}
 */
export const calculatePlanPrice = (basePrice, planId) => {
  const plan = PLAN_MAP[planId];

  if (!plan)
    return {
      monthlyPrice: basePrice,
      total: basePrice,
      save: 0,
    };

  const monthlyPrice = basePrice * (1 - plan.discountPercent / 100);

  const total = monthlyPrice * plan.months;

  const save = (basePrice - monthlyPrice) * plan.months;

  return {
    monthlyPrice,

    total,

    save,
  };
};

/* =============================
   STATUS
============================= */

export const STATUS_COLORS = {
  active: "bg-green-100 text-green-700",

  cancelled: "bg-red-100 text-red-700",

  pending: "bg-yellow-100 text-yellow-700",

  expired: "bg-gray-100 text-gray-700",
};

export const STATUS_LABELS = {
  active: "Đang hoạt động",

  cancelled: "Đã hủy",

  pending: "Chờ xử lý",

  expired: "Hết hạn",
};

/* =============================
   TEXT
============================= */

/**
 * Truncate text with ellipsis if length exceeds maxLength.
 * @param {string|null|undefined} text
 * @param {number} [maxLength=100]
 * @returns {string}
 */
export const getExcerpt = (text, maxLength = 100) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};
