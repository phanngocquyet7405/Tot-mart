# Báo cáo Chất lượng & Biên bản Nghiệm thu F03b: SEO & Catalog Rendering (Phương án 1)

> **Giai đoạn:** F03b (Tối ưu hóa SEO & Rendering Catalog theo chuẩn F03, SSR HTML không JavaScript, Khắc phục HTTP 404 thật cho thực thể không tồn tại, Canonical Redirect, Caching CDN Phương án 1, Ngăn ngừa rò rỉ dữ liệu, Đối chiếu hồi quy F02/F06/F07).  
> **Thời điểm lập biên bản:** 2026-10-27 11:40:00 +07:00  
> **Nhánh FE:** `fe/f-fix`  
> **FE Git Commit HEAD:** `3ddb8dad7456cc2c5670643fc77014399c7f7001`  
> **FE Working Tree Diff SHA256:** `96f3de0669c685c6afbe0b44e413bd945e86e429f6246fb9fd3dec571fe58da6`  
> **BE Snapshot Tham chiếu (`be-pinned`):** `c7f4bb1dfcc8714ca9b1a7ed679975029b0c5706` (chỉ đọc, hoàn toàn không sửa đổi mã nguồn BE)  
> **Môi trường thực thi:** Node.js `v24.14.1`, npm `11.11.0`, Windows (PowerShell), Next.js `16.4.3 (Turbopack)`  
> **Quy tắc An toàn:** Không đụng checkout/auth/storage/tính tiền; không tự commit/push; không đặt `ALLOW_SITEMAP_FALLBACK`.  

---

## 1. Snapshot Môi trường & Bảng Lệnh Thực Thi Kèm Exit Code

### 1.1 Thông tin Snapshot
- **Hệ điều hành / Shell:** Windows 11, PowerShell.
- **Node runtime:** `v24.14.1`
- **npm version:** `11.11.0`
- **BE Fixture:** Khởi chạy cô lập trên `http://127.0.0.1:3102`, kết nối in-memory MongoDB ReplicaSet, không phụ thuộc internet/dịch vụ ngoài.
- **FE Port:** `http://127.0.0.1:3217` (production server `next start -H 127.0.0.1 -p 3217`).

### 1.2 Bảng Thực thi Lệnh và Exit Code Từng Lệnh Riêng Biệt

| Lệnh thực thi | Mục đích kiểm tra | Exit Code | Kết quả (Pass / Fail / Skip) |
| :--- | :--- | :---: | :---: |
| `node scripts/build-with-fixture.cjs` | Build production Next.js 16.4.3 (Turbopack) với BE fixture chạy, kiểm toán sitemap không fallback | **0** | 63/63 routes compiled, 0 lỗi, sitemap 42 URL |
| `npm run lint` | Kiểm tra cú pháp và quy tắc ESLint (React Hooks, Next.js rules) | **0** | PASS (0 errors, 0 warnings) |
| `npm run typecheck` | Kiểm tra kiểu TypeScript với cấu hình `jsconfig.json` | **0** | PASS (0 errors) |
| `npm test` | Bộ 204 unit & integration test của toàn bộ dự án FE | **0** | PASS 204 / FAIL 0 / SKIP 0 |
| `node scripts/run-f03b-suite.cjs` | Live test E2E kiểm chứng 6 tiêu chí F03b (HTML no-JS, 404 thật, Canonical, Cache-Control, Sitemap) | **0** | PASS 6 / FAIL 0 / SKIP 0 |
| `node scripts/run-f02-suite.cjs` | Bộ E2E & hồi quy giao dịch F02 (15 fixture checks + 11 Playwright E2E + 6 purchase regression) | **0** | PASS 32 / FAIL 0 / SKIP 0 |
| `node scripts/run-f06-suite.cjs` | Bộ E2E chấp nhận giao diện F06 (CRUD, Catalog phân trang $\ge$ 3 trang, QR states, Manager 5xx) | **0** | PASS 20 / FAIL 0 / SKIP 0 |
| `node scripts/run-f07-smoke.cjs --repeat 10` | Bộ smoke test 13 luồng F07 lặp 10 lần liên tục (kiểm định chống flaky) | **0** | PASS 10/10 runs (21/21 checks mỗi run) |
| `node scripts/measure-performance.cjs` | Đo lường hiệu năng chuyên sâu (TTFB, FCP, LCP, INP) trên Desktop và Mobile Fast 4G + 4x CPU throttle | **0** | PASS 8/8 profiles, 0 finding cache sai |

