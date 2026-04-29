"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";

// ─────────────────────────────────────────────
// Config theo loại
// ─────────────────────────────────────────────
const TYPE_CONFIG = {
  success: { duration: 3500, icon: "✓" },
  error: { duration: 5000, icon: "✕" },
  warning: { duration: 4500, icon: "!" },
  info: { duration: 4000, icon: "i" },
  cart: { duration: 4000, icon: "✓" },
  order: { duration: 6000, icon: "✓" },
  wishlist: { duration: 3000, icon: "♥" },
  promo: { duration: 5000, icon: "%" },
};

const STYLE_MAP = {
  success: {
    icon: "bg-green-50 text-green-700",
    bar: "bg-green-500",
    action: "bg-green-50 text-green-800 hover:bg-green-100",
  },
  error: {
    icon: "bg-red-50 text-red-700",
    bar: "bg-red-500",
    action: "bg-red-50 text-red-800 hover:bg-red-100",
  },
  warning: {
    icon: "bg-amber-50 text-amber-700",
    bar: "bg-amber-400",
    action: "bg-amber-50 text-amber-800 hover:bg-amber-100",
  },
  info: {
    icon: "bg-blue-50 text-blue-700",
    bar: "bg-blue-500",
    action: "bg-blue-50 text-blue-800 hover:bg-blue-100",
  },
  cart: {
    icon: "bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-500",
    action: "bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
  },
  order: {
    icon: "bg-blue-50 text-blue-700",
    bar: "bg-blue-500",
    action: "bg-blue-50 text-blue-800 hover:bg-blue-100",
  },
  wishlist: {
    icon: "bg-pink-50 text-pink-700",
    bar: "bg-pink-500",
    action: "bg-pink-50 text-pink-800 hover:bg-pink-100",
  },
  promo: {
    icon: "bg-orange-50 text-orange-700",
    bar: "bg-orange-400",
    action: "bg-orange-50 text-orange-800 hover:bg-orange-100",
  },
};

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, exiting: true } : n)),
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 250);
  }, []);

  // Hàm gốc
  const notify = useCallback(
    (type, { title, message, actions = [], duration } = {}) => {
      const id = ++counter.current;
      const ms = duration ?? TYPE_CONFIG[type]?.duration ?? 4000;
      setNotifications((prev) => [
        ...prev.slice(-4),
        { id, type, title, message, actions, duration: ms, exiting: false },
      ]);
      if (ms > 0) setTimeout(() => dismiss(id), ms);
      return id;
    },
    [dismiss],
  );

  // ── Shorthand cho từng usecase ────────────────
  const success = (title, opts) => notify("success", { title, ...opts });
  const error = (title, opts) => notify("error", { title, ...opts });
  const warning = (title, opts) => notify("warning", { title, ...opts });
  const info = (title, opts) => notify("info", { title, ...opts });

  /** Thêm vào giỏ hàng */
  const addedToCart = (productName, { onViewCart, ...opts } = {}) =>
    notify("cart", {
      title: "Đã thêm vào giỏ hàng",
      message: productName,
      actions: [
        { label: "Xem giỏ hàng", primary: true, onClick: onViewCart },
        { label: "Tiếp tục mua" },
      ],
      ...opts,
    });

  /** Đặt hàng thành công */
  const orderPlaced = (orderId, { onTrack, ...opts } = {}) =>
    notify("order", {
      title: "Đặt hàng thành công!",
      message: `Mã đơn hàng ${orderId} · Giao trong 2–3 ngày`,
      actions: [{ label: "Theo dõi đơn", primary: true, onClick: onTrack }],
      ...opts,
    });

  /** Thêm vào yêu thích */
  const addedToWishlist = (productName, opts) =>
    notify("wishlist", {
      title: "Đã thêm vào yêu thích",
      message: productName,
      actions: [{ label: "Xem danh sách", primary: true }],
      ...opts,
    });

  /** Mã giảm giá */
  const promoApplied = (code, discount, opts) =>
    notify("promo", {
      title: "Mã giảm giá đã áp dụng!",
      message: `${code} — ${discount}`,
      actions: [{ label: "Dùng ngay", primary: true }],
      ...opts,
    });

  /** Sản phẩm hết hàng */
  const outOfStock = (productName) =>
    notify("warning", {
      title: "Sản phẩm tạm hết hàng",
      message: productName,
      actions: [{ label: "Thông báo khi có hàng", primary: true }],
    });

  /** Đăng nhập thành công */
  const loginSuccess = (name) =>
    notify("success", {
      title: `Chào mừng trở lại, ${name}!`,
      message: "Đăng nhập thành công.",
    });

  /** Lỗi thanh toán */
  const paymentFailed = (reason, { onRetry } = {}) =>
    notify("error", {
      title: "Thanh toán thất bại",
      message: reason ?? "Vui lòng kiểm tra thông tin thẻ hoặc thử lại.",
      duration: 0, // không tự đóng
      actions: [
        { label: "Thử lại", primary: true, onClick: onRetry },
        { label: "Đổi phương thức" },
      ],
    });

  return (
    <NotificationContext.Provider
      value={{
        notify,
        dismiss,
        success,
        error,
        warning,
        info,
        addedToCart,
        orderPlaced,
        addedToWishlist,
        promoApplied,
        outOfStock,
        loginSuccess,
        paymentFailed,
      }}
    >
      {children}
      <ToastPortal notifications={notifications} dismiss={dismiss} />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotification phải được dùng trong <NotificationProvider>",
    );
  return ctx;
}

