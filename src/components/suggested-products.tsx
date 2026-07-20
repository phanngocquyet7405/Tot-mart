'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  isNew?: boolean;
  href?: string;
}

interface SuggestedProductsProps {
  products: Product[];
  title?: string;
  onAddToCart?: (productId: string) => Promise<void> | void;
  isLoading?: boolean;
}

export function SuggestedProducts({
  products = [],
  title = 'You Might Also Like',
  onAddToCart,
  isLoading = false,
}: SuggestedProductsProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!products || products.length === 0) {
    return null;
  }

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleAddToCart = async (productId: string) => {
    setLoadingId(productId);
    try {
      await onAddToCart?.(productId);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-slate-600">Explore more items you might love</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => {
          const isFavorite = favorites.has(product.id);
          const displayPrice = product.originalPrice || product.price;
          const hasDiscount = product.originalPrice && product.originalPrice > product.price;
          const discountPercent = hasDiscount
            ? Math.round(
                ((product.originalPrice! - product.price) / product.originalPrice!) * 100
              )
            : product.discount;

          return (
            <div
              key={product.id}
              className="group rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all bg-white overflow-hidden flex flex-col"
            >
              {/* Image Container */}
              <Link href={product.href || `/products/${product.id}`}>
                <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    {product.isNew && (
                      <Badge className="bg-blue-500 hover:bg-blue-600">New</Badge>
                    )}
                    {discountPercent && discountPercent > 0 && (
                      <Badge className="bg-red-500 hover:bg-red-600">
                        -{discountPercent}%
                      </Badge>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:shadow-lg"
                    aria-label="Add to favorites"
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${
                        isFavorite
                          ? 'fill-red-500 stroke-red-500'
                          : 'stroke-slate-400 hover:stroke-red-500'
                      }`}
                    />
                  </button>
                </div>
              </Link>

              {/* Content */}
              <div className="flex flex-col flex-1 p-4 space-y-3">
                <Link href={product.href || `/products/${product.id}`}>
                  <h4 className="font-medium text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors text-sm">
                    {product.name}
                  </h4>
                </Link>

                {/* Rating */}
                {product.rating !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < Math.round(product.rating!)
                              ? 'fill-amber-400 stroke-amber-400'
                              : 'stroke-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    {product.reviewCount !== undefined && (
                      <span className="text-xs text-slate-600">
                        ({product.reviewCount})
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-indigo-600">
                      ${product.price.toFixed(2)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-slate-400 line-through">
                        ${displayPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <Button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={loadingId === product.id || isLoading}
                  size="sm"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 mt-auto"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {loadingId === product.id ? 'Adding...' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
