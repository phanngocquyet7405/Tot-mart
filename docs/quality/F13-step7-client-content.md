# Biên bản kiểm tra chất lượng: Bước 7 – Client nhóm D (Nội dung & Hoàn thiện Storefront)

## 1. Snapshot môi trường & Git
- **Nhánh hiện tại**: `redesign/cream`
- **Commit HEAD**: `b02c62620e44b55429fd0cf45f1c0ac9be24785e`
- **Thống kê Git diff**: `29 files changed, 672 insertions(+), 878 deletions(-)` (theo `git diff --stat`)
- **Node.js**: `v24.14.1` (xác nhận bằng `node -v`)
- **npm**: `11.11.0` (xác nhận bằng `npm -v`)
- **OS**: Windows 11 (PowerShell)

---

## 2. Kết quả kiểm tra lệnh (Exit Code riêng từng lệnh)

| Lệnh kiểm tra | Exit Code | Kết quả | Ghi chú |
| :--- | :---: | :---: | :--- |
| `npm run lint` | **0** | PASS | 0 warning, 0 error |
| `npm test` | **0** | PASS | 205/205 tests pass (0 fail, 0 skipped, 0 cancelled) |
| `npm run build` (`$env:CI='true'; $env:ALLOW_SITEMAP_FALLBACK='true'`) | **0** | PASS | Compiled trong 7.0s, static export 63/63 routes thành công |
| `test:e2e` | **N/A** | SKIPPED | Không chạy test e2e do không có backend cục bộ (theo quy định) |

---

## 3. Chi tiết thực hiện Bước 7

### A) Phạm vi các trang nội dung (`src/app/(client)/pages/`)
1. **`pages/about/page.js`**:
   - Loại bỏ toàn bộ mã màu cứng (`bg-[#f5f0e8]`, `text-stone-*`, `bg-amber-*`, `text-amber-*`).
   - Sử dụng thẻ ngữ nghĩa và token chuẩn: `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-primary-foreground`.
   - Giữ nguyên 100% nội dung gốc của `VALUES` và CTA (không bịa số liệu, năm thành lập hay số lượng maker).
2. **`pages/contact-us/page.js`**:
   - Gắn nhãn form chặt chẽ: `label` liên kết trực tiếp với `id` của input qua `htmlFor={id}`.
   - Nhãn viết hoa chữ cái đầu theo chuẩn tiếng Việt (`text-sm font-medium text-foreground`), bỏ toàn bộ `uppercase tracking-wider`.
   - Lỗi hiển thị ngay tại trường qua `text-xs text-destructive-text` và liên kết trợ năng bằng `aria-describedby` và `aria-invalid`.
   - Vùng chạm mọi trường input/select/textarea và nút bấm đạt chuẩn $\ge 44$px (`min-h-11`).
   - Trạng thái gửi thành công dùng `bg-success/15` và `text-success-text`.
3. **`pages/faq/page.js` & `pages/faq/FaqPageClient.jsx`**:
   - `FaqPageClient.jsx`: File có sẵn từ commit `8d5c6da` (không phải file mới tạo).
   - `pages/faq/page.js`: Đảm bảo là Server Component giữ metadata (`title`, `description`), KHÔNG chứa directive `'use client'`, import và render `<FaqPageClient />`.
   - `pages/faq/FaqPageClient.jsx`: Khai báo `'use client'`, đảm nhiệm toàn bộ tương tác giao diện client (tìm kiếm, mở/đóng accordion, scroll tới danh mục).
   - Văn bản nội dung giới hạn độ rộng dòng chuẩn đọc (~65ch: `max-w-[65ch]`).
   - Khối câu hỏi Accordion đáp ứng chuẩn trợ năng: nút có `id`, `aria-expanded`, `aria-controls`, vùng hiển thị có `role="region"` và `aria-labelledby`.
   - Đủ 5 trạng thái: Sẵn sàng (danh sách danh mục), Rỗng (khi tìm kiếm không có kết quả kèm nút Xóa bộ lọc), Thao tác đóng/mở mượt mà, Thẻ danh mục điều hướng trượt đến vị trí tương ứng (`scroll-mt-28`).
   - Khôi phục 100% chữ gốc từ HEAD: mô tả đầu trang, bộ câu hỏi FAQS, thông báo rỗng "Không tìm thấy câu hỏi phù hợp." và khối "Vẫn chưa tìm được câu trả lời? Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ." liên hệ.
4. **`pages/information/page.js`**:
   - Giữ nguyên toàn bộ 5 chính sách gốc (`shipping`, `return`, `privacy`, `terms`, `authenticity`) cùng toàn bộ nội dung văn bản gốc.
   - Độ rộng dòng nội dung ~65ch (`max-w-[65ch]`).
   - Accordion có trợ năng chuẩn (`aria-expanded`, `aria-controls`, `role="region"`), touch target $\ge 44$px.
   - Hộp chứng nhận tiêu chuẩn được chuẩn hóa bằng token (`bg-card`, `border-border`, `text-foreground`).
5. **`pages/news/page.js`**:
   - Giữ nguyên toàn bộ 6 bài viết trong `POSTS` và các danh mục `CATEGORIES_BLOG`.
   - Đoạn trích dẫn bài viết có độ rộng dòng tối đa ~65ch (`max-w-[65ch]`).
   - Bộ lọc danh mục và thanh tìm kiếm có nút Xóa khi có query. Trạng thái rỗng hiển thị rõ ràng khi không có bài viết khớp tìm kiếm.
