"use client";

import React from 'react';
import { cartLineKey } from '@/app/util/cartLine.mjs';
import { Plus, Minus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/app/context/CartContext";

export default function CartItem({ product, lineTotal }) {
  const { updateQuantity, removeFromCart } = useCart();

  const imageUrl =
    product.images?.[0]?.url || product.image || "/assets/placeholder.png";
  const productId = cartLineKey(product);

  return (
    <div className="flex flex-col bg-card rounded-xl p-4 border border-border shadow-xs hover:border-primary/40 transition-colors">
      <div className="flex items-center gap-4">
        {/* Ảnh sản phẩm */}
        <div className="relative w-16 h-16 bg-muted rounded-xl overflow-hidden shrink-0 border border-border">
          <Image
            src={imageUrl}
            alt={product.name || "Sản phẩm TotMart"}
            fill
            className="object-cover"
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm line-clamp-1">
            {product.name}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-primary font-bold text-sm tabular-nums">
              {product.price.toLocaleString("vi-VN")} ₫
            </span>
            {product.quantity > 1 && (
              <span className="text-xs text-muted-foreground tabular-nums">
                × {product.quantity}
              </span>
            )}
          </div>
        </div>

        {/* Nút xóa khỏi giỏ hàng */}
        <button
          aria-label={`Xóa ${product.name} khỏi giỏ`}
          onClick={() => removeFromCart(productId)}
          className="text-muted-foreground hover:text-destructive transition-colors p-2 hover:bg-destructive/10 rounded-lg shrink-0 pointer-coarse:min-h-11 pointer-coarse:min-w-11 flex items-center justify-center"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Điều khiển tăng giảm số lượng & Thành tiền */}
      {product.quantity && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background">
            <button
              aria-label={`Giảm số lượng ${product.name}`}
              onClick={() => updateQuantity(productId, -1)}
              className="px-2.5 py-1 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground pointer-coarse:min-h-11 pointer-coarse:min-w-11 flex items-center justify-center"
            >
              <Minus size={12} />
            </button>
            <span className="px-3 py-1 text-xs font-bold text-foreground min-w-8 text-center border-x border-border tabular-nums">
              {product.quantity}
            </span>
            <button
              aria-label={`Tăng số lượng ${product.name}`}
              onClick={() => updateQuantity(productId, 1)}
              className="px-2.5 py-1 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground pointer-coarse:min-h-11 pointer-coarse:min-w-11 flex items-center justify-center"
            >
              <Plus size={12} />
            </button>
          </div>
          <p className="font-bold text-foreground text-sm tabular-nums text-right">
            {(lineTotal ?? product.price * product.quantity).toLocaleString("vi-VN")} ₫
          </p>
        </div>
      )}
    </div>
  );
}
