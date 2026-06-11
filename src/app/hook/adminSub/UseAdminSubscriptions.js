/**
 * useAdminSubscriptions.js
 * Custom hook — Admin quản lý danh sách đăng ký
 * Tuân thủ microservice: chỉ gọi service layer, không gọi API trực tiếp
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  triggerDeliveryProcessing,
  fetchAllSubscriptions,
  fetchTodayDeliveries,
} from "@/app/services/api/AdminSubscriptionService";

export function useAdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayLoading, setTodayLoading] = useState(false);
  const [error, setError] = useState(null);
  const [triggeringDelivery, setTriggeringDelivery] = useState(false);

  // ─── Filter / Search state ────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest"); // newest | oldest | price_asc | price_desc

  // ─── Detail dialog state ──────────────────────────────────────────────────
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // ─── Load data ────────────────────────────────────────────────────────────
  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await fetchAllSubscriptions();
    if (result.success) {
      setSubscriptions(result.data);
    } else {
      setError(result.error);
      toast.error("Không thể tải danh sách đăng ký");
    }
    setLoading(false);
  }, []);

  const loadTodayDeliveries = useCallback(async () => {
    setTodayLoading(true);
    const result = await fetchTodayDeliveries();
    if (result.success) {
      setTodayDeliveries(result.data);
    } else {
      toast.error("Không thể tải đơn giao hôm nay");
    }
    setTodayLoading(false);
  }, []);

  useEffect(() => {
    (async () => {
      await loadSubscriptions();
    })();
  }, [loadSubscriptions]);

  // ─── Trigger delivery ─────────────────────────────────────────────────────
  const handleTriggerDelivery = useCallback(async () => {
    setTriggeringDelivery(true);
    const result = await triggerDeliveryProcessing();
    if (result.success) {
      toast.success(result.message);
      await loadSubscriptions();
    } else {
      toast.error("Kích hoạt xử lý giao hàng thất bại");
    }
    setTriggeringDelivery(false);
  }, [loadSubscriptions]);

  // ─── Open detail ──────────────────────────────────────────────────────────
  const openDetail = useCallback((sub) => {
    setSelectedSubscription(sub);
    setDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setDetailOpen(false);
    setSelectedSubscription(null);
  }, []);

  // ─── Computed: filtered + sorted list ────────────────────────────────────
  const filteredSubscriptions = subscriptions
    .filter((s) => {
      const query = searchQuery.toLowerCase();
      const matchSearch =
        !query ||
        s.userId?.name?.toLowerCase().includes(query) ||
        s.userId?.email?.toLowerCase().includes(query) ||
        s.templateId?.name?.toLowerCase().includes(query) ||
        s._id?.toLowerCase().includes(query);

      const matchStatus = statusFilter === "all" || s.status === statusFilter;
      const matchPlan = planFilter === "all" || s.planType === planFilter;

      return matchSearch && matchStatus && matchPlan;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "price_asc":
          return (a.price ?? 0) - (b.price ?? 0);
        case "price_desc":
          return (b.price ?? 0) - (a.price ?? 0);
        default:
          return 0;
      }
    });

  // ─── Stats ────────────────────────────────────────────────────────────────
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "active").length,
    cancelled: subscriptions.filter((s) => s.status === "cancelled").length,
    revenue: subscriptions
      .filter((s) => s.status === "active")
      .reduce((sum, s) => sum + (s.price ?? 0), 0),
  };

  return {
    // Data
    subscriptions: filteredSubscriptions,
    todayDeliveries,
    stats,
    // State
    loading,
    todayLoading,
    error,
    triggeringDelivery,
    // Filters
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    sortBy,
    setSortBy,
    // Detail
    selectedSubscription,
    detailOpen,
    openDetail,
    closeDetail,
    // Actions
    refresh: loadSubscriptions,
    loadTodayDeliveries,
    handleTriggerDelivery,
  };
}
