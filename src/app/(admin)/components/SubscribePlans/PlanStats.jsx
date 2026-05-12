// components/SubscribePlans/PlanStats.jsx
import { formatCurrency } from "@/utils/formatters";

export function PlanStats({ plans }) {
  const activePlans = plans.filter((p) => p.status === "active").length;
  const cancelledPlans = plans.filter((p) => p.status === "cancelled").length;
  const expiredPlans = plans.filter((p) => p.status === "expired").length;
  const pendingCancelPlans = plans.filter(
    (p) => p.cancelAtPeriodEnd && p.status === "active",
  ).length;
  const totalRevenue = plans
    .filter((p) => p.status === "active")
    .reduce((s, p) => s + (p.price || 0), 0);

  const stats = [
    {
      label: "Đang hoạt động",
      value: activePlans,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      label: "Hủy cuối kỳ",
      value: pendingCancelPlans,
      color: "text-orange-600",
      bg: "bg-orange-50 border-orange-100",
    },
    {
      label: "Đã hủy",
      value: cancelledPlans,
      color: "text-red-600",
      bg: "bg-red-50 border-red-100",
    },
    {
      label: "Hết hạn",
      value: expiredPlans,
      color: "text-gray-600",
      bg: "bg-gray-50 border-gray-100",
    },
    {
      label: "Doanh thu active",
      value: formatCurrency(totalRevenue),
      color: "text-violet-600",
      bg: "bg-violet-50 border-violet-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((s) => (
        <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
          <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
          <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
