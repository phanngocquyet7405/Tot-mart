"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

export function BoxImageSection({
  isEdit,
  errors,
  fileInputRef,
  handleImageSelect,
  imagePreviews,
  removeImage,
}) {
  return (
    <section>
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
        Hình ảnh{" "}
        {!isEdit && (
          <span className="text-destructive-text normal-case font-normal">*</span>
        )}
      </h3>

      <div className="space-y-3">
        {/* Upload zone */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-muted/50 transition-colors ${
            errors?.images ? "border-destructive/50" : "border-border"
          }`}
        >
          <ImagePlus size={20} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Click để chọn ảnh{" "}
            <span className="text-muted-foreground">(tối đa 5MB / ảnh)</span>
          </p>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleImageSelect}
        />
        {errors?.images && (
          <p className="text-xs text-destructive-text">{errors.images}</p>
        )}

        {/* Preview grid */}
        {imagePreviews.length > 0 && (
          <div className="grid grid-cols-5 gap-2">
            {imagePreviews.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-lg overflow-hidden border border-border group"
              >
                <Image
                  src={src}
                  alt={`img-${i}`}
                  fill
                  className="object-cover"
                  unoptimized={src.startsWith("blob:")}
                />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 text-[11px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                    Đại diện
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default BoxImageSection;
