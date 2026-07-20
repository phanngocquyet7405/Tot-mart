# Product & Admin Components Guide

## New Product Detail Components

All new components are located in `/src/components/` and follow professional design patterns with TypeScript support, proper error handling, and accessibility features.

### ProductGallery
**File**: `product-gallery.tsx`

A professional image gallery component with:
- Main image display with zoom effect
- Image thumbnails with selection
- Navigation arrows for large galleries
- Favorite/wishlist button
- Image counter and loading states
- Error handling for failed images
- Responsive lazy loading

**Usage**:
```tsx
<ProductGallery
  images={[
    { url: '/image1.jpg', alt: 'Product view 1' },
    { url: '/image2.jpg', alt: 'Product view 2' },
  ]}
  productName="Product Name"
  initialFavorite={false}
  onFavoriteChange={(isFavorite) => console.log(isFavorite)}
/>
```

### ProductDetails
**File**: `product-details.tsx`

Core product information display with:
- Product title and category
- Star ratings with review count
- Price display with discount calculation
- Stock status indicators
- Quantity selector with validation
- Add to cart functionality with loading states
- Error messaging
- Trust signals (shipping, returns, support)

**Usage**:
```tsx
<ProductDetails
  id="product-1"
  name="Premium Product"
  price={99.99}
  originalPrice={149.99}
  rating={4.5}
  reviewCount={128}
  inStock={true}
  stock={15}
  onAddToCart={async (quantity) => {
    await addToCartApi(productId, quantity);
  }}
/>
```

### BulkDiscounts
**File**: `bulk-discounts.tsx`

Volume pricing display with:
- Tiered discount display
- Current selection highlight
- Savings percentage calculation
- Interactive tier selection
- Price comparison
- Clean visual hierarchy

**Usage**:
```tsx
<BulkDiscounts
  discounts={[
    { minQuantity: 1, discountPercent: 0, price: 99.99 },
    { minQuantity: 5, discountPercent: 10, price: 89.99 },
    { minQuantity: 10, discountPercent: 15, price: 84.99 },
  ]}
  currentPrice={99.99}
  selectedQuantity={1}
  onSelectQuantity={(qty) => console.log(qty)}
/>
```

### GiftOptions
**File**: `gift-options.tsx`

Gift wrapping and message options with:
- Multiple gift wrapping tiers
- Price display for each option
- Gift message input (150 char limit)
- Include/exclude message toggle
- Professional pricing tiers
- Visual feedback

**Usage**:
```tsx
<GiftOptions
  options={[
    { id: 'standard', name: 'Standard', price: 2.99 },
    { id: 'premium', name: 'Premium', price: 5.99 },
  ]}
  selectedOptionId="standard"
  onSelect={(optionId, message) => console.log(optionId, message)}
/>
```

### FrequentlyBought
**File**: `frequently-bought.tsx`

"Frequently Bought Together" section with:
- Product grid (up to 3 items visible)
- Product images with lazy loading
- Rating and review count
- Quick add to cart buttons
- Purchase popularity badges
- View all link for more items

**Usage**:
```tsx
<FrequentlyBought
  products={[
    { id: '1', name: 'Item 1', image: '/img1.jpg', price: 29.99, rating: 4.5, reviewCount: 42 },
    { id: '2', name: 'Item 2', image: '/img2.jpg', price: 39.99, rating: 4.8, reviewCount: 128 },
  ]}
  onAddToCart={async (productId) => {
    await addToCart(productId);
  }}
/>
```

### SuggestedProducts
**File**: `suggested-products.tsx`

"You Might Also Like" section with:
- Responsive grid layout (1-4 columns)
- Product cards with images
- Ratings and reviews
- Price with discount display
- "New" and discount badges
- Favorite/wishlist functionality
- Add to cart buttons with loading states
- Click-through to product page

**Usage**:
```tsx
<SuggestedProducts
  products={[
    {
      id: '1',
      name: 'Related Product 1',
      image: '/img1.jpg',
      price: 49.99,
      originalPrice: 69.99,
      rating: 4.6,
      reviewCount: 95,
      isNew: true,
      href: '/products/1',
    },
  ]}
  title="You Might Also Like"
  onAddToCart={async (productId) => {
    await addToCart(productId);
  }}
/>
```

