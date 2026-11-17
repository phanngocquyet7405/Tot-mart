# Biên bản nghiệm thu Bước 4: Client Nhóm A – Khám phá

## 1. Snapshot môi trường
- **Nhánh:** `staging`
- **Commit gốc:** `0af6502`
- **Diff fingerprint (Client Discovery):** 74 files changed, 1200 insertions(+), 1845 deletions(-)
- **Node:** `v24.14.1`
- **npm:** `11.11.0`
- **Hệ điều hành:** Windows 11 (PowerShell)
- **Đường dẫn repo:** `C:\Users\84862\Desktop\WorkSpace\totmart\fe_totmart`

## 2. Kết quả Quality Gates

| Lệnh | Exit code | Chi tiết kết quả |
|---|:---:|---|
| `npm run lint` | **0** | ESLint hoàn thành sạch sẽ, 0 lỗi, 0 cảnh báo. |
| `npm test` | **0** | 205/205 tests pass, 0 fail, 0 skip (thời gian ~6.4s). |
| `$env:CI='true'; $env:ALLOW_SITEMAP_FALLBACK='true'; npm run build` | **0** | Next.js 16.4.3 Turbopack build thành công toàn bộ 63/63 routes tĩnh và động. |

## 3. Nội dung chuẩn hóa trong Bước 4 – Client Khám phá

1. **Ngôn ngữ thiết kế Storefront nhất quán:**
   - Nền ấm tự nhiên (`bg-background` kem be ấm), loại bỏ toàn bộ nền xám công nghiệp và gradient trang trí.
   - Nút chính màu đất nung terracotta (`bg-primary text-primary-foreground hover:bg-primary/90`), nút phụ viền be ấm (`border border-border bg-card/60 hover:bg-muted text-foreground`).
   - 100% sử dụng design tokens ngữ nghĩa (`text-foreground`, `text-muted-foreground`, `border-border`, `bg-card`, `bg-background`). Duy nhất ngoại lệ cho phép: `text-white` trên các overlay tối hoặc banner ảnh tương phản.
   - Loại bỏ toàn bộ lớp màu hardcode (`green-*`, `gray-*`, `stone-*`, `zinc-*`, mã hex `#C85C3C`, `#2C1810`).

2. **Kiểu chữ & Typography:**
   - `Playfair Display` (`font-serif`) chỉ sử dụng cho các tiêu đề biên tập, hero unboxing nổi bật của trang chủ.
   - Toàn bộ nội dung đọc, nút bấm, nhãn, bộ lọc, thẻ giá, thông số kỹ thuật dùng `Plus Jakarta Sans` (`font-sans`).
   - Mọi giá tiền hiển thị VND đều áp dụng `tabular-nums` để hàng số thẳng hàng và dễ đọc.

3. **Thẻ sản phẩm chuẩn hóa (Unified Product Card):**
   - Hợp nhất logic và giao diện hiển thị giữa `src/app/(client)/components/layout/product/product_card.js` và `src/components/components_client/components/layout/product/product_card.js`.
   - Giữ nguyên các prop tương thích ngược: `onAddToCart`, `onToggleWishlist`, `isWishlisted`, `salePercent`, `reviewCount`, `rating`.
   - Ảnh sản phẩm hiển thị chuẩn tỷ lệ, có placeholder dự phòng SVG an toàn.

4. **Trang chi tiết & Trải nghiệm Mua hàng trên Mobile:**
   - Trang chi tiết sản phẩm (`/products/[slug]`) và combo (`/products/box/[id]`): Bổ sung thanh đặt mua cố định đáy màn hình trên thiết bị di động (`fixed bottom-0 left-0 right-0 z-40 bg-card/95 border-t border-border shadow-lg p-3 md:hidden`) với thông tin giá và nút Mua ngay tiện lợi.
   - Bộ lọc danh mục và thương hiệu trên mobile: Tích hợp Drawer trượt mượt mà kèm nút bấm kích hoạt nổi bật $\ge 44$px (`SideBar.js`).
   - Đủ 5 trạng thái: Skeleton loading, Empty state với nút hành động CTA, Error state với nút "Thử lại", Disabled state khi hết hàng/đang xử lý, Success state.

5. **Chuyển động & Trợ năng (A11y):**
   - Tuân thủ mục 4 của `DESIGN.md`. Chuyển động tinh tế, micro-interactions dưới 200ms.
   - Tôn trọng thuộc tính `prefers-reduced-motion`: marquee và banner cuộn tự động dừng khi người dùng bật chế độ giảm chuyển động.

## 4. Danh sách các file thay đổi trong Bước 4

### A. Khung điều hướng & Shell Storefront
- `src/app/(client)/components/ui/AnnouncementBar.js`
- `src/app/(client)/components/ui/main_header.js`
- `src/app/(client)/components/ui/nav_menu.js`
- `src/app/(client)/components/ui/category_dropdown.js`
- `src/app/(client)/components/ui/drop_menu.js`
- `src/app/(client)/components/ui/search_bar.js`
- `src/app/(client)/components/ui/SideBar.js`
- `src/app/(client)/components/ui/LanguageSwitcher.jsx`
- `src/app/(client)/components/ui/footer.js`
- `src/app/(client)/components/layout/totmart_suppport.js`
- `src/components_box/announcement-bar.js`
- `src/components_box/nav_box.js`
- `src/components_box/intro-section.js`
- `src/components_box/product-showcase.js`
- `src/components/components_main/*` (chuẩn hóa re-export theo canonical)

### B. Trang chủ & Giới thiệu
- `src/app/page.js`
- `src/app/(client)/homepage/page.js`
- `src/app/(client)/components/hero_section_page/hero_section.js`
- `src/app/(client)/components/layout/product_section.js`
- `src/app/(client)/components/layout/home/product_categories_showcase.js`

