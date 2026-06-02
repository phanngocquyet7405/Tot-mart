// components/SubscribePlans/PlanDetailDialog.jsx
// Chỉ hiển thị chi tiết + nút cancel (end/immediate).
// Không có edit/delete — BE không có route.

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CalendarClock, XCircle, Zap } from "lucide-react";
import {
  formatCurrency,
  formatDate,
  PLAN_TYPE_LABELS,
} from "@/app/util/formatter";
import { StatusBadge } from "./StatusBadge";

export function PlanDetailDialog({
  open,
  onOpenChange,
  plan,
  onCancelClick, // ({ plan, mode: 'end' | 'immediate' }) => void
}) {
  if (!plan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock size={18} className="text-indigo-500" />
            Chi tiết gói: {plan.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          {/* User */}
          <div className="rounded-lg bg-muted/30 p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Người dùng
            </p>
            <p className="font-medium">{plan.userId?.name || "—"}</p>
            <p className="text-muted-foreground">
              {plan.userId?.email || plan.userId}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Loại gói",
                value: PLAN_TYPE_LABELS[plan.planType] || plan.planType,
              },
              {
                label: "Trạng thái",
                value: (
                  <StatusBadge
                    status={plan.status}
                    cancelAtPeriodEnd={plan.cancelAtPeriodEnd}
                  />
                ),
              },
              { label: "Giá hiện tại", value: formatCurrency(plan.price) },
              {
                label: "Giá gốc",
                value: (
                  <span className="line-through text-muted-foreground">
                    {formatCurrency(plan.oldPrice)}
                  </span>
                ),
              },
              {
                label: "Giảm giá",
                value: plan.discountPercent ? `${plan.discountPercent}%` : "0%",
              },
              { label: "Tổng giao hàng", value: plan.totalDeliveries },
              { label: "Đã giao", value: plan.completeDeliveries ?? 0 },
              { label: "Còn lại", value: plan.remainDeliveries },
              {
                label: "Giao hàng tiếp theo",
                value: formatDate(plan.nextDeliveries),
              },
              {
                label: "Giao hàng gần nhất",
                value: formatDate(plan.lastDeliveries),
              },
              {
                label: "Kỳ bắt đầu",
                value: formatDate(plan.currentPeriodStart),
              },
              {
                label: "Kỳ kết thúc",
                value: formatDate(plan.currentPeriodEnd),
              },
            ].map((r) => (
              <div key={r.label} className="rounded-lg border p-2.5">
                <p className="text-[11px] text-muted-foreground mb-1">
                  {r.label}
                </p>
                <div className="font-medium text-sm">{r.value}</div>
              </div>
            ))}
          </div>

          {/* Shipping address */}
          <div className="rounded-lg bg-muted/30 p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Địa chỉ giao hàng
            </p>
            {plan.shippingAddress ? (
              <>
                <p>{plan.shippingAddress.address}</p>
                <p className="text-muted-foreground">
                  {plan.shippingAddress.district}, {plan.shippingAddress.city},{" "}
                  {plan.shippingAddress.country}
                </p>
                <p className="text-muted-foreground">
                  SĐT: {plan.shippingAddress.phone}
                </p>
                <p className="text-muted-foreground">
                  Zip: {plan.shippingAddress.zipCode}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Chưa có</p>
            )}
          </div>

          {/* Gifts */}
          {plan.gift?.length > 0 && (
            <div className="rounded-lg bg-pink-50 border border-pink-100 p-3 space-y-1">
              <p className="text-xs font-semibold text-pink-700 uppercase tracking-wide">
                Quà tặng kèm
              </p>
              {plan.gift.map((g, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{g.boxId?.name || g.boxId}</span>
                  <span className="text-muted-foreground">x{g.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — chỉ hiện cancel nếu active */}
        {onCancelClick && plan.status === "active" && (
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-2 border-t">
            {!plan.cancelAtPeriodEnd && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                onClick={() => {
                  onOpenChange(false);
                  onCancelClick({ plan, mode: "end" });
                }}
              >
                <XCircle size={13} className="mr-1.5" />
                Huỷ cuối kỳ
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => {
                onOpenChange(false);
                onCancelClick({ plan, mode: "immediate" });
              }}
            >
              <Zap size={13} className="mr-1.5" />
              Dừng ngay
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