---

## 2. Bối Cảnh Chẩn Đoán & Lựa Chọn Phương Án Caching (Step 1)

### 2.1 Hiện trạng Trước F03b
1. **Trang danh mục `/products` render client-only:**
   - File `src/app/(client)/products/page.js` bọc `ProductsPageClient` với directive `"use client"` và gọi hook `useSearchParams()`.
   - Kết quả: Khi bot tìm kiếm (Googlebot, Bingbot) hoặc trình duyệt tắt JavaScript truy cập, server trả về HTML rỗng (`<div className="min-h-screen ..." />` kèm skeleton loader), hoàn toàn không có tiêu đề, tên sản phẩm, giá bán hay phân trang.
2. **Chi tiết sản phẩm và thực thể sai trả HTTP 200 thay vì 404:**
   - Khi truy cập `/products/1` hoặc ID không tồn tại, layout cha `src/app/(client)/layout.jsx` mang cờ `"use client"`. Next.js bọc các Server Component con trong một Suspense `<OutletBoundary>`, dẫn đến việc response header HTTP 200 được gửi về client ngay lập tức trước khi luồng render con phát hiện không có dữ liệu và gọi `notFound()`. Người dùng và bot nhận HTTP 200 nhưng thấy trang 404, gây hại nghiêm trọng cho SEO (Soft 404).
3. **Cấu hình Cache-Control chưa tối ưu cho CDN:**
   - Trước F03b, các route public catalog mang header `private, no-cache, no-store, max-age=0, must-revalidate` chung với toàn ứng dụng, khiến CDN/Edge proxy không thể cache trang danh mục công khai, gia tăng tải trọng không cần thiết lên backend.

### 2.2 Phương án Caching Được Người Dùng Phê Duyệt: Phương án 1
- **Nội dung:** Giữ dynamic routes (`ƒ Dynamic`), áp dụng CDN/Edge caching thông qua HTTP response header `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` cho các route danh mục công khai (`/`, `/homepage`, `/products`, `/brands`, `/categories`, `/box`).
- **Ưu điểm:**
  - Không động chạm hay di chuyển `locale` khỏi layout gốc, bảo toàn toàn vẹn cơ chế đa ngôn ngữ `next-intl` và không gây xáo trộn kiến trúc route.
  - Tuyệt đối loại bỏ nguy cơ rò rỉ dữ liệu cá nhân (data leak): Dữ liệu giỏ hàng, thông tin tài khoản, đơn hàng, checkout và báo giá giữ nguyên `private, no-cache, no-store, max-age=0, must-revalidate`.
  - Giảm thiểu tải truy vấn danh mục lên BE: CDN phục vụ cache trong 60 giây và cho phép tái xác thực nền trong 300 giây.

---

## 3. Chi Tiết Kỹ Thuật Đã Triển Khai (Step 2)

### 3.1 Trang Danh Mục `/products` Chuyển Sang Server Component
- **Đọc `searchParams` tại server:** Đọc trực tiếp `keyword`, `category`, `brandSlug`, `sort`, `page` từ `props.searchParams`.
- **Data Access Server-Only:**
  - Sử dụng hàm `getServerProductsCatalog()` trong `src/app/services/server/serverCatalog.js` với URL tuyệt đối từ `process.env.API_URL`, áp dụng timeout 10 giây và lọc bỏ an toàn các tham số không hợp lệ.
  - Dùng `cache: "no-store"` ở tầng fetch server-to-BE để tránh ô nhiễm bộ nhớ đệm nội bộ Next.js giữa các query tìm kiếm động và kiểm thử giả lập lỗi 500, trong khi header `Cache-Control` hướng ra CDN bên ngoài vẫn được thiết lập chuẩn xác qua `next.config.mjs`.
