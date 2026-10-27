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
    if (!price || price <= 0) return "Liên hệ";
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

  const discountPercent = product.salePercent || 0;
  const rawPrice = Number(product.price) || 0;
  const salePrice = rawPrice > 0 ? Math.round(rawPrice * (1 - discountPercent / 100)) : 0;
  const originalPrice = discountPercent > 0 ? rawPrice : product.originalPrice;
  const stock = product.stock ?? 0;
  const hasValidPrice = Number.isFinite(rawPrice) && rawPrice > 0;
  const outOfStock = stock <= 0 || !hasValidPrice;

  const rawImage = product.images && product.images[0]?.url ? product.images[0].url : "/assets/placeholder.png";
  const [imgSrc, setImgSrc] = React.useState(rawImage);
  React.useEffect(() => {
    setImgSrc(product.images && product.images[0]?.url ? product.images[0].url : "/assets/placeholder.png");
  }, [product.images]);

  return (
    <div className="flex flex-col group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-green-200">
      <Link href={productHref} className="block">
        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
          <Image
            src={imgSrc}
            alt={product.name || "Sản phẩm TotMart"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
            priority={false}
            onError={() => setImgSrc("/assets/placeholder.png")}
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
            className={`absolute bottom-3 right-3 p-2 bg-white rounded-full hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-300 motion-reduce:transition-none ${
              isWishlisted
                ? "text-red-500 opacity-100"
                : "text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100"
            }`}
            aria-label={isWishlisted ? "Bỏ yêu thích sản phẩm" : "Thêm vào danh sách yêu thích"}
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
          {Number.isSafeInteger(product.reviewCount) && product.reviewCount > 0 && Number.isFinite(product.rating) && product.rating > 0 && product.rating <= 5 && (
            <div
              className="flex items-center gap-2 mb-3"
              aria-label={`Đánh giá ${product.rating} trên 5 sao (${product.reviewCount} lượt đánh giá)`}
            >
              <div className="flex gap-0.5" aria-hidden="true">
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
              <span className="text-xs text-gray-500" aria-hidden="true">
                ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(salePrice)}
            </span>
             {originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                 {formatPrice(originalPrice)}
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
