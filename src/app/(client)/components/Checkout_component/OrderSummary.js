"use client";
/**
 * OrderSummary.js
 * Cột phải — "phiếu đơn hàng" (sticky trên desktop, thu gọn trên mobile).
 * Liệt kê TẤT CẢ sản phẩm có ảnh.
 * Toàn bộ số tiền VND tabular-nums, căn phải.
 */

import { cartLineKey } from "@/app/util/cartLine.mjs";
import { useState } from "react";
import { Truck, RotateCcw, Gift, ChevronDown, ChevronUp, ShoppingBag } from "lucide-react";
import { CartLine } from "./CartLine";
import { formatCurrency } from "@/app/util/formatter";

function CostRow({ label, value, tone }) {
  const toneClass =
    tone === "discount"
      ? "text-destructive"
      : tone === "free"
        ? "text-success-text"
        : "text-foreground";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold tabular-nums text-right ${toneClass}`}>{value}</span>
    </div>
  );
}

export function OrderSummary({
  cartItems,
  hasProducts,
  cartTotal,
  discount,
  giftFee = 0,
  bulkDiscountAmount = 0,
  finalTotal,
}) {
  const [mobileExpanded, setMobileExpanded] = useState(false);
  const lineCount = cartItems.length;
  const totalQty = cartItems.reduce((sum, i) => sum + (i.quantity ?? 1), 0);
  const scrolls = lineCount > 4;

  const summaryContent = (
    <>
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4">
        <h2 className="font-serif text-xl font-semibold text-foreground">
          Đơn hàng của bạn
        </h2>
        {hasProducts && (
          <p className="text-xs text-muted-foreground mt-1 tabular-nums">
            {lineCount} loại · {totalQty} sản phẩm
          </p>
        )}
      </div>

      {hasProducts && (
        <div className="relative">
          <ul
            className={[
              "px-5 sm:px-6 divide-y divide-dashed divide-border",
              scrolls ? "max-h-72 overflow-y-auto pb-4" : "",
            ].join(" ")}
            tabIndex={scrolls ? 0 : undefined}
            aria-label={scrolls ? "Danh sách sản phẩm, cuộn để xem thêm" : undefined}
          >
            {cartItems.map((item) => (
              <li key={cartLineKey(item)} className="py-3 first:pt-0 last:pb-0">
                <CartLine item={item} compact />
              </li>
            ))}
          </ul>
          {scrolls && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-card to-transparent"
              aria-hidden="true"
            />
          )}
        </div>
      )}

      <div className="mx-5 sm:mx-6 mt-3 border-t border-dashed border-border" />

      <div className="px-5 sm:px-6 py-4 space-y-2.5">
        {bulkDiscountAmount > 0 && (
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Đã giảm số lượng</span>
            <span className="font-semibold text-destructive tabular-nums text-right">
              -{formatCurrency(bulkDiscountAmount)}
            </span>
          </div>
        )}
        {giftFee > 0 && <CostRow label="Gói quà" value={formatCurrency(giftFee)} />}
        {hasProducts && <CostRow label="Tạm tính" value={formatCurrency(cartTotal)} />}
        {discount > 0 && (
          <CostRow label="Giảm giá" value={`-${formatCurrency(discount)}`} tone="discount" />
        )}
        <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
          Phí vận chuyển: khách trả trực tiếp cho bên giao hàng, không nằm trong số tiền bên dưới. Mức phí cần được thông báo và thống nhất trước khi giao.
        </p>
      </div>

      <div className="flex items-baseline justify-between px-5 sm:px-6 py-4 bg-muted/30 border-t border-border">
        <span className="text-sm font-semibold text-foreground">Thanh toán cho TotMart</span>
        <span className="font-serif text-2xl sm:text-3xl font-bold text-primary tabular-nums text-right">
          {formatCurrency(finalTotal)}
        </span>
      </div>
    </>
  );

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      {/* Mobile Collapsible Header (< lg) */}
      <div className="lg:hidden bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setMobileExpanded((prev) => !prev)}
          className="w-full flex items-center justify-between p-4 text-left pointer-coarse:min-h-11"
          aria-expanded={mobileExpanded}
          aria-label="Thu gọn hoặc mở rộng tóm tắt đơn hàng"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <ShoppingBag size={18} className="text-primary shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-foreground uppercase tracking-wide block truncate">
                Tóm tắt đơn hàng ({totalQty} món)
              </span>
              <span className="text-xs text-muted-foreground">
                {mobileExpanded ? "Bấm để thu gọn" : "Bấm để xem chi tiết"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-base font-bold text-primary tabular-nums text-right">
              {formatCurrency(finalTotal)}
            </span>
            {mobileExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {mobileExpanded && (
          <div className="border-t border-border">
            {summaryContent}
          </div>
        )}
      </div>

      {/* Desktop Card (>= lg) */}
      <div className="hidden lg:block bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
        {summaryContent}
      </div>

      <ul className="space-y-2.5 px-1 text-xs text-muted-foreground">
        <li className="flex items-center gap-2.5">
          <Truck size={15} className="text-primary shrink-0" aria-hidden="true" />
          Giao hàng trong 2–5 ngày
        </li>
        <li className="flex items-center gap-2.5">
          <RotateCcw size={15} className="text-primary shrink-0" aria-hidden="true" />
          Đổi trả miễn phí trong 7 ngày
        </li>
        <li className="flex items-center gap-2.5">
          <Gift size={15} className="text-primary shrink-0" aria-hidden="true" />
          Phí gói quà hiển thị trong báo giá
        </li>
      </ul>
    </aside>
  );
}