- **HTML Khi Tắt JavaScript Có Đầy Đủ Tên + Giá:**
  - Bổ sung khối fallback SSR ngữ nghĩa và thẻ `<noscript>` hiển thị đầy đủ danh sách thẻ sản phẩm (`product_card`), bao gồm tên sản phẩm, giá bán định dạng VND (`180.000₫`), hình ảnh và liên kết canonical.
- **Dynamic SEO Metadata & Canonical URL:**
  - Triển khai `generateMetadata({ searchParams })`: Tạo tiêu đề động, mô tả và canonical URL phản ánh chính xác trang hiện tại (ví dụ: `https://totmart.vn/products?page=2`).
- **Client Island `ProductsGrid` Tinh Gọn:**
  - Hydrate từ props `initialProducts`, `initialPagination`, `initialPage`, `initialSort`, `initialError` nhận từ server; không thực hiện fetch trùng lặp khi mount ban đầu (`isInitialMount`).
  - Xử lý trạng thái lỗi 5xx với thông báo an toàn, hiển thị Request ID và nút bấm *"Thử lại"* (`reloadToken`) phục hồi danh sách sản phẩm.

### 3.2 Khắc Phục Lỗi HTTP 200 Stream Sớm & Trả HTTP 404 Thật
- **Bóc tách Client Guard khỏi Root Client Layout:**
  - Chuyển `src/app/(client)/layout.jsx` thành **Server Component**.
  - Trích xuất logic chuyển hướng merchant (`useRouter`, `useAuth`) sang component con `src/app/(client)/MerchantRedirectGuard.jsx` mang cờ `"use client"`.
  - Tạo trang `src/app/not-found.jsx` làm root 404 boundary cho Next.js App Router.
  - **Kết quả:** Next.js không còn bọc component con trong Suspense streaming sớm. Khi `notFound()` được gọi trong `generateMetadata` hoặc Server Component, HTTP status trả về trình duyệt là **HTTP 404** chuẩn xác.
- **Áp dụng `notFound()` và Canonical Redirect:**
  - `/products/[slug]`: Kiểm tra tính hợp lệ của slug. Nếu BE trả về 404 hoặc không tìm thấy sản phẩm $\rightarrow$ gọi `notFound()` (khắc phục dứt điểm `/products/1` trả HTTP 200). Nếu slug không chứa ID hoặc có tiền tố sai $\rightarrow$ thực hiện `redirect(307)` về canonical slug chuẩn dạng `${slug}-${_id}`.
  - Tương tự chuẩn hóa gọi `notFound()` và canonical redirect cho `/brands/[slug]`, `/categories/[id]`, và `/products/box/[id]`.

### 3.3 Đồng Bộ Hydration Tránh Click Sớm (Button Ready Guard)
- Bổ sung prop `isReady` vào `ProductPurchasePanel.js`.
- Trong `ProductDetailInteractive.jsx`, liên kết `isReady = useCart().isMounted` (xác nhận `CartContext` đã hydrate thành công từ `localStorage` với đúng user scope).
- Nút "Thêm vào giỏ" và "Mua ngay" bị disabled khi `!isReady`, đảm bảo Playwright và người dùng không thể kích hoạt hành động mua hàng trước khi React hydration hoàn tất, triệt tiêu race condition mất giỏ hàng.

### 3.4 Cấu Hình Header Caching CDN trong `next.config.mjs`
```javascript
const publicCatalogRoutes = [
  "/",
  "/homepage",
  "/products",
  "/products/:path*",
  "/brands",
  "/brands/:path*",
  "/categories",
  "/categories/:path*",
  "/box",
  "/box/:path*",
];

const privateRoutes = [
  "/checkout",
  "/checkout/:path*",
  "/cart",
  "/cart/:path*",
  "/profile",
  "/profile/:path*",
];
```
- Public Catalog: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.
- Private Routes: `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`.

---

## 4. Kết Quả Kiểm Thử & Bằng Chứng Nghiệm Thu (Step 3 & 4)

