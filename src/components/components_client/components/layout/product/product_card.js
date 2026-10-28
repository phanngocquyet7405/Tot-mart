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
    <div className="flex flex-col group bg-card rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 border border-border">
      <Link href={productHref} className="block">
        <div className="relative w-full aspect-square bg-muted overflow-hidden">
          <Image
            src={imgSrc}
            alt={product.name || "Sản phẩm TotMart"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
            priority={false}
            onError={() => setImgSrc("/assets/placeholder.png")}
          />

          {/* Overlay Hết hàng — phủ mờ ảnh + nhãn ở giữa */}
          {outOfStock && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center z-10">
              <span className="bg-foreground text-background px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Hết hàng
              </span>
            </div>
          )}

          {/* Discount Badge */}
          {discountPercent > 0 && !outOfStock && (
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full text-xs font-bold">
              -{discountPercent}%
            </div>
          )}

          {/* Badge */}
          {product.badge && (
            <div className="absolute top-3 right-3 bg-accent text-accent-foreground border border-border px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider">
              {product.badge}
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => handleAction(e, onToggleWishlist)}
            className={`absolute bottom-3 right-3 p-2.5 bg-card/90 border border-border rounded-full hover:bg-card shadow-xs transition-colors pointer-coarse:min-h-11 pointer-coarse:min-w-11 flex items-center justify-center motion-reduce:transition-none ${
              isWishlisted
                ? "text-destructive opacity-100"
                : "text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
            }`}
            aria-label={isWishlisted ? "Bỏ yêu thích sản phẩm" : "Thêm vào danh sách yêu thích"}
          >
            <Heart
              className={`w-4 h-4 ${isWishlisted ? "fill-destructive text-destructive" : ""}`}
            />
          </button>
        </div>

        <div className="flex flex-col grow p-4">
          {/* Product Name */}
          <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 min-h-10 leading-snug group-hover:text-primary transition-colors">
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
                        ? "text-warning fill-warning"
                        : "text-muted-foreground/30 fill-muted"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground tabular-nums" aria-hidden="true">
                ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-base sm:text-lg font-bold text-foreground tabular-nums">
              {formatPrice(salePrice)}
            </span>
            {originalPrice && (
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => !outOfStock && handleAction(e, onAddToCart)}
            disabled={outOfStock}
            className={`w-full py-2.5 px-3 text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-colors rounded-lg active:scale-[0.97] ${
              outOfStock
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                : "bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
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
