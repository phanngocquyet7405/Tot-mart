"use client";

import Image from "next/image";
import { PLACEHOLDER_IMAGE } from "./productDetailService";

export function ProductGallery({
  images = [],
  productName,
  selectedImage,
  onSelectImage,
  discountPercent = 0,
}) {
  return (
    <div className="lg:col-span-7 space-y-4">
      <div className="relative border border-stone-100 rounded-2xl overflow-hidden bg-white shadow-sm aspect-square flex items-center justify-center group">
        <Image
          src={selectedImage || PLACEHOLDER_IMAGE}
          alt={productName || "Ảnh sản phẩm"}
          fill
          className="object-cover p-2 transition-transform duration-500 group-hover:scale-105"
          priority
          unoptimized
          onError={(e) => {
            e.target.src = PLACEHOLDER_IMAGE;
          }}
        />

        {discountPercent > 0 && (
          <span className="absolute top-4 left-4 bg-red-600 text-white px-3.5 py-1 text-xs font-black rounded-full shadow-md tracking-wider">
            SALE {discountPercent}%
          </span>
        )}
      </div>

      {images.length > 0 && (
        <div className="flex gap-3 overflow-x-auto py-2 scrollbar-none">
          {images.map((img, i) => {
            const imgUrl = img?.url || PLACEHOLDER_IMAGE;
            return (
              <button
                key={i}
                onClick={() => onSelectImage(imgUrl)}
                className={`relative w-20 h-20 rounded-xl overflow-hidden bg-white border-2 shrink-0 transition-all active:scale-95 ${
                  selectedImage === imgUrl
                    ? "border-amber-700 ring-4 ring-amber-100"
                    : "border-stone-200 hover:border-amber-400"
                }`}
              >
                <Image
                  alt={`${productName || "Sản phẩm"} ${i + 1}`}
                  src={imgUrl}
                  fill
                  className="object-cover p-1"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
