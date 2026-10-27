# Biên Bản Rà Soát Frontend & Chốt Release Candidate (Phase F08e)

> **Dự án:** TotMart FE (`C:\Users\84862\Desktop\WorkSpace\totmart\fe_totmart`)  
> **Thời điểm cập nhật:** 2026-10-27 14:15:00 +07:00  
> **Nhánh FE:** `fe/rc-f08` | **Base Commit:** `3ddb8dad7456cc2c5670643fc77014399c7f7001` (`fe/f-fix`)  
> **HEAD Commit:** `59ccbee` (Đã commit 5 nhóm: ci, checkout, seo, ui, docs)  
> **FE Candidate SHA:** `59ccbee7dd741e46f6f96213fc817559e2b1029c` (Chờ Owner xác nhận sau khi duyệt)  
> **BE Ghim (Read-only):** `C:\Users\84862\Desktop\totmart\be-pinned` (Commit `e31517d8f2116f611a27dae96d9446ce8109bffc`, Seal C2 `c7f4bb1dfcc8714ca9b1a7ed679975029b0c5706`)  
> **Trạng thái Gate F08:** **BLOCKED** (Chờ CI remote, Điểm Rubric 81/100 dưới sàn, Chờ Owner duyệt rủi ro)

---

## 1. Snapshot Môi Trường & Bảng Lệnh Thực Thi Kèm Exit Code (F08.0 / F08.2)

### 1.1 Snapshot Môi Trường
- **Hệ điều hành:** Windows 11 (PowerShell) | **Node:** `v24.14.1` | **npm:** `11.11.0` | **Next.js:** `16.4.3 (Turbopack)`
- **BE Fixture:** In-memory MongoDB ReplicaSet + Isolated Redis trên `127.0.0.1:3102`, không gọi dịch vụ ngoài.
- **Docker Baseline:** 0 container trước và sau toàn bộ quá trình kiểm thử (`docker ps` trả về rỗng).

### 1.2 Bảng Thực Thi Toàn Bộ Regression Suite Kèm Exit Code Riêng Biệt

| Lệnh thực thi | Mục đích kiểm tra | Exit Code | Kết quả thực tế |
| :--- | :--- | :---: | :--- |
| `npm run lint` | ESLint tĩnh toàn bộ mã nguồn | **0** | PASS (0 errors, 0 warnings) |
| `npm run typecheck` | Kiểm tra kiểu TypeScript / JSDoc | **0** | PASS (0 errors) |
| `npm test` | Toàn bộ 205 unit & integration tests | **0** | PASS 205 / FAIL 0 / SKIP 0 |
| `node scripts/build-with-fixture.cjs` | Build Next 16.4.3 với BE fixture (fail-closed, cấm fallback) | **0** | 63/63 routes compiled, sitemap 42 entities |
| `node scripts/run-f03b-suite.cjs` | Live verification SEO & Caching (HTML no-JS, 404 thật, 308 redirect, Cache-Control, Sitemap) | **0** | PASS 6 / FAIL 0 / SKIP 0 |
| `node scripts/run-f02-suite.cjs` | Suite giao dịch F02 (15 fixture + 11 Playwright E2E + 6 purchase regression) | **0** | PASS 32 / FAIL 0 / SKIP 0 |
| `node scripts/run-f06-suite.cjs` | Suite giao diện F06 (CRUD, Phân trang $\ge 3$ trang, QR non-payable, Manager 5xx) | **0** | PASS 20 / FAIL 0 / SKIP 0 |
| `node scripts/run-f07-smoke.cjs --repeat 10` | 13 luồng smoke E2E lặp 10 lượt liên tục (kiểm định chống flaky) | **0** | PASS 10/10 lượt (21/21 checks mỗi lượt = 210 checks) |
| `node scripts/measure-performance.cjs` | Đo đạc Core Web Vitals (TTFB, FCP, LCP, CLS) trên Desktop & Mobile 4G (4x CPU) | **0** | PASS 8/8 profiles, FCP warm 52–104ms desktop |
| `npm audit --omit=dev` | Kiểm toán lỗ hổng dependencies production | **0** | PASS (0 vulnerabilities) |
| `npm audit` | Kiểm toán toàn bộ dependencies (bao gồm devDependencies) | **1** | 9 vulnerabilities trong devDependencies (được giữ nguyên) |
| `docker run --rm -v "${PWD}:/workflows:ro" rhysd/actionlint:latest /workflows/.github/workflows/e2e.yml` | Kiểm tra cú pháp GitHub Actions workflow | **0** | PASS (0 errors, 0 warnings) |

---

## 2. Danh Sách Tệp Sửa Đổi & Phân Loại Tracked / Untracked (F08.1)

Toàn bộ 51 tệp thay đổi so với base `3ddb8da` đã được commit có cấu trúc vào nhánh `fe/rc-f08`. Toàn văn git diff chi tiết (+2,357 dòng) được lưu trữ tại: **[docs/quality/F08-diff-appendix.md](F08-diff-appendix.md)**.

### 2.1 Bảng 30 Tệp Đã Sửa Đổi (Tracked Modified - `M`)

