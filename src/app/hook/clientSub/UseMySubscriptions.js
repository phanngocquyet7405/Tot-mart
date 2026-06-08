/**
 * useMySubscriptions.js
 * Custom hook — Client quản lý gói đăng ký cá nhân
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchMySubscriptions,
  cancelSubscriptionAtEnd,
  cancelSubscriptionImmediately,
  fetchMyTodayDeliveries,
} from "@/app/services/api/MySubscriptionService";

export function useMySubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Cancel dialog state ──────────────────────────────────────────────────
  const [cancelTarget, setCancelTarget] = useState(null); // { sub, mode: 'at_end' | 'immediately' }
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // ─── Tab filter ───────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("all"); // all | active | cancelled | completed

  // ─── Load ─────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [subResult, todayResult] = await Promise.all([
      fetchMySubscriptions(),
      fetchMyTodayDeliveries(),
    ]);

    if (subResult.success) {
      setSubscriptions(subResult.data);
    } else {
      setError(subResult.error);
      toast.error("Không thể tải danh sách gói đăng ký");
    }

    if (todayResult.success) {
      setTodayDeliveries(todayResult.data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      if (isMounted) {
        await load();
      }
    };

    initData();

    return () => {
      isMounted = false; // Cleanup dọn dẹp để ngăn setState trên unmounted component
    };
  }, [load]);

  // ─── Open cancel dialog ───────────────────────────────────────────────────
  const openCancelDialog = useCallback((sub, mode) => {
    setCancelTarget({ sub, mode });
    setCancelDialogOpen(true);
  }, []);

  const closeCancelDialog = useCallback(() => {
    setCancelDialogOpen(false);
    setCancelTarget(null);
  }, []);

  // ─── Confirm cancel ───────────────────────────────────────────────────────
  const confirmCancel = useCallback(async () => {
    if (!cancelTarget) return;
    setCancelling(true);

    const { sub, mode } = cancelTarget;
    const fn =
      mode === "immediately"
        ? cancelSubscriptionImmediately
        : cancelSubscriptionAtEnd;

    const result = await fn(sub._id);

    if (result.success) {
      toast.success(
        mode === "immediately"
          ? "Đã hủy đăng ký ngay lập tức"
          : "Đã đặt lịch hủy vào cuối kỳ",
      );
      closeCancelDialog();
      await load();
    } else {
      toast.error(result.error ?? "Hủy đăng ký thất bại");
    }

    setCancelling(false);
  }, [cancelTarget, closeCancelDialog, load]);

  // ─── Computed: tab-filtered list ──────────────────────────────────────────
  const filteredSubscriptions =
    activeTab === "all"
      ? subscriptions
      : subscriptions.filter((s) => s.status === activeTab);

  // ─── Tab counts ───────────────────────────────────────────────────────────
  const tabCounts = {
    all: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "active").length,
    cancelled: subscriptions.filter((s) => s.status === "cancelled").length,
    completed: subscriptions.filter((s) => s.status === "completed").length,
  };

  return {
    subscriptions: filteredSubscriptions,
    todayDeliveries,
    loading,
    error,
    activeTab,
    setActiveTab,
    tabCounts,
    // Cancel
    cancelTarget,
    cancelDialogOpen,
    cancelling,
    openCancelDialog,
    closeCancelDialog,
    confirmCancel,
    // Refresh
    refresh: load,
  };
}