6. **`pages/offers-discounts-coupons/page.js`**:
   - Nâng cấp giao diện từ thẻ đơn sơ lên card thiết kế tinh tế với token cream & terracotta (`bg-card`, `border-border`, `bg-primary text-primary-foreground`).
   - Giữ nguyên toàn bộ nội dung và nút điều hướng tới `/products`.
7. **`pages/our-makers/page.js`**:
   - Chuẩn hóa token thiết kế đồng bộ với storefront, loại bỏ toàn bộ `bg-[#f5f0e8]`, `text-stone-*`, `bg-amber-*`.
   - Không bịa thông tin đối tác hay số liệu mới; bảo toàn cấu trúc hiện có.
8. **`src/app/not-found.jsx` (Trang 404)**:
   - Loại bỏ `text-gray-900`, `text-gray-700`, `bg-green-700`, `hover:bg-green-800`.
   - Thay thế bằng giao diện trang nhã: Icon `PackageOpen`, tiêu đề font serif, badge mã lỗi `404`, nút bấm token `bg-primary text-primary-foreground` và nút phụ `bg-card border-border`.

### B) Rà soát Header, Footer & Announcement Bar
1. **`src/app/(client)/components/ui/main_header.js`**:
   - Đổi `text-blue-600` (vai trò admin) thành `text-primary font-semibold`.
   - Đổi `text-white` ở badge khám phá sản phẩm và giỏ hàng thành `text-primary-foreground`.
   - Chuẩn hóa chuỗi "My Profile" trong menu tài khoản dùng `t("myAccount")` từ file messages (`Tài khoản của tôi` / `My Account`).
2. **`src/app/(client)/components/ui/footer.js`**:
   - Loại bỏ `text-black` ở các thẻ phương thức thanh toán, thay bằng `text-foreground`.
   - Bảo toàn toàn bộ liên kết thông tin, thương hiệu và hỗ trợ.
3. **`src/components_box/announcement-bar.js`**:
   - Bỏ màu RGBA thô, thay bằng biến CSS động `hsl(var(--background) / 0.3)`.
   - Bỏ trùng lặp `font-bold` trên thẻ Link.
4. **`src/app/(client)/pages/layout-page.jsx`**:
   - Đổi `bg-[#faf8f4]` thành `bg-background text-foreground`.

---

## 4. Quét màu cứng (Hardcoded color scan)
- Chạy lệnh kiểm tra:
  ```powershell
  git grep -E "#[0-9a-fA-F]{6}|(gray|slate|zinc|stone|neutral|green|emerald|indigo|blue|amber|orange|yellow|red|rose)-[0-9]{2,3}" "src/app/(client)/pages" "src/app/not-found.jsx"
  ```
- **Kết quả**: Exit code 1 (0 dòng khớp). Toàn bộ các file nội dung và 404 đã sạch 100% màu cứng, hoàn toàn dùng token ngữ nghĩa.

---

## 5. Bằng chứng ảnh chụp thực tế (Screenshots)
Tất cả ảnh chụp lưu ngoài repo tại:
`C:\Users\Admin\.gemini\antigravity\brain\df0ba1f3-1fa1-461b-ae39-4c7216217560\screenshots\step7\`

| Màn hình | Desktop (1440px) | Mobile (390px) | Trạng thái |
| :--- | :--- | :--- | :--- |
| **Về chúng tôi** (`/pages/about`) | `about-1440.png` (238,832 bytes) | `about-390.png` (206,190 bytes) | PASS |
| **Liên hệ** (`/pages/contact-us`) | `contact-us-1440.png` (193,879 bytes) | `contact-us-390.png` (173,327 bytes) | PASS |
| **Câu hỏi thường gặp** (`/pages/faq`) | `faq-1440.png` (246,575 bytes) | `faq-390.png` (206,750 bytes) | PASS |
| **Thông tin & Chính sách** (`/pages/information`) | `information-1440.png` (196,366 bytes) | `information-390.png` (173,051 bytes) | PASS |
| **Tin tức** (`/pages/news`) | `news-1440.png` (303,506 bytes) | `news-390.png` (288,761 bytes) | PASS |
| **Ưu đãi** (`/pages/offers-discounts-coupons`) | `offers-1440.png` (133,571 bytes) | `offers-390.png` (114,676 bytes) | PASS |
| **Nhà sản xuất** (`/pages/our-makers`) | `our-makers-1440.png` (246,738 bytes) | `our-makers-390.png` (213,331 bytes) | PASS |
| **Trang 404** (`/trang-khong-ton-tai-404`) | `not-found-1440.png` (36,581 bytes) | `not-found-390.png` (26,976 bytes) | PASS |

---

## 6. Rủi ro & Cách quay lui
- **Rủi ro**: Không có rủi ro về logic thanh toán hay hợp đồng backend; toàn bộ thay đổi chỉ thuần túy ở tầng hiển thị nội dung tĩnh và trang thông tin.
- **Cách quay lui**:
  ```powershell
  git checkout HEAD -- src/app/(client)/pages src/app/not-found.jsx src/app/(client)/components/ui/main_header.js src/app/(client)/components/ui/footer.js src/components_box/announcement-bar.js
  ```
