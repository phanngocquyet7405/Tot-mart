"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/app/context/CartContext";
import {
  PLACEHOLDER_IMAGE,
  formatPrice,
  getFinalPrice,
  buildProductHref,
} from "./productDetailService";

/**
 * @param {object[]} products - Danh sách sản phẩm gợi ý mua kèm, cùng shape
 *   với `relatedProducts` mà useProductDetail đã fetch sẵn (_id, name,
 *   images[].url, price, discount) — không cần gọi API riêng.
 */
export function FrequentlyBought({ products = [] }) {
  const { addToCart } = useCart();
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  if (products.length === 0) return null;

  const toggleItem = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedProducts = products.filter(
    (p) =>
      selectedIds.has(p._id) &&
      p.stock > 0 &&
      Number.isFinite(getFinalPrice(p)),
  );
  const total = selectedProducts.reduce((sum, p) => sum + getFinalPrice(p), 0);

  const handleAddAll = () => {
    if (selectedProducts.length === 0) return;
    selectedProducts.forEach((p) => {
      addToCart({
        _id: p._id,
        id: p._id,
        name: p.name,
        image: p.images?.[0]?.url || PLACEHOLDER_IMAGE,
        price: getFinalPrice(p),
      });
    });
    toast.success(
      `Đã thêm ${selectedProducts.length} sản phẩm vào giỏ hàng 🛒`,
    );
  };

  return (
    <section className="tm-section mt-14 pt-10 border-t border-border/80 space-y-6" aria-label="Gợi ý mua thêm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
            Gợi ý mua kèm phong vị Việt
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Những thức quà được nhiều thực khách lựa chọn kết hợp cùng sản phẩm này
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => {
          const isChecked = selectedIds.has(p._id);
          const finalPrice = getFinalPrice(p);
          return (
            <article
              key={p._id}
              className={`flex flex-col gap-3 p-3.5 border rounded-2xl transition-all duration-200 ${
                isChecked
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                  : "border-border/80 hover:border-primary/40 bg-card shadow-2xs"
              }`}
            >
              <label className="flex min-h-11 items-center gap-2.5 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={!(p.stock > 0) || !Number.isFinite(finalPrice)}
                  onChange={() => toggleItem(p._id)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
                <span className={isChecked ? "text-primary font-bold" : "text-muted-foreground"}>
                  {p.stock > 0 ? "Chọn mua thêm" : "Tạm hết hàng"}
                </span>
              </label>

              <Link
                href={buildProductHref(p)}
                className="block relative aspect-square rounded-xl overflow-hidden bg-stone-50 dark:bg-stone-900 border border-border/60 group"
              >
                <Image
                  src={p.images?.[0]?.url || PLACEHOLDER_IMAGE}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 45vw, 25vw"
                  className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </Link>

              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                  <Link
                    className="underline-offset-4 hover:underline hover:text-primary transition-colors"
                    href={buildProductHref(p)}
                  >
                    {p.name}
                  </Link>
                </p>
                <p className="text-base font-black text-primary tabular-nums">
                  {Number.isFinite(finalPrice)
                    ? formatPrice(finalPrice)
                    : "Chưa có giá"}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-stone-50/80 dark:bg-stone-900/40 border border-border/80 shadow-2xs">
        <div>
          <p className="text-sm text-muted-foreground">
            Tạm tính ({selectedProducts.length} sản phẩm mua kèm):{" "}
            <span className="text-xl font-black text-primary tabular-nums ml-1">
              {formatPrice(total)}
            </span>
          </p>
          <p className="text-xs text-muted-foreground/80 mt-0.5">
            Giá cuối cùng được xác nhận khi thanh toán. Phí giao hàng trả riêng cho đơn vị vận chuyển.
          </p>
        </div>
        <button
          onClick={handleAddAll}
          disabled={selectedProducts.length === 0}
          className="tm-button tm-button--primary w-full sm:w-auto px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs shadow-sm hover:shadow active:scale-95 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Thêm sản phẩm đã chọn
        </button>
      </div>
    </section>
  );
}

export default FrequentlyBought;