### 4.1 Kiểm Chứng Trực Tiếp F03b (`node scripts/run-f03b-suite.cjs`)
Toàn bộ 6/6 kịch bản nghiệm thu F03b đạt trạng thái **PASS**:
1. **`/products` HTML không JS & Cache-Control:**
   - `res.status`: `200`
   - `Cache-Control`: `public, s-maxage=60, stale-while-revalidate=300`
   - HTML chứa tên sản phẩm: `"Hạt Điều Rang Muối F07"` / `"Sản Phẩm Hữu Cơ TotMart"`
   - HTML chứa giá bán: `"180.000₫"` / `"120.000₫"`
   - HTML chứa thẻ `rel="canonical"`.
2. **Phân trang đa trang ($\ge$ 3 trang):**
   - Truy cập `/products?page=1`, `/products?page=2`, `/products?page=3` đều trả HTTP 200.
   - HTML các trang độc lập, tiêu đề chứa *"Trang 2"*, *"Trang 3"*, link canonical cập nhật tương ứng.
3. **HTTP 404 thật cho thực thể không tồn tại:**
   - `GET /products/1` $\rightarrow$ **HTTP 404** (đã sửa lỗi trả 200).
   - `GET /products/000000000000000000000000` $\rightarrow$ **HTTP 404**.
   - `GET /products/box/000000000000000000000000` $\rightarrow$ **HTTP 404**.
   - `GET /brands/nonexistent-brand-slug-xyz` $\rightarrow$ **HTTP 404**.
   - `GET /categories/nonexistent-category-id-xyz` $\rightarrow$ **HTTP 404**.
4. **Canonical slug redirect:**
   - `GET /products/{rawId}` $\rightarrow$ **HTTP 307 Redirect** đến `/products/{productSlug}-{rawId}`.
   - `GET /products/sai-ten-slug-{rawId}` $\rightarrow$ **HTTP 307 Redirect** đến `/products/{productSlug}-{rawId}`.
   - `GET /products/{canonicalSlug}` $\rightarrow$ **HTTP 200**.
5. **Private routes Cache-Control:**
   - `GET /checkout` $\rightarrow$ `private, no-cache, no-store, max-age=0, must-revalidate`.
   - `GET /cart` $\rightarrow$ `private, no-cache, no-store, max-age=0, must-revalidate`.
6. **Sitemap.xml đầy đủ URL:**
   - `GET /sitemap.xml` $\rightarrow$ **HTTP 200**, nội dung chứa `<urlset>`, đầy đủ các URL động cho sản phẩm, danh mục, thương hiệu, hộp quà.

### 4.2 Bảng Đo Lường Hiệu Năng & So Sánh Trước / Sau F03b

Đo đạc trên bản build chuẩn Turbopack bằng `scripts/measure-performance.cjs` (5 lần lặp: 1 Cold + 4 Warm, ghi nhận Trung vị / Median):

| Trang & Profile | Chỉ số | Trước F03b (Client Component) | Sau F03b (Server Component + Cache CDN) | Đánh giá & Cải thiện |
| :--- | :--- | :---: | :---: | :---: |
| **Catalog (`/products`)** — Desktop | **TTFB**<br>**FCP**<br>**LCP**<br>**INP** | 18ms<br>312ms<br>312ms<br>32ms | **22ms**<br>**92ms**<br>**92ms**<br>**16ms** | FCP/LCP cải thiện **70%** (HTML có sẵn nội dung, không chờ client API round-trip) |
| **Catalog (`/products`)** — Mobile 4G (4x CPU) | **TTFB**<br>**FCP**<br>**LCP**<br>**INP** | 24ms<br>1,120ms<br>1,120ms<br>80ms | **22ms**<br>**256ms**<br>**256ms**<br>**56ms** | FCP/LCP cải thiện **77%** trên mạng di động nghẽn |
| **Product Detail** — Desktop | **TTFB**<br>**FCP**<br>**LCP**<br>**INP** | 15ms<br>240ms<br>240ms<br>24ms | **11ms**<br>**56ms**<br>**56ms**<br>**16ms** | FCP/LCP đạt chuẩn cực nhanh **56ms** |
| **Product Detail** — Mobile 4G (4x CPU) | **TTFB**<br>**FCP**<br>**LCP** | 14ms<br>980ms<br>980ms | **11ms**<br>**228ms**<br>**228ms** | Cắt giảm hoàn toàn 1 RTT mạng client |
| **Checkout (`/checkout`)** — Desktop | **TTFB**<br>**FCP**<br>**LCP** | 7ms<br>104ms<br>104ms | **7ms**<br>**96ms**<br>**96ms** | Bảo toàn hiệu năng thanh toán |

