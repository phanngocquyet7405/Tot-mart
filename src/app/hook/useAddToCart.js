"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { useCart } from "@/app/context/CartContext";

/**
 * useAddToCart.js
 * Hook dùng chung cho MỌI nơi trong app cần thêm sản phẩm/hộp quà vào giỏ:
 * trang danh sách sản phẩm, trang chi tiết sản phẩm, trang chi tiết box,
 * sản phẩm gợi ý trong Cart Drawer, featured products ở trang chủ...
 *
 * Trước đây mỗi nơi tự viết lại 3 bước (addToCart → toast → mở drawer)
 * theo cách khác nhau — có chỗ đủ cả 3, có chỗ chỉ addToCart im lặng
 * (không toast, không mở drawer), có chỗ là hàm rỗng console.log. Hook
 * này gộp lại một chỗ duy nhất để hành vi luôn nhất quán.
 *
 * Cách dùng:
 *   const { addToCart } = useAddToCart();
 *   addToCart(product);              // qty mặc định = 1, có toast + mở drawer
 *   addToCart(product, 3);           // thêm 3
 *   addToCart(product, 1, { openDrawer: false }); // chỉ toast, không mở drawer
 */
export function useAddToCart() {
  const { addToCart: addToCartRaw, openCart } = useCart();

  const addToCart = useCallback(
    (product, quantity = 1, options = {}) => {
      if (!product) return;

      const { showToast = true, openDrawer = true, message } = options;

      addToCartRaw(product, quantity);

      if (showToast) {
        toast.success(
          message ||
            `Đã thêm ${quantity > 1 ? `${quantity} ` : ""}${product.name} vào giỏ hàng 🛒`,
        );
      }

      if (openDrawer) openCart();
    },
    [addToCartRaw, openCart],
  );

  return { addToCart };
}
