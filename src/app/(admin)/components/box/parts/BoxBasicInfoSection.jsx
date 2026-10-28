"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

/**
 * @typedef {Object} BoxFormState
 * @property {string} ownerId
 * @property {string} name
 * @property {string} descriptions
 * @property {number} stock
 * @property {number} discountPercent
 * @property {string} validFrom
 * @property {string} validTo
 * @property {boolean} isGift
 */

/**
 * @param {Object} props
 * @param {BoxFormState} props.form
 * @param {React.Dispatch<React.SetStateAction<BoxFormState>>} props.setForm
 * @param {Record<string, string>} props.errors
 * @param {string} props.today
 */
export function BoxBasicInfoSection({ form, setForm, errors, today }) {
  const handleNameChange = (
    /** @type {React.ChangeEvent<HTMLInputElement>} */ e,
  ) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, name: val }));
  };

  const handleDescChange = (
    /** @type {React.ChangeEvent<HTMLTextAreaElement>} */ e,
  ) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, descriptions: val }));
  };

  const handleStockChange = (
    /** @type {React.ChangeEvent<HTMLInputElement>} */ e,
  ) => {
    const val = Number(e.target.value) || 1;
    setForm((f) => ({ ...f, stock: val }));
  };

  const handleDiscountChange = (
    /** @type {React.ChangeEvent<HTMLInputElement>} */ e,
  ) => {
    const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
    setForm((f) => ({ ...f, discountPercent: val }));
  };

  const handleValidFromChange = (
    /** @type {React.ChangeEvent<HTMLInputElement>} */ e,
  ) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, validFrom: val }));
  };

  const handleValidToChange = (
    /** @type {React.ChangeEvent<HTMLInputElement>} */ e,
  ) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, validTo: val }));
  };

  const handleGiftToggle = (/** @type {boolean} */ checked) => {
    setForm((f) => ({ ...f, isGift: checked }));
  };

  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
        Thông tin cơ bản
      </h3>
      <div className="space-y-4">
        {/* Tên */}
        <div className="space-y-1.5">
          <Label>
            Tên Combo <span className="text-destructive-text">*</span>
          </Label>
          <Input
            placeholder="VD: Combo quà tặng đặc biệt"
            value={form.name}
            onChange={handleNameChange}
            className={errors.name ? "border-destructive/50" : ""}
          />
          {errors.name && <p className="text-xs text-destructive-text">{errors.name}</p>}
        </div>

        {/* Mô tả */}
        <div className="space-y-1.5">
          <Label>
            Mô tả <span className="text-destructive-text">*</span>
          </Label>
          <Textarea
            rows={3}
            placeholder="Mô tả nội dung và điểm nổi bật của combo..."
            value={form.descriptions}
            onChange={handleDescChange}
            className={`resize-none ${errors.descriptions ? "border-destructive/50" : ""}`}
          />
          {errors.descriptions && (
            <p className="text-xs text-destructive-text">{errors.descriptions}</p>
          )}
        </div>

        {/* Tồn kho + Giảm giá */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>
              Tồn kho <span className="text-destructive-text">*</span>
            </Label>
            <Input
              type="number"
              min={1}
              value={form.stock}
              onChange={handleStockChange}
              className={`tabular-nums ${errors.stock ? "border-destructive/50" : ""}`}
            />
            {errors.stock && (
              <p className="text-xs text-destructive-text">{errors.stock}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Giảm giá (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.discountPercent}
              onChange={handleDiscountChange}
              className="tabular-nums"
            />
          </div>
        </div>

        {/* Ngày */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>
              Ngày bắt đầu <span className="text-destructive-text">*</span>
            </Label>
            <Input
              type="date"
              min={today}
              value={form.validFrom}
              onChange={handleValidFromChange}
              className={errors.validFrom ? "border-destructive/50" : ""}
            />
            {errors.validFrom && (
              <p className="text-xs text-destructive-text">{errors.validFrom}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>
              Ngày kết thúc <span className="text-destructive-text">*</span>
            </Label>
            <Input
              type="date"
              min={form.validFrom || today}
              value={form.validTo}
              onChange={handleValidToChange}
              className={errors.validTo ? "border-destructive/50" : ""}
            />
            {errors.validTo && (
              <p className="text-xs text-destructive-text">{errors.validTo}</p>
            )}
          </div>
        </div>

        {/* Gift toggle */}
        <div className="flex items-center gap-3 py-1">
          <Switch
            checked={form.isGift}
            onCheckedChange={handleGiftToggle}
            id="isGift"
          />
          <Label htmlFor="isGift" className="cursor-pointer">
            Đánh dấu là Combo quà tặng
          </Label>
        </div>
      </div>
    </section>
  );
}
