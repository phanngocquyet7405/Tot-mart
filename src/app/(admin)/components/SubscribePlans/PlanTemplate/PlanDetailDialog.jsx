"use client";
// components/SubscribePlans/PlanDetailDialog.jsx
// Hiển thị chi tiết một Subscription Template (mẫu gói).
// KHÔNG dùng shadcn Dialog — dùng BaseDialog tự làm.

import {
  CalendarClock,
  Package,
  Gift,
  Pencil,
  Trash2,
  CheckCircle2,
  EyeOff,
  AlignLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BaseDialog,
  BaseDialogHeader,
  BaseDialogBody,
  BaseDialogFooter,
} from "./BaseDialog";
import {
  formatCurrency,
  formatDate,
  PLAN_TYPE_LABELS,
} from "@/app/util/formatter";

// ── Atoms ─────────────────────────────────────────────────────────────────────

function SectionLabel({ icon: Icon, color = "text-muted-foreground", label }) {
  return (
    <p
      className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider ${color} mb-2`}
    >
      <Icon size={11} />
      {label}
    </p>
  );
}

function InfoGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((r) => (
        <div
          key={r.label}
          className="rounded-lg border border-border bg-muted/30 p-2.5"
        >
          <p className="text-[11px] text-muted-foreground mb-1">{r.label}</p>
          <div className="font-semibold text-sm text-foreground">
            {r.value ?? "—"}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

/**
 * PlanDetailDialog — hiển thị chi tiết một Subscription Template
 *
 * @param {boolean}   open
 * @param {function}  onOpenChange    (false) => void
 * @param {object}    template        object từ getAllTemplatesApi
 * @param {function}  [onEditClick]   (template) => void — mở form edit
 * @param {function}  [onDeleteClick] (template) => void — xác nhận xoá
 */
export function PlanDetailDialog({
  open,
  onOpenChange,
  template,
  onEditClick,
  onDeleteClick,
}) {
  const item = template;
  if (!item) return null;

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="max-w-lg"
      maxHeight="max-h-[88vh]"
    >
      {/* Header */}
      <BaseDialogHeader
        icon={CalendarClock}
        iconClass="bg-primary/10 text-primary"
        title={item.name}
        subtitle={`ID: ${item._id} · Mẫu gói đăng ký`}
      />

      <BaseDialogBody className="space-y-4">
        {/* Trạng thái hiển thị */}
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
            item.isActive
              ? "bg-success/15 border border-success/20 text-success-text"
              : "bg-muted border border-border text-muted-foreground"
          }`}
        >
          {item.isActive ? (
            <>
              <CheckCircle2 size={15} /> Đang hiển thị cho khách hàng
            </>
          ) : (
            <>
              <EyeOff size={15} /> Đã ẩn — khách không thấy gói này
            </>
          )}
        </div>

        {/* Mô tả */}
        {item.description && (
          <div className="rounded-xl bg-muted/30 border border-border p-3.5">
            <SectionLabel
              icon={AlignLeft}
              color="text-muted-foreground"
              label="Mô tả"
            />
            <p className="text-sm text-foreground leading-relaxed">
              {item.description}
            </p>
          </div>
        )}

        {/* Thông tin gói */}
        <div>
          <SectionLabel
            icon={Package}
            color="text-primary"
            label="Thông tin mẫu gói"
          />
          <InfoGrid
            items={[
              {
                label: "Chu kỳ",
                value: PLAN_TYPE_LABELS[item.planType] || item.planType,
              },
              {
                label: "Combo chính",
                value: item.boxId?.name || item.boxId,
              },
              {
                label: "Giá gốc (từ box)",
                value: formatCurrency(item.basePrice),
              },
              {
                label: "Giảm giá",
                value: item.discountPercent
                  ? `${item.discountPercent}%`
                  : "Không giảm",
              },
              {
                label: "Giá sau giảm",
                value: (
                  <span className="text-primary">
                    <span className="tabular-nums">{formatCurrency(item.discountPrice)}</span>
                  </span>
                ),
              },
              {
                label: "Ngày tạo",
                value: formatDate(item.createdAt),
              },
            ]}
          />
        </div>

        {/* Thanh tiết kiệm */}
        {item.discountPercent > 0 && item.basePrice > 0 && (
          <div className="rounded-xl bg-primary/10 border border-primary/20 px-4 py-3">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-primary font-medium">Mức tiết kiệm</span>
              <span className="font-bold text-primary">
                −<span className="tabular-nums">{formatCurrency(item.basePrice - item.discountPrice)}</span></span>
            </div>
            <div className="h-2 bg-primary/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${100 - item.discountPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
              <span><span className="tabular-nums">{formatCurrency(item.discountPrice)}</span> / khách trả</span>
              <span>{item.discountPercent}% off</span>
            </div>
          </div>
        )}

        {/* Quà tặng kèm */}
        {item.gift?.length > 0 ? (
          <div className="rounded-xl bg-pink-50 border border-pink-100 p-3.5">
            <SectionLabel
              icon={Gift}
              color="text-primary"
              label="Box quà tặng kèm gói"
            />
            <div className="space-y-1.5">
              {item.gift.map((g, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-foreground">
                    {g.boxId?.name || g.boxId}
                  </span>
                  <span className="rounded-full bg-pink-100 text-pink-700 text-xs px-2 py-0.5 font-medium">
                    x{g.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-muted/30 border border-border p-3 text-center">
            <p className="text-xs text-muted-foreground">
              Không có quà tặng kèm gói này
            </p>
          </div>
        )}
      </BaseDialogBody>

      {/* Footer */}
      {(onEditClick || onDeleteClick) && (
        <BaseDialogFooter className="gap-2 justify-between">
          {onDeleteClick && (
            <Button
              size="sm"
              variant="outline"
              className="border-destructive/20 text-destructive-text hover:bg-destructive/10 hover:text-destructive-text"
              onClick={() => {
                onOpenChange(false);
                onDeleteClick(item);
              }}
            >
              <Trash2 size={13} className="mr-1.5" />
              Xoá mẫu gói
            </Button>
          )}
          {onEditClick && (
            <Button
              size="sm"
              className="min-h-11 ml-auto"
              onClick={() => {
                onOpenChange(false);
                onEditClick(item);
              }}
            >
              <Pencil size={13} className="mr-1.5" />
              Chỉnh sửa
            </Button>
          )}
        </BaseDialogFooter>
      )}
    </BaseDialog>
  );
}
