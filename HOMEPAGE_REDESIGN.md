# TotMart Homepage Redesign

## Overview
The homepage has been completely redesigned with a premium organic aesthetic matching the mockup design provided. The new design emphasizes:
- Clean, luxurious typography with serif headings
- Green and gold color scheme for organic branding
- Large hero section with alternating image-text layouts
- Product category showcase grid
- FAQ and newsletter subscription sections

## Changes Made

### 1. **Hero Section** (`hero_section.js`)
- Updated banner with new typography and layout
- Changed color scheme to match premium organic brand
- Added yellow accent label and serif italic subtitle
- Improved CTA buttons with "Shop Now" and "Learn More" variants
- Responsive full-width banner with overlay gradient

### 2. **Product Categories Showcase** (NEW - `product_categories_showcase.js`)
- New component displaying 4 featured product categories
- Circular image backgrounds with hover effects
- Product count display under each category
- Links to individual category pages
- Responsive grid layout (1-4 columns based on screen size)

### 3. **Product Section** (`product_section.js`)
- Enhanced styling with green color scheme
- Updated background colors for dark/light variants
- Improved responsive layout for image-text pairings
- Better CTA button styling and hover effects
- Maintains alternating left-right layout for visual interest

### 4. **Newsletter & FAQ** (`totmart_support.js`)
- FAQ section with accordion-style questions
- Green and gold color scheme throughout
- Enhanced newsletter signup section with gradient background
- Improved form styling with better visual hierarchy
- Yellow "Join" button for strong CTA

### 5. **Collection Layout** (`product_layout.js`)
- Updated with new color scheme (green, yellow accents)
- Added visual underline beneath section titles
- Improved typography hierarchy
- Better spacing and alignment
- "View All" links now styled with green and arrow icons

### 6. **TotMart Landing** (`totmart_landing.js`)
- Integrated new ProductCategoriesShowcase component
- Maintained all existing product sections
- Better component organization

## Color Palette
- **Primary Green**: `#1a5f3a` (forest green for premium feel)
- **Secondary Green**: `#166534` (darker shade)
- **Accent Yellow**: `#f59e0b` (golden yellow)
- **Text**: Gray-900 for dark content, white for inverse
- **Backgrounds**: White, gray-50, green-900 for sections

## Typography
- **Headings**: Serif font (font-serif) with font-bold
- **Body Text**: Sans-serif (default) for readability
- **Accent Text**: Uppercase, letter-spaced, small size for labels
- **Font Sizes**: 
  - Headings: 3xl-5xl (36-48px)
  - Subheadings: lg-2xl (18-24px)
  - Body: base-lg (16-18px)

## Components Integration
1. Hero Section → Main banner
2. ProductCategoriesShowcase → 4-category grid
3. ProductSection (x3) → Featured product sections
4. TotMartSupport → FAQ and Newsletter

## Responsive Design
- Mobile: Single column layouts, stacked elements
- Tablet: 2-column grids, side-by-side layouts
- Desktop: Full featured layouts with optimal spacing
- All images scale appropriately with CSS transforms

## Features Implemented
✓ Premium organic aesthetic
✓ Green and gold color scheme
✓ Alternating content layouts
✓ Category showcase grid
✓ FAQ accordion
✓ Newsletter subscription
✓ Smooth hover animations
✓ Responsive design
✓ Accessible button and form elements
