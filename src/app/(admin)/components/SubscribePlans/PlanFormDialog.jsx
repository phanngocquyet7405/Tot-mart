"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  Plus,
  Trash2,
  Gift,
  Package,
  MapPin,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { getAllBoxesApi } from "@/app/services/api/boxService";
import {
  createPlanApi,
  planApi,
} from "@/app/services/api/subscribePlanService";
import {
  formatCurrency,
  PLAN_TYPE_LABELS,
  DEFAULT_DELIVERIES,
} from "@/app/util/formatter";

// ─── Constants ───────────────────────────────────────────────────────────────

const EMPTY_ADDRESS = {
  address: "",
  district: "",
  city: "",
  country: "Vietnam",
  zipCode: "",
  phone: "",
};

const EMPTY_FORM = {
  name: "",
  userId: "",
  boxId: "",
  planType: "1_month",
  totalDeliveries: 1,
  discountPercent: 0,
  cancelAtPeriodEnd: false,
  gift: [],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, color, label }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${color} mb-3`}
    >
      <Icon size={13} />
      {label}
    </div>
  );
}

function Field({ label, error, required, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
      {error && <p className="text-[11px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PlanFormDialog({ open, onOpenChange, plan, onSuccess }) {
  const isEdit = !!plan;

  const [form, setForm] = useState(EMPTY_FORM);
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [boxes, setBoxes] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Load boxes list
  useEffect(() => {
    if (!open) return;
    getAllBoxesApi()
      .then((res) => setBoxes(res.data?.boxes || res.data || []))
      .catch(() => toast.error("Không thể tải danh sách box"));
  }, [open]);

  // Populate form on open
  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setForm({
        name: plan.name || "",
        userId:
          typeof plan.userId === "object"
            ? plan.userId?._id || ""
            : plan.userId || "",
        boxId:
          typeof plan.boxId === "object"
            ? plan.boxId?._id || ""
            : plan.boxId || "",
        planType: plan.planType || "1_month",
        totalDeliveries: plan.totalDeliveries || 1,
        discountPercent: plan.discountPercent || 0,
        cancelAtPeriodEnd: plan.cancelAtPeriodEnd || false,
        gift: (plan.gift || []).map((g) => ({
          boxId:
            typeof g.boxId === "object" ? g.boxId?._id || "" : g.boxId || "",
          quantity: g.quantity || 1,
        })),
      });
      setAddress({ ...EMPTY_ADDRESS, ...(plan.shippingAddress || {}) });
    } else {
      setForm(EMPTY_FORM);
      setAddress(EMPTY_ADDRESS);
    }
    setErrors({});
  }, [open, plan, isEdit]);

  // Computed price preview
  const selectedBox = useMemo(
    () => boxes.find((b) => b._id === form.boxId),
    [boxes, form.boxId],
  );

  const pricePreview = useMemo(() => {
    if (!selectedBox?.value) return null;
    const original = selectedBox.value;
    const discountAmt = (original * (form.discountPercent || 0)) / 100;
    return { original, discountAmt, final: original - discountAmt };
  }, [selectedBox, form.discountPercent]);

  // Field setters with error clearing
  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  };

  const setAddr = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    const key = `addr_${field}`;
    setErrors((prev) => {
      const { [key]: _, ...rest } = prev;
      return rest;
    });
  };

  const handlePlanTypeChange = (val) => {
    setForm((prev) => ({
      ...prev,
      planType: val,
      // Auto-fill totalDeliveries only for new plans
      ...(!isEdit && { totalDeliveries: DEFAULT_DELIVERIES[val] || 1 }),
    }));
  };

  // Gift management
  const addGift = () =>
    setForm((prev) => ({
      ...prev,
      gift: [...prev.gift, { boxId: "", quantity: 1 }],
    }));
  const updateGift = (i, field, value) => {
    const next = [...form.gift];
    next[i] = { ...next[i], [field]: value };
    setForm((prev) => ({ ...prev, gift: next }));
  };
  const removeGift = (i) =>
    setForm((prev) => ({
      ...prev,
      gift: prev.gift.filter((_, idx) => idx !== i),
    }));

  // Validation
  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Tên gói là bắt buộc";
    if (!isEdit && !form.userId.trim()) e.userId = "User ID là bắt buộc";
    if (!form.boxId) e.boxId = "Vui lòng chọn box";
    if (!form.totalDeliveries || form.totalDeliveries < 1)
      e.totalDeliveries = "Tối thiểu 1 lần giao";
    if (form.discountPercent < 0 || form.discountPercent > 100)
      e.discountPercent = "Từ 0 đến 100";
    // Address
    if (!address.address.trim()) e.addr_address = "Bắt buộc";
    if (!address.district.trim()) e.addr_district = "Bắt buộc";
    if (!address.city.trim()) e.addr_city = "Bắt buộc";
    if (!address.country.trim()) e.addr_country = "Bắt buộc";
    if (!address.zipCode.trim()) e.addr_zipCode = "Bắt buộc";
    if (!address.phone.trim()) e.addr_phone = "Bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...form,
        shippingAddress: address,
        gift: form.gift.filter((g) => g.boxId),
      };
      if (isEdit) {
        await planApi.update(plan._id, payload);
        toast.success("Cập nhật gói thành công");
      } else {
        await createPlanApi(payload);
        toast.success("Tạo gói đăng ký thành công");
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi hệ thống");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Settings2 size={16} className="text-indigo-500" />
            {isEdit ? `Chỉnh sửa: ${plan.name}` : "Tạo gói đăng ký mới"}
          </DialogTitle>
          {isEdit && (
            <p className="text-xs text-slate-400 font-mono mt-1">
              ID: {plan._id}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-1">
          {/* ── SECTION 1: Thông tin gói ── */}
          <div className="rounded-xl border bg-slate-50/50 p-4 space-y-4">
            <SectionTitle
              icon={Settings2}
              color="text-indigo-500"
              label="Thông tin gói"
            />

            <Field label="Tên gói hiển thị" required error={errors.name}>
              <Input
                placeholder="VD: Gói Wellness 3 tháng - Nguyễn Văn A"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>

            {/* userId chỉ hiển thị khi tạo mới */}
            {!isEdit ? (
              <Field
                label="User ID (khách hàng)"
                required
                error={errors.userId}
                hint="MongoDB ObjectId của khách hàng"
              >
                <Input
                  placeholder="6507f1f77bcf86cd79439011"
                  value={form.userId}
                  onChange={(e) => set("userId", e.target.value)}
                  className="font-mono text-sm"
                />
              </Field>
            ) : (
              <div className="rounded-lg bg-slate-100 px-3 py-2 flex justify-between items-center">
                <span className="text-xs text-slate-500">Khách hàng</span>
                <span className="text-xs font-medium font-mono text-slate-700">
                  {typeof plan.userId === "object"
                    ? plan.userId?.email ||
                      plan.userId?.name ||
                      plan.userId?._id
                    : plan.userId}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Chu kỳ gói" required>
                <select
                  value={form.planType}
                  onChange={(e) => handlePlanTypeChange(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Object.entries(PLAN_TYPE_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Số lần giao hàng"
                required
                error={errors.totalDeliveries}
                hint={isEdit ? "Chỉnh sửa thận trọng" : ""}
              >
                <Input
                  type="number"
                  min={1}
                  value={form.totalDeliveries}
                  onChange={(e) => set("totalDeliveries", +e.target.value)}
                />
              </Field>
            </div>

            {/* cancelAtPeriodEnd toggle */}
            <label className="flex items-center justify-between rounded-lg border border-dashed px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Huỷ vào cuối kỳ
                </p>
                <p className="text-xs text-slate-400">
                  Gói dừng sau kỳ hiện tại, không tự động gia hạn
                </p>
              </div>
              <Switch
                checked={form.cancelAtPeriodEnd}
                onCheckedChange={(v) => set("cancelAtPeriodEnd", v)}
              />
            </label>
          </div>

          {/* ── SECTION 2: Box & Giá ── */}
          <div className="rounded-xl border bg-slate-50/50 p-4 space-y-4">
            <SectionTitle
              icon={Package}
              color="text-violet-500"
              label="Box & Định giá"
            />

            <Field label="Loại Box" required error={errors.boxId}>
              <select
                value={form.boxId}
                onChange={(e) => set("boxId", e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">— Chọn box —</option>
                {boxes.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                    {b.value ? ` — ${formatCurrency(b.value)}` : ""}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4 items-start">
              <Field label="Giảm giá (%)" error={errors.discountPercent}>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.discountPercent}
                  onChange={(e) => set("discountPercent", +e.target.value)}
                />
              </Field>

              {/* Price preview */}
              {pricePreview ? (
                <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 space-y-1.5">
                  <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-wide">
                    Xem trước giá
                  </p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Giá gốc</span>
                    <span
                      className={
                        form.discountPercent > 0
                          ? "line-through text-slate-400"
                          : "font-semibold text-indigo-700"
                      }
                    >
                      {formatCurrency(pricePreview.original)}
                    </span>
                  </div>
                  {form.discountPercent > 0 && (
                    <>
                      <div className="flex justify-between text-xs text-red-500">
                        <span>−{form.discountPercent}%</span>
                        <span>−{formatCurrency(pricePreview.discountAmt)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-indigo-700 border-t border-indigo-100 pt-1.5">
                        <span>Giá / kỳ</span>
                        <span>{formatCurrency(pricePreview.final)}</span>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="rounded-lg bg-slate-100 px-4 py-3 flex items-center justify-center h-full">
                  <p className="text-xs text-slate-400">Chọn box để xem giá</p>
                </div>
              )}
            </div>

            {/* Gift boxes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                  <Gift size={12} className="text-pink-500" />
                  Box quà tặng kèm
                  {form.gift.length > 0 && (
                    <Badge className="ml-1 bg-pink-100 text-pink-700 border-0 text-[10px] py-0">
                      {form.gift.length}
                    </Badge>
                  )}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs text-pink-600 border-pink-200 hover:bg-pink-50"
                  onClick={addGift}
                >
                  <Plus size={11} className="mr-1" />
                  Thêm quà
                </Button>
              </div>

              {form.gift.length > 0 && (
                <div className="space-y-2 bg-pink-50/60 border border-pink-100 rounded-xl p-3">
                  {form.gift.map((g, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <select
                        className="col-span-8 h-8 rounded-md border border-input bg-white px-2 text-xs"
                        value={g.boxId}
                        onChange={(e) => updateGift(i, "boxId", e.target.value)}
                      >
                        <option value="">— Chọn box quà —</option>
                        {boxes.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                      <Input
                        className="col-span-3 h-8 text-xs text-center"
                        type="number"
                        min={1}
                        value={g.quantity}
                        onChange={(e) =>
                          updateGift(i, "quantity", +e.target.value)
                        }
                        placeholder="SL"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="col-span-1 h-8 w-8 text-red-400 hover:bg-red-50"
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

          {/* ── SECTION 3: Địa chỉ giao hàng ── */}
          <div className="rounded-xl border bg-slate-50/50 p-4 space-y-4">
            <SectionTitle
              icon={MapPin}
              color="text-orange-500"
              label="Địa chỉ giao hàng"
            />

            <Field label="Địa chỉ cụ thể" required error={errors.addr_address}>
              <Input
                placeholder="Số nhà, tên đường, toà nhà..."
                value={address.address}
                onChange={(e) => setAddr("address", e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Quận / Huyện" required error={errors.addr_district}>
                <Input
                  value={address.district}
                  onChange={(e) => setAddr("district", e.target.value)}
                />
              </Field>
              <Field label="Thành phố" required error={errors.addr_city}>
                <Input
                  value={address.city}
                  onChange={(e) => setAddr("city", e.target.value)}
                />
              </Field>
              <Field label="Quốc gia" required error={errors.addr_country}>
                <Input
                  value={address.country}
                  onChange={(e) => setAddr("country", e.target.value)}
                />
              </Field>
              <Field label="Mã bưu chính" required error={errors.addr_zipCode}>
                <Input
                  placeholder="700000"
                  value={address.zipCode}
                  onChange={(e) => setAddr("zipCode", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Số điện thoại" required error={errors.addr_phone}>
              <Input
                type="tel"
                placeholder="0901234567"
                value={address.phone}
                onChange={(e) => setAddr("phone", e.target.value)}
              />
            </Field>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Huỷ
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 min-w-32.5"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Lưu thay đổi" : "Tạo gói"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
