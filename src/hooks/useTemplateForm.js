// hooks/useTemplateForm.js
// Quản lý state + validation + submit cho SubscriptionTemplate form.
// Template là MẪU GÓI (admin cấu hình) — KHÔNG phải subscription của user.

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  createTemplateApi,
  updateTemplateApi,
} from "@/app/services/api/subscribePlanService";
import { formatCurrency } from "@/app/util/formatter";

const INITIAL_FORM = {
  name: "",
  description: "",
  boxId: "",
  planType: "monthly",
  discountPercent: 0,
  isActive: true,
  gift: [], // [{ boxId: '', quantity: 1 }]
};

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Tên mẫu gói là bắt buộc";
  if (!form.boxId) errors.boxId = "Vui lòng chọn box chính";
  if (form.discountPercent < 0 || form.discountPercent > 100)
    errors.discountPercent = "Giảm giá phải từ 0–100%";
  form.gift.forEach((g, i) => {
    if (!g.boxId) errors[`gift_${i}_boxId`] = "Chọn box";
    if (!g.quantity || g.quantity < 1) errors[`gift_${i}_qty`] = "Số lượng ≥ 1";
  });
  return errors;
}

/**
 * @param {object}   options
 * @param {boolean}  options.open      - dialog có đang mở không
 * @param {object[]} options.boxes     - danh sách box đã load
 * @param {object}   [options.editTarget] - nếu có → chế độ UPDATE
 * @param {function} options.onSuccess - callback sau khi lưu thành công
 * @param {function} options.onClose   - callback để đóng dialog
 */
export function useTemplateForm({
  open,
  boxes,
  editTarget = null,
  onSuccess,
  onClose,
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = Boolean(editTarget);

  // Reset / hydrate form mỗi khi dialog mở
  useEffect(() => {
    if (!open) return;
    if (editTarget) {
      setForm({
        name: editTarget.name ?? "",
        description: editTarget.description ?? "",
        boxId: editTarget.boxId?._id ?? editTarget.boxId ?? "",
        planType: editTarget.planType ?? "monthly",
        discountPercent: editTarget.discountPercent ?? 0,
        isActive: editTarget.isActive ?? true,
        gift: (editTarget.gift ?? []).map((g) => ({
          boxId: g.boxId?._id ?? g.boxId ?? "",
          quantity: g.quantity ?? 1,
        })),
      });
    } else {
      setForm(INITIAL_FORM);
    }
    setErrors({});
  }, [open, editTarget]);

  // Helper set 1 field
  const set = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // Gift helpers
  const addGift = useCallback(
    () =>
      setForm((prev) => ({
        ...prev,
        gift: [...prev.gift, { boxId: "", quantity: 1 }],
      })),
    [],
  );

  const updateGift = useCallback((idx, field, value) => {
    setForm((prev) => {
      const gift = prev.gift.map((g, i) =>
        i === idx ? { ...g, [field]: value } : g,
      );
      return { ...prev, gift };
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`gift_${idx}_${field === "boxId" ? "boxId" : "qty"}`];
      return next;
    });
  }, []);

  const removeGift = useCallback(
    (idx) =>
      setForm((prev) => ({
        ...prev,
        gift: prev.gift.filter((_, i) => i !== idx),
      })),
    [],
  );

  // Price preview — chỉ tính khi box đã chọn
  const selectedBox = boxes.find((b) => b._id === form.boxId);
  const basePrice = selectedBox?.value ?? null;
  const pricePreview =
    basePrice != null
      ? {
          basePrice,
          discountPrice: basePrice * (1 - form.discountPercent / 100),
          formattedBase: formatCurrency(basePrice),
          formattedDiscount: formatCurrency(
            basePrice * (form.discountPercent / 100),
          ),
          formattedFinal: formatCurrency(
            basePrice * (1 - form.discountPercent / 100),
          ),
        }
      : null;

  // Submit
  const handleSave = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      boxId: form.boxId,
      planType: form.planType,
      discountPercent: Number(form.discountPercent),
      isActive: form.isActive,
      gift: form.gift.map((g) => ({
        boxId: g.boxId,
        quantity: Number(g.quantity),
      })),
    };

    setIsSaving(true);
    try {
      if (isEdit) {
        await updateTemplateApi(editTarget._id, payload);
        toast.success(`Đã cập nhật mẫu gói "${payload.name}"`);
      } else {
        await createTemplateApi(payload);
        toast.success(`Đã tạo mẫu gói "${payload.name}"`);
      }
      onClose();
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Lưu mẫu gói thất bại, vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return {
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
  };
}
