"use client";
/**
 * CancelDialog.js
 * Hộp thoại xác nhận hủy đăng ký — hỗ trợ 2 mode: cuối kỳ và ngay lập tức
 */

import { X, Loader2, Clock, Zap } from "lucide-react";
import { PLAN_TYPE_LABELS } from "@/app/util/formatter";

export function CancelDialog({ target, open, cancelling, onClose, onConfirm }) {
  if (!open || !target) return null;

  const { sub, mode } = target;
  const isImmediate = mode === "immediately";

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "—";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
        onClick={!cancelling ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div
            className={`px-6 pt-6 pb-5 border-b ${
              isImmediate
                ? "bg-destructive/10 border-destructive/25"
                : "bg-warning-text/10 border-warning-text/25"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isImmediate
                      ? "bg-destructive/15 text-destructive-text"
                      : "bg-warning-text/15 text-warning-text"
                  }`}
                >
                  {isImmediate ? (
                    <Zap size={18} />
                  ) : (
                    <Clock size={18} />
                  )}
                </div>
                <div>
                  <h3
                    className={`text-base font-bold ${
                      isImmediate ? "text-destructive-text" : "text-warning-text"
                    }`}
                  >
                    {isImmediate ? "Hủy gói ngay lập tức?" : "Hủy vào cuối chu kỳ?"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {isImmediate
                      ? "Gói của bạn sẽ dừng hoạt động ngay hôm nay."
                      : `Gói vẫn hoạt động bình thường đến hết ngày ${formatDate(sub.currentPeriodEnd)}.`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={cancelling}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground"
                aria-label="Đóng"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {/* Subscription summary */}
            <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {sub.templateId?.name ?? "Gói đăng ký định kỳ"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {PLAN_TYPE_LABELS[sub.planType] ?? sub.planType} · {sub.boxId?.name}
                  </p>
                </div>
                <span className="text-xs font-bold text-primary tabular-nums shrink-0">
                  {sub.remainDeliveries} lần giao còn lại
                </span>
              </div>
            </div>

            {/* Warning notes */}
            <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 leading-relaxed">
              {isImmediate ? (
                <>
                  <li>Các đợt giao chưa thực hiện sẽ không được gửi tiếp.</li>
                  <li>Bạn có thể đăng ký lại bất kỳ lúc nào tại cửa hàng TotMart.</li>
                </>
              ) : (
                <>
                  <li>Bạn vẫn sẽ nhận đầy đủ các đợt giao đã thanh toán trong chu kỳ này.</li>
                  <li>Hệ thống sẽ không tự động gia hạn khi kết thúc chu kỳ.</li>
                </>
              )}
            </ul>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={cancelling}
              className="px-4 py-2.5 min-h-11 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground transition-colors"
            >
              Giữ lại gói
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={cancelling}
              className={`px-4 py-2.5 min-h-11 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${
                isImmediate
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              } disabled:opacity-50`}
            >
              {cancelling && <Loader2 size={13} className="animate-spin" />}
              {cancelling ? "Đang xử lý..." : isImmediate ? "Xác nhận hủy ngay" : "Xác nhận hủy cuối kỳ"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
