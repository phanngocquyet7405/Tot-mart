# Biên bản nghiệm thu chất lượng Phase F04: Security, Session Hardening, XSS Defense, Auth & CSP

**Thời gian thực hiện**: 22/10/2026  
**Môi trường thực thi**: Windows 11 (PowerShell)  
**Tập trung**: Phòng vệ XSS allowlist không dùng regex cho `dangerouslySetInnerHTML`, khắc phục lỗi xóa nhầm phiên trong `axiosMiddleware`, chuẩn hóa luồng đăng nhập (`passwordChangeRequired`, 503/403 không báo sai mật khẩu), làm sạch logging nhạy cảm, cấu hình CSP report-only và rà soát bảo mật session.

---

## 1. Snapshot môi trường & Danh sách file thay đổi

- **Nhánh**: `staging`
- **Commit HEAD**: `6ecc0fe`
- **Môi trường**: Node.js `v24.14.1` | npm `11.11.0`
- **Danh sách file thay đổi & tạo mới trong F04**:
  - `src/app/util/htmlSanitizer.js` (Mới): Module lọc HTML phòng thủ XSS tuần tự ký tự (Deterministic Finite State Automaton), **100% không dùng Regex (Zero Regular Expression)**, hỗ trợ allowlist thẻ và thuộc tính, kiểm tra giao thức URL an toàn, tự động bổ sung `rel="noopener noreferrer"` cho `target="_blank"`.
  - `src/app/util/authErrors.js` (Mới): Module chuẩn hóa thông báo lỗi xác thực theo hợp đồng BE A-20261021.2, phân biệt 401, 403, 429, 503 và lỗi mạng tạm thời, trích xuất `requestId` và hỗ trợ nút thử lại.
  - `src/app/(client)/components/Product/ProductInfoTabs.js` (Cập nhật): Bọc `product.description` bằng `sanitizeHtml(...)` trước khi truyền vào `dangerouslySetInnerHTML`.
  - `src/app/(client)/components/layout/brand/BrandDetailHero.js` (Cập nhật): Bọc `brand.description` bằng `sanitizeHtml(...)` trước khi truyền vào `dangerouslySetInnerHTML`.
  - `src/app/middleware/axiosMiddleware.js` (Cập nhật): Chỉ gọi `clearSession()` khi refresh trả về status `401` hoặc `403`. Với lỗi `5xx`, `503` (CSOT timeout) hoặc lỗi mạng/timeout, phiên làm việc trong bộ nhớ được **GIỮ NGUYÊN**, từ chối Promise kèm thông báo để người dùng thử lại thay vì bị đăng xuất oan.
  - `src/app/(client)/login/page.js` (Cập nhật): Tích hợp `getLoginError`, xử lý cờ `passwordChangeRequired: true` và `passwordPolicyReason: "LEGACY_BCRYPT_BYTE_LIMIT"` khi đăng nhập thành công; hiển thị banner cảnh báo đổi mật khẩu và link tới `/forgot-password`; phân biệt 503/403 không hiển thị sai mật khẩu, hiển thị `requestId` và nút "Thử lại".
  - `src/app/middleware/roleMiddleware.js` (Cập nhật): Bổ sung trạng thái loading spinner rõ ràng cho `withRole` (tránh màn hình trắng vô hình); bổ sung ghi chú kiến trúc xác nhận Role Guard FE chỉ phục vụ điều hướng UX, ủy quyền thực sự và an toàn dữ liệu thuộc trách nhiệm bắt buộc của BE.
  - `src/app/util/Logger.js` (Cập nhật): Bổ sung hàm `redactSensitive` tự động ẩn (mask) các trường nhạy cảm (`token`, `password`, `cookie`, `qrUrl`, `secret`, `Authorization`).
  - `src/app/(admin)/admin-box/create/page.js` (Cập nhật): Loại bỏ các lệnh `console.group` log toàn bộ `FormData`, raw response và error dump; chuẩn hóa hiển thị lỗi 5xx/503 kèm `requestId`.
  - `next.config.mjs` (Cập nhật): Cấu hình header `Content-Security-Policy-Report-Only` cho môi trường test/staging/CI (`TOTMART_CSP_REPORT_ONLY = "1"` hoặc `CI = "true"`), hỗ trợ đầy đủ font, ảnh CDN (`res.cloudinary.com`, `images.unsplash.com`, `qr.sepay.vn`, `img.vietqr.io`).
  - `tests/apiConnection.test.cjs` (Cập nhật): Chuẩn hóa ca test dòng 91 ném lỗi kèm `response: { status: 401 }` phản ánh đúng quy tắc mới: chỉ lỗi 401/403 mới xóa phiên.
  - `tests/f04SecuritySanitizer.test.cjs` (Mới): Bộ 7 ca kiểm thử xác minh Zero Regex, bóc tách script, loại bỏ inline event handler `on*`, chặn URL protocol độc hại (`javascript:`, `data:`, `vbscript:`), giữ nguyên HTML hợp lệ.
  - `tests/f04SecuritySession.test.cjs` (Mới): Bộ 11 ca kiểm thử xác minh cơ chế giữ phiên khi refresh gặp 503/timeout/lỗi mạng, xóa phiên khi 401/403, mapping lỗi đăng nhập, che giấu dữ liệu logger và kiểm tra header CSP.
  - `docs/README.md` (Cập nhật): Cập nhật chỉ mục tài liệu với các báo cáo F03 và F04.

