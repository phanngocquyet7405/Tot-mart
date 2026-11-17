"use client";

import Image from "next/image";
import { Sparkles } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "./productDetailService";

export function ProductGallery({
  images = [],
  productName,
  selectedImage,
  onSelectImage,
  discountPercent = 0,
  compact = false,
}) {
  const gallery = (Array.isArray(images) ? images : [])
    .map((img) => (typeof img === "string" ? { url: img } : img))
    .filter((img) => img?.url);

  const current = selectedImage || gallery[0]?.url || PLACEHOLDER_IMAGE;

  return (
    <div className={`tm-gallery ${compact ? "tm-gallery--compact" : "lg:col-span-7"}`}>
      {/* Khung ảnh chính chuẩn Bokksu Boutique: Nền màu giấy ấm, viền bo mềm, hover zoom */}
      <div className="tm-gallery__image relative aspect-square sm:aspect-4/3 lg:aspect-square bg-gradient-to-b from-stone-50/80 via-background to-stone-100/30 dark:from-stone-900/40 dark:to-stone-950/20 border border-border/80 shadow-xs rounded-2xl overflow-hidden group">
        <Image
          src={current}
          alt={productName || "Ảnh sản phẩm"}
          fill
          sizes={
            compact
              ? "(max-width: 768px) 100vw, 40vw"
              : "(max-width: 1024px) 100vw, 55vw"
          }
          className="object-contain p-4 sm:p-8 transition-transform duration-500 ease-out group-hover:scale-105"
          priority={!compact ? true : undefined}
          unoptimized={current.startsWith("data:")}
          onError={(event) => {
            event.currentTarget.srcset = "";
            event.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />

        {/* Badges cao cấp phong cách Bokksu */}
        <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="tm-gallery__discount bg-destructive text-destructive-foreground font-black text-xs px-3 py-1 rounded-full tracking-wider shadow-sm">
              Giảm {discountPercent}%
            </span>
          )}
          <span className="inline-flex items-center gap-1 bg-background/90 backdrop-blur-xs text-foreground/80 border border-border/60 text-[11px] font-semibold px-2.5 py-0.5 rounded-full shadow-2xs">
            <Sparkles size={11} className="text-amber-500" />
            Thủ công chọn lọc
          </span>
        </div>
      </div>

      {/* Dải ảnh thu nhỏ (Thumbnails) mượt mà */}
      {gallery.length > 1 && (
        <div
          className="tm-gallery__thumbnails flex gap-2.5 overflow-x-auto py-1 scrollbar-thin"
          role="group"
          aria-label="Chọn ảnh sản phẩm"
        >
          {gallery.map((image, index) => {
            const isSelected = current === image.url;
            return (
              <button
                key={`${image.url}-${index}`}
                type="button"
                onClick={() => onSelectImage(image.url)}
                aria-label={`Xem ảnh ${index + 1} của ${productName || "sản phẩm"}`}
                aria-pressed={isSelected}
                className={`tm-gallery__thumbnail relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden transition-all duration-200 border-2 bg-card cursor-pointer active:scale-95 ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/25 scale-105 shadow-xs"
                    : "border-border/70 hover:border-primary/50 opacity-75 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="72px"
                  className="object-contain p-1.5"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;
