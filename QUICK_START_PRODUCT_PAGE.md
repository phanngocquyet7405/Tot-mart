# Quick Start: Product Detail Page

## Complete Product Page Example

Here's how to build a complete product detail page using all the new components:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { ProductGallery } from '@/components/product-gallery';
import { ProductDetails } from '@/components/product-details';
import { BulkDiscounts } from '@/components/bulk-discounts';
import { GiftOptions } from '@/components/gift-options';
import { FrequentlyBought } from '@/components/frequently-bought';
import { SuggestedProducts } from '@/components/suggested-products';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  price: number;
  originalPrice: number;
  stock: number;
  rating: number;
  reviewCount: number;
  images: Array<{ url: string; alt: string }>;
  bulkDiscounts: Array<{
    minQuantity: number;
    maxQuantity?: number;
    discountPercent: number;
    price: number;
  }>;
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedGiftOption, setSelectedGiftOption] = useState<string | null>(null);
  const [giftMessage, setGiftMessage] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  // Fetch related products
  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      try {
        const res = await fetch(`/api/products/${product.id}/related`);
        const data = await res.json();
        setRelatedProducts(data.suggested || []);
        setFrequentlyBought(data.frequently_bought || []);
      } catch (error) {
        console.error('Failed to fetch related products:', error);
      }
    };

    fetchRelated();
  }, [product?.id]);

  const handleAddToCart = async (quantity: number) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product!.id,
          quantity,
          giftOption: selectedGiftOption,
          giftMessage: selectedGiftOption ? giftMessage : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to add to cart');
      
      // Show success message
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
      throw error;
    }
  };

  const handleAddRelatedToCart = async (productId: string) => {
    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (!response.ok) throw new Error('Failed to add to cart');
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-slate-600">Product not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Product Section */}
      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div>
            <ProductGallery
              images={product.images}
              productName={product.name}
              initialFavorite={isFavorite}
              onFavoriteChange={setIsFavorite}
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <ProductDetails
              id={product.id}
              name={product.name}
              price={product.price}
              originalPrice={product.originalPrice}
              rating={product.rating}
              reviewCount={product.reviewCount}
              inStock={product.stock > 0}
              stock={product.stock}
              description={product.description}
              sku={product.sku}
              category={product.category}
              onAddToCart={handleAddToCart}
            />

            {/* Bulk Discounts */}
            {product.bulkDiscounts.length > 0 && (
              <BulkDiscounts
                discounts={product.bulkDiscounts}
                currentPrice={product.price}
                selectedQuantity={selectedQuantity}
                onSelectQuantity={setSelectedQuantity}
              />
            )}

            {/* Gift Options */}
            <GiftOptions
              selectedOptionId={selectedGiftOption}
              selectedMessage={giftMessage}
              onSelect={(optionId, message) => {
                setSelectedGiftOption(optionId);
                setGiftMessage(message || '');
              }}
            />
          </div>
        </div>
      </section>

      {/* Frequently Bought Section */}
      {frequentlyBought.length > 0 && (
        <section className="bg-slate-50 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <FrequentlyBought
              products={frequentlyBought}
              onAddToCart={handleAddRelatedToCart}
            />
          </div>
        </section>
      )}

      {/* Suggested Products Section */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <SuggestedProducts
            products={relatedProducts}
            onAddToCart={handleAddRelatedToCart}
          />
        </section>
      )}

      {/* Product Details Tabs */}
      <section className="bg-slate-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Product Details</h2>
            {/* Add tabs or accordion for: Description, Specifications, Reviews, etc. */}
          </div>
        </div>
      </section>
    </main>
  );
}
```

## Individual Component Examples

### ProductGallery Only
```tsx
import { ProductGallery } from '@/components/product-gallery';

export function ProductImageSection() {
  return (
    <ProductGallery
      images={[
        { url: '/products/img1.jpg', alt: 'Front view' },
        { url: '/products/img2.jpg', alt: 'Side view' },
        { url: '/products/img3.jpg', alt: 'Detail view' },
      ]}
      productName="Amazing Product"
    />
  );
}
```

### ProductDetails Only
```tsx
import { ProductDetails } from '@/components/product-details';