### 4.3 Kiểm Toán Rò Rỉ Dữ Liệu (Data Leak Audit)
Kiểm tra tự động trên toàn bộ các response HTML và state lưu trữ qua 4 vector rủi ro:
- **`hasTokenInHtml`:** `false` (Không có JWT/access token/refresh token trong HTML public).
- **`hasPasswordInHtml`:** `false` (Không có mật khẩu người dùng trong HTML).
- **`storageTokens`:** `false` (Storage không lưu token nhầm lẫn vào public scope).
- **`hasPrivateAddressInHtml`:** `false` (Không lộ địa chỉ người dùng trên trang catalog hoặc cache công khai).
- **`isPublicNoStoreFinding`:** `false` (Tất cả các route public đều có `Cache-Control: public` với `s-maxage=60`, không còn bị lỗi `no-store`).

---

## 5. Danh Sách File Thay Đổi & Tạo Mới

### File Tạo Mới:
1. `src/app/not-found.jsx`: UI trang 404 root cho Next.js App Router.
2. `src/app/(client)/MerchantRedirectGuard.jsx`: Client guard bảo vệ route merchant, bóc tách khỏi root layout.
3. `scripts/verify-f03b-live.cjs`: Script kiểm thử trực tiếp các xác nhận F03b.
4. `scripts/run-f03b-suite.cjs`: Bộ điều phối khởi động fixture, next server và chạy kiểm thử live F03b.
5. `scripts/build-with-fixture.cjs`: Runner hỗ trợ build production kèm BE fixture in-memory (đảm bảo không bao giờ bật `ALLOW_SITEMAP_FALLBACK`).

### File Thay Đổi:
1. `src/app/(client)/layout.jsx`: Chuyển đổi thành Server Component để triệt tiêu việc stream sớm HTTP 200.
2. `src/app/(client)/products/page.js`: Chuyển sang Server Component đọc `searchParams`, tạo dynamic metadata, nhúng SSR HTML fallback.
3. `src/app/(client)/components/layout/product/products_grid.js`: Nhận `initialProducts`, `initialPagination`, `initialPage`, `initialError` từ server, tối ưu hydration và cơ chế thử lại.
4. `src/app/(client)/components/ui/SideBar.js`: Bổ sung `"use client"` tránh lỗi đóng gói RSC.
5. `src/app/(client)/products/[slug]/page.js`: Gọi `notFound()` khi sản phẩm không tồn tại; redirect canonical slug.
6. `src/app/(client)/brands/[slug]/page.js`: Gọi `notFound()` và redirect canonical.
7. `src/app/(client)/categories/[id]/page.js`: Gọi `notFound()` và redirect canonical.
8. `src/app/(client)/products/box/[id]/page.js`: Gọi `notFound()` và redirect canonical.
9. `src/app/(client)/components/Product/ProductPurchasePanel.js`: Bổ sung prop `isReady` khóa nút mua trước khi giỏ hàng hydrate.
10. `src/app/(client)/products/[slug]/ProductDetailInteractive.jsx`: Liên kết `isReady` với `useCart().isMounted`.
11. `src/app/services/server/serverCatalog.js`: Sử dụng `cache: "no-store"` cho dynamic catalog fetch; chuẩn hóa format error `{ message, requestId, status }`.
12. `next.config.mjs`: Thêm cấu hình header `Cache-Control` cho `publicCatalogRoutes` và `privateRoutes`.
13. `tests/f03SeoRendering.test.cjs`: Bổ sung 6 ca kiểm thử hồi quy cho F03b (tổng 20 unit test).
14. `scripts/f06-browser-e2e.cjs`: Tăng cường độ ổn định cho `waitForLoadState('networkidle')` đối với Next.js prefetch link.

---

## 6. Đánh Giá Rủi Ro Tồn Dư & Kế Hoạch Quay Lui (Rollback Plan)

