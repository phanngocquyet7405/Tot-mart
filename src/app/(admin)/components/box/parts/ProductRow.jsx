"use client";

import { Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ProductPicker } from "./ProductPicker";

const fmtPrice = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val ?? 0,
  );

export function ProductRow({
  item,
  index,
  availableProducts,
  onChange,
  onRemove,
  error,
}) {
  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-4 space-y-3 hover:border-indigo-300 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          {item.name ? (
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-slate-900 block">
                  {item.name}
                </span>
                <span className="text-xs text-indigo-600 font-medium mt-0.5">
                  {fmtPrice(item.price)}
                </span>
              </div>
            </div>
          ) : (
            <ProductPicker
              availableProducts={availableProducts}
              onSelect={(p) =>
                onChange(index, {
                  productId: p._id,
                  name: p.name,
                  price: p.price || 0,
                })
              }
            />
          )}
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0 opacity-0 group-hover:opacity-100"
          title="Remove product"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {item.productId && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-slate-600 shrink-0">
                Số lượng
              </Label>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                <button
                  type="button"
                  onClick={() =>
                    onChange(index, "quantity", Math.max(1, item.quantity - 1))
                  }
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-sm transition-colors font-medium"
                >
                  −
                </button>
                <span className="w-9 text-center text-sm font-semibold text-slate-800 border-l border-r border-slate-200">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(index, "quantity", item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 text-sm transition-colors font-medium"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-xs text-slate-600">
              <span className="font-medium">Tổng:</span>{" "}
              <span className="font-bold text-slate-900">
                {fmtPrice(item.price * item.quantity)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange(index, { productId: "", name: "", price: 0 })
            }
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
          >
            ↻ Đổi sản phẩm
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 font-medium bg-red-50 p-2 rounded">
          {error}
        </p>
      )}
    </div>
  );
}

export default ProductRow;
