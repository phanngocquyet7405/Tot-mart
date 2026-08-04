"use client";

import Link from "next/link";
import { toast } from "sonner";
import { ProductCard } from "./product_card";
import CollectionLayout from "./product_layout";
import { useAddToCart } from "@/app/hook/useAddToCart";
import { useWishlist } from "@/app/context/WishlistContext";

export default function FeaturedProducts({
  title = "Featured Products",
  initialData = [],
}) {
  const products = initialData;
  // Trước đây chỗ này chỉ console.log("Added:", p) — sản phẩm không thực
  // sự vào giỏ hàng. Dùng hook dùng chung để hành vi giống hệt trang danh
  // sách/chi tiết sản phẩm: addToCart + toast + mở Cart Drawer.
  const { addToCart } = useAddToCart();
  // Trước đây không hề truyền onToggleWishlist — bấm icon trái tim không
  // làm gì cả. Nối vào WishlistContext dùng chung.
  const { isInWishlist, toggleWishlist } = useWishlist();

  if (!products || products.length === 0) return null;

  return (
    <CollectionLayout title={title} linkText="View All" linkHref="/products">
      {products.map((product, index) => (
        <ProductCard
          // Fallback: nếu không có id, dùng _id hoặc fallback cuối cùng là index
          key={product.id || product._id || `product-${index}`}
          product={product}
          onAddToCart={(p) => addToCart(p)}
          isWishlisted={isInWishlist(product._id || product.id)}
          onToggleWishlist={(p) => {
            const added = toggleWishlist({
              _id: p._id || p.id,
              id: p._id || p.id,
              name: p.name,
              slug: p.slug,
              image: p.images?.[0]?.url || "/placeholder.svg",
              price: p.price,
            });
            toast.success(
              added
                ? "Đã thêm vào danh sách yêu thích"
                : "Đã xóa khỏi danh sách yêu thích",
            );
          }}
        />
      ))}
    </CollectionLayout>
  );
}
