"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const COLOR_MAP = {
  indigo: {
    iconBg: "bg-indigo-100",
    icon: "text-indigo-600",
    value: "text-indigo-700",
  },
  emerald: {
    iconBg: "bg-emerald-100",
    icon: "text-emerald-600",
    value: "text-emerald-700",
  },
  amber: {
    iconBg: "bg-amber-100",
    icon: "text-amber-600",
    value: "text-amber-700",
  },
  pink: {
    iconBg: "bg-pink-100",
    icon: "text-pink-600",
    value: "text-pink-700",
  },
  blue: {
    iconBg: "bg-blue-100",
    icon: "text-blue-600",
    value: "text-blue-700",
  },
  orange: {
    iconBg: "bg-orange-100",
    icon: "text-orange-600",
    value: "text-orange-700",
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
        onClick && "cursor-pointer transition-all hover:border-zinc-200",
        isActive && "border-indigo-500 shadow-md scale-[1.01]",
        className,
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={cn("text-2xl font-bold mt-0.5", c.value)}>{value}</p>
            {sub && (
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "p-3 rounded-xl shrink-0",
                c.iconBg,
              )}
            >
              <Icon className={cn("h-5 w-5", c.icon)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