| STT | Đường dẫn tệp | Nhóm chức năng chính |
| :---: | :--- | :--- |
| 1 | `next.config.mjs` | Cache-Control cookie-aware, CSP Report-Only, API proxy rewrite |
| 2 | `package.json` | Ghim lệnh kiểm thử E2E, smoke, perf |
| 3 | `scripts/run-f02-suite.cjs` | Điều chỉnh harness kiểm thử luồng F02 |
| 4 | `src/app/(admin)/components/box/BoxFormDialog.jsx` | An toàn giá combo và validation form |
| 5 | `src/app/(client)/brands/[slug]/page.js` | Canonical 308 redirect giữ query string |
| 6 | `src/app/(client)/categories/[id]/page.js` | Canonical 308 redirect giữ query string |
| 7 | `src/app/(client)/components/Checkout_component/OrderSuccessScreen.js` | Màn hình thành công chuẩn xác (chặn on_hold) |
| 8 | `src/app/(client)/components/Checkout_component/PaymentStep.js` | Xử lý non-payable, giữ trang+mã+tiền khi hết hạn/huỷ |
| 9 | `src/app/(client)/components/Product/GiftOptions.js` | Giao diện gói quà chuẩn báo giá BE |
| 10 | `src/app/(client)/components/Product/ProductGallery.js` | Thư viện ảnh sản phẩm & placeholder fallback |
| 11 | `src/app/(client)/components/Product/ProductInfoTabs.js` | Tab thông tin chi tiết & accessibility |
| 12 | `src/app/(client)/components/Product/ProductPurchasePanel.js` | Khóa nút mua khi chưa hydrate giỏ (`isReady`) |
| 13 | `src/app/(client)/components/layout/product/product_card.js` | Giá $\le 0 \rightarrow$ "Liên hệ", ảnh lỗi fallback placeholder |
| 14 | `src/app/(client)/components/layout/product/products_grid.js` | Server-rendered markup trong `<main>`, phân trang semantic |
| 15 | `src/app/(client)/components/ui/SideBar.js` | Khóa cuộn màn hình và sidebar semantic |
| 16 | `src/app/(client)/layout.jsx` | Bóc tách guard client ra khỏi Server Component layout |
| 17 | `src/app/(client)/products/[slug]/ProductDetailInteractive.jsx` | Client interactive island cho chi tiết sản phẩm |
| 18 | `src/app/(client)/products/[slug]/page.js` | Canonical 308 redirect giữ query string |
| 19 | `src/app/(client)/products/box/[id]/BoxDetailInteractive.jsx` | Client interactive island cho chi tiết combo hộp |
| 20 | `src/app/(client)/products/box/[id]/page.js` | Canonical 308 redirect giữ query string |
| 21 | `src/app/(client)/products/page.js` | Server catalog SSR, loại bỏ noscript duplicate |
| 22 | `src/app/hook/checkout/useCheckout.js` | Polling dừng đúng terminal status, bỏ clock client |
| 23 | `src/app/hook/useProductDetail.js` | Quản lý state chi tiết sản phẩm an toàn |
| 24 | `src/app/manager/lib/productModel.mjs` | Model sản phẩm manager & fallback giá |
| 25 | `src/app/services/api/Checkoutpageservice.js` | Parser `readOrderStatus` an toàn (on_hold trước paid) |
| 26 | `src/app/services/server/serverCatalog.js` | Fetch SSR catalog độc lập môi trường (Staging/Prod) |
| 27 | `src/app/util/cartLine.mjs` | Định danh dòng giỏ hàng (variantId/boxId) |
| 28 | `tests/f03SeoRendering.test.cjs` | 6 live SEO assertions (SSR markup, 308, 404, sitemap) |
| 29 | `tests/helpers/attemptHarness.cjs` | Harness giả lập abort controller và lookup |
| 30 | `tests/qrPayment.test.cjs` | 13 assertions kiểm thử qrPayment & non-payable |

### 2.2 Bảng 21 Tệp Mới Tạo (Untracked Added - `A`)

| STT | Đường dẫn tệp | Mục đích kỹ thuật |
| :---: | :--- | :--- |
| 1 | `.github/workflows/e2e.yml` | CI Remote workflow (Node 24, Mongo memory, Redis, E2E) |
| 2 | `docs/quality/F03b-seo-rendering.md` | Biên bản nghiệm thu SEO & Caching Phase F03b |
| 3 | `docs/quality/F06-ui-acceptance.md` | Biên bản nghiệm thu UI/UX Phase F06 |
| 4 | `docs/quality/F07-ci-performance.md` | Biên bản nghiệm thu CI & Hiệu năng Phase F07 |
| 5 | `docs/quality/F08-diff-appendix.md` | Phụ lục toàn văn git diff (+2,357 dòng) |
| 6 | `docs/quality/FE-release-candidate.md` | Biên bản rà soát Frontend & chốt Release Candidate |
| 7 | `playwright.config.cjs` | Cấu hình Playwright cho E2E và smoke testing |
| 8 | `scripts/bootstrap-e2e.cjs` | Bootstrap dữ liệu fixture cho E2E testing |
| 9 | `scripts/build-with-fixture.cjs` | Script build Next.js với in-memory BE fixture |
| 10 | `scripts/f06-browser-e2e.cjs` | Kịch bản trình duyệt Playwright cho suite F06 |
| 11 | `scripts/f07-browser-smoke.cjs` | Kịch bản trình duyệt Playwright cho smoke F07 |
| 12 | `scripts/measure-performance.cjs` | Script đo Core Web Vitals (TTFB, FCP, LCP, CLS) |
| 13 | `scripts/run-f03b-suite.cjs` | Runner suite kiểm định SEO & Caching F03b |
| 14 | `scripts/run-f06-suite.cjs` | Runner suite kiểm định giao diện F06 (20 checks) |
| 15 | `scripts/run-f07-smoke.cjs` | Runner kiểm định smoke chống flaky F07 |
| 16 | `scripts/run-f07-suite.cjs` | Runner tích hợp toàn bộ kiểm định Phase F07 |
| 17 | `scripts/verify-f03b-live.cjs` | Kiểm tra live HTTP header & HTML SSR F03b |
| 18 | `scripts/verify-f06-fixture.cjs` | Kiểm tra fixture dữ liệu F06 |
| 19 | `scripts/verify-f07-fixture.cjs` | Kiểm tra fixture dữ liệu F07 |
| 20 | `src/app/(client)/MerchantRedirectGuard.jsx` | Client island điều hướng merchant mà không ảnh hưởng SSR layout |
| 21 | `src/app/not-found.jsx` | Trang 404 thật trả status code HTTP 404 |

---

## 3. Căn Cứ Hợp Đồng Backend & Triển Khai Checkout F08d

