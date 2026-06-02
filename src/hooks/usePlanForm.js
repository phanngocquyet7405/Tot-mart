/**
 * usePlanForm.js
 * ─────────────────────────────────────────────────────────────────
 * Form state + validation + submit cho PlanFormDialog.
 * Chỉ xử lý CREATE — BE không có route UPDATE.
 * ─────────────────────────────────────────────────────────────────
 */
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { createPlanApi } from "../app/services/api/subscribePlanService";
import { DEFAULT_DELIVERIES, formatCurrency } from "@/app/util/formatter";

export const EMPTY_ADDRESS = {
  address: "",
  district: "",
  city: "",
  country: "Vietnam",
  zipCode: "",
  phone: "",
};

export const EMPTY_FORM = {
  name: "",
  userId: "",
  boxId: "",
  planType: "1_month",
  totalDeliveries: 1,
  discountPercent: 0,
  cancelAtPeriodEnd: false,
  gift: [],
};

/**
 * @param {object} options
 * @param {boolean}  options.open       - Dialog mở hay không
 * @param {array}    options.boxes      - Danh sách box để render select + price preview
 * @param {function} options.onSuccess  - Callback sau khi tạo thành công
 * @param {function} options.onClose    - Đóng dialog
 */
export function usePlanForm({ open, boxes, onSuccess, onClose }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Reset mỗi lần dialog mở
  useEffect(() => {
    if (!open) return;
    setForm(EMPTY_FORM);
    setAddress(EMPTY_ADDRESS);
    setErrors({});
  }, [open]);

  // Price preview
  const selectedBox = useMemo(
    () => boxes.find((b) => b._id === form.boxId),
    [boxes, form.boxId],
  );

  const pricePreview = useMemo(() => {
    if (!selectedBox?.value) return null;
    const original = selectedBox.value;
    const discountAmt = (original * (form.discountPercent || 0)) / 100;
    return {
      original,
      discountAmt,
      final: original - discountAmt,
      formattedOriginal: formatCurrency(original),
      formattedDiscount: formatCurrency(discountAmt),
      formattedFinal: formatCurrency(original - discountAmt),
    };
  }, [selectedBox, form.discountPercent]);

  // Field setters
  const set = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const setAddr = useCallback((field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const { [`addr_${field}`]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const handlePlanTypeChange = useCallback((val) => {
    setForm((prev) => ({
      ...prev,
      planType: val,
      totalDeliveries: DEFAULT_DELIVERIES[val] || 1,
    }));
  }, []);

  // Gift
  const addGift = useCallback(
    () =>
      setForm((prev) => ({
        ...prev,
        gift: [...prev.gift, { boxId: "", quantity: 1 }],
      })),
    [],
  );

  const updateGift = useCallback((i, field, value) => {
    setForm((prev) => {
      const next = [...prev.gift];
      next[i] = { ...next[i], [field]: value };
      return { ...prev, gift: next };
    });
  }, []);

  const removeGift = useCallback(
    (i) =>
      setForm((prev) => ({
        ...prev,
        gift: prev.gift.filter((_, idx) => idx !== i),
      })),
    [],
  );

  // Validation
  const validate = useCallback(() => {
    const e = {};
    if (!form.name.trim()) e.name = "Tên gói là bắt buộc";
    if (!form.userId.trim()) e.userId = "User ID là bắt buộc";
    if (!form.boxId) e.boxId = "Vui lòng chọn box";
    if (!form.totalDeliveries || form.totalDeliveries < 1)
      e.totalDeliveries = "Tối thiểu 1 lần giao";
    if (form.discountPercent < 0 || form.discountPercent > 100)
      e.discountPercent = "Từ 0 đến 100";
    if (!address.address.trim()) e.addr_address = "Bắt buộc";
    if (!address.district.trim()) e.addr_district = "Bắt buộc";
    if (!address.city.trim()) e.addr_city = "Bắt buộc";
    if (!address.country.trim()) e.addr_country = "Bắt buộc";
    if (!address.zipCode.trim()) e.addr_zipCode = "Bắt buộc";
    if (!address.phone.trim()) e.addr_phone = "Bắt buộc";
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form, address]);

  // Submit — chỉ CREATE
  const handleSave = useCallback(async () => {
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
      await createPlanApi(payload);
      toast.success("Tạo gói đăng ký thành công");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi hệ thống");
    } finally {
      setIsSaving(false);
    }
  }, [validate, form, address, onSuccess, onClose]);

  return {
    form,
    address,
    errors,
    isSaving,
    selectedBox,
    pricePreview,
    set,
    setAddr,
    handlePlanTypeChange,
    addGift,
    updateGift,
    removeGift,
    handleSave,
  };
}