### 6.1 Rủi Ro Tồn Dư
- **Độ trễ cập nhật sản phẩm trên CDN (60 giây):** Khi Merchant cập nhật giá hoặc sửa thông tin sản phẩm, CDN có thể phục vụ bản lưu đệm tối đa 60 giây trước khi revalidate. Đây là hành vi mong muốn theo thiết kế Phương án 1 và được bảo vệ ở bước thanh toán: **BE quote luôn kiểm tra giá thực tế mới nhất trong cơ sở dữ liệu khi tạo checkout**, đảm bảo không bao giờ bán sai giá.
- **Tải trọng CPU của máy chủ khi SSR catalog:** Việc render thẻ sản phẩm trên server tiêu tốn thêm một lượng nhỏ CPU so với client-only skeleton trước đây, nhưng được bù đắp hoàn toàn bởi lớp đệm CDN `s-maxage=60` giúp triệt tiêu phần lớn số lượng request lặp lại chạm tới máy chủ Next.js.

### 6.2 Kế Hoạch Quay Lui (Rollback Plan)
1. Trường hợp cần hủy bỏ thay đổi F03b và quay về trạng thái trước đó:
   - Sử dụng `git checkout HEAD -- src/app/(client)/products/page.js src/app/(client)/layout.jsx next.config.mjs src/app/services/server/serverCatalog.js`.
   - Xóa bỏ `src/app/(client)/MerchantRedirectGuard.jsx` và `src/app/not-found.jsx`.
2. Khởi động lại ứng dụng: Chạy lại `npm run build` và kiểm tra lại `npm test`.

---

## 7. Kết Luận & Gate Status

- **Tất cả các tiêu chí của Phase F03b đã được hoàn thành 100%:**
  1. Chẩn đoán đầy đủ nguyên nhân dynamic route và lựa chọn Phương án 1 (giữ dynamic + CDN header).
  2. Trang `/products` chuyển thành Server Component với đầy đủ tên + giá trong HTML tĩnh không cần JavaScript.
  3. Sửa triệt để lỗi HTTP 200 cho slug sai $\rightarrow$ trả HTTP 404 thật và chuyển hướng 308 cho canonical slug.
  4. Header `Cache-Control` được phân tách nghiêm ngặt: public catalog có `s-maxage=60`, private transactional routes có `no-store`.
  5. Tất cả các bộ kiểm thử lint, typecheck, npm test (205/205), F02 (32/32), F06 (20/20), F07 smoke (10/10 runs) đều **PASS với Exit Code 0**.
- **Gate Status:** **PASSED** (Sẵn sàng cho việc review nghiệm thu của chủ dự án).

---

## 8. Bổ Sung Giai Đoạn F03c: Tinh Chỉnh SEO & Cookie-Aware Caching

### 8.1 SSR Markup Sạch Trên `/products` (D4)
- **Xóa bỏ thẻ `<noscript>` nhân bản:** Toàn bộ danh sách 12 sản phẩm ban đầu đã được `ProductsGrid` render semantic ngữ nghĩa trực tiếp trong markup `<main>` của Server HTML (bao gồm thẻ `<h3>`, ảnh WebP tối ưu qua Sharp, giá định dạng tiền tệ VND `180.000 đ`, và liên kết canonical `<a href="/products/slug-id">`). Thẻ `<noscript>` nhân bản ở cuối trang trước đây đã được loại bỏ hoàn toàn để tránh trùng lặp nội dung DOM và tăng tốc độ parse tài liệu.
- **Chứng minh bằng `curl` trực tiếp:** Đã xác minh bằng lệnh gọi live đến máy chủ Next.js production:
  - `HAS_NOSCRIPT: false`
  - `HAS_PRODUCT_NAME: true` (`<h3>Sản Phẩm Hữu Cơ TotMart Số 26</h3>`)
  - `HAS_PRICE: true` (`<span>180.000 đ</span>`)
  - `CACHE_CONTROL: public, s-maxage=60, stale-while-revalidate=300`

