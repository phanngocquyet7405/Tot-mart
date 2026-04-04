import React from 'react';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const ProductCard = ({ product, onAddToCart, onToggleWishlist }) => {
  const handleAction = (e, callback) => {
    e.preventDefault();
    e.stopPropagation();
    if (callback) callback(product);
  };

  return (
    <div className="flex flex-col group bg-white border border-transparent hover:border-gray-200 transition-all duration-300 rounded-sm overflow-hidden">
      <Link href={`/products/${product.id || product.slug}`} className="block">
        
        {/* Image Container */}
        <div className="relative w-full aspect-4/3 bg-gray-50 overflow-hidden">
          <Image 
            src={product.image || '/assets/placeholder.png'} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            width={400}
            height={300}
            priority={product.id <= 4}
          />
          
          {/* Badges */}
          {product.badge && (
            <div className={`absolute top-0 left-0 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-widest z-10 ${product.badgeColor || 'bg-black'}`}>
              {product.badge}
            </div>
          )}

          {/* Heart Button */}
          <button 
            onClick={(e) => handleAction(e, onToggleWishlist)}
            className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white text-gray-700 hover:text-red-500 transition-all shadow-sm z-10"
            aria-label="Add to wishlist"
          >
            <Heart className={`w-4 h-4 ${product.isWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        {/* Product Info */}
        <div className="flex flex-col grow p-4 bg-[#f8f9fa]">
          {/* Add to cart button */}
          <button 
            onClick={(e) => handleAction(e, onAddToCart)}
            className="w-full bg-[#1e3040] hover:bg-[#4a7c44] text-white py-2.5 text-[10px] font-bold tracking-[0.15em] flex items-center justify-center gap-2 mb-4 transition-colors duration-300"
          >
            <span className="text-lg leading-none">+</span> ADD TO CART
          </button>

          {/* Title */}
          <h3 className="text-sm text-gray-800 font-medium mb-2 line-clamp-2 min-h-10 leading-snug group-hover:text-[#4a7c44] transition-colors">
            {product.name}
          </h3>

          {/* Price Area */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-base font-bold text-black">{product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through decoration-gray-400/60">{product.originalPrice}</span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-auto">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 ${
                    i < (product.rating || 0)
                      ? 'text-black fill-black' 
                      : 'text-gray-200 fill-gray-100'
                  }`} 
                />
              ))}
            </div>
            <span className="text-[11px] text-gray-500 ml-1">
              {product.reviews || 0} Reviews
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};