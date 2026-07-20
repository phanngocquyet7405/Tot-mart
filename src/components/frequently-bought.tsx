'use client';

import Image from 'next/image';
import { ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  purchaseCount?: number;
}

interface FrequentlyBoughtProps {
  products: Product[];
  onAddToCart?: (productId: string) => Promise<void> | void;
  isLoading?: boolean;
}

export function FrequentlyBought({
  products = [],
  onAddToCart,
  isLoading = false,
}: FrequentlyBoughtProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!products || products.length === 0) {
    return null;
  }

  const displayProducts = products.slice(0, 3);

  const handleAddToCart = async (productId: string) => {
    setLoadingId(productId);
    try {
      await onAddToCart?.(productId);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          Frequently Bought Together
        </h3>
        <p className="text-sm text-slate-600">Customers often purchase these items with this product</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayProducts.map((product) => (
          <div
            key={product.id}
            className="group p-4 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all bg-white"
          >
            {/* Image */}
            <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-slate-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {product.purchaseCount && product.purchaseCount > 100 && (
                <Badge className="absolute top-2 right-2 bg-orange-500">
                  Popular
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 line-clamp-2 text-sm">
                {product.name}
              </h4>

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
                  <span className="text-xs text-slate-600">
                    ({product.reviewCount || 0})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-indigo-600">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={() => handleAddToCart(product.id)}
                disabled={loadingId === product.id || isLoading}
                size="sm"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
              >
                <ShoppingCart className="h-4 w-4" />
                {loadingId === product.id ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {products.length > 3 && (
        <Button
          variant="outline"
          className="w-full border-indigo-200 hover:bg-indigo-50"
        >
          View All {products.length} Recommendations
        </Button>
      )}
    </div>
  );
}
