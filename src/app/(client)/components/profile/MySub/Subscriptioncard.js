"use client";
/**
 * SubscriptionCard.js
 * Card hiển thị một gói đăng ký trong trang My Subscriptions
 */

import {
  MapPin,
  Gift,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  XCircle,
  Zap,
  Package,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DeliveryTimeline } from "./Deliverytimeline";
import {
  STATUS_CONFIG,
  getDaysRemaining,
} from "@/app/services/api/MySubscriptionService";
import { formatCurrency, PLAN_TYPE_LABELS } from "@/app/util/formatter";
import { useBoxProducts } from "@/hooks/useBoxProducts";
import { cn } from "@/lib/utils";
import Image from "next/image";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80";

export function SubscriptionCard({ subscription: sub, onCancel }) {
  const [expanded, setExpanded] = useState(false);

  // Sản phẩm bên trong box của gói này — chỉ tải khi người dùng mở "Chi tiết"
  const boxId = sub.boxId?._id;
  const {
    products: boxProducts,
    isLoading: loadingProducts,
    hasFetched,
    refetch: fetchBoxProducts,
  } = useBoxProducts(boxId, { lazy: true });

  useEffect(() => {
    if (expanded && boxId && !hasFetched) {
      fetchBoxProducts();
    }
  }, [expanded, boxId, hasFetched, fetchBoxProducts]);

  const config = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG["cancelled"];
  const planLabel = PLAN_TYPE_LABELS[sub.planType] ?? sub.planType;
  const daysLeft = getDaysRemaining(sub.currentPeriodEnd);
  const canCancel = ["active", "pending_payment"].includes(sub.status);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  return (
    <div
      className={cn(
        "bg-card rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs",
        sub.status === "active"
          ? "border-border"
          : "border-border/60 opacity-80",
      )}
    >
      {sub.status === "pending_payment" && (
        <div className="p-3.5 bg-warning-text/10 border-b border-warning-text/25 text-xs">
          <Link
            className="underline font-bold text-warning-text hover:text-foreground transition-colors"
            href={`/checkout?code=${encodeURIComponent(sub.paymentCode)}`}
          >
            Vui lòng thanh toán để kích hoạt gói đăng ký này
          </Link>
        </div>
      )}

      {/* ─── Card Header ─── */}
      <div className="p-5 flex items-start gap-4">
        {/* Box image */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
          <Image
            fill
            src={sub.boxId?.images?.[0] ?? PLACEHOLDER}
            alt={sub.boxId?.name || "Box"}
            className="w-full h-full object-cover"
            sizes="64px"
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-sm font-bold text-foreground leading-tight">
                {sub.templateId?.name ?? "Gói đăng ký định kỳ"}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {planLabel} · {sub.boxId?.name}
              </p>
            </div>

            {/* Status badge */}
            <span
              className={cn(
                "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0 border",
                config.badgeClass,
              )}
            >
              <span
                className={cn("w-1.5 h-1.5 rounded-full", config.dotClass)}
              />
              {config.label}
            </span>
          </div>

          {/* Price row */}
          <div className="flex items-center gap-2.5 mt-2.5">
            <span className="text-base font-bold text-primary tabular-nums">
              {formatCurrency(sub.price ?? 0)}
            </span>
            {sub.discountPercent > 0 && (
              <>
                <span className="text-xs text-muted-foreground line-through tabular-nums">
                  {formatCurrency(sub.oldPrice ?? 0)}
                </span>
                <span className="text-[11px] font-bold text-success-text bg-success-text/10 border border-success-text/25 px-1.5 py-0.5 rounded-md tabular-nums">
                  -{sub.discountPercent}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Delivery Progress ─── */}
      {sub.status === "active" && (
        <div className="px-5 pb-4">
          <DeliveryTimeline
            totalDeliveries={sub.totalDeliveries}
            remainDeliveries={sub.remainDeliveries}
          />
        </div>
      )}

      {/* ─── Quick info strip ─── */}
      <div className="px-5 pb-4 flex flex-wrap items-center gap-3 border-b border-border/50">
        {sub.nextDeliveries && sub.status === "active" && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Calendar size={12} className="text-primary shrink-0" />
            <span>
              Lần giao kế tiếp:{" "}
              <span className="font-bold text-foreground tabular-nums">
                {formatDate(sub.nextDeliveries)}
              </span>
            </span>
          </div>
        )}

        {daysLeft !== null && sub.status === "active" && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className={cn(
                "font-bold tabular-nums",
                daysLeft <= 7 ? "text-warning-text" : "text-foreground",
              )}
            >
              {daysLeft} ngày còn lại
            </span>
            <span>trong chu kỳ</span>
          </div>
        )}

        {sub.cancelAtPeriodEnd && (
          <span className="text-[11px] font-bold text-warning-text bg-warning-text/10 border border-warning-text/25 px-2 py-0.5 rounded-full">
            ⚠ Sẽ hủy vào {formatDate(sub.currentPeriodEnd)}
          </span>
        )}
      </div>

      {/* ─── Expanded detail ─── */}
      {expanded && (
        <div className="px-5 py-4 space-y-3.5 bg-muted/20 border-b border-border/60">
          {/* Address */}
          {sub.shippingAddress && (
            <div className="flex items-start gap-2">
              <MapPin size={13} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Địa chỉ nhận hàng
                </p>
                <p className="text-xs font-medium text-foreground">
                  {sub.shippingAddress.address}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {[sub.shippingAddress.district, sub.shippingAddress.city]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Sản phẩm trong hộp */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Package size={13} className="text-primary" />
              Sản phẩm dự kiến trong hộp
            </p>

            {loadingProducts ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                <Loader2 size={13} className="animate-spin" />
                Đang tải danh sách sản phẩm...
              </div>
            ) : boxProducts.length > 0 ? (
              <div className="space-y-1.5">
                {boxProducts.slice(0, 4).map((p, i) => {
                  const href = p._id
                    ? `/products/${p.slug || "san-pham"}-${p._id}`
                    : null;
                  const row = (
                    <>
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-card border border-border shrink-0">
                        {p.images?.[0]?.url ? (
                          <Image
                            src={p.images[0].url}
                            alt={p.name || "Sản phẩm"}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package size={12} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <span className="flex-1 min-w-0 text-xs font-medium text-foreground truncate">
                        {p.name || "Sản phẩm"}
                      </span>
                      <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                        x{p.quantity || 1}
                      </span>
                      {href && (
                        <ChevronRight
                          size={12}
                          className="text-muted-foreground shrink-0"
                        />
                      )}
                    </>
                  );
                  return href ? (
                    <Link
                      key={p._id || i}
                      href={href}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1 -mx-2 hover:bg-card transition-colors"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div
                      key={p._id || i}
                      className="flex items-center gap-2.5 px-2 py-1 -mx-2"
                    >
                      {row}
                    </div>
                  );
                })}
                {boxProducts.length > 4 && boxId && (
                  <Link
                    href={`/products/box/${boxId}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline mt-1"
                  >
                    Xem toàn bộ {boxProducts.length} sản phẩm
                    <ChevronRight size={11} />
                  </Link>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">
                Chưa có danh sách sản phẩm chi tiết cho combo này.
              </p>
            )}
          </div>

          {/* Gifts */}
          {sub.gift && sub.gift.length > 0 && (
            <div className="flex items-start gap-2">
              <Gift size={13} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Quà tặng đi kèm
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sub.gift.map((g, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20"
                    >
                      {g.boxId?.name ?? `Quà tặng ${i + 1}`}
                      {g.deliverAtMonth && ` · Tháng ${g.deliverAtMonth}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex gap-6 pt-1 text-xs">
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Ngày bắt đầu
              </p>
              <p className="font-semibold text-foreground mt-0.5 tabular-nums">
                {formatDate(sub.currentPeriodStart)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Kết thúc kỳ
              </p>
              <p className="font-semibold text-foreground mt-0.5 tabular-nums">
                {formatDate(sub.currentPeriodEnd)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Footer actions ─── */}
      <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2">
        {/* Cancel actions */}
        <div className="flex items-center gap-2">
          {canCancel && (
            <>
              <button
                type="button"
                onClick={() => onCancel(sub, "at_end")}
                className="min-h-9 px-2 text-xs font-semibold text-muted-foreground hover:text-warning-text transition-colors flex items-center gap-1.5"
              >
                <XCircle size={13} />
                Hủy vào cuối kỳ
              </button>
              <span className="text-border">|</span>
              <button
                type="button"
                onClick={() => onCancel(sub, "immediately")}
                className="min-h-9 px-2 text-xs font-semibold text-muted-foreground hover:text-destructive-text transition-colors flex items-center gap-1.5"
              >
                <Zap size={13} />
                Hủy ngay
              </button>
            </>
          )}
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="min-h-9 px-3 rounded-lg border border-border bg-background hover:bg-muted text-xs font-bold text-foreground transition-colors flex items-center gap-1 ml-auto"
        >
          {expanded ? (
            <>
              <ChevronUp size={13} /> Thu gọn
            </>
          ) : (
            <>
              <ChevronDown size={13} /> Xem chi tiết
            </>
          )}
        </button>
      </div>
    </div>
  );
}
