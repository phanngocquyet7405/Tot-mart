"use client";

import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export function AdminEmptyState({
  message = "Không có dữ liệu phù hợp.",
  action,
  className,
  icon: Icon = Inbox,
}) {
  return (
    <EmptyState
      icon={Icon}
      title={message}
      action={action}
      className={className}
    />
  );
}
