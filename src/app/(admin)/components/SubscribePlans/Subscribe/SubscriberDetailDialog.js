"use client";
/**
 * SubscriberDetailDialog.js
 * Dialog xem chi tiết một đăng ký — thông tin user, gói, lịch giao hàng, quà tặng
 */

import {
  X,
  User,
  Package,
  MapPin,
  Gift,
  Calendar,
  TrendingDown,
  RotateCcw,
  Truck,
} from "lucide-react";
import { SubscriberStatusBadge } from "./Subscriberstatusbadge";
import { Button } from "@/components/ui/button";
import { PLAN_TYPE_LABELS, formatCurrency } from "@/app/util/formatter";
import { cn } from "@/lib/utils";

function DetailRow({ label, value, className }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/60 last:border-0">
      <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground shrink-0">
        {label}
      </span>
      <span
        className={cn(
          "text-xs font-semibold text-foreground text-right",
          className,
        )}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon size={12} className="text-primary" />
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </span>
    </div>
  );
}

export function SubscriberDetailDialog({ subscription, open, onClose }) {
  if (!open || !subscription) return null;

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  const addr = subscription.shippingAddress;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-card border-l border-border shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">
                #{subscription._id?.slice(-8)}
              </span>
              <SubscriberStatusBadge
                status={subscription.status}
                size="sm"
              />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {subscription.templateId?.name ?? "Đăng ký định kỳ"}
            </h3>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="min-h-11 min-w-11 text-muted-foreground"
          >
            <X size={18} />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* User info */}
          <div>
            <SectionTitle icon={User} title="Khách hàng" />
            <div className="bg-muted/30 rounded-xl p-4 border border-border/60">
              <DetailRow
                label="Họ tên"
                value={subscription.userId?.name}
              />
              <DetailRow
                label="Email"
                value={subscription.userId?.email}
              />
              <DetailRow
                label="Điện thoại"
                value={subscription.userId?.phone || addr?.phone}
                className="tabular-nums"
              />
            </div>
          </div>

          {/* Delivery address */}
          {addr && (
            <div>
              <SectionTitle icon={MapPin} title="Địa chỉ nhận hàng" />
              <div className="bg-muted/30 rounded-xl p-4 border border-border/60">
                <DetailRow label="Người nhận" value={addr.receiverName || subscription.userId?.name} />
                <DetailRow label="SĐT nhận" value={addr.phone} className="tabular-nums" />
                <DetailRow
                  label="Địa chỉ"
                  value={[addr.address, addr.district, addr.city]
                    .filter(Boolean)
                    .join(", ")}
                />
              </div>
            </div>
          )}

          {/* Plan & Pricing */}
          <div>
            <SectionTitle icon={Package} title="Gói & Thanh toán" />
            <div className="bg-muted/30 rounded-xl p-4 border border-border/60">
              <DetailRow
                label="Chu kỳ"
                value={
                  PLAN_TYPE_LABELS[subscription.planType] ??
                  subscription.planType
                }
              />
              <DetailRow
                label="Tổng số lần giao"
                value={`${subscription.totalDeliveries ?? 0} lần`}
                className="tabular-nums"
              />
              <DetailRow
                label="Còn lại"
                value={`${subscription.remainDeliveries ?? 0} lần`}
                className="tabular-nums"
              />
              <DetailRow
                label="Giá gốc"
                value={formatCurrency(subscription.oldPrice ?? subscription.price ?? 0)}
                className="line-through text-muted-foreground tabular-nums"
              />
              <DetailRow
                label="Giá thanh toán"
                value={formatCurrency(subscription.price ?? 0)}
                className="text-primary font-bold text-sm tabular-nums"
              />
              {subscription.discountPercent > 0 && (
                <DetailRow
                  label="Giảm giá"
                  value={`-${subscription.discountPercent}%`}
                  className="text-destructive-text tabular-nums"
                />
              )}
            </div>
          </div>

          {/* Schedule */}
          <div>
            <SectionTitle icon={Calendar} title="Lịch trình" />
            <div className="bg-muted/30 rounded-xl p-4 border border-border/60">
              <DetailRow
                label="Bắt đầu"
                value={formatDate(subscription.startDate)}
                className="tabular-nums"
              />
              <DetailRow
                label="Kết thúc"
                value={formatDate(subscription.endDate)}
                className="tabular-nums"
              />
              <DetailRow
                label="Giao tiếp theo"
                value={formatDate(subscription.nextDeliveries)}
                className="text-primary font-semibold tabular-nums"
              />
              {subscription.cancelAtPeriodEnd && (
                <DetailRow
                  label="Lưu ý"
                  value="Hủy khi hết chu kỳ hiện tại"
                  className="text-warning-text"
                />
              )}
            </div>
          </div>

          {/* Gifts */}
          {subscription.gift && subscription.gift.length > 0 && (
            <div>
              <SectionTitle icon={Gift} title="Quà tặng kèm" />
              <div className="space-y-2">
                {subscription.gift.map((g, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20"
                  >
                    <Gift size={16} className="text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {g.boxId?.name ?? `Quà tặng #${idx + 1}`}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Combo quà tặng kèm gói
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end shrink-0">
          <Button
            variant="outline"
            onClick={onClose}
            className="min-h-11"
          >
            Đóng
          </Button>
        </div>
      </div>
    </>
  );
}
