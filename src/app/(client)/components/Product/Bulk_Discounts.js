"use client";

import { useState } from "react";
import { TrendingDown } from "lucide-react";
import { formatPrice } from "./productDetailService";

// Bậc giảm giá mặc định — dùng khi sản phẩm chưa có cấu hình bulkPricing
// riêng từ admin. Đây chỉ là gợi ý hiển thị; khi backend bổ sung field
// `product.bulkPricing`, truyền qua prop `options` để ghi đè bậc mặc định
// mà không cần sửa gì trong component này.
const DEFAULT_TIERS = [
  { quantity: 1, discountPercent: 0 },
  { quantity: 3, discountPercent: 5 },
  { quantity: 5, discountPercent: 10 },
];

/**
 * @param {number} basePrice - Giá gốc 1 sản phẩm (VNĐ), lấy từ product.price
 * @param {{quantity:number,discountPercent:number}[]=} options - Bậc giảm giá tuỳ chỉnh
 * @param {(quantity:number)=>void=} onSelectQuantity - Callback đồng bộ số lượng
 *   đã chọn về state chính của trang (ví dụ setQuantity trong useProductDetail).
 *   Không truyền vẫn hoạt động bình thường, component chỉ không đồng bộ ra ngoài.
 */
export function BulkDiscounts({ basePrice, options, onSelectQuantity }) {
  const tiers = options?.length ? options : DEFAULT_TIERS;
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!basePrice || basePrice <= 0) return null;

  const handleSelect = (idx, quantity) => {
    setSelectedIndex(idx);
    onSelectQuantity?.(quantity);
  };

  const selected = tiers[selectedIndex];
  const unitPrice =
    basePrice - (basePrice * (selected?.discountPercent || 0)) / 100;
  const total = unitPrice * (selected?.quantity || 1);

  return (
    <div className="bg-stone-50 rounded-2xl p-6 space-y-4 border border-stone-100">
      <div className="flex items-center gap-2">
        <TrendingDown className="w-4 h-4 text-amber-800" />
        <h3 className="text-xs font-black uppercase tracking-widest text-stone-800">
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
                  ? "border-amber-700 bg-white ring-2 ring-amber-100"
                  : "border-stone-200 bg-white hover:border-amber-300"
              }`}
            >
              <input
                type="radio"
                name="bulk-tier"
                checked={isSelected}
                onChange={() => handleSelect(idx, tier.quantity)}
                className="w-4 h-4 accent-amber-800"
              />

              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="font-bold text-stone-800 text-sm">
                    Mua {tier.quantity} sản phẩm
                    {tier.discountPercent > 0 &&
                      ` — Giảm ${tier.discountPercent}%`}
                  </p>
                  <p className="text-xs text-stone-400">
                    {formatPrice(tierUnitPrice)} / sản phẩm
                  </p>
                </div>
                {tier.discountPercent > 0 && (
                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[11px] font-black shrink-0">
                    -{tier.discountPercent}%
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-stone-200 text-sm">
        <span className="text-stone-500 font-medium">Tạm tính:</span>
        <span className="text-lg font-black text-stone-900">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}
