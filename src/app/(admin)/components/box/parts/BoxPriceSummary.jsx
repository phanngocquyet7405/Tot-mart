"use client";

const fmtPrice = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val ?? 0,
  );

export function BoxPriceSummary({ subtotal, discountPercent, computedValue }) {
  if (!subtotal || subtotal <= 0) return null;

  return (
    <div className="mt-3 rounded-xl bg-indigo-50 border border-indigo-100 p-3 space-y-1">
      <div className="flex justify-between text-sm text-gray-500">
        <span>Tổng giá sản phẩm</span>
        <span>{fmtPrice(subtotal)}</span>
      </div>
      {discountPercent > 0 && (
        <div className="flex justify-between text-sm text-red-500">
          <span>Giảm giá ({discountPercent}%)</span>
          <span>
            −{fmtPrice(subtotal * (discountPercent / 100))}
          </span>
        </div>
      )}
      <div className="flex justify-between text-sm font-bold text-indigo-700 border-t border-indigo-200 pt-1">
        <span>Giá trị box</span>
        <span>{fmtPrice(computedValue)}</span>
      </div>
    </div>
  );
}

export default BoxPriceSummary;
