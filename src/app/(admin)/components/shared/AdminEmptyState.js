"use client";

import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminEmptyState({
  message = "Không có dữ liệu phù hợp.",
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center text-muted-foreground",
        className,
      )}
    >
      <Inbox className="h-10 w-10 mb-3 opacity-40" />
      <p className="text-sm font-medium">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