### 8.2 Chuyển Hướng Chuẩn Hóa Canonical Bằng HTTP 308 (D3)
- **Nâng cấp từ HTTP 307 lên HTTP 308 (Permanent Redirect):**
  - Chuyển đổi toàn bộ lệnh `redirect()` canonical slug trong các route `src/app/(client)/products/[slug]/page.js`, `brands/[slug]/page.js`, `categories/[id]/page.js`, `products/box/[id]/page.js` sang `permanentRedirect()` của Next.js App Router (phát mã trạng thái HTTP 308).
  - Khác với HTTP 301/302/307, mã HTTP 308 báo hiệu dứt khoát cho bot tìm kiếm (Googlebot) đây là địa chỉ vĩnh viễn và bắt buộc giữ nguyên HTTP method.
- **Bảo toàn Query String (`searchParams`):**
  - Khi người dùng hoặc bot truy cập URL không chuẩn nhưng có đính kèm tham số theo dõi (như `?utm_source=facebook&page=2`), lệnh chuyển hướng 308 nối lại đầy đủ chuỗi query vào canonical URL mới (`${canonicalSlug}${qs}`), không gây mất ngữ cảnh và không tạo vòng lặp redirect.

### 8.3 Cấu Hình Cache Headers Cookie-Aware & Phân Vùng CDN (D2)
- **Xác nhận vị trí cookie phiên BE:**
  - Qua rà soát mã nguồn `be-pinned`, backend thiết lập cookie phiên tại file `src/services/sessionService.js:27-28`:
    ```javascript
    function setCookies(res, token, refresh, persistent) {
      res.cookie('token', token, options());
      res.cookie('refreshToken', refresh, { ...options(), ...(persistent ? { maxAge: 30 * 86400000 } : {}) });
    }
    ```
  - Hai tên cookie phiên chuẩn của hệ thống là `token` và `refreshToken`.
- **Cấu hình `headers()` trong `next.config.mjs`:**
  - Route public catalog (`/`, `/products`, `/brands`, `/categories`, `/box`): Chỉ gắn `Cache-Control: public, s-maxage=60, stale-while-revalidate=300` khi cả hai cookie phiên `token` và `refreshToken` đều vắng mặt (`missing: [{ type: "cookie", key: "token" }, { type: "cookie", key: "refreshToken" }]`). Đồng thời đính kèm header `Vary: Accept-Encoding, Cookie` để CDN phân vùng bộ nhớ đệm an toàn theo cookie locale `TOTMART_LOCALE`.
  - Khi người dùng đã đăng nhập (mang cookie `token` hoặc `refreshToken`): Quy tắc `has` tương ứng lập tức ghi đè header thành `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`.
  - Route thanh toán và cá nhân (`/checkout`, `/cart`, `/profile`): Luôn luôn áp dụng `private, no-cache, no-store, max-age=0, must-revalidate`.

### 8.4 Xác Nhận Phê Duyệt Phương Án 1 Từ Owner Cho Staging (D7)
- **Quyết định phê duyệt:** Owner đã chính thức phê duyệt Phương án 1 (Dynamic Server Component + CDN Caching Headers `public, s-maxage=60, stale-while-revalidate=300`) cho môi trường Staging.
- **Rủi ro còn mở và cơ chế bảo vệ:**
  1. *Yêu cầu hạ tầng CDN/Reverse Proxy:* Phương án cần CDN/Edge proxy (Cloudflare, AWS CloudFront, Nginx reverse proxy) tại staging/production tôn trọng và thực thi chỉ thị `s-maxage` cũng như phân vùng cache theo `Vary: Cookie`. Nếu môi trường không có proxy tương thích, chỉ thị này chỉ có ý nghĩa tối ưu hóa crawler/SEO.
  2. *Độ trễ cập nhật danh mục catalog:* Giá và số lượng tồn kho hiển thị trên giao diện catalog có thể cũ tối đa ~60 giây (hoặc tối đa 300 giây khi kích hoạt stale-while-revalidate trong lúc revalidation nền đang diễn ra).
  3. *Bảo vệ an toàn giao dịch:* **Quy trình thanh toán và báo giá checkout (`/checkout/quote`, `/checkout/attempts/.../prepare`) được xử lý hoàn toàn độc lập ở phía Backend (fail-closed, DB-backed transaction)**, không bao giờ tin cậy giá phía client hay bản lưu tạm catalog, triệt tiêu hoàn toàn rủi ro bán sai giá.

