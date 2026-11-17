# Báo cáo Chất lượng & Biên bản Nghiệm thu FE-SEC: Xử lý Lỗ hổng npm audit

> **Giai đoạn:** FE-SEC (Chỉ xử lý lỗ hổng npm audit, không thêm tính năng)  
> **Thời điểm hoàn thành:** 2026-10-24 18:30:00 +07:00  
> **Trạng thái Git:** Chưa commit (tuân thủ tuyệt đối chỉ đạo `Không commit`)  
> **Nhánh làm việc:** `fe/f-fix`  
> **Frontend Baseline Checkpoint:** Commit `96a8b5a` (Bảo toàn toàn bộ mã nguồn working tree chưa commit từ F-FIX / F-FIX2)  
> **BE Snapshot ghim:** `C:\Users\84862\Desktop\totmart\be-pinned` (`c7f4bb1dfcc8714ca9b1a7ed679975029b0c5706`, 0 file thay đổi)  

---

## 1. Kết quả Kiểm toán npm audit & Đề xuất Bản vá

### 1.1 Hiện trạng Trước Nâng cấp (`npm audit --omit=dev`)
- **Dependencies production được kiểm tra:** 219 packages
- **Tổng số lỗ hổng tìm thấy:** 2 vulnerabilities (1 High, 1 Critical)
- Không có lỗ hổng Moderate, Low hoặc Info trong production scope.

### 1.2 Chi tiết từng Advisory (GHSA)

