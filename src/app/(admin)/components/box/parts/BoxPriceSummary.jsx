"use client";

const fmtPrice = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val ?? 0,
  );

export function BoxPriceSummary({ subtotal, discountPercent, computedValue }) {
  if (!subtotal || subtotal <= 0) return null;

  return (
    <div className="mt-3 rounded-xl bg-muted/50 border border-border p-3 space-y-1">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Tổng giá sản phẩm</span>
        <span className="tabular-nums">{fmtPrice(subtotal)}</span>
      </div>
      {discountPercent > 0 && (
        <div className="flex justify-between text-sm text-destructive-text">
          <span>Giảm giá ({discountPercent}%)</span>
          <span>
            −{fmtPrice(subtotal * (discountPercent / 100))}
          </span>
        </div>
      )}
      <div className="flex justify-between text-sm font-bold text-primary border-t border-primary/20 pt-1">
        <span>Giá trị combo</span>
        <span className="tabular-nums">{fmtPrice(computedValue)}</span>
      </div>
    </div>
  );
}

export default BoxPriceSummary;
