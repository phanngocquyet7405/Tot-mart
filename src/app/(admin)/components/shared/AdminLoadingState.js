"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminLoadingState({ message = "Đang tải dữ liệu...", className }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 text-muted-foreground",
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin mb-3 text-indigo-600" />
      <p className="text-sm animate-pulse">{message}</p>
    </div>
  );
}