| Package | Severity | Advisory ID | Tiêu đề Lỗ hổng | Phiên bản ảnh hưởng | CWE | Bản vá tối thiểu |
| :--- | :---: | :--- | :--- | :---: | :---: | :---: |
| **`next`** (Direct) | **Critical** | [GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw) | Next.js: Unauthenticated Remote Code Execution in Image Optimization API when SVG files are used | `>=16.0.0 <=16.4.0` | CWE-1395 | `16.4.1` |
| **`next`** (Direct) | **High** | [GHSA-p3m5-59mp-jv5r](https://github.com/advisories/GHSA-p3m5-59mp-jv5r) | Next.js: Denial of Service in App Router using Server Actions | `>=16.0.0 <=16.4.0` | CWE-770 | `16.4.1` |
| **`next`** (Direct) | **Critical** | [GHSA-673q-mjm6-r5xr](https://github.com/advisories/GHSA-673q-mjm6-r5xr) | Next.js: Unauthenticated Remote Code Execution in `use cache` functions returning typed arrays | `>=16.0.0 <=16.4.0` | CWE-502 | `16.4.1` |
| **`follow-redirects`** (Indirect qua `axios`) | **High** | [GHSA-q3jh-wrc6-jgq8](https://github.com/advisories/GHSA-q3jh-wrc6-jgq8) | follow-redirects array-form headers bypass cross-origin credential stripping | `>=1.16.0 <1.16.1` | CWE-200, CWE-212 | `1.16.1` |
| **`follow-redirects`** (Indirect qua `axios`) | **High** | [GHSA-8r9p-f939-6h3c](https://github.com/advisories/GHSA-8r9p-f939-6h3c) | follow-redirects sensitiveHeaders regex escaping can expose credential headers | `>=1.16.0 <1.16.1` | CWE-185, CWE-200 | `1.16.1` |

### 1.3 Xác minh Phiên bản Nâng cấp
1. **Xác nhận `npm view next@16.4.3`:**
   - **Phiên bản:** `16.4.3`
   - **Dist-tag:** `'latest': '16.4.3'` (Chính thức, **KHÔNG PHẢI canary hoặc rc**)
   - **Thời điểm phát hành:** `2026-10-23T13:40:24.922Z`
   - **Ghim phiên bản:** Ghim chính xác `"next": "16.4.3"` trong [package.json](file:///c:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/package.json) (đã loại bỏ ký tự `^`).
2. **Xác nhận `follow-redirects@1.16.1`:**
   - **Phiên bản:** `1.16.1`
   - **Phụ thuộc gián tiếp từ:** `axios@1.20.0` (khai báo `"follow-redirects": "^1.16.0"`, thỏa mãn hoàn toàn semver).
   - **Không nâng `axios`** hay bất kỳ thư viện nào khác.
3. **Kiểm tra `eslint-config-next` & `@next/*`:**
   - `eslint-config-next` giữ nguyên `16.2.2` (chỉ phụ thuộc peer vào `eslint >=9.0.0` và `typescript >=3.3.1`, không yêu cầu cùng version với `next`).
   - Các gói nội bộ bắt buộc đi kèm theo `next@16.4.3` gồm:
     - `@next/env`: `16.4.3`
     - `@next/swc-win32-x64-msvc`: `16.4.3` (cùng các optional native binaries khác cho darwin/linux/arm64).

---

## 2. Đánh giá Mức độ Phơi nhiễm của Ứng dụng (Exposure Assessment)

| Yếu tố Rà soát | Cấu hình & Hiện trạng Mã nguồn | Đánh giá Mức độ Phơi nhiễm |
| :--- | :--- | :---: |
| **1. `images.dangerouslyAllowSVG`** | Trong [next.config.mjs](file:///c:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/next.config.mjs), `dangerouslyAllowSVG` **KHÔNG được kích hoạt** (mặc định của Next.js là `false`). Cấu hình `images.remotePatterns` chỉ cho phép các CDN cố định (`res.cloudinary.com`, `images.unsplash.com`, `qr.sepay.vn`, `img.vietqr.io`). Không hỗ trợ xử lý SVG từ xa qua Image Optimization API. | **KHÔNG PHƠI NHIỄM TRỰC TIẾP** (với GHSA-2464-fhr4-w9xw) |
| **2. Chỉ thị `'use cache'`** | Rà soát toàn bộ source code (`src/`, `components/`, `app/`): **0 kết quả** sử dụng chỉ thị `'use cache'`. | **KHÔNG PHƠI NHIỄM** (với GHSA-673q-mjm6-r5xr) |
| **3. Server Actions (`"use server"`)** | Tệp [src/app/actions/setLocale.js](file:///c:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/actions/setLocale.js) sử dụng chỉ thị `"use server"` định nghĩa Server Action `setLocale`, phục vụ đổi ngôn ngữ client và kích hoạt `revalidatePath("/", "layout")`. Endpoint action này mở công khai. | **CÓ PHƠI NHIỄM (EXPOSED)** (với GHSA-p3m5-59mp-jv5r - DoS Server Actions) |
| **4. `follow-redirects` (qua `axios`)** | `axios` được ứng dụng sử dụng làm HTTP client chính cho toàn bộ giao tiếp backend. Khi gặp redirect cross-origin, credential headers có nguy cơ bị lộ. | **CÓ NGUY CƠ PHƠI NHIỄM (HIGH RISK)** (với GHSA-q3jh-wrc6-jgq8, GHSA-8r9p-f939-6h3c) |

> [!IMPORTANT]
> **Khẳng định nguyên tắc an ninh:** Dù ứng dụng không phơi nhiễm trực tiếp với lỗ hổng SVG RCE và `use cache` RCE nhờ cấu hình an toàn, ứng dụng **thực sự phơi nhiễm** với lỗ hổng DoS qua Server Action `setLocale` và rò rỉ header qua `follow-redirects`. Thực hiện đúng chỉ đạo: **Kể cả khi không phơi nhiễm vẫn nâng bản vá đầy đủ.**

---

## 3. So sánh package.json và package-lock.json Trước/Sau

### 3.1 So sánh `package.json`
```diff
--- a/package.json
+++ b/package.json
@@ -32,7 +32,7 @@
     "framer-motion": "^12.38.0",
     "jwt-decode": "^4.0.0",
     "lucide-react": "^1.8.0",
-    "next": "^16.2.4",
+    "next": "16.4.3",
     "next-intl": "^4.13.7",
     "next-themes": "^0.4.6",
     "radix-ui": "^1.4.3",
```

### 3.2 So sánh `package-lock.json`
Chỉ thay đổi đúng 2 nhóm gói theo kế hoạch:
- `next`: `16.4.0` -> `16.4.3`
- `@next/env`: `16.4.0` -> `16.4.3`
- `@next/swc-*` (tất cả các nền tảng): `16.4.0` -> `16.4.3`
- `follow-redirects`: `1.16.0` -> `1.16.1`
- **Các thư viện khác:** Không có bất kỳ thư viện sản xuất hay phát triển nào khác bị thay đổi hoặc nâng cấp ngoài phạm vi trên.

---

## 4. Bảng Kiểm chứng Toàn bộ Cổng Chất lượng (Quality Gates)

| Cổng Kiểm tra / Lệnh | Exit Code | Kết quả Chi tiết | Ghi chú |
| :--- | :---: | :--- | :--- |
| **`npm audit --omit=dev`** | **0** | **found 0 vulnerabilities** | Sạch 100% ở mọi mức độ (0 Critical, 0 High, 0 Moderate, 0 Low) |
| **`npm ci`** | **0** | Đã cài đặt 742 packages sạch theo lockfile | Lockfile nhất quán hoàn hảo |
| **`npm run lint`** | **0** | 0 lỗi ESLint | Giữ nguyên 3 cảnh báo exhaustive-deps lịch sử |
| **`npm run typecheck`** | **0** | TypeScript kiểm tra kiểu thành công | `tsc -p jsconfig.json --noEmit` không có lỗi |
| **`npm test`** | **0** | **192 / 192 tests PASS (100%)** | Toàn bộ unit tests cho Sanitizer, SEO, Catalog, Session, Cart |
| **`npm run build -- --webpack`** | **0** | **Biên dịch thành công đủ 63/63 routes** | `$env:CI="true"; $env:ALLOW_SITEMAP_FALLBACK="true"`. Cảnh báo `SecurityFatalError` của 16.4.0 đã biến mất hoàn toàn |
| **Sitemap ISR (`verify-sitemap-isr.cjs`)** | **0** | **HTTP 200 OK (`STALE_CACHE_SERVED_200`)** | `<urlset>` đầy đủ, phục hồi static routes khi BE ngắt kết nối |
| **E2E F02 Full Suite (`run-f02-suite.cjs`)** | **0** | **15 HTTP + 11 Browser + 6 Regression PASS** | Chạy trên production build, kết nối `be-pinned` |

### 4.1 Chi tiết Kết quả E2E F02 Full Suite
1. **HTTP BE Fixture Contract Checks (15/15 PASS):**
   - 1. HTTP prepare + BE delivery snapshot: **PASS**
   - 2. HTTP create commits; response loss simulated; lookup recovers original code: **PASS**
   - 3. Online order-status payable + QR URL (fixture bank): **PASS**
   - 4. Terminate created cannot restart: **PASS**
   - 5. Address edit preserves frozen snapshot: **PASS**
   - 6. Unknown blocks restart; terminate writes tombstone: **PASS**
   - 7. Merchant prepare forbidden: **PASS**
   - 8. Admin combo requires explicit owner: **PASS**
   - 9. Subscription prepare, confirm, create and lookup: **PASS**
   - 10. Concurrent real HTTP create/terminate leaves one committed checkout or durable tombstone: **PASS**
   - 11. Lookup hash mismatch rejected with verified machine code: **PASS**
   - 12. COD prepare/create has no payable bank transfer: **PASS**
   - 13. ADDRESS_NOT_FOUND before hash; lost body-terminate response retried: **PASS**
   - 14. Both body-terminate schemas reject invalid payload: **PASS**
   - 15. Two identical COD carts create two keys/checkouts: **PASS**
2. **Playwright Browser E2E Suite (11/11 PASS):**
   - COD twice with identical carts, explicit new action: **PASS**
   - Online created -> explicit new -> old payment URL recoverable: **PASS**
   - Pre-hash ADDRESS_NOT_FOUND -> retry cleans reference safely: **PASS**
   - Saves new address and completes purchase after pre-hash termination: **PASS**
   - UI Code 91 recovery (BE 503 after commit, backoff lookup recovers created): **PASS**
   - UI subscription twice with explicit new action (DB +2): **PASS**
   - Storage completely wiped: redirects / presents support cleanly: **PASS**
   - Edge Case 1 (Two tabs in same browser context): **PASS**
   - Edge Case 2 (User switch / session expiry isolation): **PASS**
   - Edge Case 3 (Session revocation 401, stepper recovery, single lookup): **PASS**
   - Edge Case 4 (Storage quota full / QuotaExceededError safety): **PASS**
3. **Purchase UI Regression Suite (6/6 PASS):**
   - Mobile UI COD twice with identical carts: **PASS**
   - Online created -> old payment URL recoverable: **PASS**
   - UI ADDRESS_NOT_FOUND body terminate: **PASS**
   - UI saves new address and purchases: **PASS**
   - Keyboard focus reaches explicit new-purchase control: **PASS**
   - UI subscription twice with explicit new action: **PASS**

---

## 5. Kiểm tra Port Binding & Dung lượng Bundle

### 5.1 Rà soát Lắng nghe Cổng Mạng (Port Binding Audit)
Khởi chạy Next.js production server trong suite:
```
next start -H 127.0.0.1 -p 3217
```
- **Local:** `http://127.0.0.1:3217`
- **Network:** `http://127.0.0.1:3217`
- **Địa chỉ lắng nghe:** Duy nhất loopback `127.0.0.1`. Tuyệt đối **không mở trên `0.0.0.0`** hoặc để lộ cổng trên mạng LAN/Wifi.

### 5.2 So sánh Dung lượng Bundle Trước và Sau Nâng cấp

| Thành phần Bundle | Trước (Next.js 16.4.0) | Sau (Next.js 16.4.3) | Chênh lệch (Bytes) | Tỷ lệ (%) |
| :--- | :---: | :---: | :---: | :---: |
| **`.next/static` (Toàn bộ static bundle)** | 4,230,282 bytes | 4,230,469 bytes | +187 bytes | +0.004% |
| **`.next/static/chunks` (JavaScript chunks)** | 3,769,060 bytes | 3,769,247 bytes | +187 bytes | +0.005% |

*Đánh giá:* Dung lượng bundle gần như nguyên vẹn, mức tăng chỉ 187 bytes tương ứng với các logic kiểm tra an ninh trong runtime của bản vá Next.js.

---

## 6. Sổ Theo dõi Sự cố & Lần chạy Thất bại (Failure Log)

Tuân thủ nghiêm ngặt yêu cầu *"Ghi mọi lần fail, không thêm retry để che lỗi"*:

| Lần chạy | Thời điểm | Hạng mục / Lệnh | Trạng thái | Nguyên nhân Kỹ thuật | Biện pháp Khắc phục Triệt để |
| :---: | :---: | :--- | :---: | :--- | :--- |
| **Run 1** | 18:25:50 | `node scripts/run-f02-suite.cjs` | **FAIL (Exit 1)** | 15 HTTP checks PASS. Khi chuyển sang Browser E2E, Next.js server gặp lỗi `ECONNREFUSED` tại các endpoint `/api/home/login`, `/api/users/me` dẫn đến timeout 30s tại `#email`. Nguyên nhân: Bản build trước đó chạy mà không truyền `API_URL`, Next.js nạp `.env.local` chứa `API_URL=http://localhost:5000/api` và biên dịch cứng vào `.next/routes-manifest.json`, trong khi BE fixture lắng nghe tại `http://127.0.0.1:3101`. | Thực hiện biên dịch lại production build với biến môi trường `$env:API_URL="http://127.0.0.1:3101/api"` để Next.js ghi đúng destination proxy vào `routes-manifest.json`. Không sửa mã nguồn, không thêm retry trong test. |
| **Run 2** | 18:29:30 | `node scripts/run-f02-suite.cjs` | **PASS (Exit 0)** | 100% PASS toàn bộ bộ test: 15/15 HTTP checks, 11/11 browser scenarios, 6/6 purchase UI regression scenarios. | Bản build trỏ chính xác vào BE fixture port 3101. |

---

## 7. Kết luận & Trạng thái Checkpoint

- **Mục tiêu FE-SEC hoàn thành 100%:** Toàn bộ lỗ hổng trong `npm audit --omit=dev` đã được triệt tiêu hoàn toàn (từ 2 vulnerabilities xuống 0 vulnerabilities).
- **Phạm vi thay đổi tối thiểu tuyệt đối:**
  - `package.json`: Chỉ đổi duy nhất `"next": "16.4.3"`.
  - `package-lock.json`: Chỉ đổi các mục của `next`, `@next/*` và `follow-redirects`. Không nâng bất kỳ thư viện dev hay prod nào khác.
- **Không thay đổi hành vi nghiệp vụ:** Các cấu hình `images`, bundler Webpack, và tính năng ứng dụng hoạt động ổn định 100%.
- **Trạng thái Git:** Toàn bộ thay đổi đang ở trạng thái **Working Tree Chưa Commit** (chưa commit bất kỳ lệnh nào).
