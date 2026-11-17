"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLOR_MAP = {
  indigo: {
    iconBg: "bg-primary/10",
    icon: "text-primary",
  },
  emerald: {
    iconBg: "bg-success/15",
    icon: "text-success-text",
  },
  amber: {
    iconBg: "bg-warning/15",
    icon: "text-warning-text",
  },
  pink: {
    iconBg: "bg-destructive/15",
    icon: "text-destructive-text",
  },
  blue: {
    iconBg: "bg-primary/10",
    icon: "text-primary",
  },
  orange: {
    iconBg: "bg-warning/15",
    icon: "text-warning-text",
  },
};

export function AdminStatsCard({
  label,
  value,
  icon: Icon,
  color = "indigo",
  sub,
  onClick,
  isActive,
  className,
}) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.indigo;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "border-border bg-card transition-all",
        onClick && "cursor-pointer hover:border-border/80 hover:bg-muted/30",
        isActive && "border-primary shadow-sm scale-[1.01]",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tabular-nums text-foreground mt-0.5">{value}</p>
            {sub && (
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "p-3 rounded-xl shrink-0 border border-border/50",
                c.iconBg,
              )}
            >
              <Icon className={cn("size-5", c.icon)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
