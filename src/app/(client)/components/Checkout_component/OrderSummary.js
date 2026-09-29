/**
 * OrderSummary.js
 * Cột phải — "phiếu đơn hàng" (sticky). Liệt kê TẤT CẢ sản phẩm có ảnh; khi
 * nhiều hơn 4 dòng, danh sách cuộn bên trong (max-h) thay vì cắt bớt như
 * trước đây (slice(0, 3) + "+N sản phẩm khác"). Có thanh tiến độ tới mức
 * miễn phí vận chuyển.
 */

"use client";

import { Truck, RotateCcw, Gift } from "lucide-react";
import { CartLine } from "./CartLine";
import { formatCurrency } from "@/app/util/formatter";

// Khớp calcShippingFee (Checkoutpageservice) và BE: subtotal < 500.000 → tính ship
const FREE_SHIP_THRESHOLD = 500_000;

function CostRow({ label, value, tone }) {
  const toneClass =
    tone === "discount"
      ? "text-[#B14B2D]"
      : tone === "free"
        ? "text-[#15803d]"
        : "text-[#2C1810]";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-stone-600">{label}</span>
      <span className={`font-semibold tabular-nums ${toneClass}`}>{value}</span>
    </div>
  );
}

export function OrderSummary({
  cartItems,
  hasProducts,
  cartTotal,
  shippingFee,
  discount,
  finalTotal,
}) {
  const lineCount = cartItems.length;
  const totalQty = cartItems.reduce((sum, i) => sum + (i.quantity ?? 1), 0);
  const scrolls = lineCount > 4;
  const remainingForFreeShip = Math.max(0, FREE_SHIP_THRESHOLD - cartTotal);
  const progress = Math.min(100, Math.round((cartTotal / FREE_SHIP_THRESHOLD) * 100));

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="bg-[#FFF5F2] border border-[#F0DDD5] rounded-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <h2 className="font-serif text-xl font-semibold text-[#2C1810]">
            Đơn hàng của bạn
          </h2>
          {hasProducts && (
            <p className="text-xs text-stone-500 mt-1">
              {lineCount} loại · {totalQty} sản phẩm
            </p>
          )}
        </div>

        {hasProducts && (
          <div className="relative">
            <ul
              className={[
                "px-6 divide-y divide-dashed divide-[#F0DDD5]",
                scrolls ? "max-h-72 overflow-y-auto pb-6" : "",
              ].join(" ")}
              tabIndex={scrolls ? 0 : undefined}
              aria-label={scrolls ? "Danh sách sản phẩm, cuộn để xem thêm" : undefined}
            >
              {cartItems.map((item, i) => (
                <li key={item._id || item.id || i} className="py-3 first:pt-0 last:pb-0">
                  <CartLine item={item} compact />
                </li>
              ))}
            </ul>
            {scrolls && (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#FFF5F2] to-transparent"
                aria-hidden="true"
              />
            )}
          </div>
        )}

        <div className="mx-6 mt-4 border-t border-dashed border-[#E8CFC4]" />

        <div className="px-6 py-4 space-y-2.5">
          {hasProducts && <CostRow label="Tạm tính" value={formatCurrency(cartTotal)} />}
          {discount > 0 && (
            <CostRow label="Giảm giá" value={`-${formatCurrency(discount)}`} tone="discount" />
          )}
          <CostRow
            label="Vận chuyển"
            value={shippingFee === 0 ? "Miễn phí" : formatCurrency(shippingFee)}
            tone={shippingFee === 0 ? "free" : undefined}
          />

          {shippingFee > 0 && hasProducts && (
            <div className="pt-1">
              <div
                className="h-1.5 rounded-full bg-[#F0DDD5] overflow-hidden"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Tiến độ tới mức miễn phí vận chuyển"
              >
                <div
                  className="h-full rounded-full bg-[#C85C3C] transition-[width] duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-stone-600 mt-1.5">
                Mua thêm {formatCurrency(remainingForFreeShip)} để được miễn phí vận chuyển
              </p>
            </div>
          )}
        </div>

        <div className="flex items-baseline justify-between px-6 py-5 bg-white/60 border-t border-[#F0DDD5]">
          <span className="text-sm font-semibold text-[#2C1810]">Tổng cộng</span>
          <span className="font-serif text-3xl font-semibold text-[#C85C3C] tabular-nums">
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>

      <ul className="space-y-2.5 px-1 text-xs text-stone-600">
        <li className="flex items-center gap-2.5">
          <Truck size={15} className="text-[#C85C3C] shrink-0" aria-hidden="true" />
          Giao hàng trong 2–5 ngày
        </li>
        <li className="flex items-center gap-2.5">
          <RotateCcw size={15} className="text-[#C85C3C] shrink-0" aria-hidden="true" />
          Đổi trả miễn phí trong 7 ngày
        </li>
        <li className="flex items-center gap-2.5">
          <Gift size={15} className="text-[#C85C3C] shrink-0" aria-hidden="true" />
          Đóng gói quà tặng miễn phí
        </li>
      </ul>
    </aside>
  );
}
