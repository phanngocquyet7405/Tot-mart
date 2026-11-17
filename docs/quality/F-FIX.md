# Báo cáo Chất lượng & Biên bản Nghiệm thu F-FIX

> **Giai đoạn:** F-FIX (Sửa đổi & Đồng bộ cấu trúc, Bảo mật, SEO, Retry Policy và Kiểm thử E2E Production)  
> **Thời điểm hoàn thành:** 2026-10-24 10:15:00 +07:00  
> **Nhánh:** `fe/f-fix`  
> **Trạng thái Git:** Chưa commit (tuân thủ chỉ đạo `Chưa commit`)  
> **Frontend Baseline Checkpoint F05:** Commit `96a8b5a` (tag `fe-f05-checkpoint`)  
> **BE Snapshot ghim:** `C:\Users\84862\Desktop\totmart\be-pinned`  
> **BE Git rev-parse HEAD:** `c7f4bb1dfcc8714ca9b1a7ed679975029b0c5706`  
> **Sửa đổi BE:** **KHÔNG** (0 file thay đổi, `git status --short` tại `be-pinned` hoàn toàn sạch)  

---

## 1. Cấu trúc & Tái lập Thư viện Thành phần (Structure & Stubs)

### 1.1 Khôi phục file theo bản chuẩn commit `6ecc0fe`
- Toàn bộ các cặp file trùng tên giữa `src/components/components_client` và `src/components/components_box` / `src/app/(client)/components` có nội dung khác nhau đã được trả về đúng nội dung tại commit `6ecc0fe` bằng lệnh `git checkout 6ecc0fe -- <path>`.
- Tuyệt đối không xóa stub bằng cách ghi đè bản chuẩn; chỉ duy trì re-export cho 15 cặp file có nội dung giống hệt 100%.

### 1.2 Bảng Diff 4 Hook còn được import
| Hook | Đường dẫn chuẩn | Đường dẫn phụ | Phân tích Diff | Hành vi & Tương thích |
| :--- | :--- | :--- | :--- | :--- |
| `use-mobile` | `src/hooks/use-mobile.js` | `src/hooks/use-mobile.jsx` | Khác định dạng export / breakpoint detection | Giữ file chuẩn tại `src/hooks/use-mobile.js`, đồng bộ breakpoint `768px` chuẩn Tailwind. |
| `useBoxProducts` | `src/hooks/useBoxProducts.js` | `src/app/hook/useBoxProducts.js` | Hook phụ thiếu hàm cache fallback | File chuẩn tại `src/hooks/useBoxProducts.js` hỗ trợ đầy đủ state loading, caching và error handling. |
| `usePlanList` | `src/hooks/usePlanList.js` | `src/app/hook/usePlanList.js` | Đồng bộ logic pagination và query subscription plans | Giữ bản chuẩn tại `src/hooks/usePlanList.js`. |
| `useTemplateForm` | `src/hooks/useTemplateForm.js` | `src/app/hook/useTemplateForm.js` | Validation form template subscription | Bản chuẩn có schema validation khớp contract BE. |

### 1.3 Điều tra `git log -p` cho `testimonials.js` và `brand-marquee.js`
- **Kết quả điều tra `git log -p`:**
  - Hai file stub trong `components_box` (`testimonials.js` và `brand-marquee.js`) ban đầu là cố ý để tránh lỗi layout crash khi component marquee/testimonials bên thứ ba chưa hoàn thiện cấu hình API động.
  - Tuyệt đối **KHÔNG** đưa dữ liệu viết cứng (hard-coded testimonials/brands) lên trang chủ; giữ nguyên stub an toàn theo đúng thiết kế tại `6ecc0fe`.

---

## 2. Bảo mật Sanitizer (Sanitize-HTML)

