# BIÊN BẢN CHẤT LƯỢNG: F14 - TỔNG HỢP NÂNG CẤP CHECKOUT & REDESIGN BOUTIQUE

## 1. Snapshot Môi Trường & Mã Nguồn
- **Nhánh Git**: `redesign/cream`
- **Commit HEAD**: `c94fb2d` (`fix(product): fix broken product detail layout and align with artisan boutique aesthetic`)
- **Node.js**: `v24.14.1`
- **npm**: `11.11.0`
- **OS**: Windows (PowerShell)
- **Design Tokens**: Cream / Terracotta (`oklch`)
- **Phạm vi sửa đổi**: Frontend Only (`fe_totmart`), Backend API Read-only

---

## 2. Lệnh Kiểm Tra & Exit Code Riêng Biệt

| Lệnh Kiểm Tra | Exit Code | Kết Quả | Ghi Chú |
|:---|:---:|:---:|:---|
| `npm run lint` | **0** | **PASS** | Không có warning hay error ESLint (đã sửa Rules-of-Hooks). |
| `npm test` | **0** | **PASS** | 205/205 tests pass 100% (bao gồm 13 tests thanh toán VietQR & SePay). |
| `$env:CI="true"; $env:ALLOW_SITEMAP_FALLBACK="true"; npm run build` | **0** | **PASS** | Toàn bộ 63 routes Next.js compile và static generation thành công. |

---

## 3. Nội Dung Thực Hiện Theo Từng Bước

### Bước 0 – Khảo Sát Hiện Trạng
- Khảo sát `/checkout`, `CartDrawer`, hệ thống 2 header song song, hero carousel, `/brands`, `/profile`.
- Báo cáo rõ nguyên nhân của từng lỗi kỹ thuật và giao diện.

### Bước 1 – Hiện Đại Hoá Luồng Checkout
- Tích hợp chuẩn contract mới từ BE (`/api/checkout/sessions` cho QR SePay và `/api/checkout/check-out` cho COD).
- Màn QR có bộ đếm ngược thời gian thực (`CountdownTimer`), nút "Đổi phương thức thanh toán" (gọi huỷ session trả về chọn COD/QR), nút "Tạo lại mã QR" khi hết hạn, nút "Tôi đã chuyển khoản, kiểm tra lại", chặn double-click.
- Xoá hoàn toàn khối debug "Kiểm tra yêu cầu đặt hàng trước", thay bằng thông báo thay đổi giá/kho rõ ràng và thân thiện.
- Lưu trữ và khôi phục an toàn session pending trong `sessionStorage` khi người dùng F5 hoặc back trình duyệt.

### Bước 2 – Thống Nhất Header Chuẩn "TotMart Craft & Gift"
- Dọn dẹp hoàn toàn thanh điều hướng 2 hàng cũ và xoá các mục TEST1/TEST2.
- `src/components_box/nav_box.js` kết nối `AppContext` để hiển thị đúng Role (`Quản trị viên` / `Tài khoản`) và Tên khách hàng kèm Dropdown quản lý tài khoản.
- Re-export qua `main_header.js` và làm rỗng `nav_menu.js` để bảo đảm tương thích toàn bộ hệ thống trang client.
- Bổ sung khoảng đệm `HEADER_H` (100px) cho các trang client.

### Bước 3 – Khắc Phục Lỗi Chồng Lấn Cart Drawer
- Drawer và panel *"Có thể bạn sẽ thích"* phủ trọn vẹn từ `top: 0` (`h-[100dvh]`) với `z-index: 80`, cao hơn header.
- Overlay phủ toàn màn hình (`z-index: 70`), bấm ngoài đóng drawer.
- Bổ sung sự kiện đóng bằng phím `Escape`.
- Khoá cuộn trang nền (`document.body.style.overflow = "hidden"`) khi mở và khôi phục khi đóng.
- Tối ưu cho mobile với safe-area insets (`env(safe-area-inset-top)` và `env(safe-area-inset-bottom)`).

### Bước 4 – Hero Homepage Mượt Mà & Tiếp Cận
- Giải quyết triệt để lỗi chữ các slide bị chồng nhau bằng `<AnimatePresence mode="wait">` (slide cũ biến mất hoàn toàn trước khi slide mới xuất hiện).
- Ẩn hoàn toàn các slide background inactive (`opacity-0 pointer-events-none z-0`).
- Tăng cường độ tương phản với gradient đa tầng (`from-black/85 via-black/50 to-black/35`), không tràn chữ lên ảnh.
- Hỗ trợ đầy đủ `prefers-reduced-motion` qua `useReducedMotion()`.

