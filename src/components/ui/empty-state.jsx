"use client";

import * as React from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

function EmptyState({
  icon: Icon = Inbox,
  title,
  message,
  description,
  action,
  children,
  className,
  ...props
}) {
  const displayTitle = title || message || "Không có dữ liệu";
  const displayDesc = description || (title && message ? message : null);

  return (
    <div
      role="status"
      data-slot="empty-state"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center text-muted-foreground",
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground/80">
          <Icon className="size-6 shrink-0" aria-hidden="true" />
        </div>
      )}
      <h3 className="font-sans text-base font-semibold text-foreground">
        {displayTitle}
      </h3>
      {displayDesc && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground leading-relaxed">
          {displayDesc}
        </p>
      )}
      {action && <div className="mt-5 flex items-center justify-center gap-2">{action}</div>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export { EmptyState };