---

## 2. Xác minh lỗi & Kết quả triển khai từng hạng mục

### 2.1. Rà soát `dangerouslySetInnerHTML` & Phòng vệ XSS Allowlist không dùng Regex
- **Hiện trạng khảo sát**:
  Toàn bộ thư mục `src/` có chính xác 4 vị trí sử dụng `dangerouslySetInnerHTML`:
  1. `src/app/(client)/components/Product/ProductInfoTabs.js` (dòng 41): Render `product.description` (nội dung rich-text do Merchant/Admin nhập qua editor TipTap).
  2. `src/app/(client)/components/layout/brand/BrandDetailHero.js` (dòng 71): Render `brand.description` (nội dung rich-text mô tả gian hàng).
  3. `src/app/(client)/products/[slug]/page.js` (dòng 100): Script JSON-LD schema (đã escape ký tự `<` thành `\u003c`).
  4. `src/app/(client)/products/box/[id]/page.js` (dòng 91): Script JSON-LD schema (đã escape ký tự `<` thành `\u003c`).
- **Xác minh hợp đồng BE sanitize**:
  Backend lưu trữ rich-text từ TipTap và trả về qua API mà không đảm bảo sanitize trên wire. FE render trực tiếp qua `dangerouslySetInnerHTML` tạo ra nguy cơ XSS nghiêm trọng nếu cơ sở dữ liệu chứa payload độc hại.
