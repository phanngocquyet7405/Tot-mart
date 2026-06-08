/**
 * SubscriptionCard.js
 * Card hiển thị một gói đăng ký trong trang My Subscriptions
 */

"use client";

import {
  MapPin,
  Gift,
  Calendar,
  ChevronDown,
  ChevronUp,
  XCircle,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { DeliveryTimeline } from "./Deliverytimeline";
import {
  STATUS_CONFIG,
  getDaysRemaining,
} from "@/app/services/api/MySubscriptionService";
import { formatCurrency, PLAN_TYPE_LABELS } from "@/app/util/formatter";
import { cn } from "@/lib/utils";
import Image from "next/image";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80";

export function SubscriptionCard({ subscription: sub, onCancel }) {
  const [expanded, setExpanded] = useState(false);

  const config = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG["cancelled"];
  const planLabel = PLAN_TYPE_LABELS[sub.planType] ?? sub.planType;
  const daysLeft = getDaysRemaining(sub.currentPeriodEnd);
  const canCancel = sub.status === "active" && !sub.cancelAtPeriodEnd;

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
        "bg-white rounded-3xl border-2 overflow-hidden transition-all duration-300",
        sub.status === "active"
          ? "border-[#F0DDD5] shadow-sm hover:shadow-md"
          : "border-stone-100 opacity-75",
      )}
    >
      {/* ─── Card Header ─── */}
      <div className="p-5 flex items-start gap-4">
        {/* Box image */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-stone-100 shrink-0">
          <Image
            fill
            src={sub.boxId?.images?.[0] ?? PLACEHOLDER}
            alt={sub.boxId?.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = PLACEHOLDER;
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <h3 className="text-sm font-black text-stone-800 leading-tight">
                {sub.templateId?.name ?? "Gói đăng ký"}
              </h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {planLabel} · {sub.boxId?.name}
              </p>
            </div>

            {/* Status badge */}
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shrink-0"
              style={{
                backgroundColor: config.bg,
                color: config.text,
                border: `1px solid ${config.border}`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: config.dot }}
              />
              {config.label}
            </span>
          </div>

          {/* Price row */}
          <div className="flex items-center gap-3 mt-2.5">
            <span className="text-base font-black text-[#C85C3C]">
              {formatCurrency(sub.price ?? 0)}
            </span>
            {sub.discountPercent > 0 && (
              <>
                <span className="text-xs text-stone-300 line-through">
                  {formatCurrency(sub.oldPrice ?? 0)}
                </span>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
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
      <div className="px-5 pb-4 flex flex-wrap gap-3">
        {sub.nextDeliveries && sub.status === "active" && (
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            <Calendar size={11} className="text-[#C85C3C]" />
            <span>
              Giao tiếp:{" "}
              <span className="font-bold">
                {formatDate(sub.nextDeliveries)}
              </span>
            </span>
          </div>
        )}

        {daysLeft !== null && sub.status === "active" && (
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            <span
              className={cn(
                "font-bold",
                daysLeft <= 7 ? "text-amber-600" : "text-stone-600",
              )}
            >
              {daysLeft} ngày còn lại
            </span>
            <span>trong kỳ</span>
          </div>
        )}

        {sub.cancelAtPeriodEnd && (
          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            ⚠ Hủy vào {formatDate(sub.currentPeriodEnd)}
          </span>
        )}
      </div>

      {/* ─── Expanded detail ─── */}
      {expanded && (
        <div className="border-t border-stone-100 px-5 py-4 space-y-3 bg-stone-50/50">
          {/* Address */}
          {sub.shippingAddress && (
            <div className="flex items-start gap-2">
              <MapPin size={12} className="text-[#C85C3C] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-0.5">
                  Địa chỉ giao hàng
                </p>
                <p className="text-xs text-stone-600">
                  {sub.shippingAddress.address}
                </p>
                <p className="text-[11px] text-stone-400">
                  {[sub.shippingAddress.district, sub.shippingAddress.city]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          )}

          {/* Gifts */}
          {sub.gift && sub.gift.length > 0 && (
            <div className="flex items-start gap-2">
              <Gift size={12} className="text-[#C85C3C] mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1.5">
                  Quà tặng đi kèm
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {sub.gift.map((g, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-semibold px-2 py-0.5 bg-[#FFF0EB] text-[#C85C3C] rounded-full border border-[#F0DDD5]"
                    >
                      {g.boxId?.name ?? `Quà ${i + 1}`}
                      {g.deliverAtMonth && ` · T${g.deliverAtMonth}`}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="flex gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Bắt đầu
              </p>
              <p className="text-xs font-semibold text-stone-600 mt-0.5">
                {formatDate(sub.currentPeriodStart)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Kết thúc kỳ
              </p>
              <p className="text-xs font-semibold text-stone-600 mt-0.5">
                {formatDate(sub.currentPeriodEnd)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── Footer actions ─── */}
      <div className="border-t border-stone-100 px-5 py-3 flex items-center justify-between">
        {/* Cancel actions */}
        <div className="flex items-center gap-2">
          {canCancel && (
            <>
              <button
                onClick={() => onCancel(sub, "at_end")}
                className="text-[10px] font-bold text-stone-400 hover:text-amber-600 transition-colors flex items-center gap-1"
              >
                <XCircle size={11} />
                Hủy cuối kỳ
              </button>
              <span className="text-stone-200">|</span>
              <button
                onClick={() => onCancel(sub, "immediately")}
                className="text-[10px] font-bold text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <Zap size={11} />
                Hủy ngay
              </button>
            </>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-1 text-[10px] font-bold text-stone-400 hover:text-stone-600 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp size={12} /> Thu gọn
            </>
          ) : (
            <>
              <ChevronDown size={12} /> Chi tiết
            </>
          )}
        </button>
      </div>
    </div>
  );
}