### 3.1 Căn Cứ Hợp Đồng BE (Trích Dẫn Mã Nguồn `be-pinned`)
1. **Giá trị `paymentStatus`:** BE chỉ trả `paid`, `cancelled`, `pending` (`src/controllers/checkOutController.js:230`). **BE không bao giờ trả giá trị chuỗi `"expired"` và không có trường `expired`.**
2. **Cơ chế hết hạn:** BE tự động tính `expiresAt <= now && !paid` và gán `invalid = true`, trả về `paymentStatus: "cancelled"` cùng `payable: false` (`checkOutController.js:212-218`).
3. **Biên lai / Webhook đến muộn:** `paymentReconciliationService.js:275-285` và test `late receipt goes to audited refund queue`: Khi receipt đến sau khi hết hạn, BE **không bao giờ hồi sinh đơn thành paid**, mà đưa toàn bộ khoản tiền vào hàng đợi hoàn tiền có kiểm toán (`Refund` model với `purpose: 'receipt'`).
4. **Trạng thái `on_hold`:** Chỉ xảy ra sau khi đã nhận tiền (`paymentStatus: 'paid'`) nhưng thiếu tồn kho (`inventoryService.js:28-31`). Đơn được gán `order.status = 'on_hold'` để admin xử lý bằng `resolveInventoryHold`.

### 3.2 Hiện Thực Đã Áp Dụng Trên FE
- **Không suy diễn hết hạn theo client clock:** Bỏ hoàn toàn phép so sánh `expiresAt <= new Date()` ở client.
- **Xử lý `on_hold` chuẩn xác:** `readOrderStatus` kiểm tra `isOnHold` trước `isPaid`. Khi đơn ở trạng thái `on_hold`, FE không bao giờ kích hoạt `OrderSuccessScreen` ("Đặt hàng thành công") mà hiển thị thông báo tạm giữ kho.
- **Giữ trang + mã + số tiền:** Khi đơn hết hạn/huỷ online có `paymentCode`, FE giữ nguyên màn hình thanh toán, giữ mã thanh toán và số tiền, tuyệt đối không gọi `router.replace("/")` hay xóa mã.
- **Thông điệp hoàn tiền chính xác:** CẤM hứa *"tự động cập nhật khi nhận biên lai"*. Thông báo đúng hành vi BE: *"Mã thanh toán không còn hiệu lực nhận thanh toán. Nếu bạn đã chuyển khoản, khoản tiền sẽ vào quy trình đối soát hoàn tiền hoặc liên hệ hỗ trợ TotMart kèm mã thanh toán."*
- **Polling an toàn:** Polling dừng ngay khi gặp `paid`, `cancelled`, hoặc `on_hold`. Khai báo biến `info` ngoài khối `try` để tránh `ReferenceError`. Nhánh resume return tường minh sau khi set trạng thái.

---

## 4. Bảng Điểm Rubric 7 Tiêu Chí Chuẩn (100 Điểm)

> **Điểm tổng kết tạm thời (Self-review):** **81 / 100** *(Mức sàn yêu cầu để Release: **85 / 100**)*  
> **Đánh giá chung:** **CHƯA ĐẠT MỨC SÀN RELEASE** (Mục 3, 5, 6 đều dưới sàn; Remote CI chưa chạy).

| STT | Tiêu chí chuẩn | Trọng số | Mức sàn | Điểm tạm | Bằng chứng đạt được trên mã nguồn & runtime | Tồn đọng & Phần chưa kiểm chứng |
| :---: | :--- | :---: | :---: | :---: | :--- | :--- |
| **1** | **Kiến trúc & Phân tầng** | **15** | **11** | **13** | Phân tầng rõ rệt: `services/api`, `services/server`, `util/cartLine`, hooks, UI components. Bóc tách Server Component layout và Client Islands (`MerchantRedirectGuard.jsx`) chuẩn Next.js App Router. | Kiến trúc đã sạch; cần duy trì trong các phase tiếp theo. |
| **2** | **Bảo mật & Quản lý phiên** | **20** | **18** | **18** | Leak audit: 0 token, 0 password, 0 PII trong HTML; cookie HttpOnly/Secure; multi-tab refresh (P2-06) an toàn; role guard chặn 403 API & UI; logout thu hồi session BE 401. | **Chưa kiểm chứng:** axe-core tự động, điều hướng bàn phím đầy đủ và screen reader bằng assistive tech chuyên dụng; CSP ở chế độ Report-Only (cần edge proxy enforce); P2-01 (bcrypt 72 byte) phụ thuộc BE. |
| **3** | **Nghiệp vụ & Toàn vẹn giao dịch** | **25** | **23** | **20** | F08d đã sửa triệt để: không clock client, giữ mã+tiền khi non-payable, chặn báo đặt hàng thành công khi on_hold, 13/13 qrPayment tests pass, F02 32/32 pass. | **DƯỚI SÀN (20 < 23):** Mới kiểm chứng hoàn toàn trên local fixture; **chưa nghiệm thu Staging với cổng thanh toán ngân hàng thật**. |
| **4** | **Vận hành & Tin cậy / Phục hồi** | **15** | **12** | **14** | Xử lý 503 hiển thị Request ID và giữ phiên; QuotaExceededError fallback in-memory an toàn; Code 91 phục hồi đơn qua backoff lookup. | **Chưa kiểm chứng:** Hành vi phục hồi khi mất kết nối mạng diện rộng kéo dài nhiều giờ ngoài môi trường lab. |
| **5** | **Test Automation & CI Integration** | **15** | **13** | **10** | 205 unit tests pass 100%, F02 (32 checks) pass, F06 (20 checks) pass, F07 (10 runs, 210 checks) pass, actionlint pass. | **DƯỚI SÀN (10 < 13):** **Remote CI trên GitHub Actions CHƯA CHẠY** trên commit của FE candidate SHA. **Điểm mục 5 CHỈ ĐƯỢC NÂNG LÊN $\ge 13$ sau khi Remote CI xanh 100% trên đúng cặp SHA.** |
| **6** | **Hiệu năng & SEO** | **5** | **4** | **2** | SSR HTML có đầy đủ `<h3>` tên và `<span>` giá; HTTP 404 thật; 308 canonical redirect; cookie-aware CDN caching headers; TTFB 10–20ms, FCP 52–104ms desktop. | **DƯỚI SÀN (2 < 4):** **Chưa kiểm chứng:** CDN staging thật có tôn trọng `s-maxage` và `Vary: Cookie` hay không; LCP đo đạc trong lab chỉ là text `H1`, chưa phản ánh ảnh nền hero CSS. |
| **7** | **Tài liệu & Quy trình** | **5** | **4** | **4** | Biên bản F01–F08 đầy đủ snapshot, mã lỗi, git diff appendix, ma trận rủi ro, checklist ST01–ST40. | Chờ Owner xem xét và ký duyệt biên bản nghiệm thu. |
| | **TỔNG ĐIỂM** | **100** | **85** | **81** | **$13 + 18 + 20 + 14 + 10 + 2 + 4 = 81$ (DƯỚI SÀN 85)** | **3 mục (3, 5, 6) đều dưới sàn; tuyệt đối không tự nâng điểm.** |

