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
    <div className="group rounded-lg border border-border bg-card p-4 space-y-3 hover:border-primary/40 hover:shadow-sm transition-all">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          {item.name ? (
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-sm font-semibold text-foreground block">
                  {item.name}
                </span>
                <span className="text-xs text-primary font-medium mt-0.5">
                  <span className="tabular-nums">{fmtPrice(item.price)}</span>
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
          className="p-2 min-h-11 min-w-11 flex items-center justify-center text-muted-foreground hover:text-destructive-text hover:bg-destructive/10 rounded-lg transition-colors shrink-0 opacity-0 group-hover:opacity-100"
          title="Remove product"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {item.productId && (
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="text-xs font-medium text-muted-foreground shrink-0">
                Số lượng
              </Label>
              <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/50">
                <button
                  type="button"
                  onClick={() =>
                    onChange(index, "quantity", Math.max(1, item.quantity - 1))
                  }
                  className="min-h-11 min-w-11 flex items-center justify-center text-muted-foreground hover:bg-muted text-sm transition-colors font-medium"
                >
                  −
                </button>
                <span className="w-9 text-center text-sm font-semibold text-foreground border-l border-r border-border">
                  <span className="tabular-nums">{item.quantity}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onChange(index, "quantity", item.quantity + 1)}
                  className="min-h-11 min-w-11 flex items-center justify-center text-muted-foreground hover:bg-muted text-sm transition-colors font-medium"
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Tổng:</span>{" "}
              <span className="font-bold text-foreground">
                <span className="tabular-nums">{fmtPrice(item.price * item.quantity)}</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onChange(index, { productId: "", name: "", price: 0 })
            }
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            ↻ Đổi sản phẩm
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive-text font-medium bg-destructive/10 p-2 rounded">
          {error}
        </p>
      )}
    </div>
  );
}

export default ProductRow;
