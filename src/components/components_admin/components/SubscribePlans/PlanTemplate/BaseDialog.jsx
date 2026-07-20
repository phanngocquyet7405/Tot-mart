// components/SubscribePlans/BaseDialog.jsx
// Custom dialog primitive — KHÔNG dùng shadcn Dialog/AlertDialog.
// Dùng chung cho CancelPlanDialog, PlanDetailDialog, v.v.

"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * BaseDialog
 * @param {boolean}   open
 * @param {function}  onOpenChange   - (false) => void
 * @param {string}    maxWidth       - class tailwind, vd "max-w-lg" (default)
 * @param {string}    maxHeight      - class tailwind, vd "max-h-[85vh]" (default)
 * @param {boolean}   closeOnOverlay - đóng khi click ra ngoài (default true)
 * @param {boolean}   showClose      - hiện nút X góc trên phải (default true)
 * @param {ReactNode} children
 */
export function BaseDialog({
  open,
  onOpenChange,
  maxWidth = "max-w-lg",
  maxHeight = "max-h-[85vh]",
  closeOnOverlay = true,
  showClose = true,
  children,
}) {
  const overlayRef = useRef(null);

  // Khoá scroll body khi mở
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Đóng khi nhấn Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (closeOnOverlay && e.target === overlayRef.current)
          onOpenChange(false);
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        className={`relative w-full ${maxWidth} ${maxHeight} flex flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden`}
      >
        {showClose && (
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-3.5 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={16} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

/**
 * BaseDialogHeader — thanh tiêu đề với border dưới
 */
export function BaseDialogHeader({ icon: Icon, iconClass, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 shrink-0 pr-14">
      {Icon && (
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass ?? "bg-indigo-50"}`}
        >
          <Icon size={16} className="text-current" />
        </div>
      )}
      <div>
        <h2 className="text-sm font-bold text-slate-800 leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/**
 * BaseDialogBody — vùng cuộn chính
 */
export function BaseDialogBody({ children, className = "" }) {
  return (
    <div className={`overflow-y-auto flex-1 px-6 py-5 ${className}`}>
      {children}
    </div>
  );
}

/**
 * BaseDialogFooter — hàng nút phía dưới
 */
export function BaseDialogFooter({ children, className = "" }) {
  return (
    <div
      className={`flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-100 shrink-0 ${className}`}
    >
      {children}
    </div>
  );
}