// ─────────────────────────────────────────────
// Portal wrapper (tránh SSR crash)
// ─────────────────────────────────────────────
function ToastPortal({ notifications, dismiss }) {
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <ToastContainer notifications={notifications} dismiss={dismiss} />,
    document.body, // Hoặc element bạn muốn mount vào
  );
}

// ─────────────────────────────────────────────
// Container
// ─────────────────────────────────────────────
function ToastContainer({ notifications, dismiss }) {
  return (
    <>
      <style>{`
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-5 right-5 z-9999 flex flex-col-reverse gap-2.5 pointer-events-none"
        style={{ width: 340 }}
      >
        {notifications.map((n) => (
          <ToastItem key={n.id} notif={n} dismiss={dismiss} />
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// Single Toast
// ─────────────────────────────────────────────
function ToastItem({ notif, dismiss }) {
  const { id, type, title, message, actions, duration, exiting } = notif;
  const s = STYLE_MAP[type] ?? STYLE_MAP.info;

  return (
    <div
      role="alert"
      className={[
        "pointer-events-auto relative flex items-start gap-3",
        "bg-white border border-gray-100 rounded-xl",
        "shadow-[0_4px_20px_rgba(0,0,0,0.08)]",
        "px-3.5 py-3 overflow-hidden",
        "transition-all duration-220ms ease-out",
        exiting
          ? "opacity-0 translate-x-8 scale-95"
          : "opacity-100 translate-x-0 scale-100",
      ].join(" ")}
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div
          className={`absolute bottom-0 left-0 h-[2.5px] ${s.bar} origin-left`}
          style={{ animation: `toast-progress ${duration}ms linear forwards` }}
        />
      )}

      {/* Icon badge */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[13px] font-semibold ${s.icon}`}
      >
        {TYPE_CONFIG[type]?.icon ?? "i"}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-[13px] font-semibold text-gray-800 leading-snug">
          {title}
        </p>
        {message && (
          <p className="text-[12px] text-gray-500 leading-snug mt-0.5 line-clamp-2">
            {message}
          </p>
        )}
        {actions?.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {actions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  action.onClick?.();
                  dismiss(id);
                }}
                className={[
                  "text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors",
                  action.primary
                    ? s.action
                    : "text-gray-400 hover:bg-gray-50 hover:text-gray-600",
                ].join(" ")}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => dismiss(id)}
        aria-label="Đóng thông báo"
        className="w-5 h-5 flex items-center justify-center rounded text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors text-[11px] shrink-0 mt-0.5"
      >
        ✕
      </button>
    </div>
  );
}
