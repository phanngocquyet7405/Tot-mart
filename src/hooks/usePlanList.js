/**
 * usePlanList.js
 * ─────────────────────────────────────────────────────────────────
 * Fetch + filter + sort danh sách SubscribePlan (Admin dashboard).
 * ─────────────────────────────────────────────────────────────────
 */
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { getAllTemplatesApi } from "../app/services/api/subscribePlanService";
import { PLAN_TYPE_LABELS } from "@/app/util/formatter";

export const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "cancelled", label: "Đã huỷ" },
  { value: "expired", label: "Hết hạn" },
];

export const PLAN_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả chu kỳ" },
  ...Object.entries(PLAN_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

export function usePlanList() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planTypeFilter, setPlanTypeFilter] = useState("all");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAllTemplatesApi();
      // axiosMiddleware đã unwrap response.data, nên res = { success, count, data: [...] }
      setPlans(res?.data || []);
    } catch {
      toast.error("Không thể tải danh sách gói đăng ký");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey],
  );

  const clearFilters = useCallback(() => {
    setStatusFilter("all");
    setPlanTypeFilter("all");
  }, []);

  const filtered = useMemo(() => {
    let result = plans.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.userId?.name?.toLowerCase().includes(q) ||
        p.userId?.email?.toLowerCase().includes(q) ||
        p._id?.slice(-6).includes(q);
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const matchType =
        planTypeFilter === "all" || p.planType === planTypeFilter;
      return matchSearch && matchStatus && matchType;
    });

    return [...result].sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [plans, search, statusFilter, planTypeFilter, sortKey, sortDir]);

  const hasActiveFilters = statusFilter !== "all" || planTypeFilter !== "all";

  return {
    plans,
    filtered,
    isLoading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    planTypeFilter,
    setPlanTypeFilter,
    hasActiveFilters,
    clearFilters,
    sortKey,
    sortDir,
    handleSort,
    fetchPlans,
  };
}
