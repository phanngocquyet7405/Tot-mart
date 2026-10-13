"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { axiosConfig } from "@/app/services/api/axiosConfig";

export const NOTIFICATION_TYPES = {
  new_order: { label: "Đơn hàng mới", icon: "ShoppingCart", tone: "emerald" },
  payment_received: {
    label: "Đã nhận thanh toán",
    icon: "ShoppingCart",
    tone: "emerald",
  },
  order_cancelled: {
    label: "Đơn hàng đã hủy",
    icon: "PackageX",
    tone: "destructive",
  },
  payment_underpaid: {
    label: "Thanh toán thiếu",
    icon: "AlertTriangle",
    tone: "amber",
  },
};
const Context = createContext(null);
const API = "/admin/notifications";

// Polling thay cho SSE: không giữ kết nối dài, chạy được qua rewrite/proxy của Vercel.
const POLL_INTERVAL_MS = 15000;
const OFFLINE_AFTER_FAILURES = 3;

function normalize(item) {
  return {
    ...item,
    id: item._id,
    title: NOTIFICATION_TYPES[item.type]?.label || "Thông báo",
    read: Boolean(item.isRead),
  };
}

export function AdminNotificationProvider({ children }) {
  const [snapshot, setSnapshot] = useState({
    notifications: [],
    unreadCount: 0,
  });
  const [status, setStatus] = useState("connecting");
  const [attempt, setAttempt] = useState(0);
  const refreshRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    let timer;
    let failures = 0;
    let requestVersion = 0;
    let inFlight = false;

    const refresh = async () => {
      const version = ++requestVersion;
      const response = await axiosConfig.get(API, { params: { limit: 50 } });
      if (!disposed && version === requestVersion) {
        setSnapshot({
          notifications: response.data.map(normalize),
          unreadCount: response.unreadCount,
        });
      }
    };
    refreshRef.current = refresh;

    const schedule = () => {
      clearTimeout(timer);
      if (disposed) return;
      timer = setTimeout(tick, POLL_INTERVAL_MS);
    };

    async function tick() {
      if (disposed || inFlight) return;
      // Tab ẩn: bỏ qua lượt này, quay lại sẽ refresh ngay (xem onVisible).
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "hidden"
      ) {
        schedule();
        return;
      }
      inFlight = true;
      try {
        await refresh();
        failures = 0;
        if (!disposed) setStatus("live");
      } catch {
        failures += 1;
        if (!disposed && failures >= OFFLINE_AFTER_FAILURES)
          setStatus("offline");
      } finally {
        inFlight = false;
        schedule();
      }
    }

    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    tick();
    return () => {
      disposed = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      refreshRef.current = null;
    };
  }, [attempt]);

  const markAsRead = useCallback(async (id) => {
    try {
      await axiosConfig.patch(`${API}/${encodeURIComponent(id)}/mark-read`);
      await refreshRef.current?.();
    } catch {
      toast.error("Không thể đánh dấu đã đọc. Vui lòng thử lại.");
    }
  }, []);
  const markAllAsRead = useCallback(async () => {
    try {
      await axiosConfig.patch(`${API}/mark-all-read`);
      await refreshRef.current?.();
    } catch {
      toast.error("Không thể đánh dấu đã đọc. Vui lòng thử lại.");
    }
  }, []);
  const retryConnection = useCallback(() => {
    setStatus("connecting");
    setAttempt((value) => value + 1);
  }, []);
  return (
    <Context.Provider
      value={{
        ...snapshot,
        status,
        markAsRead,
        markAllAsRead,
        retryConnection,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useAdminNotifications() {
  const context = useContext(Context);
  if (!context)
    throw new Error("useAdminNotifications requires AdminNotificationProvider");
  return context;
}
