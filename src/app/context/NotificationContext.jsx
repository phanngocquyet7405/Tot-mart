"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * AdminNotificationContext — thông báo real-time cho khu vực admin, dùng
 * Server-Sent Events (SSE) qua EventSource.
 *
 * QUAN TRỌNG: Backend chưa có endpoint `/notifications/stream` — context
 * này được viết sẵn, tương thích ngay khi BE bổ sung endpoint (xem
 * docs/NOTIFICATIONS_BE_SPEC.md). Cho tới lúc đó:
 *   - Nếu không kết nối được, tự động lùi về trạng thái "offline" sau vài
 *     lần thử, KHÔNG spam request vô hạn vào endpoint chưa tồn tại.
 *   - Bật NEXT_PUBLIC_MOCK_NOTIFICATIONS=true trong .env.local để giả lập
 *     dữ liệu real-time ngay trên FE, phục vụ demo/dev UI trước khi có BE.
 */

// Kết nối THẲNG tới BE, không qua rewrite proxy /api/* của Next.js — vì
// SSE là kết nối mở lâu dài, nếu FE deploy trên hạ tầng serverless (Vercel...)
// thì proxy qua Next.js rewrite có thể bị timeout giữa chừng. BE (Render)
// là server chạy liên tục nên chịu được kết nối mở lâu dài tốt hơn.
const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL || "https://totmartapi.onrender.com/api"
).replace(/\/$/, "");
const STREAM_URL = `${API_BASE}/admin/notifications/stream`;
const MAX_NOTIFICATIONS = 50;
const MAX_RECONNECT_ATTEMPTS = 4;
const RECONNECT_BASE_DELAY_MS = 2000;
const STORAGE_KEY = "admin_notifications_v1";

export const NOTIFICATION_TYPES = {
  "order.created": {
    label: "Đơn hàng mới",
    icon: "ShoppingCart",
    tone: "emerald",
  },
  "product.lowStock": {
    label: "Sắp hết hàng",
    icon: "AlertTriangle",
    tone: "amber",
  },
  "product.outOfStock": {
    label: "Đã hết hàng",
    icon: "PackageX",
    tone: "destructive",
  },
  "user.registered": {
    label: "Người dùng mới",
    icon: "UserPlus",
    tone: "indigo",
  },
};

const MOCK_FIXTURES = [
  {
    type: "order.created",
    title: "Đơn hàng mới",
    message: "Đơn #TM-8841 từ Nguyễn Văn A — 356.000đ",
  },
  {
    type: "product.lowStock",
    title: "Sắp hết hàng",
    message: 'Sản phẩm "Mật ong rừng U Minh" chỉ còn 4 sản phẩm',
  },
  {
    type: "product.outOfStock",
    title: "Đã hết hàng",
    message: 'Sản phẩm "Trà atiso túi lọc" đã hết hàng',
  },
  {
    type: "user.registered",
    title: "Người dùng mới",
    message: "thu.tran@example.com vừa đăng ký tài khoản",
  },
];

const AdminNotificationContext = createContext(null);

function loadPersisted() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(notifications) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)),
    );
  } catch {
    // localStorage đầy hoặc bị chặn — bỏ qua, không ảnh hưởng UI
  }
}

export function AdminNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(loadPersisted);
  // 'connecting' | 'live' | 'reconnecting' | 'offline' | 'mock'
  const [status, setStatus] = useState("connecting");

  const eventSourceRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const mockIntervalRef = useRef(null);

  const pushNotification = useCallback((payload) => {
    setNotifications((prev) => {
      const next = [
        {
          id:
            payload.id ||
            `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: payload.type,
          title: payload.title,
          message: payload.message,
          entityId: payload.entityId || null,
          createdAt: payload.createdAt || new Date().toISOString(),
          read: false,
        },
        ...prev,
      ].slice(0, MAX_NOTIFICATIONS);
      persist(next);
      return next;
    });
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      persist(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      persist(next);
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    persist([]);
  }, []);

  const cleanupConnection = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (mockIntervalRef.current) {
      clearInterval(mockIntervalRef.current);
      mockIntervalRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      setStatus("offline");
      return;
    }

    setStatus(reconnectAttemptsRef.current > 0 ? "reconnecting" : "connecting");

    const es = new EventSource(
      `${STREAM_URL}?token=${encodeURIComponent(token)}`,
    );
    eventSourceRef.current = es;

    es.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setStatus("live");
    };

    es.addEventListener("notification", (event) => {
      try {
        const data = JSON.parse(event.data);
        pushNotification(data);
      } catch (err) {
        console.error("Không parse được notification event:", err);
      }
    });

    es.onerror = () => {
      es.close();
      eventSourceRef.current = null;

      reconnectAttemptsRef.current += 1;
      if (reconnectAttemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
        // Endpoint có thể chưa tồn tại (BE chưa build) — dừng spam,
        // chuyển sang trạng thái offline, chờ người dùng bấm thử lại.
        setStatus("offline");
        return;
      }

      setStatus("reconnecting");
      const delay =
        RECONNECT_BASE_DELAY_MS * 2 ** (reconnectAttemptsRef.current - 1);
      reconnectTimerRef.current = setTimeout(connect, delay);
    };
  }, [pushNotification]);

  const startMockMode = useCallback(() => {
    setStatus("mock");
    let i = 0;
    mockIntervalRef.current = setInterval(() => {
      const fixture = MOCK_FIXTURES[i % MOCK_FIXTURES.length];
      i += 1;
      pushNotification(fixture);
    }, 18000);
  }, [pushNotification]);

  const retryConnection = useCallback(() => {
    cleanupConnection();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [cleanupConnection, connect]);

  useEffect(() => {
    const useMock = process.env.NEXT_PUBLIC_MOCK_NOTIFICATIONS === "true";
    if (useMock) {
      startMockMode();
    } else {
      connect();
    }
    return cleanupConnection;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      status,
      markAsRead,
      markAllAsRead,
      clearAll,
      retryConnection,
    }),
    [
      notifications,
      unreadCount,
      status,
      markAsRead,
      markAllAsRead,
      clearAll,
      retryConnection,
    ],
  );

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  );
}

export function useAdminNotifications() {
  const ctx = useContext(AdminNotificationContext);
  if (!ctx) {
    throw new Error(
      "useAdminNotifications phải dùng bên trong AdminNotificationProvider",
    );
  }
  return ctx;
}
