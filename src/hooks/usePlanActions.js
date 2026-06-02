/**
 * usePlanActions.js
 * ─────────────────────────────────────────────────────────────────
 * Side-effect actions có trong BE:
 *   - Trigger giao hàng thủ công  (POST /process-deliveries)
 *   - Huỷ cuối kỳ                 (PATCH /:id/cancel)
 *   - Huỷ ngay lập tức            (PATCH /:id/cancel-immediately)
 * ─────────────────────────────────────────────────────────────────
 */
"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  cancelPlanApi,
  cancelImmediatelyApi,
  triggerDeliveryApi,
} from "../app/services/api/subscribePlanService";

export function usePlanActions({ fetchPlans, closeDetail }) {
  // ── Trigger delivery ───────────────────────────────────────────────────────
  const [isTriggeringDelivery, setIsTriggeringDelivery] = useState(false);

  const handleTriggerDelivery = useCallback(async () => {
    setIsTriggeringDelivery(true);
    try {
      await triggerDeliveryApi();
      toast.success("Đã kích hoạt xử lý giao hàng thủ công");
      fetchPlans();
    } catch {
      toast.error("Kích hoạt thất bại");
    } finally {
      setIsTriggeringDelivery(false);
    }
  }, [fetchPlans]);

  // ── Cancel ─────────────────────────────────────────────────────────────────
  const [cancelTarget, setCancelTarget] = useState(null); // { plan, mode: 'end' | 'immediate' }
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancelClick = useCallback(({ plan, mode }) => {
    setCancelTarget({ plan, mode });
    setCancelOpen(true);
  }, []);

  const handleCancelConfirm = useCallback(async () => {
    if (!cancelTarget) return;
    setIsProcessing(true);
    try {
      if (cancelTarget.mode === "immediate") {
        await cancelImmediatelyApi(cancelTarget.plan._id);
        toast.success("Đã dừng gói ngay lập tức");
      } else {
        await cancelPlanApi(cancelTarget.plan._id);
        toast.success("Đã đặt lịch huỷ cuối kỳ");
      }
      fetchPlans();
      setCancelOpen(false);
      closeDetail?.(cancelTarget.plan._id);
      setCancelTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    } finally {
      setIsProcessing(false);
    }
  }, [cancelTarget, fetchPlans, closeDetail]);

  return {
    isTriggeringDelivery,
    handleTriggerDelivery,
    cancelTarget,
    cancelOpen,
    setCancelOpen,
    isProcessing,
    handleCancelClick,
    handleCancelConfirm,
  };
}
