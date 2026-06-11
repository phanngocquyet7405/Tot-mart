/**
 * CancelDialog.js
 * Hộp thoại xác nhận hủy đăng ký — hỗ trợ 2 mode: cuối kỳ và ngay lập tức
 */

"use client";

import { AlertTriangle, X, Loader2, Clock, Zap } from "lucide-react";
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={!cancelling ? onClose : undefined}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div
            className={`px-6 pt-6 pb-5 ${
              isImmediate
                ? "bg-red-50 border-b border-red-100"
                : "bg-amber-50 border-b border-amber-100"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isImmediate ? "bg-red-100" : "bg-amber-100"
                  }`}
                >
                  {isImmediate ? (
                    <Zap size={18} className="text-red-600" />
                  ) : (
                    <Clock size={18} className="text-amber-600" />
                  )}
                </div>
                <div>
                  <h3
                    className={`text-base font-black ${isImmediate ? "text-red-800" : "text-amber-800"}`}
                  >
                    {isImmediate ? "Hủy ngay lập tức?" : "Hủy vào cuối kỳ?"}
                  </h3>
                  <p
                    className={`text-xs mt-0.5 ${isImmediate ? "text-red-600" : "text-amber-700"}`}
                  >
                    {isImmediate
                      ? "Gói của bạn sẽ dừng ngay hôm nay"
                      : `Gói vẫn hoạt động đến ${formatDate(sub.currentPeriodEnd)}`}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={cancelling}
                className="w-8 h-8 rounded-lg hover:bg-white/60 flex items-center justify-center transition-colors text-stone-400"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            {/* Subscription summary */}
            <div className="bg-stone-50 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-black text-stone-700">
                    {sub.templateId?.name ?? "Gói đăng ký"}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {PLAN_TYPE_LABELS[sub.planType] ?? sub.planType}
                  </p>
                </div>
                <span className="text-xs font-black text-[#C85C3C]">
                  {sub.remainDeliveries} lần còn lại
                </span>
              </div>
            </div>

            {/* Warning */}
            <div
              className={`flex items-start gap-3 rounded-xl p-3.5 ${
                isImmediate
                  ? "bg-red-50 border border-red-100"
                  : "bg-amber-50 border border-amber-100"
              }`}
            >
              <AlertTriangle
                size={14}
                className={`shrink-0 mt-0.5 ${isImmediate ? "text-red-500" : "text-amber-500"}`}
              />
              <p
                className={`text-[11px] leading-relaxed ${isImmediate ? "text-red-700" : "text-amber-700"}`}
              >
                {isImmediate
                  ? "Hành động này không thể hoàn tác. Lịch giao hàng còn lại sẽ bị hủy toàn bộ ngay lập tức."
                  : "Bạn sẽ tiếp tục nhận hàng cho đến hết chu kỳ. Sau đó, gói sẽ không tự động gia hạn."}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              disabled={cancelling}
              className="flex-1 py-3 rounded-xl border-2 border-stone-200 text-sm font-bold text-stone-600 hover:border-stone-300 hover:bg-stone-50 transition-all disabled:opacity-50"
            >
              Giữ lại
            </button>

            <button
              onClick={onConfirm}
              disabled={cancelling}
              className={`flex-1 py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70 ${
                isImmediate
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-amber-500 hover:bg-amber-600"
              }`}
            >
              {cancelling ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : isImmediate ? (
                <>
                  <Zap size={13} />
                  Hủy ngay
                </>
              ) : (
                <>
                  <Clock size={13} />
                  Xác nhận hủy cuối kỳ
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
