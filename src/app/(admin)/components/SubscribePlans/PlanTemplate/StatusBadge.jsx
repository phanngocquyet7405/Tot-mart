// components/SubscribePlans/StatusBadge.jsx
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, Ban, XCircle } from "lucide-react";

export function StatusBadge({ status, cancelAtPeriodEnd }) {
  if (cancelAtPeriodEnd && status === "active") {
    return (
      <Badge className="bg-warning/15 text-warning-text border-warning/20 gap-1 font-medium">
        <Clock size={11} /> Hủy cuối kỳ
      </Badge>
    );
  }
  const map = {
    active: "bg-success/15 text-success-text border-success/20",
    cancelled: "bg-destructive/15 text-destructive-text border-destructive/20",
    expired: "bg-muted text-muted-foreground border-border",
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
    <Badge className={`${map[status] || "bg-muted text-muted-foreground border-border"} gap-1 font-medium`}>
      {icons[status]} {labels[status] || status}
    </Badge>
  );
}