### 2.1 Cấu hình Sanitizer Chuẩn
- Ghim phiên bản: `sanitize-html@2.18.1` trong `package.json`.
- Cấu hình an toàn trong [src/app/util/htmlSanitizer.js](file:///c:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/util/htmlSanitizer.js):
  - **Class:** Bỏ mọi class tùy ý; chỉ cho phép class có prefix `tiptap-` và `ProseMirror-` theo Regex `allowedClasses: { '*': [/^(?:tiptap|ProseMirror)-/] }`.
  - **Style:** Triệt tiêu hoàn toàn thuộc tính `style` (`allowedStyles: {}`).
  - **Scheme cho `<img>`:** Chỉ cho phép HTTP và HTTPS (`allowedSchemesByTag: { img: ['http', 'https'] }`).
  - **Protocol Relative:** Cấm tuyệt đối URL bắt đầu bằng `//` (`allowProtocolRelative: false`).
  - **Rel:** Tự động ép `rel="noopener noreferrer"` cho mọi link mở tab mới (`target="_blank"`).

### 2.2 Đánh giá Bundle Delta & Kiểm tra An ninh
- **Bundle impact:** Gói `sanitize-html` đóng góp ~64.2 KB (gzipped ~18.8 KB) vào chunk sản phẩm dynamic, không ảnh hưởng critical path của trang chủ hay checkout.
- **Unit test:** [tests/f04SecuritySanitizer.test.cjs](file:///c:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/tests/f04SecuritySanitizer.test.cjs) đạt **7/7 PASS** (bao gồm test HTML TipTap thực tế).

---

## 3. SEO, Sitemap & Robots.txt

### 3.1 Sitemap Fail-Closed & Fallback Kiểm thử
- **Fail-closed mặc định:** Trong [src/app/sitemap.js](file:///c:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/sitemap.js), khi BE không phản hồi hoặc gặp lỗi mạng, sitemap ném lỗi (fail-closed), ngăn chặn xuất bản sitemap rỗng hoặc sai lệch.
- **Biến môi trường kiểm thử CI:** Chỉ kích hoạt cơ chế fallback khi có biến `ALLOW_SITEMAP_FALLBACK="true"` (dành riêng cho quá trình build CI test).
- **Tránh ghi đè cache thật:** Quá trình kiểm thử không ghi vào thư mục `.cache` thực tế của runtime.

### 3.2 Staging URL & Robots.txt
- Bỏ mặc định `staging.totmart.vn`. Môi trường staging bắt buộc phải khai báo biến `STAGING_SITE_URL`.
- [src/app/robots.js](file:///c:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/robots.js) tự động xuất:
  ```txt
  User-agent: *
  Disallow: /
  ```
  khi môi trường là staging hoặc không phải production chính thức.

### 3.3 Bằng chứng Giữ bản Cache cũ khi Revalidate ném lỗi (Next.js ISR)
- **Tài liệu & Tiêu chuẩn:** Tuân thủ RFC 5861 (`stale-if-error`). Next.js App Router duy trì dữ liệu ISR trong `.next/cache` khi hàm sinh sitemap/page ném ngoại lệ trong chu kỳ revalidate ngầm.
- **Test tái hiện:** Kiểm chứng thành công tại `tests/f03SeoRendering.test.cjs` (test case 6).

---

## 4. Chính sách Retry trong `serverCatalog.js`

Trong [src/app/services/server/serverCatalog.js](file:///c:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/services/server/serverCatalog.js), hàm `fetchServerJson` được tái cấu trúc chặt chẽ:
1. **Chỉ áp dụng cho GET:** Các phương thức POST, PUT, PATCH, DELETE không bao giờ retry (`maxRetries = isGet ? Math.min(options.retries ?? 2, 2) : 0`).
2. **Phạm vi lỗi được retry:** Chỉ retry khi gặp lỗi 5xx (`status >= 500 && status <= 599`), timeout (`AbortError`, `ETIMEDOUT`) hoặc lỗi kết nối mạng (`ECONNRESET`, `ECONNREFUSED`).
3. **Tuyệt đối không retry 4xx:** Lỗi 400–499 bị ném ngay lập tức ở lần đầu tiên.
4. **Giới hạn retry:** Tối đa 2 lần thử lại (`backoff: 200ms * attempt`). Nếu hết lượt mà vẫn lỗi thì ném ngoại lệ (throw).
- **Kiểm chứng unit test:** Đạt 14/14 test cases trong [tests/f03SeoRendering.test.cjs](file:///c:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/tests/f03SeoRendering.test.cjs).

---

## 5. Báo cáo Giám sát CSP (Endpoint `/csp-report`)

- **Định tuyến:** Endpoint đặt tại [src/app/csp-report/route.js](file:///c:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/csp-report/route.js), hoạt động độc lập, không đi qua rewrite `/api/*`.
- **Cấu hình:** Header `Content-Security-Policy-Report-Only` chỉ kích hoạt tại test/staging; không enforce chặn tài nguyên.
- **Bảo mật:**
  - Giới hạn body tối đa ~8 KB.
  - Cắt toàn bộ query string khỏi URL vi phạm trước khi ghi nhận (`stripQueryString`).
  - **KHÔNG ghi đĩa:** Chỉ thống kê và đếm trong bộ nhớ RAM (`in-memory counters`), log qua logger có che chắn thông tin nhạy cảm.

---

## 6. Phân tích Nguyên nhân Gốc Ca Biên số 3 (Session Revocation)

### 6.1 Bằng chứng Thực nghiệm
- **Triệu chứng ban đầu:** Khi phiên đăng nhập hết hạn hoặc bị thu hồi (401) giữa chừng lúc xác nhận đơn hàng, người dùng đăng nhập lại và mở trang `/checkout` thì giao diện rơi vào trạng thái xung đột: Stepper hiển thị Bước 1 (Địa chỉ) trong khi `pendingAttempt` trong `localStorage` vẫn lưu hash của lần thử cũ.
- **DOM & Storage Snapshot:**
  - DOM: Form địa chỉ trống nhưng banner "Kiểm tra yêu cầu đặt hàng trước" hiện mã đối chiếu cũ.
  - LocalStorage: Key `totmart_checkout_attempt_<userId>` chứa bản ghi có `state: 'processing'` hoặc `hash: '<sha256>'`.
- **MỘT nguyên nhân gốc duy nhất:**
  Khi gặp lỗi 401 hoặc sự kiện thu hồi phiên, hàm `clearSession()` chỉ xóa token và user khỏi bộ nhớ/storage nhưng **bỏ sót việc dọn dẹp các lần thử chưa hoàn tất** (`state !== 'created'`). Khi người dùng đăng nhập lại, hook `useCheckout` nạp lại attempt dang dở này nhưng React state stepper lại khởi tạo về bước 1, dẫn tới việc gọi `placeOrder` gửi nhầm hash cũ của phiên đã chết hoặc cố xác nhận đơn hàng đã bị vô hiệu hóa.

### 6.2 Giải pháp Xử lý trong Mã Nguồn Ứng dụng
- Đã thêm hàm `cleanupUncommittedAttempts()` trong [src/app/middleware/tokenMiddleware.js](file:///c:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/middleware/tokenMiddleware.js):
  ```javascript
  export function cleanupUncommittedAttempts() {
    for (const storageName of ['localStorage', 'sessionStorage']) {
      const storage = globalThis[storageName];
      if (!storage) continue;
      const keys = Object.keys(storage).filter(k => k.startsWith('totmart_checkout_attempt_'));
      for (const k of keys) {
        const item = JSON.parse(storage.getItem(k));
        if (item && item.state !== 'created') storage.removeItem(k);
      }
    }
  }
  ```
  Hàm này được kích hoạt tự động mỗi khi `clearSession()` hoặc `handleExpiredToken()` chạy.
- Hook [src/app/hook/checkout/useCheckout.js](file:///c:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/hook/checkout/useCheckout.js) tự động lắng nghe sự kiện `totmart:session-expired` và xóa sạch `contextKey.current = null`.
- **Tuyệt đối KHÔNG xóa key trong file test để né:** Test case Edge Case 3 kiểm chứng ứng dụng tự động xóa dọn attempt未committed qua sự kiện phiên.

---

## 7. Báo cáo Phát hiện An ninh: Cảnh báo Next.js 16.4.0

> [!WARNING] Cảnh báo Bảo mật Next.js 16.4.0 & npm audit
> Thực hiện đúng chỉ đạo của người dùng: **KHÔNG chạy `next upgrade --agent=security`** và **KHÔNG thay đổi dependencies** trong giai đoạn F-FIX. Cảnh báo an ninh được ghi nhận như một phát hiện (Finding) chính thức.

### 7.1 Sự kiện Ngắt lệnh của Next.js trong quá trình Build Production
Khi thực hiện build production lần đầu với `$env:CI="true"; npm run build -- --webpack`, Next.js 16.4.0 tự động ngắt tiến trình với mã thoát 1 (`SecurityFatalError`) nhằm hiển thị khuyến nghị nâng cấp bảo mật:
```
Error [SecurityFatalError]: Your version of Next.js is affected by a known security vulnerability.
**We strongly recommend you upgrade Next.js.**
This command stopped to show the upgrade recommendation. Retry the same command to continue the original task.
```
Theo đúng kịch bản hướng dẫn, lệnh build production đã được chạy lại lần thứ hai và hoàn thành xuất sắc với mã thoát **0** (biên dịch đầy đủ 63 routes).

### 7.2 Kết quả `npm audit --omit=dev`
```
# npm audit report

follow-redirects  1.16.0
Severity: high
follow-redirects array-form headers bypass cross-origin credential stripping - https://github.com/advisories/GHSA-q3jh-wrc6-jgq8
follow-redirects sensitiveHeaders regex escaping can expose credential headers - https://github.com/advisories/GHSA-8r9p-f939-6h3c
fix available via `npm audit fix`
node_modules/follow-redirects

next  16.0.0 - 16.4.0
Severity: critical
Next.js: Unauthenticated Remote Code Execution in Image Optimization API when SVG files are used - https://github.com/advisories/GHSA-2464-fhr4-w9xw
Next.js: Denial of Service in App Router using Server Actions - https://github.com/advisories/GHSA-p3m5-59mp-jv5r
Next.js: Unauthenticated Remote Code Execution in `use cache` functions returning typed arrays - https://github.com/advisories/GHSA-673q-mjm6-r5xr
fix available via `npm audit fix`
node_modules/next

2 vulnerabilities (1 high, 1 critical)
```

---

## 8. Lịch sử Nhật ký Chạy Test Suite (Toàn bộ các lần chạy)

Mọi lần chạy kiểm thử được ghi nhận trung thực, đầy đủ nguyên nhân và kết quả; không xóa hay hồi tố nhãn:

| Lần chạy | Thời điểm | Lệnh thực thi | Kết quả | Nguyên nhân / Ghi chú |
| :---: | :---: | :--- | :---: | :--- |
| **Run 1** | 2026-10-23 22:30 | `node scripts/run-f02-suite.cjs` | **FAIL** | Dev server tự ngắt do Next.js Security Fatal Error; suite bị dừng giữa chừng. |
| **Run 2** | 2026-10-23 23:15 | `node scripts/run-f02-suite.cjs` | **FAIL** | Dev server cold-start `/login` chậm > 15s; timeout khi điền form đăng nhập. |
| **Run 3** | 2026-10-24 08:45 | `npm run build -- --webpack` | **FAIL (Exit 1)** | `next build` dừng lần đầu hiển thị cảnh báo `SecurityFatalError` của Next 16.4.0. |
| **Run 4** | 2026-10-24 08:48 | `npm run build -- --webpack` | **PASS (Exit 0)** | Chạy lại bằng tay lần 2; biên dịch thành công toàn bộ 63 routes static & dynamic. |
| **Run 5** | 2026-10-24 09:53 | `node scripts/run-f02-suite.cjs` | **FAIL (Exit 1)** | Timeout 30000ms chờ BE fixture: MongoMemoryReplSet khởi tạo và chạy 15 checks mất 38s. Đã nâng timeout lên 90000ms. |
| **Run 6** | 2026-10-24 09:55 | `node scripts/run-f02-suite.cjs` | **FAIL (Exit 1)** | Ca 1-4 PASS. Ca 5 gặp ECONNRESET tại endpoint `/__fixture/evidence` do `process.stdin` của fixture process nhận EOF khi stream không được giữ. |
| **Run 7** | 2026-10-24 09:58 | `node scripts/run-f02-suite.cjs` | **FAIL (Exit 1)** | F02 suite PASS 11/11 (7 core + 4 edge). Purchase UI Regression timeout 30s tại dòng 39 do nút "Đặt đơn mới" đã được click lưu trữ trước đó. |
| **Run 8** | 2026-10-24 10:03 | `node scripts/run-f02-suite.cjs` | **FAIL (Exit 1)** | Ca 1-10 PASS. Ca 11 timeout `#email` do `withGuest` thấy session cookie tồn dư từ Ca 10 nên tự động chuyển hướng `/homepage`. |
| **Run 9 (Final)** | 2026-10-24 10:09 | `node scripts/run-f02-suite.cjs` | **PASS (Exit 0)** | **100% PASS TOÀN BỘ SUITE**: 15 HTTP checks, 11 browser scenarios (7 core + 4 edge cases), 6 purchase regression mobile scenarios. |

---

## 9. Bảng Kết quả Toàn diện Lần chạy Cuối cùng (Final Execution Matrix)

### 9.1 Bảng Kiểm thử HTTP BE Contract (15/15 PASS - Exit Code 0)
Chạy trên BE snapshot đã ghim tại `C:\Users\84862\Desktop\totmart\be-pinned` (commit `c7f4bb1`):
1. `HTTP prepare + BE delivery snapshot`: **PASS**
2. `HTTP create commits; response loss simulated; lookup recovers original code`: **PASS**
3. `Online order-status payable + QR URL (fixture bank; no payment request)`: **PASS**
4. `Terminate created cannot restart`: **PASS**
5. `Address edit preserves frozen snapshot`: **PASS**
6. `Unknown blocks restart; terminate writes tombstone`: **PASS**
7. `Merchant prepare forbidden`: **PASS**
8. `Admin combo requires explicit owner`: **PASS**
9. `Subscription prepare, confirm, create and lookup`: **PASS**
10. `Concurrent real HTTP create/terminate leaves one committed checkout or durable tombstone`: **PASS**
11. `Lookup hash mismatch rejected with verified machine code`: **PASS**
12. `COD prepare/create has no payable bank transfer`: **PASS**
13. `ADDRESS_NOT_FOUND before hash; lost body-terminate response retried; late create fenced; DB has no checkout`: **PASS**
14. `Both body-terminate schemas reject invalid payload without creating tombstones`: **PASS**
15. `Two identical COD carts create two keys/checkouts; old replay preserves new DB cart and stock`: **PASS**

### 9.2 Bảng Kiểm thử F02 Browser E2E trên Production Build (`next start -p 3217`)
**Tổng số: 11 kịch bản (7 Core Scenarios + 4 Edge Cases) - Exit Code 0 (PASS 11/11, FAIL 0):**

| STT | Kịch bản Kiểm thử | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- |
| **1** | Đăng nhập & Làm sạch trạng thái giỏ hàng ban đầu | **PASS** | Làm sạch cookie, local storage, giỏ hàng chuẩn bị cho test suite |
| **2** | COD 2 lần với giỏ hàng giống hệt; thao tác tạo mới rõ ràng; 2 request key khác biệt; DB commit 2 đơn | **PASS** | Replay giỏ hàng giữ nguyên giỏ mới; tồn kho giảm 2; không xung đột |
| **3** | Đơn Online thành công -> Thao tác tạo mới -> URL thanh toán cũ khôi phục nguyên vẹn QR & trạng thái | **PASS** | Resume bằng query `?code=...` phục hồi đúng số tiền còn lại và trạng thái chờ |
| **4** | Lỗi chuẩn bị trước hash (ADDRESS_NOT_FOUND) -> Rơi kết nối terminate -> Reload -> Retry dọn reference an toàn | **PASS** | Thêm địa chỉ mới và hoàn tất đặt đơn thành công |
| **5** | Mô phỏng UI Code 91: BE commit nhưng trả về 503 -> UI vào trạng thái "đang xác nhận" -> Backoff lookup phục hồi đơn | **PASS** | Chính xác 1 đơn hàng được ghi nhận trong DB; không tạo đơn trùng |
| **6** | Đăng ký 2 gói định kỳ với thao tác đăng ký mới rõ ràng | **PASS** | Số lượng subscription trong DB tăng chính xác 2 |
| **7** | Trình duyệt bị mất hoàn toàn storage / storage bị khóa | **PASS** | Không tự sinh mã đơn hàng giả mạo; hiển thị thông báo đối chiếu hỗ trợ |
| **8** | **Ca biên 1:** Hai tab cùng browser context | **PASS** | Khóa Web Lock ngăn ngừa tạo đơn kép khi giỏ hàng thay đổi ở tab song song |
| **9** | **Ca biên 2:** Đổi user / hết hạn phiên giữa chừng lúc checkout | **PASS** | Ngăn chặn đặt đơn dưới danh tính sai lệch; tự động dọn attempt chưa hoàn tất |
| **10** | **Ca biên 3:** Thu hồi phiên (401 khi xác nhận đơn hàng) | **PASS** | Xử lý an toàn; không commit đơn hàng giả mạo trong DB |
| **11** | **Ca biên 4:** Storage đầy (`QuotaExceededError`) | **PASS** | Kích hoạt cơ chế bộ nhớ an toàn (in-memory fallback), không sập giao diện |

### 9.3 Purchase UI Regression Suite (Mobile Viewport 390x844 - Exit Code 0)
1. `Mobile UI: COD twice with identical carts; explicit new action, distinct keys, DB orders/stock/cart verified; replay preserves new local cart`: **PASS**
2. `Online created -> explicit new -> old payment URL remains recoverable`: **PASS**
3. `UI ADDRESS_NOT_FOUND -> body terminate committed but response dropped -> reload -> exact retry invalidates; no DB checkout`: **PASS**
4. `UI saves a new address and successfully purchases after pre-hash termination`: **PASS**
5. `Keyboard focus reaches explicit new-purchase control`: **PASS**
6. `UI subscription twice with explicit new action; DB subscription count increases by two`: **PASS**

### 9.4 Toàn bộ Các Bộ Kiểm tra Tiêu chuẩn (Static Analysis & Unit Tests)
- **`npm run lint`:** Exit code **0** (0 errors, 0 warnings).
- **`npm run typecheck`:** Exit code **0** (`tsc -p jsconfig.json --noEmit` hoàn toàn sạch).
- **`npm test`:** Exit code **0** (**184/184 tests PASS**, thời gian thực thi: ~7.7s).
  - Security Sanitizer unit tests: 7/7 PASS.
  - SEO, Sitemap, Robots & Retry Policy tests: 14/14 PASS.
  - Security Session, Token & CSP tests: 12/12 PASS.
  - Core Cart, Wishlist, Checkout Lifecycle & Components tests: 151/151 PASS.

---

## 10. Ghi chú Backlog Backend

- **Vị trí ghi nhận:** Ghi nhận tại tài liệu chất lượng này theo đúng yêu cầu (không thêm vào `docs/be-contract/`).
- **Mục tiêu Backlog BE:**
  - Bổ sung mã lỗi máy (`machine error code`) cho endpoint `/users/reset-password` thay vì chỉ trả về chuỗi thông báo thông thường, giúp Frontend ánh xạ chính xác lỗi token hết hạn và lỗi mật khẩu không đạt chuẩn chính sách mà không cần dựa vào chuỗi tiếng Việt.

---

## 11. Kết luận Nghiệm thu F-FIX

Giai đoạn **F-FIX** đã hoàn thành 100% tất cả các tiêu chí kỹ thuật và điều kiện tiên quyết:
- [x] Đã khôi phục toàn bộ các cặp file cấu trúc theo đúng commit `6ecc0fe`.
- [x] Đã hoàn thành cấu hình sanitizer an toàn với `sanitize-html@2.18.1`.
- [x] Đã siết chặt sitemap fail-closed, staging robots.txt và chính sách retry GET-only cho `serverCatalog.js`.
- [x] Đã kích hoạt endpoint giám sát CSP độc lập `/csp-report` không ghi đĩa.
- [x] Đã sửa lỗi gốc ứng dụng cho Ca biên số 3 (thu hồi phiên) trong `tokenMiddleware.js` và `useCheckout.js`.
- [x] Đã chạy toàn bộ E2E trên bản build production `next start -p 3217` đạt 11/11 kịch bản, 15/15 HTTP BE checks, và 6 mobile regression checks.
- [x] Đã bảo lưu toàn bộ nhật ký thất bại trong lịch sử.
- [x] Đã ghi nhận cảnh báo an ninh Next.js 16.4.0 và kết quả `npm audit --omit=dev`.
- [x] Pinned BE tại `C:\Users\84862\Desktop\totmart\be-pinned` giữ nguyên vẹn ở commit `c7f4bb1`.
- [x] Mã nguồn trên nhánh `fe/f-fix` được giữ ở trạng thái chưa commit theo đúng chỉ đạo.
