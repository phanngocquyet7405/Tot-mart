"use client";

import {
  Bell,
  ShoppingCart,
  AlertTriangle,
  PackageX,
  UserPlus,
  CheckCheck,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
  useAdminNotifications,
  NOTIFICATION_TYPES,
} from "../../context/AdminNotificationContext";

const ICONS = { ShoppingCart, AlertTriangle, PackageX, UserPlus };

const TONE_CLASSES = {
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  destructive: "bg-destructive/10 text-destructive",
  indigo: "bg-indigo-100 text-indigo-600",
};

const STATUS_CONFIG = {
  live: { label: "Trực tiếp", dot: "bg-emerald-500" },
  connecting: { label: "Đang kết nối...", dot: "bg-amber-400 animate-pulse" },
  reconnecting: { label: "Đang kết nối lại...", dot: "bg-amber-400 animate-pulse" },
  offline: { label: "Ngoại tuyến", dot: "bg-zinc-400" },
  mock: { label: "Chế độ demo", dot: "bg-violet-500" },
};

function NotificationRow({ notification, onRead }) {
  const meta = NOTIFICATION_TYPES[notification.type] || {
    label: notification.type,
    icon: "Bell",
    tone: "indigo",
  };
  const Icon = ICONS[meta.icon] || Bell;

  return (
    <button
      onClick={() => !notification.read && onRead(notification.id)}
      className={cn(
        "flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-muted/60",
        !notification.read && "bg-muted/30",
      )}
    >
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          TONE_CLASSES[meta.tone],
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-sm", !notification.read && "font-semibold")}>
            {notification.title}
          </span>
          {!notification.read && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground/70">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: vi,
          })}
        </p>
      </div>
    </button>
  );
}

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    status,
    markAsRead,
    markAllAsRead,
    retryConnection,
  } = useAdminNotifications();

  const statusInfo = STATUS_CONFIG[status] || STATUS_CONFIG.offline;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-90 p-0">
        <div className="flex items-center justify-between p-3">
          <DropdownMenuLabel className="p-0 flex items-center gap-2">
            Thông báo
            <span className="flex items-center gap-1 text-[11px] font-normal text-muted-foreground">
              <span className={cn("h-1.5 w-1.5 rounded-full", statusInfo.dot)} />
              {statusInfo.label}
            </span>
          </DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={markAllAsRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Đọc hết
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />

        {status === "offline" && (
          <div className="flex items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <span>Không kết nối được máy chủ thông báo.</span>
            <Button
              variant="outline"
              size="sm"
              className="h-6 gap-1 px-2 text-[11px]"
              onClick={retryConnection}
            >
              <RefreshCw className="h-3 w-3" />
              Thử lại
            </Button>
          </div>
        )}

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
              <Inbox className="h-8 w-8 opacity-30" />
              <p className="text-sm">Chưa có thông báo nào</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <NotificationRow key={n.id} notification={n} onRead={markAsRead} />
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
