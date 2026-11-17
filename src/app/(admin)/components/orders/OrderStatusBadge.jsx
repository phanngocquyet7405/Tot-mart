/**
 * OrderStatusBadge.jsx
 * Hiển thị badge trạng thái đơn hàng với màu sắc + dot indicator.
 * Cùng style với SubscriberStatusBadge để đồng bộ trong toàn bộ admin.
 */

import { ORDER_STATUS_CONFIG, ORDER_STATUS } from "../../admin-orders/services/ordersAdminService";

export function OrderStatusBadge({ status, size = "md" }) {
  const config = ORDER_STATUS_CONFIG[status] ?? ORDER_STATUS_CONFIG[ORDER_STATUS.PENDING];

  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-xs px-3 py-1.5 gap-2",
  };

  const dotSize = {
    sm: "size-1",
    md: "size-1.5",
    lg: "size-2",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide ${config.badgeClass || 'border-border bg-muted text-muted-foreground'} ${sizeClasses[size]}`}
    >
      <span
        className={`rounded-full shrink-0 ${config.dotClass || 'bg-muted-foreground'} ${dotSize[size]}`}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}