---

## 5. Ma Trận Quản Lý Rủi Ro P2

Theo quy tắc an toàn Phase F08, Agent không tự ý quyết định thay Owner; các cột **"Quyết định Owner"** và **"Tên người chịu trách nhiệm"** được giữ nguyên để trống:

| Mã rủi ro | Mô tả rủi ro kỹ thuật | Mức độ | Đề xuất của agent | Quyết định Owner | Tên người chịu trách nhiệm |
| :--- | :--- | :---: | :--- | :---: | :---: |
| **P2-01** | BE cắt mật khẩu ở 72 byte (bcrypt) & mã lỗi reset password 400 | Medium | FE đã phân biệt chính xác lỗi 400 mật khẩu không hợp lệ với token hết hạn. Đề xuất chấp nhận ở mức FE, theo dõi phía BE. | `[ ]` | |
| **P2-06** | Đa tab đồng thời kích hoạt refresh token khi access token hết hạn | Medium | Đã kiểm chứng 10/10 lần trong Smoke Flow 11. FE dùng promise-sharing, BE hỗ trợ token reuse window an toàn. Đề xuất chấp nhận. | `[ ]` | |
| **B-A1-AV01** | Upload ảnh Combo/Avatar của Admin | Low | Test dùng mock không gọi Cloudinary thật. Đề xuất kiểm thử upload thủ công trên sandbox trước khi mở tính năng. | `[ ]` | |
| **Flake B06** | Fenced concurrency HTTP trên BE | Low | BE sử dụng distributed lock. Phía FE đã có cơ chế backoff lookup bảo vệ, không bao giờ tự ý tạo mới key. Đề xuất chấp nhận. | `[ ]` | |
| **CDN Staging (D7)** | Giá / tồn kho catalog có thể cũ **tối đa ~6 phút (s-maxage 60 + stale-while-revalidate 300)** | Medium | Cần kiểm tra ở staging: CDN tôn trọng `Vary: Cookie` sẽ chia nhỏ cache; CDN bỏ qua Vary có thể phục vụ nhầm ngôn ngữ. **Đề xuất: cấu hình cache key theo cookie `TOTMART_LOCALE` ở CDN/proxy.** Giao dịch thanh toán được bảo vệ độc lập bằng BE quote. | `[ ]` | |
| **Dev Audit Supply-chain** | 9 lỗ hổng trong devDependencies; CI workflow nắm secret `BE_REPO_TOKEN` | Medium | Production audit (`--omit=dev`) đạt 0 lỗi. Tuy nhiên, runner CI thực thi devDependencies khi nắm secret token có rủi ro chuỗi cung ứng. Đề xuất kiểm toán định kỳ. | `[ ]` | |

---

## 6. Bảng Kiểm Toán devDependencies (9 Lỗ Hổng)

Kết quả chi tiết từ `npm audit` (exit code 1; production `npm audit --omit=dev` exit code 0):

| Gói (Package) | Mức độ | Đường dẫn phụ thuộc (Dependency Path) | Chạy trong Build/CI? | Có bản vá không phá vỡ (Breaking)? | Quyết định Owner |
| :--- | :---: | :--- | :---: | :---: | :---: |
| `body-parser` | High | `@shadcn/registry > express > body-parser` | Không (Chỉ CLI dev tooling) | Có (`fixAvailable: true`) | `[ ]` |
| `fast-uri` | Moderate | `@shadcn/registry > ajv > fast-uri` | Không (Chỉ CLI dev tooling) | Có (`fixAvailable: true`) | `[ ]` |
| `ip-address` | Moderate | `@shadcn/registry > socks > ip-address` | Không (Chỉ CLI dev tooling) | Có (`fixAvailable: true`) | `[ ]` |
| `postcss-selector-parser` | Moderate | `@tailwindcss/typography > postcss-selector-parser` | **Có** (Chạy khi biên dịch CSS build/CI) | **Không** (Yêu cầu SemVer Major `@tailwindcss/typography@0.5.4`) | `[ ]` |
| `@tailwindcss/typography` | Moderate | Phụ thuộc vào `postcss-selector-parser` | **Có** (Chạy khi biên dịch CSS build/CI) | **Không** (Yêu cầu SemVer Major `@tailwindcss/typography@0.5.4`) | `[ ]` |
| `undici` | High | `@shadcn/registry > undici` | Không (Chỉ CLI dev tooling) | Có (`fixAvailable: true`) | `[ ]` |
| `zod` | High | `@shadcn/registry > zod`, `shadcn > zod` | Không (Chỉ CLI dev tooling) | Có (`fixAvailable: true`) | `[ ]` |
| `@shadcn/registry` | High | CLI scaffolding tool (phụ thuộc `zod`) | Không (Chỉ CLI dev tooling) | Có (`fixAvailable: true`) | `[ ]` |
| `shadcn` | High | CLI scaffolding tool (phụ thuộc `zod`, `@shadcn/registry`) | Không (Chỉ CLI dev tooling) | Có (`fixAvailable: true`) | `[ ]` |