### C. Thẻ sản phẩm & Danh sách sản phẩm
- `src/app/(client)/components/layout/product/product_card.js`
- `src/components/components_client/components/layout/product/product_card.js`
- `src/app/(client)/components/layout/product/products_grid.js`
- `src/app/(client)/components/layout/product/product_layout.js`
- `src/app/(client)/products/page.js`
- `src/app/(client)/products/ProductsPageClient.jsx`

### D. Chi tiết sản phẩm & Combo
- `src/app/(client)/components/Product/ProductPurchasePanel.js`
- `src/app/(client)/components/Product/ProductInfoTabs.js`
- `src/app/(client)/components/Product/FrequentlyBought.js`
- `src/app/(client)/components/Product/ProductLoadingState.js`
- `src/app/(client)/products/box/[id]/BoxDetailInteractive.jsx`
- `src/components/bulk-discounts.tsx`
- `src/components/frequently-bought.tsx`
- `src/components/gift-options.tsx`
- `src/components/product-details.tsx`
- `src/components/product-gallery.tsx`
- `src/components/suggested-products.tsx`
- `src/components/components_main/products/description_editor.jsx`
- `src/components/components_main/products/product_description.jsx`

### E. Catalogs (Box, Gift, Subscription) & Đăng ký
- `src/app/(client)/components/CommerceCatalog.jsx`
- `src/app/(client)/products/Subscriber/page.js`
- `src/app/(client)/components/Subsciber_components/ChoosePlanModal.js`
- `src/app/(client)/components/Subsciber_components/MonthlyThemes.js`
- `src/app/(client)/components/Subsciber_components/PlanCard.js`
- `src/app/(client)/components/Subsciber_components/PlanComparison.js`
- `src/app/(client)/components/Subsciber_components/TrustBadges.js`
- `src/components_box/ChoosePlan.js`

### F. Thương hiệu & Danh mục
- `src/app/(client)/brands/BrandsPageClient.jsx`
- `src/app/(client)/components/layout/brand/BrandBaseLayout.js`
- `src/app/(client)/components/layout/brand/BrandDetailHero.js`
- `src/app/(client)/components/layout/brand/brand_card.js`
- `src/app/(client)/components/layout/brand/brand_grid.js`
- `src/app/(client)/components/layout/brand/brand_sidebar.js`
- `src/app/(client)/categories/CategoriesPageClient.jsx`
- `src/app/(client)/categories/[id]/CategoryDetailClient.jsx`
- `src/app/(client)/components/layout/category/category_base_layout.js`
- `src/app/(client)/components/layout/category/category_card.js`
- `src/app/(client)/components/layout/category/category_sidebar.js`

## 5. Danh mục ảnh chụp thực tế (Lưu ngoài repo)
Toàn bộ ảnh chụp màn hình kiểm thử giao diện Desktop (1440px) và Mobile (390px) được lưu tại thư mục bên ngoài repo:
`C:\Users\Admin\.gemini\antigravity\brain\df0ba1f3-1fa1-461b-ae39-4c7216217560\screenshots\step4\`

| Tên màn hình | Đường dẫn route | Ảnh Desktop (1440px) | Ảnh Mobile (390px) |
|---|---|---|---|
| Trang chủ Box | `/` | `homepage-box-1440.png` | `homepage-box-390.png` |
| Trang chủ Store | `/homepage` | `homepage-store-1440.png` | `homepage-store-390.png` |
| Danh sách sản phẩm | `/products` | `products-list-1440.png` | `products-list-390.png` |
| Chi tiết sản phẩm | `/products/[slug]-[id]` | `product-detail-1440.png` | `product-detail-390.png` |
| Catalog Combo | `/products/box` & `/box` | `products-box-1440.png`, `box-catalog-1440.png` | `products-box-390.png`, `box-catalog-390.png` |
| Chi tiết Combo | `/products/box/[id]` | `box-detail-1440.png` | `box-detail-390.png` |
| Catalog Quà tặng | `/gift` | `gift-catalog-1440.png` | `gift-catalog-390.png` |
| Gói đăng ký | `/subscription` | `subscription-catalog-1440.png` | `subscription-catalog-390.png` |
| Sản phẩm thuê bao | `/products/Subscriber` | `products-subscriber-1440.png` | `products-subscriber-390.png` |
| Danh sách thương hiệu | `/brands` | `brands-list-1440.png` | `brands-list-390.png` |
| Chi tiết thương hiệu | `/brands/[slug]` | `brand-detail-1440.png` | `brand-detail-390.png` |
| Danh sách danh mục | `/categories` | `categories-list-1440.png` | `categories-list-390.png` |
| Chi tiết danh mục | `/categories/[id]` | `category-detail-1440.png` | `category-detail-390.png` |

## 6. Đánh giá rủi ro & Cách quay lui

- **Rủi ro:**
  - Một số trang chi tiết yêu cầu dữ liệu backend động (như API categories, brands). Trường hợp backend chưa khởi chạy, các khối dữ liệu đã có fallback giao diện rỗng (EmptyState) hoặc Skeleton loading chuẩn hóa, không gây vỡ giao diện hay chặn tiến trình SSR.
  - Bộ lọc Sidebar trên mobile khi mở dạng drawer cần đảm bảo không cuộn nền body (`overflow-hidden` khi drawer mở).
- **Cách quay lui:**
  - Nếu muốn quay lại commit trước Bước 4:
    ```bash
    git checkout origin/staging -- src/app/(client) src/components_box src/components/components_main src/components/components_client
    ```
