"use client";
/**
 * CartLine.js
 * Một dòng sản phẩm dùng chung cho ReviewStep (đầy đủ) và OrderSummary (`compact`).
 * Chuẩn hóa màu sắc token, tabular-nums.
 */

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
      <div className="relative w-full h-full overflow-hidden rounded-xl bg-muted border border-border grid place-items-center">
        {showImage ? (
          <Image
            src={src}
            alt={item?.name || "Sản phẩm TotMart"}
            fill
            sizes={`${size}px`}
            unoptimized
            className="object-cover"
            onError={() => setFailedSrc(src)}
          />
        ) : (
          <Package
            size={Math.round(size * 0.38)}
            className="text-muted-foreground/60"
            aria-hidden="true"
          />
        )}
      </div>
      {badge != null && (
        <span className="absolute -top-1.5 -right-1.5 grid place-items-center min-w-5 h-5 px-1 rounded-full bg-foreground text-background text-[11px] font-bold leading-none tabular-nums">
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
            "font-semibold text-foreground leading-snug line-clamp-2",
            compact ? "text-[13px]" : "text-sm",
          ].join(" ")}
        >
          {item.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
          {compact
            ? formatCurrency(unitPrice)
            : `${formatCurrency(unitPrice)} × ${quantity}`}
        </p>
      </div>
      <p className="text-sm font-bold text-foreground shrink-0 tabular-nums text-right">
        {formatCurrency(item.lineTotal ?? unitPrice * quantity)}
      </p>
    </div>
  );
}
