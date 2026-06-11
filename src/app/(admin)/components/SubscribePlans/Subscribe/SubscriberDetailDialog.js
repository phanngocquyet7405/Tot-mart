/**
 * SubscriberDetailDialog.js
 * Dialog xem chi tiết một đăng ký — thông tin user, gói, lịch giao hàng, quà tặng
 */

"use client";

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
import { PLAN_TYPE_LABELS } from "@/app/util/formatter";
import { formatCurrency } from "@/app/util/formatter";
import { cn } from "@/lib/utils";

function DetailRow({ label, value, className }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-stone-100 last:border-0">
      <span className="text-[11px] uppercase tracking-wider font-bold text-stone-400 shrink-0">
        {label}
      </span>
      <span
        className={cn(
          "text-xs font-semibold text-stone-700 text-right",
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
      <div className="w-6 h-6 rounded-lg bg-[#FFF0EB] flex items-center justify-center">
        <Icon size={12} className="text-[#C85C3C]" />
      </div>
      <span className="text-[11px] font-black uppercase tracking-widest text-stone-500">
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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-base font-black text-stone-800">
              Chi tiết đăng ký
            </h2>
            <p className="text-[11px] text-stone-400 mt-0.5 font-mono">
              #{subscription._id?.slice(-8).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <SubscriberStatusBadge status={subscription.status} size="md" />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors text-stone-400 hover:text-stone-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* ─── Thông tin người dùng ─── */}
          <div>
            <SectionTitle icon={User} title="Người đăng ký" />
            <div className="bg-stone-50 rounded-2xl px-4 py-1">
              <DetailRow label="Họ tên" value={subscription.userId?.name} />
              <DetailRow label="Email" value={subscription.userId?.email} />
            </div>
          </div>

          {/* ─── Thông tin gói ─── */}
          <div>
            <SectionTitle icon={Package} title="Gói đăng ký" />
            <div className="bg-stone-50 rounded-2xl px-4 py-1">
              <DetailRow
                label="Tên gói"
                value={subscription.templateId?.name}
              />
              <DetailRow
                label="Loại gói"
                value={
                  PLAN_TYPE_LABELS[subscription.planType] ??
                  subscription.planType
                }
              />
              <DetailRow label="Hộp" value={subscription.boxId?.name} />
              <DetailRow
                label="Giá gốc"
                value={formatCurrency(subscription.oldPrice ?? 0)}
              />
              <DetailRow
                label="Giảm giá"
                value={
                  subscription.discountPercent
                    ? `${subscription.discountPercent}%`
                    : "Không có"
                }
              />
              <DetailRow
                label="Giá thanh toán"
                value={
                  <span className="text-[#C85C3C] font-black">
                    {formatCurrency(subscription.price ?? 0)}
                  </span>
                }
              />
            </div>
          </div>

          {/* ─── Lịch giao hàng ─── */}
          <div>
            <SectionTitle icon={Truck} title="Lịch giao hàng" />
            <div className="bg-stone-50 rounded-2xl px-4 py-1">
              <DetailRow
                label="Bắt đầu kỳ"
                value={formatDate(subscription.currentPeriodStart)}
              />
              <DetailRow
                label="Kết thúc kỳ"
                value={formatDate(subscription.currentPeriodEnd)}
              />
              <DetailRow
                label="Giao hàng tiếp"
                value={
                  subscription.nextDeliveries
                    ? formatDate(subscription.nextDeliveries)
                    : "Không có"
                }
              />
              <DetailRow
                label="Số lần giao"
                value={`${subscription.remainDeliveries ?? 0} / ${subscription.totalDeliveries ?? 0}`}
              />
              {subscription.cancelAtPeriodEnd && (
                <div className="py-2.5 flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    ⚠ Sẽ hủy cuối kỳ
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ─── Địa chỉ giao hàng ─── */}
          {addr && (
            <div>
              <SectionTitle icon={MapPin} title="Địa chỉ giao hàng" />
              <div className="bg-stone-50 rounded-2xl p-4 space-y-1">
                <p className="text-xs font-semibold text-stone-700">
                  {addr.address}
                </p>
                <p className="text-[11px] text-stone-500">
                  {[addr.district, addr.city, addr.country]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                {addr.phone && (
                  <p className="text-[11px] text-stone-400">📞 {addr.phone}</p>
                )}
                {addr.zipCode && (
                  <p className="text-[11px] text-stone-400">
                    ZIP: {addr.zipCode}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ─── Quà tặng ─── */}
          {subscription.gift && subscription.gift.length > 0 && (
            <div>
              <SectionTitle icon={Gift} title="Quà tặng đi kèm" />
              <div className="space-y-2">
                {subscription.gift.map((g, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-[#FFF8F5] border border-[#F0DDD5] rounded-xl px-4 py-2.5"
                  >
                    <span className="text-xs font-semibold text-stone-700">
                      {g.boxId?.name ?? `Quà ${i + 1}`}
                    </span>
                    {g.deliverAtMonth && (
                      <span className="text-[10px] font-bold text-[#C85C3C] bg-[#FFE8DF] px-2 py-0.5 rounded-full">
                        Tháng {g.deliverAtMonth}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Metadata ─── */}
          <div>
            <SectionTitle icon={Calendar} title="Thời gian" />
            <div className="bg-stone-50 rounded-2xl px-4 py-1">
              <DetailRow
                label="Ngày tạo"
                value={formatDate(subscription.createdAt)}
              />
              <DetailRow
                label="Cập nhật lần cuối"
                value={formatDate(subscription.updatedAt)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-100 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border-2 border-stone-200 text-sm font-bold text-stone-600 hover:border-stone-300 hover:bg-stone-50 transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </>
  );
}