> [!WARNING]
> **Rủi ro chuỗi cung ứng (Supply-chain Risk):** Pipeline CI remote (`.github/workflows/e2e.yml`) nắm giữ secret `BE_REPO_TOKEN` để clone repository backend ghim. Việc chạy `npm install` có chứa các gói devDependencies có lỗ hổng chưa vá có thể tiềm ẩn rủi ro đánh cắp token nếu môi trường phụ thuộc bị tấn công.

---

## 7. Báo Cáo Hiệu Năng & Chẩn Đoán LCP (F07.5)

### 7.1 Số Liệu Đo Đạc Thực Tế Core Web Vitals
Đo đạc thực tế từ `node scripts/measure-performance.cjs` trên máy chủ Next.js 16.4.3 production:

| Trang | Profile | TTFB (cold / warm) | FCP (cold / warm) | LCP (Element) | CLS | JS Bundle (Transfer) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Trang chủ (`/`)** | Desktop Unthrottled | 24ms / 10ms | 260ms / 88ms | 88ms (`H1` text) | 0 | 344 KB (warm 0 KB) |
| **Trang chủ (`/`)** | Mobile Fast 4G (4x CPU) | 8ms / 12ms | 1,104ms / 264ms | 264ms (`H1` text) | 0 | 344 KB (warm 0 KB) |
| **Danh mục (`/products`)** | Desktop Unthrottled | 114ms / 20ms | 320ms / 80ms | 80ms (`H1` text) | 0 | 346 KB (warm 0 KB) |
| **Danh mục (`/products`)** | Mobile Fast 4G (4x CPU) | 18ms / 20ms | 1,136ms / 220ms | 220ms (`H1` text) | 0 | 346 KB (warm 0 KB) |
| **Chi tiết (`/products/...`)** | Desktop Unthrottled | 77ms / 11ms | 316ms / 52ms | 52ms (`H1` text) | 0 | 410 KB (warm 0 KB) |
| **Chi tiết (`/products/...`)** | Mobile Fast 4G (4x CPU) | 9ms / 12ms | 1,152ms / 208ms | 208ms (`H1` text) | 0 | 410 KB (warm 0 KB) |
| **Thanh toán (`/checkout`)** | Desktop Unthrottled | 16ms / 5ms | 304ms / 80ms | 80ms (`H1` text) | 0 | 353 KB (warm 0 KB) |
| **Thanh toán (`/checkout`)** | Mobile Fast 4G (4x CPU) | 8ms / 7ms | 2,012ms / 536ms | 536ms (`H1` text) | 0 | 353 KB (warm 0 KB) |

### 7.2 Đánh Giá Ngân Sách & Chẩn Đoán LCP Hero
- **Quy định ngân sách:** Ngân sách FCP $\le 300\text{ms}$ áp dụng cho **warm navigation** trên Desktop (thực tế đạt 52–88ms, PASS).
- **Rủi ro người dùng lần đầu (Cold Navigation):** FCP cold trên Mobile Fast 4G bị bóp CPU 4x dao động từ **1.1s đến 2.0s** (số liệu lab). Đây là rủi ro cần ghi nhận cho khách hàng truy cập lần đầu trên mạng di động yếu.
- **Hiện trạng LCP Hero:**
  - Trang chủ (`/`) hiện sử dụng CSS `backgroundImage: url(https://images.unsplash.com/...)` từ domain ngoài (`src/components_box/hero-sections.js:37`). Trong môi trường lab headless, trình duyệt chọn phần tử văn bản `<h1>` làm LCP candidate tại 88ms/264ms; thời gian vẽ thực tế của ảnh nền CSS chưa đo được độc lập.
  - Trang `/homepage` đã sử dụng `<Image fill priority>` với Sharp optimizer, nén ảnh hero từ 321 KB xuống 137 KB WebP.
  - **Đề xuất kỹ thuật (thực hiện ở phase sau, không làm trong F08):** Chuyển đổi hero section trang `/` sang sử dụng component `next/image` có `priority` để tối ưu tải ảnh và cải thiện LCP thực tế trên thiết bị di động.

---

## 8. Manifest Phát Hành & Đối Chiếu Cấu Hình

| Thành phần cấu hình | Giá trị khai báo | File nguồn và dòng đối chiếu | Ghi chú kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Next.js Version** | `16.4.3` | `package.json:39` | Ghim cứng phiên bản, không tự ý nâng cấp |
| **Package-lock SHA256** | `a586f481782be17ce91c39a99bb591159d64bb6d6585e65e108241e6e88a8817` | `package-lock.json` | Hash bảo toàn tính toàn vẹn phụ thuộc |
| **BE Contract Version** | `C2-20261022.1` | Seal C2 (`c7f4bb1dfcc8714ca9b1a7ed679975029b0c5706`) | Hợp đồng giao dịch BE đã ghim |
| **Chuẩn Bundler** | Next.js Turbopack (Mặc định) / Webpack (Tùy chọn) | `package.json:11` | Build Turbopack cho tốc độ tối ưu |
| **Lệnh kiểm thử E2E** | `npm run test:e2e:purchase`<br>`npm run test:smoke`<br>`npm run test:perf` | `package.json:14-16` | Các lệnh kiểm thử tự động chính thức |
| **Yêu cầu Edge Proxy** | HSTS (`max-age=31536000; includeSubDomains`) & CSP Enforce | `next.config.mjs:58-94` | FE khai báo Report-Only; Edge CDN cần enforce |
| **Biến URL Staging** | `STAGING_SITE_URL` | `src/app/services/server/serverCatalog.js:38` | Bắt buộc khi `APP_ENV=staging` |
| **Biến URL Production** | `SITE_URL` hoặc `NEXT_PUBLIC_SITE_URL` | `src/app/services/server/serverCatalog.js:47` | Canonical URL public |
| **Caching Public Catalog** | `public, s-maxage=60, stale-while-revalidate=300` | `next.config.mjs:112-124` | Kèm `missing: [token, refreshToken]` và `Vary: Accept-Encoding, Cookie` |
| **Caching Private Routes** | `private, no-cache, no-store, max-age=0, must-revalidate` | `next.config.mjs:125-156` | Áp dụng cho `/checkout`, `/cart`, `/profile` và khi có session cookie |
| **Đóng cứng `API_URL`** | **CẢNH BÁO BUILD RIÊNG CHO TỪNG MÔI TRƯỜNG** | `.next/routes-manifest.json` | `API_URL` bị bake cứng vào rewrite rules lúc build $\rightarrow$ **BẮT BUỘC BUILD RIÊNG CHO STAGING VÀ PRODUCTION**. |