### Bước 5 – Sửa /brands và /profile
- `/brands`: Thay `text-white` bằng `text-foreground` trên nền kem `bg-card` để tiêu đề "Gian hàng đối tác" hiển thị sắc nét.
- Quét toàn bộ dự án loại bỏ các vị trí dùng chữ trắng trên nền sáng.
- `/profile`: Định dạng lại `TabsList` sang responsive `grid grid-cols-1 sm:grid-cols-3` với `min-h-11`, chữ căn giữa, pill active nằm gọn gàng bên trong khung viền bo tròn, không tràn mép trên mobile 375px.

### Bước 6 – Nhất Quán Giao Diện Admin
- Việt hoá hoàn toàn các chuỗi: "Management" $\rightarrow$ "Quản trị", "Gift" $\rightarrow$ "Gói quà", "Doanh thu active" $\rightarrow$ "Doanh thu hiệu lực".
- Trang `/admin-gifts`: Việt hoá tiêu đề, nút tạo, badge và dialog.
- Mẫu gói đăng ký (`PlanTable.jsx`): Bỏ thuộc tính `opacity-0` làm trống cột thao tác; bổ sung các nút thao tác trực tiếp (Ẩn/Hiện, Chỉnh sửa, Menu thêm); kết nối API `updateTemplateApi` đổi trạng thái `isActive`.

### Sửa Giao Diện Trang Chi Tiết Sản Phẩm (`/products/[slug]`)
- **Nguyên nhân vỡ**: Thiếu `lg:col-span-5` trên `ProductPurchasePanel` trong lưới 12 cột, khiến panel mua hàng bị ép co cụm vào 1/12 màn hình.
- **Khắc phục theo chuẩn Bokksu Boutique**:
  - Tỉ lệ phân chia 7/5 chuẩn: Gallery (7 cột) + Purchase Panel (5 cột).
  - Thêm class `tm-commerce--atelier` vào container để áp dụng font serif Playfair Display sang trọng.
  - Hiển thị badge nghệ nhân/nhà sản xuất (Brand), đánh giá sao kèm số lượng review.
  - Chuẩn hoá trích xuất ảnh sản phẩm (hỗ trợ cả mảng chuỗi url lẫn mảng object `{ url }`), tránh hiển thị ảnh placeholder.
  - Khôi phục phần sản phẩm gợi ý mua kèm (`FrequentlyBought`) với dữ liệu `relatedProducts`.

---

## 4. Các File Đã Thay Đổi

1. `src/app/(admin)/admin-gifts/page.jsx`
2. `src/app/(admin)/admin-subscribe-plan/page.js`
3. `src/app/(admin)/admin-subscribe-plan/registered/page.js`
4. `src/app/(admin)/components/SubscribePlans/PlanTemplate/PlanStats.jsx`
5. `src/app/(admin)/components/SubscribePlans/PlanTemplate/PlanTable.jsx`
6. `src/app/(admin)/components/adminNavigation.mjs`
7. `src/app/(admin)/layout.js`
8. `src/app/(client)/brands/BrandsPageClient.jsx`
9. `src/app/(client)/cart/page.js`
10. `src/app/(client)/categories/[id]/CategoryDetailClient.jsx`
11. `src/app/(client)/components/Cart_component/cart_drawer.js`
12. `src/app/(client)/components/Product/ProductGallery.js`
13. `src/app/(client)/components/Product/ProductPurchasePanel.js`
14. `src/app/(client)/components/hero_section_page/hero_section.js`
15. `src/app/(client)/components/profile/ProfileTabs.jsx`
16. `src/app/(client)/components/ui/AnnouncementBar.js`
17. `src/app/(client)/components/ui/main_header.js`
18. `src/app/(client)/components/ui/nav_menu.js`
19. `src/app/(client)/homepage/HomePageClient.jsx`
20. `src/app/(client)/products/ProductsPageClient.jsx`
21. `src/app/(client)/products/[slug]/ProductDetailInteractive.jsx`
22. `src/app/(client)/products/[slug]/page.js`
23. `src/app/(client)/products/box/[id]/page.js`
24. `src/app/(client)/wishlist/page.js`
25. `src/components_box/hero-sections.js`
26. `src/components_box/nav_box.js`
27. `src/components_box/product-showcase.js`
28. `src/messages/en.json`
29. `src/messages/vi.json`

---

## 5. Rủi Ro & Kế Hoạch Quay Lui (Rollback)
- **Rủi ro**: Nếu Backend local chưa khởi chạy, các tính năng fetch SSR sitemap sẽ fallback về cache an toàn.
- **Rollback**: Có thể quay lại commit trước chuỗi chỉnh sửa bằng `git reset --hard 61f3495` mà không ảnh hưởng tới dữ liệu Backend hay cơ sở dữ liệu.
