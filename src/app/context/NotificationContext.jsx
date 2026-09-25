"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { axiosConfig } from "@/app/services/api/axiosConfig";
import { BASE_URL } from "@/app/services/api/apiEndpoints";

export const NOTIFICATION_TYPES = {
  new_order: { label: "Đơn hàng mới", icon: "ShoppingCart", tone: "emerald" },
  payment_received: { label: "Đã nhận thanh toán", icon: "ShoppingCart", tone: "emerald" },
  order_cancelled: { label: "Đơn hàng đã hủy", icon: "PackageX", tone: "destructive" },
  payment_underpaid: { label: "Thanh toán thiếu", icon: "AlertTriangle", tone: "amber" },
};
const Context = createContext(null);
const API = "/admin/notifications";
function normalize(item) {
  return { ...item, id: item._id, title: NOTIFICATION_TYPES[item.type]?.label || "Thông báo", read: Boolean(item.isRead) };
}

export function AdminNotificationProvider({ children }) {
  const [snapshot, setSnapshot] = useState({ notifications: [], unreadCount: 0 });
  const [status, setStatus] = useState("connecting");
  const [attempt, setAttempt] = useState(0);
  const refreshRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    let source;
    let timer;
    let failures = 0;
    let requestVersion = 0;
    const refresh = async () => {
      const version = ++requestVersion;
      const response = await axiosConfig.get(API, { params: { limit: 50 } });
      if (!disposed && version === requestVersion) {
        setSnapshot({ notifications: response.data.map(normalize), unreadCount: response.unreadCount });
      }
    };
    refreshRef.current = refresh;

    function reconnect() {
      source?.close();
      clearTimeout(timer);
      if (disposed) return;
      failures += 1;
      if (failures > 4) { setStatus("offline"); return; }
      setStatus("reconnecting");
      timer = setTimeout(connect, 2000 * 2 ** (failures - 1));
    }

    async function connect() {
      try {
        const response = await axiosConfig.get(`${API}/stream-ticket`);
        if (disposed) return;
        // Tickets are single-use: obtain a new one on every retry.
        source = new EventSource(`${BASE_URL.replace(/\/$/, "")}${API}/stream?ticket=${encodeURIComponent(response.data.ticket)}`);
        source.onopen = () => {
          if (disposed) return;
          failures = 0;
          setStatus("live");
          // Recover notifications missed while disconnected.
          refresh().catch(() => { if (!disposed) setStatus("offline"); });
        };
        source.onmessage = () => { refresh().catch(() => { if (!disposed) setStatus("offline"); }); };
        source.onerror = reconnect;
      } catch { reconnect(); }
    }

    connect();
    refresh().catch(() => { if (!disposed) setStatus("offline"); });
    // Synchronize read state changed by other admins, too.
    const poll = setInterval(() => { refresh().catch(() => {}); }, 30000);
    return () => {
      disposed = true;
      source?.close();
      clearTimeout(timer);
      clearInterval(poll);
      refreshRef.current = null;
    };
  }, [attempt]);

  const markAsRead = useCallback(async (id) => {
    try {
      await axiosConfig.patch(`${API}/${encodeURIComponent(id)}/mark-read`);
      await refreshRef.current?.();
    } catch { toast.error("Không thể đánh dấu đã đọc. Vui lòng thử lại."); }
  }, []);
  const markAllAsRead = useCallback(async () => {
    try {
      await axiosConfig.patch(`${API}/mark-all-read`);
      await refreshRef.current?.();
    } catch { toast.error("Không thể đánh dấu đã đọc. Vui lòng thử lại."); }
  }, []);
  const retryConnection = useCallback(() => { setStatus("connecting"); setAttempt((value) => value + 1); }, []);
  return <Context.Provider value={{ ...snapshot, status, markAsRead, markAllAsRead, retryConnection }}>{children}</Context.Provider>;
}

export function useAdminNotifications() {
  const context = useContext(Context);
  if (!context) throw new Error("useAdminNotifications requires AdminNotificationProvider");
  return context;
}