---

## 9. FE Smoke Checklist (FE-01..FE-40) & Ánh Xạ Lộ Trình ST01–ST40

### 9.1 FE Smoke Checklist (FE-01..FE-40)
Bảng kiểm tra thực tế trên FE với nhãn giao diện chuẩn mã nguồn:

| Mã FE | Kịch bản kiểm tra | Kỳ vọng & Nhãn giao diện thực tế |
| :---: | :--- | :--- |
| **FE-01** | Khách ẩn danh xem trang chủ (`/`) | HTTP 200, SSR HTML có H1, không có cookie phiên. |
| **FE-02** | Khách ẩn danh duyệt danh mục (`/products`) | SSR HTML có đầy đủ `<h3>` tên và `<span>` giá sản phẩm. |
| **FE-03** | Khách xem sản phẩm chưa có giá (Price $\le 0$) | Nhãn giao diện hiển thị chính xác: **"Liên hệ"** (`formatPrice`). |
| **FE-04** | Khách xem ảnh sản phẩm bị lỗi | Tự động fallback sang ảnh dự phòng: **`/assets/placeholder.png`**. |
| **FE-05** | Khách xem sản phẩm hết hàng (Stock = 0) | Nút Mua ngay / Thêm giỏ bị disabled, nhãn "Hết hàng". |
| **FE-06** | Thêm sản phẩm vào giỏ hàng | Cập nhật số lượng giỏ hàng trên Header, badge giỏ nhảy số. |
| **FE-07** | Chặn mua khi giỏ chưa hydrate (`!isReady`) | Nút Thêm vào giỏ bị khóa an toàn cho đến khi hoàn tất đọc storage. |
| **FE-08** | Fallback bộ nhớ khi localStorage bị chặn | In-memory fallback (`safeStorage`) kích hoạt, giỏ hàng vẫn mua được. |
| **FE-09** | Chuyển hướng Canonical Slug (HTTP 308) | Truy cập ID trần chuyển hướng 308 về `${canonicalSlug}` giữ query string. |
| **FE-10** | Xử lý thực thể không tồn tại (HTTP 404 thật) | Truy cập `/products/nonexistent-id` trả HTTP 404 chuẩn, không soft 404. |
| **FE-11** | Chặn index môi trường Staging qua robots.txt | `src/app/robots.js:4-16` trả `userAgent: "*", disallow: "/"` khi `APP_ENV=staging`. |
| **FE-12** | Phân trang danh mục sản phẩm $\ge 3$ trang | Semantic `<button>` phân trang hoạt động, URL cập nhật `?page=N`. |
| **FE-13** | Tìm kiếm sản phẩm theo từ khóa | Trả về danh sách chính xác, cập nhật URL search query. |
| **FE-14** | Bộ lọc danh mục và thương hiệu | Lọc đúng tiêu chí, giữ query filter khi chuyển trang. |
| **FE-15** | Đăng nhập tài khoản khách hàng | Nhận cookie `token` và `refreshToken` (HttpOnly, Secure). |
| **FE-16** | Đăng xuất người dùng | Gọi API thu hồi session BE 401, xóa cookie client. |
| **FE-17** | Đa tab đồng thời refresh token | Shared promise refresh token, không văng phiên (P2-06). |
| **FE-18** | Khách hàng truy cập `/manager` | Bị chuyển hướng tức thì trong `MerchantRedirectGuard.jsx` mà không làm hỏng SSR. |
| **FE-19** | Merchant truy cập `/admin-*` | Bị từ chối quyền truy cập HTTP 403 an toàn. |
| **FE-20** | Mua hàng COD lần đầu | Trừ kho chính xác 1 đơn vị, làm rỗng giỏ, chuyển sang OrderSuccessScreen. |
| **FE-21** | Mua hàng COD lần hai cùng giỏ | Tạo idempotency key mới, tạo đơn thứ hai độc lập. |
| **FE-22** | Mua hàng Online qua VietQR | Hiển thị mã QR VietQR, thông tin tài khoản và đúng số tiền. |
| **FE-23** | Thanh toán thiếu tiền (Underpaid) | Hiển thị thông báo trả thiếu và cập nhật QR cho số tiền còn lại. |
| **FE-24** | Thanh toán thành công (Paid) | Polling nhận status paid $\rightarrow$ chuyển sang `OrderSuccessScreen`. |
| **FE-25** | Đơn hàng hết hạn thanh toán online | Giữ nguyên trang, giữ mã thanh toán và tiền, thông báo đối soát hoàn tiền. |
| **FE-26** | Đơn hàng bị huỷ thủ công online | Giữ nguyên trang, giữ mã thanh toán và tiền, thông báo đối soát hoàn tiền. |
| **FE-27** | Đơn hàng tạm giữ kho (`on_hold`) | Hiển thị thông báo tạm giữ kho, **KHÔNG hiện "Đặt hàng thành công"**. |
| **FE-28** | Khôi phục đơn hàng qua Resume URL | Truy cập `/checkout?code=...` khôi phục đúng trạng thái và mã QR. |
| **FE-29** | Áp dụng mã giảm giá (Coupon) | Báo giá BE trừ đúng số tiền, phản ánh giá cuối cùng. |
| **FE-30** | Mua gói combo hộp quà | Tính đúng giá combo và danh sách quà tặng kèm theo. |
| **FE-31** | Xử lý lỗi 503 từ Backend | Giao diện thông báo lỗi hệ thống kèm Request ID, KHÔNG xóa phiên. |
| **FE-32** | Phục hồi giao dịch rớt mạng (Code 91) | FE backoff lookup khôi phục đơn, không tạo đơn kép. |
| **FE-33** | Caching header khách ẩn danh | Nhận `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`. |
| **FE-34** | Caching header khách đăng nhập | Nhận `Cache-Control: private, no-store, no-cache, max-age=0`. |
| **FE-35** | Phân vùng ngôn ngữ CDN (`Vary: Cookie`) | Trả header `Vary: Accept-Encoding, Cookie` cho public catalog. |
| **FE-36** | Sitemap XML động | `/sitemap.xml` trả đầy đủ URL canonical của 42 thực thể catalog. |
| **FE-37** | Phân quyền truy cập Manager orders | Merchant chỉ xem được đơn hàng của chính mình. |
| **FE-38** | Quản lý sản phẩm Manager | CRUD sản phẩm với validation chặt chẽ. |
| **FE-39** | Tùy chọn đóng gói quà tặng (Gift Wrap) | Hiển thị phụ phí gói quà và lời nhắn theo báo giá BE. |
| **FE-40** | Khả năng tiếp cận cơ bản | Tab, Enter, Esc hoạt động trên các modal và dialog. |

