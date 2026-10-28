"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "../../ui/RichTextEditor";

/**
 * BasicInfoSection
 *
 * Props:
 *  - form    : { name, stock, discountPercent, descriptions, isGift, images[] }
 *  - errors  : { name?, stock?, descriptions?, images? }
 *  - onChange(field, value)
 *
 * FIX:
 *  - Dùng field key "descriptions" (đúng schema BE)
 *  - Hiển thị lỗi khi images rỗng
 */
export function BasicInfoSection({ form, errors, onChange }) {
  const handleAddImages = (e) => {
    if (e.target.files) {
      onChange("images", [...form.images, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveImage = (index) => {
    const next = [...form.images];
    next.splice(index, 1);
    onChange("images", next);
  };

  const inputClass =
    "border-border bg-card text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus-visible:border-[hsl(var(--primary))] focus-visible:ring-[hsl(var(--primary))]/30";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* ── Cột trái: Label + Ảnh đại diện ── */}
      <div>
        <h3 className="text-sm font-medium text-[var(--foreground)]">Thông tin cơ bản</h3>
        <p className="text-xs text-[var(--foreground)]/50 mt-1">
          Tên, số lượng tồn kho và mô tả của box
        </p>

        {/* Ảnh đại diện (img[0]) */}
        {form.images.length > 0 ? (
          <div className="mt-6 relative group w-full aspect-square rounded-xl border border-border overflow-hidden bg-card shadow-sm">
            <Image
              src={URL.createObjectURL(form.images[0])}
              alt="Main Preview"
              className="object-cover"
              fill
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(0)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[11px] px-2 py-1 rounded-md backdrop-blur-sm">
              Ảnh đại diện
            </div>
          </div>
        ) : (
          /* Placeholder khi chưa có ảnh */
          <div className="mt-6 w-full aspect-square rounded-xl border-2 border-dashed border-border bg-card flex flex-col items-center justify-center gap-2 text-[var(--foreground)]/30">
            <ImagePlus size={28} />
            <span className="text-xs">Chưa có ảnh</span>
          </div>
        )}
      </div>

      {/* ── Cột phải: Inputs + Upload ── */}
      <div className="md:col-span-2 space-y-4">
        {/* Tên box */}
        <div className="space-y-1.5">
          <Label htmlFor="boxName" className="text-[var(--foreground)]/80">
            Tên box *
          </Label>
          <Input
            id="boxName"
            placeholder="Ví dụ: Premium Mystery Box"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            className={inputClass}
          />
          {errors.name && (
            <span className="text-xs text-destructive-text">{errors.name}</span>
          )}
        </div>

        {/* Tồn kho + Giảm giá */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="boxStock" className="text-[var(--foreground)]/80">
              Tồn kho *
            </Label>
            <Input
              id="boxStock"
              type="number"
              min={1}
              value={form.stock}
              onChange={(e) => onChange("stock", +e.target.value)}
              className={inputClass}
            />
            {errors.stock && (
              <span className="text-xs text-destructive-text">{errors.stock}</span>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="boxDiscount" className="text-[var(--foreground)]/80">
              Giảm giá (%)
            </Label>
            <Input
              id="boxDiscount"
              type="number"
              min={0}
              max={100}
              value={form.discountPercent}
              onChange={(e) => onChange("discountPercent", +e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Mô tả — key: descriptions ✅ */}
        <div className="space-y-1.5">
          <Label className="text-[var(--foreground)]/80">Mô tả *</Label>
          <RichTextEditor
            value={form.descriptions}
            onChange={(html) => onChange("descriptions", html)}
            placeholder="Mô tả nội dung box..."
            minHeight={140}
            error={errors.descriptions}
          />
        </div>

        {/* Checkbox quà tặng */}
        <label className="flex items-center gap-2 cursor-pointer select-none pb-1">
          <input
            type="checkbox"
            checked={form.isGift}
            onChange={(e) => onChange("isGift", e.target.checked)}
            className="w-4 h-4 rounded border-border text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]/40"
          />
          <span className="text-sm text-[var(--foreground)]/70">Đây là combo quà tặng</span>
        </label>

        {/* ── Upload ảnh ── */}
        <div className="pt-4 border-t border-border space-y-3">
          <Label
            htmlFor="boxImages"
            className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)]/80 shadow-sm hover:bg-border/40 transition-colors"
          >
            <ImagePlus size={16} />
            Tải ảnh lên
          </Label>
          <Input
            id="boxImages"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleAddImages}
          />

          {/* Lỗi images required ✅ */}
          {errors.images && (
            <span className="text-xs text-destructive-text">{errors.images}</span>
          )}

          {/* Ảnh phụ (img[1..n]) */}
          {form.images.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {form.images.slice(1).map((file, idx) => (
                <div
                  key={idx + 1}
                  className="relative group w-20 h-20 rounded-lg border border-border overflow-hidden bg-card shadow-sm"
                >
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`preview-${idx + 1}`}
                    className="object-cover"
                    fill
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx + 1)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
