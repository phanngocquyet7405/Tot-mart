// utils/formatters.js
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export const formatCurrency = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n ?? 0,
  );

export const formatDate = (d) => {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd/MM/yyyy", { locale: vi });
  } catch {
    return "—";
  }
};

export const formatRelative = (d) => {
  if (!d) return "—";
  try {
    return formatDistanceToNow(new Date(d), { addSuffix: true, locale: vi });
  } catch {
    return "—";
  }
};

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