- **Giải pháp triển khai**:
  - Xây dựng `src/app/util/htmlSanitizer.js` dựa trên bộ phân tích cú pháp ký tự (Deterministic Finite State Automaton), **hoàn toàn không dùng Regex** (vượt qua kiểm tra nghiêm ngặt `Zero Regular Expression verification`).
  - Allowlist thẻ: `p, br, hr, strong, b, em, i, u, s, strike, del, sub, sup, h1, h2, h3, h4, h5, h6, ul, ol, li, blockquote, pre, code, span, div, table, thead, tbody, tr, th, td, a, img`.
  - Nuốt sạch thẻ nguy hiểm kèm nội dung: `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, `<svg>`, `<math>`.
  - Bóc tách triệt để mọi thuộc tính sự kiện `on*` (`onclick`, `onerror`, `onload`).
  - Kiểm tra protocol an toàn không dùng regex: chỉ cho phép `http:`, `https:`, `mailto:`, `tel:` hoặc relative path; chặn đứng `javascript:`, `data:`, `vbscript:`.
  - Tự động bổ sung `rel="noopener noreferrer"` cho các liên kết có `target="_blank"`.
  - Bọc cả 2 vị trí rich-text bằng `sanitizeHtml(...)`. Nội dung HTML định dạng hợp lệ của sản phẩm và thương hiệu được hiển thị nguyên vẹn.

### 2.2. Khắc phục lỗi xóa nhầm phiên trong `axiosMiddleware.js`
- **Hiện trạng trước sửa**:
  Nhánh `catch (failure)` của logic refresh gọi `clearSession()` vô điều kiện cho mọi lỗi ném ra. Khi backend gặp 503 (MongoDB CSOT timeout 5000ms, Redis hiccup ~5s), lỗi mạng chập chờn hoặc timeout, người dùng đang có cookie hợp lệ bị đăng xuất oan và mất toàn bộ token trong bộ nhớ.
- **Giải pháp triển khai**:
  - Điều chỉnh điều kiện xóa phiên: **CHỈ gọi `clearSession()` khi `failure.response?.status` là 401 hoặc 403**.
  - Khi refresh gặp 5xx, 503 hoặc lỗi mạng: Giữ nguyên `accessToken` và phiên làm việc trong bộ nhớ, reject error để ứng dụng thông báo thử lại.
  - Bảo lưu cơ chế Single-flight refresh (`refreshing = axios.post(...)`), kiểm tra đối chiếu `_requestUserId` ngăn chặn đổi tài khoản giữa chừng, và gắn header CSRF bắt buộc `X-TotMart-Request: 1`.
  - Cập nhật ca test dòng 91 trong `tests/apiConnection.test.cjs` sang status 401 để phù hợp với chuẩn mới.

### 2.3. Chuẩn hóa luồng Đăng nhập (`login/page.js`)
- **Hiện trạng trước sửa**:
  1. Hoàn toàn bỏ qua trường `passwordChangeRequired` và `passwordPolicyReason` trong response của `POST /api/home/login`.
  2. Mọi lỗi đều bị fallback thành thông báo `"Email hoặc mật khẩu không đúng."`. Khi BE trả 503 (Mongo timeout), 403 (tài khoản bị khóa) hoặc lỗi mạng, UI lại báo sai mật khẩu, vi phạm trực tiếp hợp đồng BE.
- **Giải pháp triển khai**:
  - Tách logic phân loại lỗi thành `src/app/util/authErrors.js`:
    - `401`: "Email hoặc mật khẩu không chính xác."
    - `403`: "Tài khoản của bạn đã bị khóa hoặc tạm ngưng. Vui lòng liên hệ hỗ trợ." (Không báo sai mật khẩu).
    - `429`: "Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi trong giây lát rồi thử lại."
    - `503`: "Hệ thống đang bận hoặc gián đoạn kết nối. Vui lòng thử lại sau ít phút." (Không báo sai mật khẩu, kèm `requestId` và nút "Thử lại").
    - `5xx`: "Lỗi hệ thống. Vui lòng thử lại." kèm `requestId`.
    - Lỗi mạng / timeout: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền và thử lại."
  - Khi đăng nhập thành công nhưng có `res.passwordChangeRequired === true`:
    - Lưu token và phiên người dùng bình thường.
    - Hiển thị banner cảnh báo amber nổi bật thông báo: *"Mật khẩu của bạn đang sử dụng định dạng cũ vượt quá giới hạn an toàn (tối đa 72 byte UTF-8). Vui lòng đặt lại mật khẩu để bảo vệ tài khoản của bạn."* (nếu lý do là `LEGACY_BCRYPT_BYTE_LIMIT`).
    - Cung cấp nút chuyển hướng trực tiếp đến luồng đặt lại mật khẩu chủ động (`/forgot-password`) kèm nút "Để sau và tiếp tục".

### 2.4. Xử lý lỗi 5xx/503 & Làm sạch Logging
- **Hiện trạng trước sửa**:
  Tại `src/app/(admin)/admin-box/create/page.js`, mã nguồn sử dụng `console.group` in toàn bộ `FormData`, từng key/value, full response và error object ra browser console.
- **Giải pháp triển khai**:
  - Gỡ bỏ hoàn toàn các lệnh log toàn bộ `FormData`, request body và response error tại `admin-box/create/page.js`.
  - Nâng cấp `src/app/util/Logger.js`: Tích hợp hàm `redactSensitive` đệ quy tự động nhận diện và thay thế giá trị của các trường nhạy cảm (`token`, `password`, `cookie`, `qrUrl`, `secret`, `Authorization`) bằng `[REDACTED]`.
  - Khi API tạo box gặp 503/5xx: Hiển thị thông báo an toàn kèm `requestId`.

### 2.5. Báo cáo nơi lưu Access Token & Đề xuất kiến trúc
- **Hiện trạng thẩm định**:
  - `src/app/middleware/tokenMiddleware.js` lưu `accessToken` trong biến module JavaScript (`let accessToken = null`).
  - Hàm `saveToken` chủ động dọn dẹp và xóa sạch key `token` / `user` trong `localStorage` và `sessionStorage`.
  - `refreshToken` được lưu trữ an toàn trong HttpOnly, Secure, SameSite=Lax cookie do Backend quản lý.
- **Đánh giá & Khuyến nghị**:
  - Mô hình in-memory access token + HttpOnly cookie refresh là tiêu chuẩn an toàn cao nhất chống lại các cuộc tấn công đánh cắp token qua XSS.
  - Phù hợp hoàn toàn với tài liệu hợp đồng BE (`FE-BE-contract-handoff.md`).
  - **Khuyến nghị**: Giữ nguyên kiến trúc hiện tại, không đổi sang web storage trong phase này.

### 2.6. Cấu hình CSP Report-Only cho Test/Staging
- **Triển khai trong `next.config.mjs`**:
  - Header `Content-Security-Policy-Report-Only` được kích hoạt có kiểm soát khi `TOTMART_CSP_REPORT_ONLY = "1"`, `TOTMART_ENV = "staging"` hoặc `CI = "true"`.
  - Directives:
    - `default-src 'self'`;
    - `script-src 'self' 'unsafe-eval'`;
    - `style-src 'self' 'unsafe-inline'`;
    - `font-src 'self' data: https://fonts.gstatic.com`;
    - `img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://qr.sepay.vn https://img.vietqr.io`;
    - `connect-src 'self' https: http://localhost:*`;
    - `frame-ancestors 'none'`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`.
  - **HSTS (`Strict-Transport-Security`)**: Thuộc cấu hình hạ tầng Reverse Proxy / Edge (Cloudflare, Nginx, Render Edge). Không cấu hình cứng trong code Next.js để tránh ảnh hưởng môi trường local HTTP.
  - **Không áp dụng cưỡng chế (Enforce)** vào production trong phase này.

### 2.7. Hoàn thiện Role Guard
- Cải thiện `src/app/middleware/roleMiddleware.js`:
  - Trong `withRole`: Khi `isLoading === true`, hiển thị spinner loading rõ ràng thay vì trả về `null` gây đóng băng giao diện.
  - Khi không đủ quyền: Điều hướng kèm mã lỗi rõ ràng (`?error=forbidden`).
  - Ghi chú bảo mật: Role Guard FE chỉ là tiện ích điều hướng UX; quyền hạn thực sự và bảo vệ dữ liệu bắt buộc được kiểm chứng tại Backend endpoint.

### 2.8. Rà soát File tracked đáng ngờ
- **Danh sách file tracked trong Git index**:
  - `.claude/settings.local.json`
  - Thư mục `.claude/` (skills/impeccable/...)
  - Thư mục `.cursor/` (skills/impeccable/...)
  - Thư mục `.impeccable/` (config.json, design.json, live/config.json)
- **Đề xuất lệnh gỡ khỏi Git index cho Repository Owner**:
  *(Tuân thủ quy tắc an toàn: FE Agent chỉ báo cáo, không tự ý chạy lệnh)*
  ```powershell
  git rm --cached .claude/settings.local.json
  git rm -r --cached .claude .cursor .impeccable
  git commit -m "chore: untrack local IDE settings and agent skill files"
  ```

---

## 3. Kết quả thực thi các lệnh kiểm tra (Exit Code & Số liệu)

| Lệnh | Exit Code | Kết quả chi tiết | Đánh giá |
| :--- | :---: | :--- | :---: |
| `npm run lint` | **0** | ESLint kiểm tra toàn bộ codebase: **0 errors, 0 warnings**. | **PASS** |
| `npm test` | **0** | Chạy 27 test suites (`tests/*.test.cjs`):<br>- **Passed**: **180 tests**<br>- **Failed**: 0<br>- **Skipped**: 0<br>- **Duration**: 8.07s | **PASS** |
| `$env:CI="true"; npm run build -- --webpack` | **0** | Biên dịch Next.js 16.4.0 thành công hoàn tất trong 50s.<br>- 62 routes tĩnh & động.<br>- `sitemap.xml` kết xuất Static ISR 1h.<br>- CSP Report-Only active. | **PASS** |

### Chi tiết 7 ca kiểm thử trong `tests/f04SecuritySanitizer.test.cjs`:
1. `htmlSanitizer: Zero Regular Expression verification`: **PASS** (xác minh source code không chứa RegExp, .match, .search, .test)
2. `htmlSanitizer: Strips classic <script> and dangerous tags completely`: **PASS**
3. `htmlSanitizer: Strips inline event handlers (onerror, onclick, onload, etc.)`: **PASS**
4. `htmlSanitizer: Blocks dangerous URL protocols (javascript, data, vbscript, etc.)`: **PASS**
5. `htmlSanitizer: Automatically enforces rel='noopener noreferrer' on target='_blank'`: **PASS**
6. `htmlSanitizer: Preserves valid rich-text formatting and structures without corruption`: **PASS**
7. `htmlSanitizer: Gracefully handles null, empty, malformed and non-string inputs`: **PASS**

### Chi tiết 11 ca kiểm thử trong `tests/f04SecuritySession.test.cjs`:
1. `axiosMiddleware: Refresh trả về 401 xóa phiên và bắn sự kiện session-expired`: **PASS**
2. `axiosMiddleware: Refresh trả về 403 xóa phiên và bắn sự kiện session-expired`: **PASS**
3. `axiosMiddleware: Refresh gặp 503 (CSOT timeout) KHÔNG xóa phiên, giữ nguyên token`: **PASS**
4. `axiosMiddleware: Refresh gặp lỗi mạng/timeout (không có status) KHÔNG xóa phiên`: **PASS**
5. `axiosMiddleware: Đổi tài khoản trong lúc refresh không xóa phiên của tài khoản mới`: **PASS**
6. `Login: 401 hiển thị sai email/mật khẩu`: **PASS**
7. `Login: 403 hiển thị tài khoản bị khóa, TUYỆT ĐỐI KHÔNG báo sai mật khẩu`: **PASS**
8. `Login: 503 hiển thị hệ thống bận, TUYỆT ĐỐI KHÔNG báo sai mật khẩu, kèm requestId`: **PASS**
9. `Login: Lỗi mạng không có status báo lỗi kết nối và cho phép thử lại`: **PASS**
10. `Logger: redactSensitive che giấu token, password, cookie, qrUrl và secret`: **PASS**
11. `CSP: next.config.mjs xuất header Content-Security-Policy-Report-Only trong môi trường staging/test`: **PASS**

---

## 4. Đánh giá rủi ro & Kế hoạch quay lui (Rollback Plan)

- **Rủi ro nội dung rich-text**: Bộ lọc HTML allowlist có thể loại bỏ một số thẻ lạ nếu admin nhập thẻ HTML tùy chỉnh ngoài danh mục.
  - *Biện pháp giảm thiểu*: Danh mục allowlist đã bao quát toàn bộ 32 thẻ chuẩn của TipTap và HTML formatting, bảng biểu, danh sách, liên kết, ảnh.
- **Rủi ro phiên làm việc**: Khi refresh gặp lỗi mạng tạm thời, phiên vẫn được giữ trong bộ nhớ. Nếu token thực sự đã bị revoke ở backend, request tiếp theo sẽ nhận 401 và kích hoạt chu trình refresh/expire đúng quy trình.
- **Kế hoạch quay lui nếu cần**:
  ```powershell
  git checkout HEAD -- src/app/util/htmlSanitizer.js src/app/util/authErrors.js src/app/middleware/axiosMiddleware.js src/app/(client)/login/page.js next.config.mjs
  ```