export function ProductInfoSection() {
  return (
    <ProductDetails
      id="prod-123"
      name="Premium Wireless Headphones"
      price={99.99}
      originalPrice={149.99}
      rating={4.5}
      reviewCount={128}
      inStock={true}
      stock={15}
      category="Electronics"
      sku="WH-1000-XM4"
      onAddToCart={async (quantity) => {
        await fetch('/api/cart/add', {
          method: 'POST',
          body: JSON.stringify({ productId: 'prod-123', quantity }),
        });
      }}
    />
  );
}
```

### BulkDiscounts Only
```tsx
import { BulkDiscounts } from '@/components/bulk-discounts';

export function PricingSection() {
  const tiers = [
    { minQuantity: 1, discountPercent: 0, price: 99.99 },
    { minQuantity: 5, discountPercent: 10, price: 89.99 },
    { minQuantity: 10, discountPercent: 15, price: 84.99 },
    { minQuantity: 20, discountPercent: 20, price: 79.99 },
  ];

  return (
    <BulkDiscounts
      discounts={tiers}
      currentPrice={99.99}
      selectedQuantity={1}
    />
  );
}
```

### FrequentlyBought Only
```tsx
import { FrequentlyBought } from '@/components/frequently-bought';

export function ComplementaryProducts() {
  return (
    <FrequentlyBought
      products={[
        {
          id: '1',
          name: 'Protective Case',
          image: '/products/case.jpg',
          price: 19.99,
          rating: 4.8,
          reviewCount: 342,
          purchaseCount: 1523,
        },
        // ... more products
      ]}
      onAddToCart={async (productId) => {
        await addProductToCart(productId);
      }}
    />
  );
}
```

### SuggestedProducts Only
```tsx
import { SuggestedProducts } from '@/components/suggested-products';

export function RecommendedSection() {
  return (
    <SuggestedProducts
      title="You Might Also Like"
      products={[
        {
          id: '1',
          name: 'Similar Product',
          image: '/products/similar1.jpg',
          price: 89.99,
          originalPrice: 129.99,
          rating: 4.6,
          reviewCount: 95,
          isNew: true,
        },
        // ... more products
      ]}
      onAddToCart={async (productId) => {
        await addProductToCart(productId);
      }}
    />
  );
}
```

## API Integration Examples

### Fetch Product Data
```typescript
// GET /api/products/[id]
async function fetchProduct(productId: string) {
  const res = await fetch(`/api/products/${productId}`);
  return res.json();
  // Expected response:
  // {
  //   id: string
  //   name: string
  //   description: string
  //   price: number
  //   originalPrice: number
  //   rating: number
  //   reviewCount: number
  //   stock: number
  //   images: [{ url: string, alt: string }]
  //   bulkDiscounts: [...]
  //   category: string
  //   sku: string
  // }
}
```

### Add to Cart
```typescript
// POST /api/cart/add
async function addToCart(productId: string, quantity: number, options?: {
  giftOption?: string;
  giftMessage?: string;
}) {
  const res = await fetch('/api/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId,
      quantity,
      ...options,
    }),
  });
  return res.json();
}
```

### Fetch Related Products
```typescript
// GET /api/products/[id]/related
async function fetchRelatedProducts(productId: string) {
  const res = await fetch(`/api/products/${productId}/related`);
  return res.json();
  // Expected response:
  // {
  //   frequently_bought: [...],
  //   suggested: [...],
  // }
}
```

## Styling Customization

All components use Tailwind CSS and can be customized through your Tailwind config:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#4f46e5', // Indigo
        secondary: '#64748b', // Slate
      },
    },
  },
};
```

## Environment Variables

No additional environment variables are required. Components are fully self-contained and use your existing API endpoints.

## Troubleshooting

### Images Not Loading
- Ensure image URLs are accessible
- Check CORS policies
- Verify Next.js Image configuration

### Add to Cart Not Working
- Check API endpoint is correct
- Verify authentication if required
- Check browser console for errors

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check for CSS conflicts in global styles
- Verify shadcn/ui components are installed

## Next Steps

1. ✅ Copy the example code above
2. ✅ Update API endpoints for your backend
3. ✅ Connect real product data
4. ✅ Style according to your brand
5. ✅ Deploy and test

For detailed component documentation, see `COMPONENTS_GUIDE.md`.
