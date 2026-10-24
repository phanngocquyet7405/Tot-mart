/**
 * usePlanDialog.js
 * ─────────────────────────────────────────────────────────────────
 * Quản lý trạng thái mở/đóng dialog:
 *   - Detail dialog (xem chi tiết)
 *   - Form dialog (chỉ tạo mới — BE không có route update)
 * ─────────────────────────────────────────────────────────────────
 */
"use client";

import { useState, useCallback } from "react";

export function usePlanDialog() {
  // ── Detail ────────────────────────────────────────────────────────────────
  const [detailPlan, setDetailPlan] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewDetail = useCallback((plan) => {
    setDetailPlan(plan);
    setDetailOpen(true);
  }, []);

  /**
   * Đóng detail nếu planId khớp (gọi sau khi cancel thành công).
   * Gọi không có tham số = đóng vô điều kiện.
   */
  const closeDetail = useCallback(
    (planId) => {
      if (!planId || detailPlan?._id === planId) {
        setDetailOpen(false);
        setDetailPlan(null);
      }
    },
    [detailPlan],
  );

  // ── Form — chỉ CREATE, không có edit ──────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);

  const handleOpenCreate = useCallback(() => {
    setFormOpen(true);
  }, []);

  return {
    // Detail
    detailPlan,
    detailOpen,
    setDetailOpen,
    handleViewDetail,
    closeDetail,
    // Form
    formOpen,
    setFormOpen,
    handleOpenCreate,
  };
}