### 9.2 Bảng Ánh Xạ Lộ Trình ST01–ST40
Phân loại mức độ kiểm chứng giữa FE Local, Staging và các ca Chưa Phủ:

| Nhóm phạm vi | Danh sách kịch bản ST | Ghi chú kiểm chứng |
| :--- | :--- | :--- |
| **Đã phủ bằng FE Local** | ST02, ST03, ST04, ST05, ST06, ST07, ST11, ST12, ST13, ST14, ST15, ST16, ST17, ST18, ST19, ST20, ST21, ST22, ST23, ST27, ST28, ST29, ST30, ST32, ST33, ST34, ST35, ST36 | Đã có unit test, integration test hoặc kịch bản Playwright E2E chạy trên local fixture. |
| **Cần BE / Staging Live** | ST01, ST08, ST09, ST10, ST24, ST25, ST26, ST31, ST37, ST38, ST39 | Cần hạ tầng thật: SMS/Email OTP (ST01), DB multi-tenant (ST08-09), VietQR banking webhook (ST24-26), Subscription billing (ST31), CDN Edge Proxy thật (ST37-38). |

> [!IMPORTANT]
> **Danh sách các ca CHƯA PHỦ (Uncovered Edge Cases):**
> 1. Webhook ngân hàng gửi trùng lặp hoặc khách chuyển thừa tiền so với đơn.
> 2. Hết hạn cạnh tranh tiền (race condition giữa timeout hết hạn và khách vừa chuyển khoản xong).
> 3. Hoàn tiền thực tế (Refund) và đối soát tiền thu hộ COD ngoài đời thực.
> 4. Gói đăng ký định kỳ (Subscription) snapshot kỳ thanh toán và hủy gia hạn tự động.
> 5. Báo cáo tài chính Merchant và bảng đối soát doanh thu Admin thực tế.
> 6. Vượt hạn ngạch (Rate Limit / Quota Exceeded) ngay sau khi gọi lệnh Create đơn.
> 7. Payload JSON hỏng hoặc phản hồi schema legacy từ các phiên bản BE cũ.
> 8. Thực thi chính sách bảo mật XSS / CSP Enforce tại CDN / Edge Proxy.
> 9. Mạng mất kết nối kéo dài nhiều giờ hoặc chập chờn liên tục ngoài đời thực.
> 10. Trình duyệt thực tế đa dạng (WebKit trên iOS, Safari macOS, Firefox Android).
> 11. Tải lại trang (Reload) khi máy chủ cập nhật bản mới hoặc khi FE thực hiện rollback cache invalidation.

---

## 10. Bảng Đối Chiếu Bằng Chứng Cho Các Điều Kiện Duyệt (D1–D6)

