/**
 * SubscriberStatusBadge.js
 * Hiển thị badge trạng thái đăng ký với màu sắc và dot indicator
 */

import { STATUS_CONFIG } from "../../ui";

export function SubscriberStatusBadge({ status, size = "md" }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["pending"];

  const sizeClasses = {
    sm: "text-[9px] px-1.5 py-0.5 gap-1",
    md: "text-[10px] px-2 py-1 gap-1.5",
    lg: "text-xs px-3 py-1.5 gap-2",
  };

  const dotSize = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full uppercase tracking-wide ${sizeClasses[size]}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        border: `1px solid ${config.border}`,
      }}
    >
      <span
        className={`rounded-full shrink-0 ${dotSize[size]}`}
        style={{ backgroundColor: config.dot }}
      />
      {config.label}
    </span>
  );
}
