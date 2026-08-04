"use client";
import React from "react";
import { Heart, Star, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}) => {
  const productId = product._id || product.id;
  const productSlug = product.slug || "san-pham";
  const productHref = `/products/${productSlug}-${productId}`;

  const formatPrice = (price) => {
    if (!price) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  const handleAction = (e, callback) => {
    e.preventDefault();
    e.stopPropagation();
    if (callback) callback(product);
  };

  const discountPercent = product.discountPercent || 0;
  // product.stock có thể undefined với dữ liệu cũ/thiếu — coi như 0 (hết
  // hàng) để nhất quán với cách trang chi tiết sản phẩm đang xử lý
  // (ProductPurchasePanel.js: const stock = product.stock ?? 0).
  const stock = product.stock ?? 0;
  const outOfStock = stock <= 0;

  return (
    <div className="flex flex-col group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-200">
      <Link href={productHref} className="block">
        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={
              product.images && product.images[0]?.url
                ? product.images[0].url
                : "/placeholder.svg"
            }
            alt={product.name || "product"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={false}
          />

          {/* Overlay Hết hàng — phủ mờ ảnh + nhãn ở giữa, dễ nhận biết ngay
              trên lưới sản phẩm thay vì phải bấm vào mới biết hết hàng */}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
              <span className="bg-gray-900 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Hết hàng
              </span>
            </div>
          )}

          {/* Discount Badge */}
          {discountPercent > 0 && !outOfStock && (
            <div className="absolute top-3 left-3 bg-green-700 text-white px-3 py-1 rounded-full text-xs font-bold">
              -{discountPercent}%
            </div>
          )}

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {product.badge}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => handleAction(e, onToggleWishlist)}
            className={`absolute bottom-3 right-3 p-2 bg-white rounded-full hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-300 ${
              isWishlisted
                ? "text-red-500 opacity-100"
                : "text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        </div>

        <div className="flex flex-col grow p-4">
          {/* Product Name */}
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-10 leading-snug group-hover:text-green-700 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < (product.rating || 0)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 fill-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {product.reviews ? `(${product.reviews})` : ""}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => !outOfStock && handleAction(e, onAddToCart)}
            disabled={outOfStock}
            className={`w-full py-2.5 text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-colors duration-300 rounded-md ${
              outOfStock
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800 text-white cursor-pointer"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            {outOfStock ? "HẾT HÀNG" : "THÊM VÀO GIỎ"}
          </button>
        </div>
      </Link>
    </div>
  );
};
