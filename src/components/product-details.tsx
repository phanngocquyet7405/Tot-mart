'use client';

import { ShoppingCart, Star, Check, Package, Truck, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ProductDetailsProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stock?: number;
  description?: string;
  sku?: string;
  category?: string;
  onAddToCart?: (quantity: number) => Promise<void> | void;
}

export function ProductDetails({
  id,
  name,
  price,
  originalPrice,
  discount = 0,
  rating,
  reviewCount,
  inStock,
  stock = 0,
  description,
  sku,
  category,
  onAddToCart,
}: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayPrice = originalPrice && originalPrice > price ? originalPrice : null;
  const effectiveDiscount = displayPrice
    ? Math.round(((displayPrice - price) / displayPrice) * 100)
    : discount;

  const handleQuantityChange = (newQuantity: number) => {
    const boundedQuantity = Math.max(1, Math.min(newQuantity, stock || 100));
    setQuantity(boundedQuantity);
  };

  const handleAddToCart = async () => {
    setError(null);
    setIsAdding(true);
    try {
      await onAddToCart?.(quantity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const ratingStars = Math.round(rating);

  return (
    <div className="space-y-6">
      {/* Product Header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            {category && (
              <p className="text-sm text-slate-500 mb-1">{category}</p>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {name}
            </h1>
          </div>
          {sku && (
            <p className="text-sm text-slate-500 shrink-0">SKU: {sku}</p>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < ratingStars
                    ? 'fill-amber-400 stroke-amber-400'
                    : 'stroke-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-slate-600">
            {rating.toFixed(1)} ({reviewCount.toLocaleString()} reviews)
          </span>
          {inStock && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Check className="h-3 w-3 mr-1" />
              In Stock
            </Badge>
          )}
        </div>
      </div>

      {/* Price Section */}
      <div className="space-y-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-4xl font-bold text-slate-900">
            ${price.toFixed(2)}
          </span>
          {displayPrice && displayPrice > price && (
            <>
              <span className="text-lg text-slate-400 line-through">
                ${displayPrice.toFixed(2)}
              </span>
              <Badge className="bg-red-100 text-red-700 border-red-200">
                {effectiveDiscount}% OFF
              </Badge>
            </>
          )}
        </div>
        {description && (
          <p className="text-sm text-slate-600">{description}</p>
        )}
      </div>

      {/* Quantity Selector */}
      <div className="space-y-3">
        <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700">
          Quantity
        </Label>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || !inStock}
            className="h-10 w-10 p-0"
          >
            −
          </Button>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={stock || 100}
            value={quantity}
            onChange={(e) => handleQuantityChange(Number(e.target.value))}
            disabled={!inStock}
            className="h-10 w-20 text-center font-semibold"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={quantity >= (stock || 100) || !inStock}
            className="h-10 w-10 p-0"
          >
            +
          </Button>
          {stock !== undefined && stock > 0 && stock < 5 && (
            <span className="text-xs text-amber-600 font-medium">
              Only {stock} left
            </span>
          )}
        </div>
      </div>

      {/* Add to Cart Button */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex gap-2">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button
        onClick={handleAddToCart}
        disabled={!inStock || isAdding}
        size="lg"
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 transition-colors disabled:opacity-50"
      >
        {isAdding ? (
          <>
            <span className="inline-block animate-spin">⏳</span>
            Adding...
          </>
        ) : (
          <>
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
          </>
        )}
      </Button>

      {!inStock && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
          This product is currently out of stock
        </div>
      )}

      {/* Trust Section */}
      <div className="space-y-3 border-t border-b py-4">
        <div className="flex gap-3">
          <Truck className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-slate-900">Free shipping over $100</p>
            <p className="text-slate-600">On orders $100 and above</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Package className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-slate-900">Satisfaction guaranteed</p>
            <p className="text-slate-600">30-day return policy</p>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-2 text-sm text-slate-600">
        <p className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span>Fast delivery within 2-3 business days</span>
        </p>
        <p className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span>Secure checkout with encrypted payment</span>
        </p>
        <p className="flex items-start gap-2">
          <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span>24/7 customer support available</span>
        </p>
      </div>
    </div>
  );
}
