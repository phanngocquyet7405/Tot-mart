"use client";

import React from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";

export default function CartItem({ product }) {
  const { updateQuantity, removeFromCart } = useCart();

  // Xử lý lấy ảnh từ cấu trúc dữ liệu schema của Box hoặc Product
  const imageUrl =
    product.images?.[0]?.url || product.image || "/placeholder.svg";
  const productId = product._id || product.id;

  return (
    <div className="flex flex-col bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Ảnh sản phẩm */}
        <div className="relative w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
          <Image
            src={imageUrl}
            alt={product.name || "Product"}
            fill
            className="object-cover"
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-sm line-clamp-1">
            {product.name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-orange-600 font-bold text-sm">
              {product.price.toLocaleString("vi-VN")}₫
            </span>
            {product.quantity > 1 && (
              <span className="text-xs text-gray-400">
                × {product.quantity}
              </span>
            )}
          </div>
        </div>

        {/* Nút xóa khỏi giỏ hàng */}
        <button
          onClick={() => removeFromCart(productId)}
          className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Điều khiển tăng giảm số lượng & Thành tiền */}
      {product.quantity && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => updateQuantity(productId, -1)}
              className="px-2.5 py-1 hover:bg-gray-50 transition-colors text-slate-600"
            >
              <Minus size={12} />
            </button>
            <span className="px-3 py-1 text-xs font-bold text-slate-900 min-w-8 text-center border-x border-gray-100">
              {product.quantity}
            </span>
            <button
              onClick={() => updateQuantity(productId, 1)}
              className="px-2.5 py-1 hover:bg-gray-50 transition-colors text-slate-600"
            >
              <Plus size={12} />
            </button>
          </div>
          <p className="font-black text-slate-800 text-sm">
            {(product.price * product.quantity).toLocaleString("vi-VN")}₫
          </p>
        </div>
      )}
    </div>
  );
}
