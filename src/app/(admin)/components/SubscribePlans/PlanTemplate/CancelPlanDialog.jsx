"use client";
// components/SubscribePlans/CancelPlanDialog.jsx

import { Loader2, Zap, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseDialog, BaseDialogFooter } from "./BaseDialog";

import {
  cancelAtEndApi,
  cancelImmediatelyApi,
} from "@/app/services/api/subscribePlanService";
import { toast } from "sonner";
import { useState } from "react";

/**
 * CancelPlanDialog
 *
 * @param {{ plan, mode: 'end' | 'immediate' } | null} cancelTarget
 * @param {boolean}  open
 * @param {function} onOpenChange  (false) => void
 * @param {function} onSuccess     () => void  — gọi sau khi hủy thành công
 */
export function CancelPlanDialog({
  cancelTarget,
  open,
  onOpenChange,
  onSuccess,
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!cancelTarget) return null;

  const isImmediate = cancelTarget.mode === "immediate";
  const planName = cancelTarget.plan?.name ?? "gói đăng ký";
  const planId = cancelTarget.plan?._id;

  const accentCls = isImmediate
    ? {
        ring: "bg-destructive/15 text-destructive-text",
        btn: "bg-destructive hover:bg-destructive/90 text-destructive-foreground min-h-11",
        title: "text-destructive-text",
      }
    : {
        ring: "bg-warning/15 text-warning-text",
        btn: "bg-warning-text hover:bg-warning-text/90 text-white min-h-11",
        title: "text-warning-text",
      };

  const handleConfirm = async () => {
    if (!planId) return;
    setIsProcessing(true);
    try {
      if (isImmediate) {
        await cancelImmediatelyApi(planId);
        toast.success(`Đã dừng gói "${planName}" ngay lập tức.`);
      } else {
        await cancelAtEndApi(planId);
        toast.success(`Gói "${planName}" sẽ tự hủy sau kỳ hiện tại.`);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Hủy gói thất bại, vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="max-w-md"
      maxHeight="max-h-fit"
      closeOnOverlay={!isProcessing}
      showClose={false}
    >
      {/* Body */}
      <div className="px-6 pt-8 pb-2 flex flex-col items-center text-center space-y-4">
        {/* Icon circle */}
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full ${accentCls.ring}`}
        >
          {isImmediate ? <Zap size={24} /> : <XCircle size={24} />}
        </div>

        {/* Title */}
        <h2 className={`text-lg font-bold ${accentCls.title}`}>
          {isImmediate ? "Dừng gói ngay lập tức?" : "Hủy vào cuối kỳ?"}
        </h2>

        {/* Description */}
        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          {isImmediate ? (
            <>
              Gói{" "}
              <span className="font-semibold text-foreground">{planName}</span>{" "}
              sẽ bị hủy ngay. Người dùng sẽ không nhận được các lần giao hàng
              còn lại.
            </>
          ) : (
            <>
              Gói{" "}
              <span className="font-semibold text-foreground">{planName}</span>{" "}
              sẽ tiếp tục đến hết kỳ hiện tại rồi tự động hủy. Giao hàng đã lên
              lịch vẫn được thực hiện.
            </>
          )}
        </p>

        {/* Warning chip */}
        <div
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
            isImmediate
              ? "bg-destructive/10 text-destructive-text border border-destructive/20"
              : "bg-warning/10 text-warning-text border border-warning/20"
          }`}
        >
          {isImmediate ? <Zap size={11} /> : <XCircle size={11} />}
          {isImmediate ? "Không thể hoàn tác" : "Sẽ hủy sau kỳ hiện tại"}
        </div>
      </div>

      {/* Footer */}
      <BaseDialogFooter className="justify-center gap-3 py-5">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isProcessing}
          className="min-w-25"
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isProcessing}
          className={`min-w-30 ${accentCls.btn}`}
        >
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Xác nhận
        </Button>
      </BaseDialogFooter>
    </BaseDialog>
  );
}
