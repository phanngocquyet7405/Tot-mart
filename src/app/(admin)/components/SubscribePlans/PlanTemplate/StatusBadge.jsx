// components/SubscribePlans/StatusBadge.jsx
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Ban, XCircle } from "lucide-react";

export function StatusBadge({ status, cancelAtPeriodEnd }) {
  if (cancelAtPeriodEnd && status === "active") {
    return (
      <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
        <Clock size={11} /> Hủy cuối kỳ
      </Badge>
    );
  }
  const map = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    expired: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const icons = {
    active: <CheckCircle2 size={11} />,
    cancelled: <Ban size={11} />,
    expired: <XCircle size={11} />,
  };
  const labels = {
    active: "Đang hoạt động",
    cancelled: "Đã hủy",
    expired: "Hết hạn",
  };
  return (
    <Badge className={`${map[status] || ""} gap-1`}>
      {icons[status]} {labels[status] || status}
    </Badge>
  );
}
