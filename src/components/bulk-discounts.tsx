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
    <div className="space-y-4 p-5 rounded-lg bg-card border border-border">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
          <TrendingDown className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Buy More, Save More</h3>
          <p className="text-xs text-muted-foreground">Volume discounts available</p>
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
                  ? 'bg-card border-primary shadow-sm'
                  : 'bg-card/50 border-transparent hover:bg-card hover:border-border'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">
                      {quantityRange}
                    </span>
                    {isActive && (
                      <Badge className="bg-primary/10 text-primary border-border text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-primary">
                      ${discount.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      ${currentPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-semibold text-success-text">
                      Save {savings}%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant="secondary"
                    className="bg-destructive/15 text-destructive-text border-destructive/30"
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
      <div className="flex gap-2 p-2.5 rounded bg-card/50 border border-border">
        <Info className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-foreground/80">
          Discounts are automatically applied when you add items to cart
        </p>
      </div>
    </div>
  );
}
