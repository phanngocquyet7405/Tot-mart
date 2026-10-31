"use client";

import Image from "next/image";
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
      <div className="tm-gallery__image bg-card border border-border shadow-xs rounded-2xl">
        <Image
          src={current}
          alt={productName || "Ảnh sản phẩm"}
          fill
          sizes={
            compact
              ? "(max-width: 768px) 100vw, 40vw"
              : "(max-width: 1024px) 100vw, 55vw"
          }
          className="object-contain p-4 sm:p-8 transition-transform duration-300 hover:scale-105"
          priority={!compact ? true : undefined}
          unoptimized={current.startsWith("data:")}
          onError={(event) => {
            event.currentTarget.srcset = "";
            event.currentTarget.src = PLACEHOLDER_IMAGE;
          }}
        />
        {discountPercent > 0 && (
          <span className="tm-gallery__discount bg-primary text-primary-foreground font-black tracking-wider shadow-sm">
            Giảm {discountPercent}%
          </span>
        )}
      </div>

      {gallery.length > 1 && (
        <div
          className="tm-gallery__thumbnails"
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
                className={`tm-gallery__thumbnail rounded-xl transition-all border ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 scale-105"
                    : "border-border hover:border-primary/50"
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
