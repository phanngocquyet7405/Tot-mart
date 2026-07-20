'use client';

import { TrendingDown, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BulkDiscount {
  minQuantity: number;
  maxQuantity?: number;
  discountPercent: number;
  price: number;
}

interface BulkDiscountsProps {
  discounts: BulkDiscount[];
  currentPrice: number;
  selectedQuantity: number;
  onSelectQuantity?: (quantity: number) => void;
}

export function BulkDiscounts({
  discounts = [],
  currentPrice,
  selectedQuantity = 1,
  onSelectQuantity,
}: BulkDiscountsProps) {
  if (!discounts || discounts.length === 0) {
    return null;
  }

  const sortedDiscounts = [...discounts].sort((a, b) => a.minQuantity - b.minQuantity);

  const getCurrentDiscount = (quantity: number) => {
    return sortedDiscounts.find((d) => {
      const aboveMin = quantity >= d.minQuantity;
      const belowMax = !d.maxQuantity || quantity <= d.maxQuantity;
      return aboveMin && belowMax;
    });
  };

  const currentDiscount = getCurrentDiscount(selectedQuantity);

  return (
    <div className="space-y-4 p-5 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
          <TrendingDown className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Buy More, Save More</h3>
          <p className="text-xs text-slate-600">Volume discounts available</p>
        </div>
      </div>

      {/* Discounts Grid */}
      <div className="space-y-2">
        {sortedDiscounts.map((discount, idx) => {
          const isActive = getCurrentDiscount(selectedQuantity) === discount;
          const savings = ((currentPrice - discount.price) / currentPrice * 100).toFixed(0);
          const quantityRange = discount.maxQuantity
            ? `${discount.minQuantity} - ${discount.maxQuantity}`
            : `${discount.minQuantity}+`;

          return (
            <button
              key={idx}
              onClick={() => onSelectQuantity?.(discount.minQuantity)}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                isActive
                  ? 'bg-white border-indigo-600 shadow-sm'
                  : 'bg-white/50 border-transparent hover:bg-white hover:border-indigo-200'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-900">
                      {quantityRange}
                    </span>
                    {isActive && (
                      <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-indigo-600">
                      ${discount.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 line-through">
                      ${currentPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-semibold text-green-600">
                      Save {savings}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="secondary"
                    className="bg-red-100 text-red-700 border-red-200"
                  >
                    -{discount.discountPercent}%
                  </Badge>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info Message */}
      <div className="flex gap-2 p-2.5 rounded bg-white/50 border border-indigo-100">
        <Info className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-700">
          Discounts are automatically applied when you add items to cart
        </p>
      </div>
    </div>
  );
}
