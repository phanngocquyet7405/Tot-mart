"use client";

import Image from "next/image";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/app/context/CartContext";
import {
  PLACEHOLDER_IMAGE,
  formatPrice,
  getFinalPrice,
} from "./productDetailService";

/**
 * @param {object[]} products - Danh sách sản phẩm gợi ý mua kèm, cùng shape
 *   với `relatedProducts` mà useProductDetail đã fetch sẵn (_id, name,
 *   images[].url, price, discount) — không cần gọi API riêng.
 */
export function FrequentlyBought({ products = [] }) {
  const { addToCart } = useCart();
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(products.map((p) => p._id)),
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

  const selectedProducts = products.filter((p) => selectedIds.has(p._id));
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
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-stone-100 shadow-sm space-y-6">
      <h2 className="text-lg font-black uppercase tracking-widest text-stone-900">
        Thường được mua cùng
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => {
          const isChecked = selectedIds.has(p._id);
          const finalPrice = getFinalPrice(p);
          return (
            <label
              key={p._id}
              className={`flex flex-col gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                isChecked
                  ? "border-amber-700"
                  : "border-stone-100 hover:border-stone-300"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleItem(p._id)}
                className="w-4 h-4 accent-amber-800"
              />
              <div className="relative aspect-square rounded-lg overflow-hidden bg-[#faf8f4]">
                <Image
                  src={p.images?.[0]?.url || PLACEHOLDER_IMAGE}
                  alt={p.name}
                  fill
                  className="object-cover p-1"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-stone-800 line-clamp-2">
                  {p.name}
                </p>
                <p className="text-sm font-black text-red-600">
                  {formatPrice(finalPrice)}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-100">
        <p className="text-sm text-stone-600">
          Tổng cộng ({selectedProducts.length} sản phẩm):{" "}
          <span className="text-lg font-black text-stone-900">
            {formatPrice(total)}
          </span>
        </p>
        <button
          onClick={handleAddAll}
          disabled={selectedProducts.length === 0}
          className="w-full sm:w-auto bg-amber-800 hover:bg-amber-900 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Thêm tất cả vào giỏ
        </button>
      </div>
    </div>
  );
}
