"use client";
import React from "react";
import { Heart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const ProductCard = ({ product, onAddToCart, onToggleWishlist }) => {
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

  return (
    <div className="flex flex-col group bg-white border border-transparent hover:border-gray-200 transition-all duration-300 rounded-sm overflow-hidden shadow-sm hover:shadow-md">
      <Link href={productHref} className="block">
        <div className="relative w-full aspect-4/3 bg-gray-50 overflow-hidden">
          <Image
            src={
              product.images && product.images[0]?.url
                ? product.images[0].url
                : "/placeholder.svg"
            }
            alt={product.name || "product"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="rounded-md object-cover border transition-transform duration-500 group-hover:scale-105"
            priority={false}
          />

          {product.badge && (
            <div
              className={`absolute top-0 left-0 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-widest z-10 ${product.badgeColor || "bg-black"}`}
            >
              {product.badge}
            </div>
          )}

          <button
            onClick={(e) => handleAction(e, onToggleWishlist)}
            className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white text-gray-700 hover:text-red-500 transition-all shadow-sm z-10"
            aria-label="Add to wishlist"
          >
            <Heart
              className={`w-4 h-4 ${product.isWishlist ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        </div>

        <div className="flex flex-col grow p-4 bg-[#f8f9fa]">
          <button
            onClick={(e) => handleAction(e, onAddToCart)}
            className="w-full bg-[#1e3040] hover:bg-orange-600 text-white py-2.5 text-[10px] font-bold tracking-[0.15em] flex items-center justify-center gap-2 mb-4 transition-colors duration-300"
          >
            <span className="text-lg leading-none">+</span> ADD TO CART
          </button>

          <h3 className="text-sm text-gray-800 font-medium mb-2 line-clamp-2 min-h-10 leading-snug group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-bold text-black">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through decoration-gray-400/60">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mt-auto">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < (product.rating || 0)
                      ? "text-yellow-500 fill-yellow-500"
                      : "text-gray-200 fill-gray-100"
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-500 ml-1">
              ({product.reviews || 0} Reviews)
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};
