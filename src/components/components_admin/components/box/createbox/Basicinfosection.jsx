"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* ── Cột trái: Label + Ảnh đại diện ── */}
      <div>
        <h3 className="text-sm font-medium text-foreground">
          Thông tin cơ bản
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Tên, số lượng tồn kho và mô tả của box
        </p>

        {/* Ảnh đại diện (img[0]) */}
        {form.images.length > 0 ? (
          <div className="mt-6 relative group w-full aspect-square rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-sm">
            <Image
              src={URL.createObjectURL(form.images[0])}
              alt="Main Preview"
              className="object-cover"
              fill
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(0)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
            >
              <X size={16} />
            </button>
            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">
              Ảnh đại diện
            </div>
          </div>
        ) : (
          /* Placeholder khi chưa có ảnh */
          <div className="mt-6 w-full aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center gap-2 text-gray-400">
            <ImagePlus size={28} />
            <span className="text-xs">Chưa có ảnh</span>
          </div>
        )}
      </div>

      {/* ── Cột phải: Inputs + Upload ── */}
      <div className="md:col-span-2 space-y-4">
        {/* Tên box */}
        <div className="space-y-1.5">
          <Label htmlFor="boxName">Tên box *</Label>
          <Input
            id="boxName"
            placeholder="Ví dụ: Premium Mystery Box"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
          />
          {errors.name && (
            <span className="text-xs text-red-500">{errors.name}</span>
          )}
        </div>

        {/* Tồn kho + Giảm giá */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="boxStock">Tồn kho *</Label>
            <Input
              id="boxStock"
              type="number"
              min={1}
              value={form.stock}
              onChange={(e) => onChange("stock", +e.target.value)}
            />
            {errors.stock && (
              <span className="text-xs text-red-500">{errors.stock}</span>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="boxDiscount">Giảm giá (%)</Label>
            <Input
              id="boxDiscount"
              type="number"
              min={0}
              max={100}
              value={form.discountPercent}
              onChange={(e) => onChange("discountPercent", +e.target.value)}
            />
          </div>
        </div>

        {/* Mô tả — key: descriptions ✅ */}
        <div className="space-y-1.5">
          <Label htmlFor="boxDesc">Mô tả *</Label>
          <Textarea
            id="boxDesc"
            rows={3}
            placeholder="Mô tả nội dung box..."
            value={form.description} // Đã sửa từ form.descriptions
            onChange={(e) => onChange("description", e.target.value)} // Đã sửa từ "descriptions"
          />
          {errors.description && (
            <span className="text-xs text-red-500">{errors.description}</span>
          )}
        </div>

        {/* Checkbox quà tặng */}
        <label className="flex items-center gap-2 cursor-pointer select-none pb-1">
          <input
            type="checkbox"
            checked={form.isGift}
            onChange={(e) => onChange("isGift", e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Đây là box quà tặng
          </span>
        </label>

        {/* ── Upload ảnh ── */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
          <Label
            htmlFor="boxImages"
            className="flex w-fit cursor-pointer items-center gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
            <span className="text-xs text-red-500">{errors.images}</span>
          )}

          {/* Ảnh phụ (img[1..n]) */}
          {form.images.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {form.images.slice(1).map((file, idx) => (
                <div
                  key={idx + 1}
                  className="relative group w-20 h-20 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-100 dark:bg-gray-900 shadow-sm"
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
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
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
