"use client";
/**
 * SubscriberStatusBadge.js
 * Hiển thị badge trạng thái đăng ký với semantic tokens và dot indicator
 */

const STATUS_TOKENS = {
  active: {
    label: "Đang hoạt động",
    badgeClass: "bg-success/15 text-success-text border-success/20",
    dotClass: "bg-success",
  },
  cancelled: {
    label: "Đã hủy",
    badgeClass: "bg-destructive/15 text-destructive-text border-destructive/20",
    dotClass: "bg-destructive",
  },
  paused: {
    label: "Tạm dừng",
    badgeClass: "bg-warning/15 text-warning-text border-warning/20",
    dotClass: "bg-warning",
  },
  pending_payment: {
    label: "Chờ thanh toán",
    badgeClass: "bg-warning/15 text-warning-text border-warning/20",
    dotClass: "bg-warning",
  },
  completed: {
    label: "Hoàn thành",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    dotClass: "bg-primary",
  },
  expired: {
    label: "Hết hạn",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  },
};

export function SubscriberStatusBadge({ status, size = "md" }) {
  const config = STATUS_TOKENS[status] ?? {
    label: status || "Không rõ",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  };

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  const dotSize = {
    sm: "w-1.5 h-1.5",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.badgeClass} ${sizeClasses[size]}`}
    >
      <span
        className={`rounded-full shrink-0 ${dotSize[size]} ${config.dotClass}`}
      />
      {config.label}
    </span>
  );
}

export default SubscriberStatusBadge;
