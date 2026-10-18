"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
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
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(),
  );

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

  const selectedProducts = products.filter((p) => selectedIds.has(p._id) && p.stock > 0 && Number.isFinite(getFinalPrice(p)));
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
    <section className="tm-section space-y-6" aria-label="Gợi ý mua thêm">
      <h2 className="text-2xl font-bold text-stone-900">
        Gợi ý mua thêm
      </h2>

      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => {
          const isChecked = selectedIds.has(p._id);
          const finalPrice = getFinalPrice(p);
          return (
            <article
              key={p._id}
              className={`flex flex-col gap-3 p-3 border rounded-xl ${
                isChecked
                  ? "border-green-700"
                  : "border-stone-100 hover:border-stone-300"
              }`}
            >
              <label className="flex min-h-11 items-center gap-3 text-sm"><input
                type="checkbox"
                checked={isChecked}
                disabled={!(p.stock > 0) || !Number.isFinite(finalPrice)}
                onChange={() => toggleItem(p._id)}
                className="w-4 h-4 accent-green-800"
              /><span>{p.stock > 0 ? "Chọn mua thêm" : "Tạm hết hàng"}</span></label>
              <Link href={buildProductHref(p)} className="block relative aspect-square rounded-lg overflow-hidden bg-[#faf8f4]">
                <Image
                  src={p.images?.[0]?.url || PLACEHOLDER_IMAGE}
                  alt={p.name}
                  fill
                  sizes="(max-width: 640px) 45vw, 25vw"
                  className="object-cover p-1"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </Link>
              <div className="space-y-1">
                <p className="text-sm font-bold text-stone-800">
                  <Link className="underline-offset-4 hover:underline" href={buildProductHref(p)}>{p.name}</Link>
                </p>
                <p className="text-base font-bold text-green-800">
                  {Number.isFinite(finalPrice) ? formatPrice(finalPrice) : 'Chưa có giá'}
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
        <p className="text-sm text-stone-600">
          Tạm tính ({selectedProducts.length} sản phẩm):{" "}
          <span className="text-lg font-black text-stone-900">
            {formatPrice(total)}
          </span>
        </p>
        <button
          onClick={handleAddAll}
          disabled={selectedProducts.length === 0}
          className="tm-button tm-button--primary w-full sm:w-auto"
        >
          <ShoppingCart className="w-4 h-4" />
          Thêm sản phẩm đã chọn
        </button>
      </div>
      <p className="text-sm text-stone-600">Giá cuối cùng được xác nhận khi thanh toán. Phí giao hàng trả riêng cho đơn vị vận chuyển.</p>
    </section>
  );
}