## Admin-Box Improvements

### BoxFormDialog Enhancements
**File**: `/src/app/(admin)/components/box/BoxFormDialog.jsx`

Fixed and improved:
- ✅ **Blob URL Cleanup**: Proper cleanup on unmount prevents memory leaks
- ✅ **ProductPicker UI**: Enhanced styling with better search experience
  - Improved input focus states
  - Better visual hierarchy
  - Loading states
  - Smoother animations
- ✅ **ProductRow Styling**: Professional card design with hover effects
  - Better spacing and typography
  - Improved quantity selector
  - More prominent change product button
- ✅ **Error Display**: Clear error messages with visual emphasis
- ✅ **Validation Feedback**: Better error visibility and placement

### BoxTable Improvements
**File**: `/src/app/(admin)/components/box/BoxTable.jsx`

Fixed and improved:
- ✅ **Column Width Classes**: Replaced invalid Tailwind classes with standard ones
  - `w-18` → `w-16`
  - `min-w-22.5` → `min-w-40`
  - `w-22.5` → `w-24`
  - `w-27.5` → `w-32`
  - `w-45` → `w-44`
  - `w-15` → `w-16`
- ✅ **Table Responsiveness**: Better mobile experience
- ✅ **Image Handling**: Proper fallback and loading states
- ✅ **Visual Status**: Expired boxes clearly indicated
- ✅ **Data Presentation**: Better typography and spacing

## Design System

### Color Palette
- **Primary**: Indigo (indigo-600) - Main actions and highlights
- **Neutral**: Slate gray (slate-900, slate-600, slate-200) - Text and backgrounds
- **Status**: Green (success), Red (error), Amber (warning)
- **Secondary**: Pink - Gift options, Blue - New items

### Typography
- **Headings**: Bold, semantic hierarchy (h1 > h2 > h3)
- **Body**: Regular weight, 1.5-1.6 line height
- **Secondary**: slate-600 for descriptions

### Spacing
- Consistent 4px/8px/16px/24px grid
- Flexbox for layouts (primary method)
- Proper whitespace for readability

### Components Used
- shadcn/ui buttons, inputs, labels, badges, dialogs, tables
- Lucide icons for consistent iconography
- Next.js Image for optimized image loading

## Accessibility Features

All components include:
- ✅ Semantic HTML elements
- ✅ ARIA labels and roles
- ✅ Keyboard navigation support
- ✅ Focus states and indicators
- ✅ Color contrast compliance
- ✅ Screen reader friendly text alternatives

## Integration Notes

1. **Admin-Box Folder**: All fixes are backward compatible
2. **Product Components**: Self-contained and ready for immediate use
3. **Styling**: Uses Tailwind CSS v4 (or v3 compatible)
4. **Dependencies**: All components use existing project dependencies

## Testing Checklist

- [ ] Admin-box form submission works without errors
- [ ] Images upload and display correctly
- [ ] Product picker selection works smoothly
- [ ] Table displays all data without overflow
- [ ] Product detail page loads all components
- [ ] Cart operations complete successfully
- [ ] Responsive design works on mobile
- [ ] Keyboard navigation functions properly
- [ ] Error states display correctly

## File Locations

```
/src/components/
├── product-gallery.tsx         ✅ Created
├── product-details.tsx         ✅ Created
├── bulk-discounts.tsx          ✅ Created
├── gift-options.tsx            ✅ Created
├── frequently-bought.tsx       ✅ Created
├── suggested-products.tsx      ✅ Created
└── ui/                         (existing shadcn/ui components)

/src/app/(admin)/components/box/
├── BoxFormDialog.jsx           ✅ Fixed
├── BoxTable.jsx                ✅ Fixed
└── createbox/                  (all components reviewed)
```

## Performance Optimizations

- **Image Lazy Loading**: Images load on demand with Next.js Image
- **Responsive Images**: Proper `sizes` attribute for different viewports
- **Error Boundaries**: Graceful handling of image/data loading failures
- **Memory Management**: Proper cleanup of object URLs
- **Component Splitting**: Optimal re-render performance with isolated state

## Next Steps

1. Test all components in development environment
2. Connect product detail page to real API data
3. Add analytics tracking for user interactions
4. Consider adding product review/comment functionality
5. Implement wishlist/favorite persistence
