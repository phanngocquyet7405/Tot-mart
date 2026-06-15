"use client";

import { ProductList } from "./ProductList";

export function BoxSection({
  products,
  availableProducts = [],
  errors,
  computedValue,
  discountPercent,
  fmtPrice,
  onChangeProduct,
  onAddProduct,
  onRemoveProduct,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      {/* Label section */}
      <div>
        <h3 className="text-sm font-medium text-foreground">
          Sản phẩm trong box
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Thêm các sản phẩm sẽ được đóng gói trong box này
        </p>
      </div>

      {/* Product list + summary */}
      <div className="md:col-span-2">
        {errors.products && (
          <p className="text-xs text-red-500 mb-2">{errors.products}</p>
        )}

        <ProductList
          products={products}
          availableProducts={availableProducts}
          errors={errors}
          onChangeProduct={onChangeProduct}
          onAddProduct={onAddProduct}
          onRemoveProduct={onRemoveProduct}
        />

        {computedValue > 0 && (
          <div className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mt-3 border border-blue-100 dark:border-blue-800">
            <span className="text-xs text-blue-700 dark:text-blue-400">
              Giá trị box{" "}
              {discountPercent > 0 ? `(sau giảm ${discountPercent}%)` : ""}
            </span>
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">
              {fmtPrice(computedValue)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
