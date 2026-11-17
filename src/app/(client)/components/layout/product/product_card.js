"use client";
import React from "react";
import { Heart, Star, ShoppingCart, Sparkles } from "lucide-react";
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
  const salePrice =
    rawPrice > 0 ? Math.round(rawPrice * (1 - discountPercent / 100)) : 0;
  const originalPrice = discountPercent > 0 ? rawPrice : product.originalPrice;
  const stock = product.stock ?? 0;
  const hasValidPrice = Number.isFinite(rawPrice) && rawPrice > 0;
  const outOfStock = stock <= 0 || !hasValidPrice;

  const rawImage =
    product.images && product.images[0]?.url
      ? product.images[0].url
      : "/assets/placeholder.png";
  const [imgSrc, setImgSrc] = React.useState(rawImage);
  React.useEffect(() => {
    setImgSrc(
      product.images && product.images[0]?.url
        ? product.images[0].url
        : "/assets/placeholder.png",
    );
  }, [product.images]);

  const brandName =
    product.brand?.name ||
    (typeof product.brand === "string" ? product.brand : "");

  return (
    <div className="flex flex-col group bg-card rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 border border-border/80 hover:border-primary/40">
      <Link href={productHref} className="block flex flex-col h-full">
        {/* Khung ảnh thẻ sản phẩm chuẩn Bokksu Market */}
        <div className="relative w-full aspect-square bg-gradient-to-b from-stone-50 via-background to-stone-100/40 dark:from-stone-900/40 dark:to-stone-950/20 overflow-hidden">
          <Image
            src={imgSrc}
            alt={product.name || "Sản phẩm TotMart"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
            priority={false}
            onError={() => setImgSrc("/assets/placeholder.png")}
          />

          {/* Overlay Hết hàng */}
          {outOfStock && (
            <div className="absolute inset-0 bg-background/85 backdrop-blur-xs flex items-center justify-center z-10">
              <span className="bg-foreground text-background px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                Hết hàng
              </span>
            </div>
          )}

          {/* Discount Badge */}
          {discountPercent > 0 && !outOfStock && (
            <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider shadow-xs">
              -{discountPercent}%
            </div>
          )}

          {/* Artisan Badge */}
          {product.badge ? (
            <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-xs text-foreground border border-border/70 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs">
              {product.badge}
            </div>
          ) : (
            brandName && (
              <div className="absolute top-3 right-3 hidden group-hover:flex items-center gap-1 bg-background/90 backdrop-blur-xs text-primary border border-primary/20 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-2xs transition-all">
                <Sparkles size={10} className="text-amber-500" />
                <span className="truncate max-w-[90px]">{brandName}</span>
              </div>
            )
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => handleAction(e, onToggleWishlist)}
            className={`absolute bottom-3 right-3 p-2.5 bg-card/90 backdrop-blur-xs border border-border/80 rounded-full hover:bg-card shadow-xs transition-all active:scale-90 pointer-coarse:min-h-11 pointer-coarse:min-w-11 flex items-center justify-center motion-reduce:transition-none cursor-pointer ${
              isWishlisted
                ? "text-destructive opacity-100"
                : "text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
            }`}
            aria-label={
              isWishlisted
                ? "Bỏ yêu thích sản phẩm"
                : "Thêm vào danh sách yêu thích"
            }
          >
            <Heart
              className={`w-4 h-4 ${
                isWishlisted ? "fill-destructive text-destructive" : ""
              }`}
            />
          </button>
        </div>

        {/* Nội dung thông tin sản phẩm */}
        <div className="flex flex-col grow p-4 sm:p-5">
          {brandName && (
            <span className="text-[10px] uppercase font-bold tracking-widest text-primary/80 mb-1 block truncate">
              {brandName}
            </span>
          )}

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-foreground mb-2 line-clamp-2 min-h-10 leading-snug group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {Number.isSafeInteger(product.reviewCount) &&
            product.reviewCount > 0 &&
            Number.isFinite(product.rating) &&
            product.rating > 0 &&
            product.rating <= 5 && (
              <div
                className="flex items-center gap-1.5 mb-2.5"
                aria-label={`Đánh giá ${product.rating} trên 5 sao (${product.reviewCount} lượt đánh giá)`}
              >
                <div className="flex gap-0.5" aria-hidden="true">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < Math.round(product.rating || 0)
                          ? "text-amber-500 fill-amber-400"
                          : "text-muted-foreground/30 fill-muted"
                      }`}
                    />
                  ))}
                </div>
                <span
                  className="text-xs text-muted-foreground tabular-nums font-medium"
                  aria-hidden="true"
                >
                  ({product.reviewCount})
                </span>
              </div>
            )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-4 mt-auto">
            <span className="text-base sm:text-lg font-black text-primary tabular-nums">
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
            className={`w-full py-2.5 px-3 text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all rounded-xl active:scale-[0.97] cursor-pointer shadow-2xs ${
              outOfStock
                ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                : "bg-primary hover:bg-primary/95 text-primary-foreground hover:shadow-xs"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{outOfStock ? "HẾT HÀNG" : "THÊM VÀO GIỎ"}</span>
          </button>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
