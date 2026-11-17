"use client";

import { useState } from "react";
import { TrendingDown } from "lucide-react";

/**
 * Bulk Discounts Component — Bán sỉ / Mua số lượng lớn
 * Hiển thị các bậc giảm giá khi mua số lượng nhiều:
 * - Mua 3 cái: Giảm 5%
 * - Mua 5 cái: Giảm 10%
 * - Mua 10 cái: Giảm 15%
 *
 * Tích hợp trực tiếp vào PDP, tự động update quantity và discount.
 */

const DEFAULT_TIERS = [
  { quantity: 1, discountPercent: 0, label: "Mua lẻ" },
  { quantity: 3, discountPercent: 5, label: "Combo tiết kiệm" },
  { quantity: 5, discountPercent: 10, label: "Mua chung / Gia đình" },
  { quantity: 10, discountPercent: 15, label: "Số lượng lớn" },
];

export function BulkDiscounts({
  basePrice = 0,
  tiers = DEFAULT_TIERS,
  onSelectTier,
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const formatPrice = (p) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(p);

  const handleSelect = (idx, qty) => {
    setSelectedIndex(idx);
    if (onSelectTier) onSelectTier(tiers[idx]);
  };

  const selected = tiers[selectedIndex];
  const unitPrice =
    basePrice - (basePrice * (selected?.discountPercent || 0)) / 100;
  const total = unitPrice * (selected?.quantity || 1);

  return (
    <div className="bg-card rounded-2xl p-6 space-y-4 border border-border shadow-xs">
      <div className="flex items-center gap-2">
        <TrendingDown className="w-4 h-4 text-primary" />
        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
          Mua nhiều — giá càng tốt
        </h3>
      </div>

      <div className="space-y-2.5">
        {tiers.map((tier, idx) => {
          const tierUnitPrice =
            basePrice - (basePrice * tier.discountPercent) / 100;
          const isSelected = selectedIndex === idx;
          return (
            <label
              key={tier.quantity}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? "border-primary bg-card ring-2 ring-primary/20"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="bulk-tier"
                checked={isSelected}
                onChange={() => handleSelect(idx, tier.quantity)}
                className="w-4 h-4 accent-primary"
              />

              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="font-bold text-foreground text-sm">
                    Mua {tier.quantity} sản phẩm
                    {tier.discountPercent > 0 &&
                      ` — Giảm ${tier.discountPercent}%`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(tierUnitPrice)} / sản phẩm
                  </p>
                </div>
                {tier.discountPercent > 0 && (
                  <span className="bg-success/15 text-success-text px-2.5 py-1 rounded-full text-[11px] font-black shrink-0">
                    -{tier.discountPercent}%
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-border text-sm">
        <span className="text-muted-foreground font-medium">Tạm tính:</span>
        <span className="text-lg font-black text-foreground">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}
