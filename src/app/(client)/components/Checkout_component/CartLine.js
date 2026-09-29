/**
 * CartLine.js
 * Một dòng sản phẩm dùng chung cho ReviewStep (đầy đủ) và OrderSummary
 * (`compact`). Ảnh lấy qua getCartItemImage (chịu cả `image` lẫn
 * `images[0]`), lỗi tải ảnh / không có ảnh → hiện icon thay vì ô trống.
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import { getCartItemImage } from "@/app/util/cartItem";
import { formatCurrency } from "@/app/util/formatter";

export function CartThumb({ item, size = 64, badge }) {
  const src = getCartItemImage(item);
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="relative w-full h-full overflow-hidden rounded-xl bg-[#F5F0E8] border border-[#F0DDD5] grid place-items-center">
        {showImage ? (
          <Image
            src={src}
            alt={item?.name || "Sản phẩm"}
            fill
            sizes={`${size}px`}
            unoptimized
            className="object-cover"
            onError={() => setFailedSrc(src)}
          />
        ) : (
          <Package
            size={Math.round(size * 0.38)}
            className="text-[#C85C3C]/50"
            aria-hidden="true"
          />
        )}
      </div>
      {badge != null && (
        <span className="absolute -top-1.5 -right-1.5 grid place-items-center min-w-5 h-5 px-1 rounded-full bg-[#2C1810] text-white text-[11px] font-bold leading-none">
          {badge}
        </span>
      )}
    </div>
  );
}

export function CartLine({ item, compact = false }) {
  const quantity = item.quantity ?? 1;
  const unitPrice = item.price ?? 0;

  return (
    <div className="flex items-center gap-3">
      <CartThumb
        item={item}
        size={compact ? 52 : 72}
        badge={compact ? quantity : undefined}
      />
      <div className="min-w-0 flex-1">
        <p
          className={[
            "font-semibold text-[#2C1810] leading-snug line-clamp-2",
            compact ? "text-[13px]" : "text-sm",
          ].join(" ")}
        >
          {item.name}
        </p>
        <p className="text-xs text-stone-500 mt-0.5 tabular-nums">
          {compact
            ? formatCurrency(unitPrice)
            : `${formatCurrency(unitPrice)} × ${quantity}`}
        </p>
      </div>
      <p className="text-sm font-bold text-[#2C1810] shrink-0 tabular-nums">
        {formatCurrency(unitPrice * quantity)}
      </p>
    </div>
  );
}
