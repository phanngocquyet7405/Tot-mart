// components/SubscribePlans/PlanStats.jsx
import { formatCurrency } from "@/app/util/formatter";

export function PlanStats({ plans }) {
  const activePlans = plans.filter((p) => p.status === "active").length;
  const cancelledPlans = plans.filter((p) => p.status === "cancelled").length;
  const expiredPlans = plans.filter((p) => p.status === "expired").length;
  const pendingCancelPlans = plans.filter(
    (p) => p.cancelAtPeriodEnd && p.status === "active"
  ).length;
  const totalRevenue = plans
    .filter((p) => p.status === "active")
    .reduce((s, p) => s + (p.price || 0), 0);

  const stats = [
    {
      label: "Đang hoạt động",
      value: activePlans,
      color: "text-success-text",
      bg: "bg-success/15 border-success/20",
    },
    {
      label: "Hủy cuối kỳ",
      value: pendingCancelPlans,
      color: "text-warning-text",
      bg: "bg-warning/15 border-warning/20",
    },
    {
      label: "Đã hủy",
      value: cancelledPlans,
      color: "text-destructive-text",
      bg: "bg-destructive/15 border-destructive/20",
    },
    {
      label: "Hết hạn",
      value: expiredPlans,
      color: "text-muted-foreground",
      bg: "bg-muted border-border",
    },
    {
      label: "Doanh thu active",
      value: formatCurrency(totalRevenue),
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-xl border p-4 shadow-sm ${s.bg}`}>
          <p className="text-xs text-muted-foreground mb-1 font-medium">{s.label}</p>
          <p className={`text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
