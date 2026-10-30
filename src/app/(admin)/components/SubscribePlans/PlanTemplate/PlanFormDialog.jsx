"use client";
import logger from "@/app/util/Logger";
// components/SubscribePlans/PlanFormDialog.jsx
// Tạo / Cập nhật Subscription Template (MẪU GÓI).
// Template là cấu hình gói mà admin định nghĩa — KHÔNG phải subscription của user.
//
// Fields gửi lên BE:
//   name, description, boxId, planType, discountPercent, isActive, gift[]
//
// Fields BE tự tính (KHÔNG gửi):
//   basePrice (từ box.value), discountPrice

import { useEffect, useState } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Gift,
  Package,
  Settings2,
  X,
  ToggleLeft,
  AlignLeft,
  Tag,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import { getAllBoxesApi } from "@/app/services/api/boxService";
import { useTemplateForm } from "../../../../../hooks/useTemplateForm";
import { formatCurrency, PLAN_TYPE_LABELS } from "@/app/util/formatter";
import { toast } from "sonner";

// ── Atoms ─────────────────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, color, label, aside }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div
        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${color}`}
      >
        <Icon size={13} />
        {label}
      </div>
      {aside}
    </div>
  );
}

function Field({ label, error, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">
        {label}
        {required && <span className="text-destructive-text ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {error && <p className="text-[11px] text-destructive-text font-medium">{error}</p>}
    </div>
  );
}

// planType → số lần giao hàng mặc định để hiển thị gợi ý
const PLAN_TYPE_DELIVERY_HINT = {
  monthly: "Giao 1 lần/tháng",
  quarterly: "Giao 1 lần/3 tháng",
  biannual: "Giao 1 lần/6 tháng",
  annual: "Giao 1 lần/năm",
};

// ── Main ──────────────────────────────────────────────────────────────────────

/**
 * PlanFormDialog
 *
 * @param {boolean}  open
 * @param {function} onOpenChange  (false) => void
 * @param {object}   [editTarget]  template object nếu là chế độ sửa, null nếu tạo mới
 * @param {function} onSuccess     () => void — gọi sau khi lưu thành công
 */
export function PlanFormDialog({
  open,
  onOpenChange,
  editTarget = null,
  onSuccess,
}) {
  const [boxes, setBoxes] = useState([]);
  const [loadingBoxes, setLoadingBoxes] = useState(false);

  // Load danh sách box khi dialog mở
  useEffect(() => {
    if (!open) return;

    const fetchBoxes = async () => {
      try {
        setLoadingBoxes(true);
        const res = await getAllBoxesApi();
        setBoxes(res.data);
      } catch (error) {
        logger.error("Failed to load boxes:", error);
        toast.error("Không tải được danh sách box, vui lòng thử lại.");
      } finally {
        setLoadingBoxes(false);
      }
    };
    fetchBoxes();
  }, [open]);

  // Khoá scroll body
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const {
    form,
    errors,
    isSaving,
    isEdit,
    pricePreview,
    selectedBox,
    set,
    addGift,
    updateGift,
    removeGift,
    handleSave,
  } = useTemplateForm({
    open,
    boxes,
    editTarget,
    onSuccess,
    onClose: () => onOpenChange(false),
  });

  // Đóng khi click overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      {/* Panel */}
      <div className="relative w-full max-w-2xl max-h-[94vh] flex flex-col rounded-2xl bg-card shadow-2xl ring-1 ring-border overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Settings2 size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-tight">
                {isEdit ? "Chỉnh sửa mẫu gói" : "Tạo mẫu gói mới"}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {isEdit
                  ? `Đang sửa: ${editTarget?.name}`
                  : "Mẫu gói sẽ hiển thị cho khách hàng chọn đăng ký"}
              </p>
            </div>
          </div>
          <button
            onClick={() => !isSaving && onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* ── SECTION 1: Thông tin cơ bản ── */}
          <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
            <SectionTitle
              icon={Tag}
              color="text-primary"
              label="Thông tin mẫu gói"
              aside={
                // Toggle isActive ngay trong header section
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-xs text-muted-foreground font-medium">
                    {form.isActive ? "Đang hiển thị" : "Đã ẩn"}
                  </span>
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) => set("isActive", v)}
                  />
                </label>
              }
            />

            {/* Tên mẫu gói */}
            <Field label="Tên mẫu gói" required error={errors.name}>
              <Input
                placeholder="VD: Gói Wellness Hàng Tháng, Gói Premium Quý..."
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>

            {/* Mô tả */}
            <Field
              label="Mô tả"
              hint="Mô tả ngắn hiển thị cho khách hàng khi chọn gói"
            >
              <Textarea
                placeholder="Gói đăng ký cao cấp bao gồm các sản phẩm chăm sóc sức khỏe được tuyển chọn hàng tháng..."
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
                className="resize-none text-sm"
              />
            </Field>

            {/* Chu kỳ */}
            <Field label="Chu kỳ gói" required>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(PLAN_TYPE_LABELS).map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => set("planType", v)}
                    className={`rounded-lg border px-3 py-2.5 text-center transition-all ${
                      form.planType === v
                        ? "border-primary bg-primary/10 text-primary font-semibold ring-1 ring-primary/30"
                        : "border-border bg-card text-foreground hover:border-border hover:bg-muted/30"
                    }`}
                  >
                    <p className="text-xs font-medium leading-tight">{l}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {PLAN_TYPE_DELIVERY_HINT[v]}
                    </p>
                  </button>
                ))}
              </div>
            </Field>
          </div>

          {/* ── SECTION 2: Box & Giá ── */}
          <div className="rounded-xl border border-border bg-muted/30 p-5 space-y-4">
            <SectionTitle
              icon={Package}
              color="text-primary"
              label="Box & Định giá"
            />

            <div className="grid grid-cols-2 gap-4 items-start">
              {/* Chọn box */}
              <div className="space-y-4">
                <Field
                  label="Combo chính"
                  required
                  error={errors.boxId}
                  hint="Giá gốc lấy từ giá trị box"
                >
                  <select
                    value={form.boxId}
                    onChange={(e) => set("boxId", e.target.value)}
                    disabled={loadingBoxes}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                  >
                    <option value="">
                      {loadingBoxes ? "Đang tải..." : "— Chọn box —"}
                    </option>
                    {boxes.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                        {b.value ? ` — ${formatCurrency(b.value)}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Giảm giá (%)"
                  error={errors.discountPercent}
                  hint="Từ 0 đến dưới 100%; tổng trả trước phải dương"
                >
                  <Input
                    type="number"
                    min={0}
                    max={99.99}
                    step="0.01"
                    value={form.discountPercent}
                    onChange={(e) =>
                      set(
                        "discountPercent",
                        Math.max(0, +e.target.value),
                      )
                    }
                  />
                </Field>
              </div>

              {/* Price preview */}
              {pricePreview ? (
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 space-y-2.5">
                  <p className="text-[11px] font-bold text-primary uppercase tracking-wide flex items-center gap-1">
                    <Info size={10} /> Xem trước giá
                  </p>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Giá gốc (từ box)</span>
                      <span
                        className={
                          form.discountPercent > 0
                            ? "line-through text-muted-foreground"
                            : "font-semibold text-primary"
                        }
                      >
                        {pricePreview.formattedBase}
                      </span>
                    </div>

                    {form.discountPercent > 0 && (
                      <>
                        <div className="flex justify-between text-destructive-text">
                          <span>Giảm {form.discountPercent}%</span>
                          <span>−{pricePreview.formattedDiscount}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm text-primary border-t border-primary/20 pt-2">
                          <span>Giá sau giảm</span>
                          <span>{pricePreview.formattedFinal}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <p className="text-[11px] text-primary/70 leading-relaxed pt-1 border-t border-primary/20">
                    Giá gốc do hệ thống lấy tự động từ box — admin không cần
                    nhập thủ công.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl bg-muted border border-border p-4 flex flex-col items-center justify-center min-h-32.5 gap-2">
                  <Package size={22} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground text-center">
                    Chọn box để xem
                    <br />
                    giá tự động tính
                  </p>
                </div>
              )}
            </div>

            {/* Gift boxes */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Gift size={12} className="text-primary" />
                  Box quà tặng kèm gói
                  {form.gift.length > 0 && (
                    <Badge className="ml-1 bg-primary/10 text-primary border-0 text-[11px] py-0 h-4">
                      {form.gift.length}
                    </Badge>
                  )}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs text-primary border-primary/20 hover:bg-primary/5"
                  onClick={addGift}
                >
                  <Plus size={11} className="mr-1" />
                  Thêm quà
                </Button>
              </div>

              {form.gift.length === 0 && (
                <p className="text-[11px] text-muted-foreground pl-0.5">
                  Không có quà kèm — khách chỉ nhận box chính.
                </p>
              )}

              {form.gift.length > 0 && (
                <div className="space-y-2 bg-primary/5 border border-primary/20 rounded-xl p-3">
                  {form.gift.map((g, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-2 items-start"
                    >
                      <div className="col-span-8 space-y-0.5">
                        <select
                          className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          value={g.boxId}
                          onChange={(e) =>
                            updateGift(i, "boxId", e.target.value)
                          }
                        >
                          <option value="">— Chọn combo quà —</option>
                          {boxes.map((b) => (
                            <option key={b._id} value={b._id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                        {errors[`gift_${i}_boxId`] && (
                          <p className="text-[11px] text-destructive-text">
                            {errors[`gift_${i}_boxId`]}
                          </p>
                        )}
                      </div>
                      <div className="col-span-3 space-y-0.5">
                        <Input
                          className="h-8 text-xs text-center"
                          type="number"
                          min={1}
                          value={g.quantity}
                          onChange={(e) =>
                            updateGift(i, "quantity", +e.target.value)
                          }
                          placeholder="SL"
                        />
                        {errors[`gift_${i}_qty`] && (
                          <p className="text-[11px] text-destructive-text">
                            {errors[`gift_${i}_qty`]}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="col-span-1 h-8 w-8 text-destructive-text hover:bg-destructive/10 hover:text-destructive-text"
                        onClick={() => removeGift(i)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Note ── */}
          <div className="flex items-start gap-2 rounded-lg bg-warning/15 border border-warning/20 px-4 py-3">
            <Info size={13} className="text-warning-text mt-0.5 shrink-0" />
            <p className="text-xs text-warning-text leading-relaxed">
              Đây là <strong>mẫu gói</strong> hiển thị cho khách hàng chọn đăng
              ký. Sau khi khách đăng ký, hệ thống sẽ tạo một subscription riêng
              gắn với tài khoản của họ. Thông tin giao hàng và lịch giao sẽ được
              quản lý ở phần Subscription.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
          {/* isActive summary */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ToggleLeft
              size={14}
              className={form.isActive ? "text-success-text" : "text-muted-foreground"}
            />
            {form.isActive ? (
              <span className="text-success-text font-medium">
                Sẽ hiển thị cho khách hàng
              </span>
            ) : (
              <span className="text-muted-foreground">
                Sẽ ẩn — khách không thấy gói này
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => !isSaving && onOpenChange(false)}
              disabled={isSaving}
            >
              Huỷ
            </Button>
            <Button
              className="min-w-32 min-h-11"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Lưu thay đổi" : "Tạo mẫu gói"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