| Điều kiện | Yêu cầu kỹ thuật | Bằng chứng kiểm chứng cụ thể | Kết quả |
| :--- | :--- | :--- | :---: |
| **D1(a)** | `git apply --check` phải pass | Toàn bộ diff của D1 đã được kiểm tra trên bản sao tạm với `git apply --check` thành công 100%. | **ĐẠT** |
| **D1(b)** | BE trả `paid` + `on_hold` KHÔNG hiện "Đặt hàng thành công" | `src/app/services/api/Checkoutpageservice.js:33-42`: `readOrderStatus` kiểm tra `isOnHold` trước `isPaid`. Test `QR-06` trong `tests/qrPayment.test.cjs` xác nhận hiển thị thông báo tạm giữ kho. | **ĐẠT** |
| **D1(c)** | Hết hạn/huỷ online giữ trang + mã + tiền; thông điệp chuẩn BE | `src/app/hook/checkout/useCheckout.js:296-302` và `PaymentStep.js:154-162`: Giữ nguyên URL `/checkout`, mã thanh toán và số tiền; thông báo vào quy trình đối soát hoàn tiền, không hứa auto-update. | **ĐẠT** |
| **D1(d)** | Không đụng request key/body/hash, create/confirm, storage, giỏ | Git diff của D1 được giới hạn nghiêm ngặt ở parser trạng thái và polling logic; giữ nguyên 100% logic tạo key, lookup backoff và tính toán giỏ hàng. | **ĐẠT** |
| **D1(e)** | Test mới có assertion thật (không stub) | `tests/qrPayment.test.cjs` có 13 test cases độc lập với đầy đủ `assert.strictEqual` trên các trường dữ liệu thực tế. | **ĐẠT** |
| **D1(f)** | F02 (32 checks), F06 (20 checks), F07 (10 lượt) xanh | `node scripts/run-f02-suite.cjs` (Exit code 0, 32/32 pass); `node scripts/run-f06-suite.cjs` (Exit code 0, 20/20 pass); `node scripts/run-f07-smoke.cjs --repeat 10` (Exit code 0, 10/10 runs pass). | **ĐẠT** |
| **D2** | Tên cookie phiên ở BE; test header ẩn danh, locale, đã đăng nhập | BE đặt cookie phiên tại `src/controllers/authController.js:105, 116` với tên **`token`** và **`refreshToken`**. Test header thực thi qua `scripts/verify-f03b-live.cjs` (checks 4, 5, 6) xác nhận: ẩn danh nhận public cache; có cookie nhận `private, no-store`; cookie `TOTMART_LOCALE` kích hoạt `Vary: Cookie`. | **ĐẠT** |
| **D3** | Giữ query string, không tạo vòng lặp, status 308 | Chuyển hướng canonical sử dụng `permanentRedirect` (HTTP 308) trong slug pages (`products/[slug]`, `brands/[slug]`, `categories/[id]`, `box/[id]`), giữ nguyên search params; test check 3 trong F03b pass. | **ĐẠT** |
| **D4** | `curl` HTML thô chứng minh tên + giá nằm trong markup chính | `scripts/verify-f03b-live.cjs` (check 1) cào trực tiếp HTML SSR từ Next.js: `<h3>` tên sản phẩm và `<span>` giá tiền nằm ngay trong thẻ `<main>`, không phụ thuộc JavaScript. | **ĐẠT** |
| **D5** | 100ms đo hay ước lượng; test merchant / khách / admin | 100ms là thời gian chuyển hướng tức thì được đo đạc trong `MerchantRedirectGuard.jsx` thông qua `useEffect`; kiểm thử E2E Playwright (`scripts/f06-browser-e2e.cjs` test 4, 5, 6) xác nhận merchant bị chuyển hướng an toàn, khách ẩn danh và admin không bị ảnh hưởng. | **ĐẠT** |
| **D6** | localStorage bị chặn: nút Thêm vào giỏ vẫn dùng được (in-memory) | Module `safeStorage` tự động fallback sang biến in-memory khi gặp `QuotaExceededError` hoặc khi storage bị vô hiệu hóa; `isMounted` thành true và `isReady` đảm bảo nút Thêm vào giỏ hoạt động bình thường (`ProductPurchasePanel.js:16`). | **ĐẠT** |

---

## 11. Kế Hoạch Quay Lui & Biện Pháp Khắc Phục (Rollback Plan)

Trường hợp cần quay lui các thay đổi của đợt phát hành Release Candidate:

### 11.1 Nguyên Tắc An Toàn Working Tree
> [!CAUTION]
> **TUYỆT ĐỐI KHÔNG DÙNG** lệnh `git checkout HEAD -- ...` trên working tree chưa commit vì lệnh này sẽ xóa sạch toàn bộ mã nguồn của các phase trước (F01–F07). Hiện tại toàn bộ 51 tệp đã được Owner commit thành công vào nhánh `fe/rc-f08`.

### 11.2 Các Phương Án Quay Lui
1. **Phương án 1: Quay lui toàn bộ về nhánh base `fe/f-fix`**
   - Chuyển nhánh về base sạch:
     ```powershell
     git checkout fe/f-fix
     ```
   - Xác nhận working tree sạch tại commit `3ddb8dad7456cc2c5670643fc77014399c7f7001`.

2. **Phương án 2: Quay lui theo nhóm commit bằng `git revert`**
   - Khi cần hủy bỏ từng tính năng riêng biệt trên nhánh `fe/rc-f08`:
     - Revert tài liệu: `git revert 59ccbee`
     - Revert giao diện UI/UX: `git revert 4e3f8b3`
     - Revert SEO & Rendering: `git revert b2006bf`
     - Revert Checkout & Polling: `git revert 1c9299e`
     - Revert CI & Tooling: `git revert 63ad217`

3. **Phương án 3: Khôi phục cục bộ tệp tin (Nếu có tệp untracked)**
   - Mọi thao tác xóa hoặc checkout tệp có chứa dấu ngoặc trong đường dẫn bắt buộc phải đặt trong dấu nháy kép:
     ```powershell
     git checkout HEAD -- "src/app/(client)/MerchantRedirectGuard.jsx" "src/app/not-found.jsx"
     ```

---

## 12. Kết Luận & Điều Kiện Mở Gate F08

> ### **TRẠNG THÁI GATE F08: BLOCKED**
>
> Tuyệt đối **KHÔNG** tự ý chuyển trạng thái sang PASS hoặc READY. Gate F08 bị chặn bởi 4 nguyên nhân cốt lõi sau:

1. **Remote CI trên GitHub Actions chưa chạy:** Quy tắc chất lượng bắt buộc pipeline CI từ xa (`.github/workflows/e2e.yml`) phải chạy và xanh 100% trên commit SHA chính thức (`59ccbee`) của FE và commit BE ghim (`e31517d`). Mọi kết quả kiểm thử trên local chỉ là bằng chứng hỗ trợ, không thể thay thế cho Remote CI.
2. **Điểm Rubric tạm tính 81/100 (Dưới mức sàn 85/100):** Cả 3 tiêu chí cốt lõi (Tiêu chí 3: 20/25, Tiêu chí 5: 10/15, Tiêu chí 6: 2/5) đều đang nằm dưới mức sàn yêu cầu. Mục 5 chỉ được xem xét nâng điểm sau khi có kết quả Remote CI xanh.
3. **Ma trận rủi ro P2 & Kiểm toán chuỗi cung ứng chờ Owner phê duyệt:** Các rủi ro về devDependencies, rủi ro token trong CI runner và độ trễ CDN Staging (~6 phút) cần được Owner chính thức xem xét, điền quyết định và chỉ định nhân sự chịu trách nhiệm.
4. **Ngân sách hiệu năng người dùng mới (Cold Navigation Mobile) chờ Owner ký duyệt:** Số liệu lab FCP mobile 1.1–2.0s cần được Owner đánh giá về mặt trải nghiệm người dùng trước khi phát hành chính thức ra môi trường production.
