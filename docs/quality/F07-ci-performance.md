# Báo cáo Chất lượng & Biên bản Nghiệm thu F07 (Cập nhật F07d)

> **Giai đoạn:** F07 (Playwright & Bootstrap Chuẩn hóa, Job CI E2E, Smoke Test 13 Luồng Bắt buộc, Đánh giá Flaky Lặp 10 Lần, Đo lường Hiệu năng Đa Profile, Đối chiếu LCP/FCP, Phân tích Gốc JS Payload & Kiểm toán Caching)  
> **Thời điểm cập nhật:** 2026-10-26 03:15:00 +07:00  
> **Nhánh FE:** `fe/f-fix`  
> **FE Git Commit (SHA):** *Chờ commit* (working tree hiện tại chưa commit; tuyệt đối không dùng commit cũ `3ddb8da` làm FE ứng viên theo yêu cầu F07d)  
> **FE Working Tree:** Giữ nguyên 100% kết quả từ F00–F06, không commit tự ý (tuân thủ quy tắc `AN TOÀN` của AGENTS.md)  
> **BE Snapshot Sau Đồng Bộ (`be-pinned`):** `e31517d8f2116f611a27dae96d9446ce8109bffc` (đồng bộ read-only từ `TotMartAPI`, working tree sạch 100%)  
> **Môi trường thực thi:** Node `v24.14.1`, npm `11.11.0`, Docker Desktop `4.96.0` (Engine `29.9.1`), Windows (PowerShell)  
> **Gate Status:** **BLOCKED** *(Toàn bộ suite E2E smoke 10/10, F06 20/20, F02 32/32, unit test 192/192, build sitemap không fallback, perf và actionlint đều PASS 100% cục bộ. Gate giữ trạng thái BLOCKED do repository remote chưa được push/commit bởi owner và CI remote chưa chạy xanh trên đúng cặp SHA FE / BE).*

---

## 1. PHẦN 1 — Đối chiếu Diff BE & Xác minh Bản quyền C2 (F07d.3)

### 1.1 Nguyên văn `git diff c7f4bb1 e31517d --stat` trong Repo BE (Read-Only)
Thực thi lệnh trực tiếp tại `C:\Users\84862\Desktop\totmart\be-pinned`:
```text
 docs/BE-open-issues.md                | 92 +++++++++++++++++++++++++++++++++
 docs/BE-release-candidate.md          | 26 ++++++++++
 docs/C2-verification.md               | 28 ++++++++++-
 package-lock.json                     | 54 ++++++++++----------
 package.json                          |  4 +-
 tests/ajvDependencySecurity.test.js   | 36 +++++++++++++
 tests/dependencyParsing.test.js       | 95 +++++++++++++++++++++++++++++++++++
 tests/dependencySecurity.test.js      | 50 ++++++++++++++++++
 tests/helpers/roundB/a1-workers.js    | 19 +++++--
 tests/helpers/roundB/close-faults.js  | 32 ++++++++----
 tests/helpers/roundC2/sse-deadline.js | 20 +++++++-
 tests/helpers/sanitizePayloads.js     | 60 ++++++++++++++++++++++
 tests/sseHarnessDeadline.test.js      | 35 +++++++++++++
 13 files changed, 504 insertions(+), 47 deletions(-)
```

### 1.2 Đính chính Mô tả Sai Lệch về Bản vá BE-SEC
- **Đính chính:** Bản BE-SEC tại commit `e31517d` **CHỈ nâng cấp phiên bản dependency** trong `package.json` và `package-lock.json`:
  - `sanitize-html`: nâng từ `2.17.7` lên `2.18.1`
  - `ajv`: nâng từ `8.17.1` lên `8.18.0`
- **Không có thay đổi trong mã nguồn (`src/`):** Hoàn toàn **KHÔNG có bất kỳ file nào trong thư mục `src/` bị sửa đổi**. Không có cấu hình giới hạn kích thước hay parser limits nào được viết thêm vào `src/` trong commit `e31517d`.
- **Nội dung bổ sung còn lại:** Là các tài liệu báo cáo (`docs/`) và các test case kiểm thử phụ thuộc/test harness (`tests/`).

### 1.3 Ghi nhận Seal C2 và Yêu cầu Xác nhận từ BE
- Trong tài liệu [docs/C2-verification.md](file:///C:/Users/84862/Desktop/totmart/be-pinned/docs/C2-verification.md), **Seal C2 lịch sử được gắn với HEAD `c7f4bb1dfcc8714ca9b1a7ed679975029b0c5706`** (run `artifacts/round-c2/aeaf2aac-7dfb-44c7-a43b-13990c367346`, snapshot SHA256 `c5216c03a4f9...`).
- Commit `e31517d` là bản bổ sung tài liệu và test sau BE-SEC/Ajv, **cần sự xác nhận chính thức từ đội ngũ BE / Chủ dự án** để công nhận là bản release candidate hợp lệ thay thế cho `c7f4bb1`.

---

## 2. PHẦN 2 — Kiểm chứng Build Không Cờ Fallback & Kiểm toán Sitemap (F07d.4)

### 2.1 Quy trình Build với BE Fixture Dựng Trước
- Tiến trình BE fixture (`scripts/verify-f07-fixture.cjs` seed catalog 26 sản phẩm, category, brand, box) được khởi động trước trên port 3102.
- Biến môi trường: `CI="true"`, `API_URL="http://127.0.0.1:3102/api"`. Biến `ALLOW_SITEMAP_FALLBACK` bị xóa bỏ hoàn toàn khỏi môi trường.
- **Thực thi và ghi nhận exit code riêng biệt:**
  - `npm run build` (Next.js 16 mặc định Turbopack): **Exit Code 0** (biên dịch thành công 63 routes trong 8.4s).
  - `npm run build -- --webpack` (Webpack bundler): **Exit Code 0** (biên dịch thành công 63 routes trong 15.3s).
  - `npm run build` khi BE offline: **Exit Code 1** (Fail-Closed kích hoạt chính xác, chặn phát hành sitemap rỗng).

### 2.2 Kiểm toán Cấu trúc và Nội dung Sitemap Đầu Ra
Kiểm tra trực tiếp tệp đầu ra [.next/server/app/sitemap.xml.body](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/.next/server/app/sitemap.xml.body):
- **Tổng số URL trong sitemap:** 42 URLs.
- **URL Sản phẩm (`/products/...`):** 27 URLs (đầy đủ 26 sản phẩm catalog fixture + canonical detail).
- **URL Danh mục (`/categories/...`):** 1 URL (`https://totmart.vn/categories/hat-and-nong-san-f07`).
- **URL Thương hiệu (`/brands/...`):** 1 URL (`https://totmart.vn/brands/totmart-organic-f07`).
- **URL Hộp/Combo (`/products/box/...`):** 1 URL (`https://totmart.vn/products/box/6ade4d13694301857384ee62`).
- **Kiểm toán Rò rỉ Host:** **0 URL chứa `localhost` hoặc `127.0.0.1`** (toàn bộ sử dụng domain chuẩn `https://totmart.vn/`).
- **Kiểm toán Vùng Riêng tư (Private Sections):** **0 URL thuộc vùng private** (hoàn toàn không chứa `/admin`, `/manager`, `/checkout`, `/profile`, `/login`, `/register`, `/cart`, `/password`).

### 2.3 Cập nhật Workflow CI & Kiểm tra Actionlint
- Cập nhật [.github/workflows/e2e.yml](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/.github/workflows/e2e.yml):
  - **Step 8:** Khởi động BE fixture service chạy nền trên port 3102 và kiểm tra sức khỏe qua endpoint `http://127.0.0.1:3102/__fixture/f07-info`.
  - **Step 9:** Thực thi `npm run build` với `API_URL: "http://127.0.0.1:3102/api"`, **KHÔNG đặt cờ `ALLOW_SITEMAP_FALLBACK`**.
- **Kiểm tra cú pháp Actionlint qua Docker:**
  - Lệnh: `docker run --rm -v "${PWD}:/workflows:ro" rhysd/actionlint:latest /workflows/.github/workflows/e2e.yml`
  - **Kết quả: Exit Code 0 (0 errors, 0 warnings)**.
  - Ghi nhận: Workflow đã được lint cú pháp hợp lệ; **CHƯA CHẠY TRÊN GITHUB ACTIONS REMOTE**.

---

## 3. PHẦN 3 — Điều tra Bản chất LCP Trùng FCP & Căn nguyên 1 KB Payload (F07d.1 / F07d.2)

### 3.1 Điều tra & Bản chất Kỹ thuật LCP Trùng FCP (F07d.1)
Qua việc thực thi script chẩn đoán CDP và PerformanceObserver chuyên sâu:
- **Nguyên nhân LCP trùng FCP:**
  - Cơ chế đo lường bằng `PerformanceObserver({ type: 'largest-contentful-paint', buffered: true })` **hoạt động hoàn toàn chính xác**, không hề có lỗi gán đè từ FCP trong mã nguồn script.
  - Thuật toán của Chromium trong môi trường lab đã ghi nhận phần tử LCP chính là thẻ tiêu đề **`<h1>`** trong HTML SSR:
    - Trên Home: `<h1 ...>Discover Curated Joy Every Month</h1>` (diện tích render: **101.660 px²**, `startTime: 248 ms`).
    - Trên Catalog: `<h1 ...>Premium Organic Snacks</h1>` (diện tích render: **34.485 px²**, `startTime: 380 ms`).
  - Do Next.js App Router Server-Side Rendering (SSR) trả về thẻ `<h1>` ngay trong phản hồi HTML đầu tiên, phần tử này được vẽ lên màn hình tại thời điểm **First Contentful Paint (FCP)**.
- **Vì sao không phát sinh Image-LCP sau đó?**
  1. **Trên Trang chủ (Home):** Hero banner sử dụng CSS `background-image: url(...)` từ domain bên ngoài (`images.unsplash.com`) trên thẻ `<div>` có transition opacity, không phải thẻ `<img>` ưu tiên; diện tích text `<h1>` hiển thị lớn hơn và không bị phần tử ảnh nào thay thế làm candidate mới trong khung thời gian đo.
  2. **Trên Catalog & Product Detail:** Ảnh sản phẩm fixture trỏ tới `/assets/sample-*.jpg` trả về 404 trong môi trường test (do repo FE chỉ chứa ảnh gốc dự án, không seed ảnh mock vào `public/assets/`). Chromium không bao giờ sinh sự kiện LCP cho các ảnh bị lỗi 404.
- **Quyết định Kỹ thuật theo F07d:**
  - Ghi nhận chỉ số LCP trong môi trường synthetic lab là: **"chưa đo (H1 SSR text paint trùng FCP; chưa kích hoạt image LCP do hero dùng CSS background-image và ảnh fixture 404)"**.
  - **Gỡ bỏ LCP khỏi bảng Ngân sách Hiệu năng (Performance Budget)** theo đúng chỉ đạo để tránh việc đặt budget trên một số liệu text paint bị trùng FCP.

### 3.2 Xác định Duy nhất MỘT Căn nguyên Có Bằng chứng cho Số đo JS Payload "1 KB" (F07d.2)
Hai báo cáo trước đây đưa ra hai giả thuyết mâu thuẫn nhau (A: HTTP chunked encoding thiếu header; B: Slug sản phẩm sai dẫn tới trang 404). Qua thực nghiệm cô lập độc lập:
- **Bằng chứng thực nghiệm:**
  - Truy cập URL sản phẩm thật 100% (`/products/hat-dieu-rang-muoi-f07-6ade...`, `HTTP 200`, `h1` hiển thị đầy đủ tên sản phẩm):
    - Đọc theo `response.headers()['content-length']`: **Chỉ đạt đúng 1 KB** (chính xác có **27 / 28 request script bị thiếu header `content-length`**).
    - Đọc theo Browser Performance API (`performance.getEntriesByType('resource')`): **374 KB transfer / 1.117 KB decoded** (Webpack) hoặc **410 KB transfer / 1.381 KB decoded** (Turbopack).
  - Truy cập URL lỗi 404 (`/products/1`, `HTTP 200` client fallback):
    - Đọc theo `response.headers()['content-length']`: **Vẫn ra 1 KB**.
    - Đọc theo Browser Performance API: **185 KB transfer / 592 KB decoded**.
- **KẾT LUẬN DUY NHẤT VÀ CHÍNH XÁC:**
  - **Căn nguyên duy nhất:** Phương pháp đo ban đầu cộng dồn giá trị từ header HTTP `content-length`. Next.js production server phục vụ static chunks qua cơ chế `Transfer-Encoding: chunked`, dẫn tới 27/28 request không có header `content-length` (undefined). Script chỉ cộng được duy nhất 1 request manifest nhỏ có header này (~819 bytes), dẫn tới kết quả sai lệch 1 KB.
  - **Bản build làm chuẩn:** **Turbopack (`npm run build`)** là trình đóng gói chuẩn mặc định của Next.js 16 (410 KB transfer / 1.381 KB decoded trên Product Detail). Bản Webpack (`-- --webpack`) đạt 374 KB transfer / 1.117 KB decoded.

---

## 4. PHẦN 4 — Bảng Phân rã Payload JavaScript Không Nhãn Suy Đoán (F07d.2)

Toàn bộ các nhãn suy đoán cho mã hash đã được gỡ bỏ. Chỉ giữ lại tên tệp thực tế, dung lượng truyền tải mạng (transfer) và dung lượng mã giải nén (decoded) theo đo lường chuẩn:

| Tên chunk (File name) | Transfer Size (KB) | Decoded Size (KB) | Trang xuất hiện |
| :--- | :---: | :---: | :--- |
| `9826-8ae4c33256955f39.js` | **66.2 KB** | 237.5 KB | Home, Catalog, Product Detail, Checkout |
| `2078-8a3bac2c93d1eea1.js` | **64.9 KB** | 177.2 KB | Product Detail |
| `4bd1b696-9e9c7ff1884f6c2e.js` | **62.9 KB** | 199.0 KB | Home, Catalog, Product Detail, Checkout |
| `9685-df9ffa83e42bdd81.js` | **38.4 KB** | 117.1 KB | Home, Catalog, Product Detail, Checkout |
| `page-e0704244f181da5d.js` | **24.3 KB** | 74.6 KB | Checkout |
| `5124-12785b8949406e73.js` | **18.6 KB** | 49.4 KB | Home, Catalog, Product Detail, Checkout |
| `3953-8a386ef62ce8e4ca.js` | **12.0 KB** | 38.8 KB | Home, Catalog, Product Detail, Checkout |
| `7763-9a368a28cc6137cf.js` | **10.6 KB** | 33.9 KB | Home, Checkout |
| `975-a8892dee34ec70b9.js` | **10.5 KB** | 25.6 KB | Catalog, Product Detail |
| `page-f373bcbf44d038b8.js` | **9.9 KB** | 25.3 KB | Product Detail |
| `5075-cde686f5a59ea8df.js` | **9.8 KB** | 26.5 KB | Home |
| `9094-ebe494a35b7d8e9d.js` | **9.4 KB** | 32.8 KB | Home, Catalog, Product Detail, Checkout |
| `7509-ab60ac3057fd511a.js` | **9.1 KB** | 24.7 KB | Home, Catalog, Product Detail |
| `1713-441ae063e6c042a2.js` | **8.6 KB** | 26.0 KB | Home, Catalog, Product Detail, Checkout |
| `page-5b12a37c93bcf6ae.js` | **8.6 KB** | 22.7 KB | Checkout |

---

## 5. PHẦN 5 — Bảng Số liệu Hiệu năng Cập nhật & Ngân sách Đề xuất (F07d.1)

### 5.1 Bảng Kết quả Hiệu năng Core Web Vitals (Median p50 / p75)
Dữ liệu trích xuất từ [.cache/perf/performance-detailed-report.json](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/.cache/perf/performance-detailed-report.json):

| Trang | Profile | TTFB (ms) p50 / p75 | FCP (ms) p50 / p75 | LCP (ms) | INP (ms) | CLS | Cold JS Transfer | Warm JS Transfer | Decoded JS Size |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Home (Trang chủ)** | Desktop Unthrottled | 21 / 22 | 160 / 160 | chưa đo* | 24 ms | 0.000 | 301 KB | 0 KB | 925 KB |
| **Home (Trang chủ)** | Mobile Fast 4G (4x CPU) | 12 / 15 | 368 / 484 | chưa đo* | 48 ms | 0.000 | 301 KB | 0 KB | 925 KB |
| **Catalog (Danh mục)** | Desktop Unthrottled | 9 / 9 | 108 / 124 | chưa đo* | 16 ms | 0.000 | 314 KB | 0 KB | 950 KB |
| **Catalog (Danh mục)** | Mobile Fast 4G (4x CPU) | 8 / 9 | 664 / 700 | chưa đo* | chưa đo** | 0.000 | 314 KB | 0 KB | 950 KB |
| **Product Detail** | Desktop Unthrottled | 9 / 9 | 104 / 112 | chưa đo* | 16 ms | 0.000 | 374 KB | 0 KB | 1.117 KB |
| **Product Detail** | Mobile Fast 4G (4x CPU) | 9 / 9 | 712 / 860 | chưa đo* | chưa đo** | 0.000 | 374 KB | 0 KB | 1.117 KB |
| **Checkout (Thanh toán)** | Desktop Unthrottled | 9 / 18 | 96 / 144 | chưa đo* | 32 ms | 0.000 | 311 KB | 0 KB | 957 KB |
| **Checkout (Thanh toán)** | Mobile Fast 4G (4x CPU) | 9 / 9 | 688 / 752 | chưa đo* | 40 ms | 0.000 | 311 KB | 0 KB | 957 KB |

*\*Ghi chú LCP:* Chưa đo trong môi trường synthetic lab (chỉ ghi nhận H1/P SSR text paint trùng FCP; chưa kích hoạt image LCP do hero dùng CSS background-image và ảnh catalog 404).  
*\*\*Ghi chú INP:* Ghi nhận trung thực `"chưa đo (yêu cầu tương tác người dùng)"` trên các màn hình mobile khi không phát sinh event paint kéo dài sau click.

### 5.2 Bảng Ngân sách Hiệu năng Đề xuất (Đã gỡ bỏ LCP)
Đề xuất Chủ dự án phê duyệt trước khi enforce:

| Chỉ số | Ngưỡng đề xuất (Budget) | Cơ sở đề xuất từ Baseline | Trạng thái hiện tại |
| :--- | :--- | :--- | :---: |
| **JS Transfer Size (Cold)** | $\le 450\text{ KB}$ | Hiện tại cao nhất là Product Detail: $374\text{ KB}$ (Webpack) / $410\text{ KB}$ (Turbopack) | Đạt baseline |
| **JS Transfer Size (Warm)** | $\le 50\text{ KB}$ | Hiện tại Warm đạt $0\text{ KB}$ (toàn bộ load từ cache) | Đạt baseline |
| **TTFB (Time to First Byte)** | $\le 100\text{ ms}$ | Hiện tại loopback đạt $8\text{ ms} - 22\text{ ms}$ | Đạt baseline |
| **FCP (Desktop)** | $\le 300\text{ ms}$ | Hiện tại Desktop đạt $96\text{ ms} - 160\text{ ms}$ | Đạt baseline |
| **FCP (Mobile Fast 4G, 4x CPU)** | $\le 1000\text{ ms}$ | Hiện tại Mobile 4x CPU đạt $368\text{ ms} - 860\text{ ms}$ | Đạt baseline |
| **CLS (Cumulative Layout Shift)** | $\le 0.050$ | Hiện tại toàn bộ các trang đạt tuyệt đối $0.000$ | Đạt baseline |
| **INP (Interaction to Next Paint)**| $\le 200\text{ ms}$ | Tương tác đo được trên Desktop đạt $16\text{ ms} - 32\text{ ms}$, Mobile $40\text{ ms} - 48\text{ ms}$ | Đạt baseline |

---

## 6. PHẦN 6 — Bảng Tổng hợp Lệnh Kiểm tra Kỹ thuật & Exit Codes (F07d.6)

Toàn bộ các lệnh được chạy độc lập trong phiên F07d, ghi nhận exit code riêng biệt từng lệnh:

| Nhóm Kiểm tra | Lệnh thực thi | Exit Code | Kết quả | Phân loại / Chi tiết |
| :--- | :--- | :---: | :---: | :--- |
| **Kiểm tra tĩnh (Lint)** | `npm run lint` | **0** | **PASS** | ESLint sạch 100%, 0 lỗi |
| **Kiểm tra kiểu (Typecheck)** | `npm run typecheck` | **0** | **PASS** | TypeScript / JSConfig 100% hợp lệ |
| **Unit & Integration Tests** | `npm test` | **0** | **192 / 192 PASS** | 192 unit tests pass, 0 fail, 0 skip |
| **Hồi quy F02** | `node scripts/run-f02-suite.cjs` | **0** | **32 / 32 PASS** | 15 HTTP + 11 F02 browser + 6 UI regression |
| **Hồi quy F06** | `node scripts/run-f06-suite.cjs` | **0** | **20 / 20 PASS** | 20 E2E checks Playwright đạt chuẩn |
| **F07 Flaky Lặp 10 Lần** | `node scripts/run-f07-smoke.cjs --repeat 10` | **0** | **10 / 10 PASS** | 210 / 210 assertions pass (0% flake) |
| **F07 Đo Hiệu năng Đa Profile** | `node scripts/measure-performance.cjs --standalone` | **0** | **PASS** | 8 profile đo lường, 0 rò rỉ dữ liệu, LCP chẩn đoán |
| **Build Chuẩn Turbopack (Không Fallback)** | `$env:API_URL="http://127.0.0.1:3102/api"; npm run build` | **0** | **PASS** | 63 routes, sitemap 42 URL chuẩn |
| **Build Webpack (Không Fallback)** | `$env:API_URL="http://127.0.0.1:3102/api"; npm run build -- --webpack` | **0** | **PASS** | 63 routes, sitemap 42 URL chuẩn |
| **Actionlint Workflow CI** | `docker run --rm -v ... actionlint:latest ...` | **0** | **PASS** | 0 error, 0 warning trên file YAML CI |

---

## 7. PHẦN 7 — Kết luận & Chuyển bước (Gate Decision)

- **Kết luận:**
  1. Đã dán nguyên văn và đối chiếu chính xác `git diff c7f4bb1 e31517d --stat` (13 files changed, 504 insertions, 47 deletions). Khẳng định rõ commit `e31517d` chỉ nâng phiên bản dependency bảo mật, không sửa `src/` và không viết thêm parser limits. Ghi nhận seal C2 gắn với HEAD `c7f4bb1` và cần BE xác nhận.
  2. Đã xác định MỘT căn nguyên duy nhất có bằng chứng thực nghiệm cho số đo JS payload 1 KB (do Next.js production server phục vụ `Transfer-Encoding: chunked` lược bỏ header `content-length` trên 27/28 request script). Đã đo lại trên cả hai trình đóng gói (Turbopack 410 KB / Webpack 374 KB), chọn Turbopack làm chuẩn và gỡ bỏ toàn bộ nhãn suy đoán cho mã hash chunk.
  3. Đã điều tra chính xác căn nguyên LCP trùng FCP: do SSR render thẻ `<h1>` ngay từ FCP và không có image-LCP candidate nào thay thế (ảnh hero dùng CSS `background-image`, ảnh catalog fixture 404). Đã ghi nhận trung thực là "chưa đo" và gỡ LCP khỏi bảng budget.
  4. Đã thực thi build FE thành công 100% với BE fixture dựng trước mà **KHÔNG đặt cờ `ALLOW_SITEMAP_FALLBACK`**, xác nhận sitemap sinh ra 42 URLs đầy đủ sản phẩm, danh mục, thương hiệu, box và 0 rò rỉ localhost hay private routes. Đã cập nhật workflow CI dựng BE trước khi build và kiểm tra actionlint đạt 0 error/0 warning.
  5. Đã để trống trường "FE SHA" (chờ commit của owner, không dùng commit cũ `3ddb8da`).
  6. Toàn bộ các bộ test: lint, typecheck, unit test 192/192, F02 32/32, F06 20/20, F07 smoke lặp 10 lần (210/210 pass), perf đều đạt **100% PASS** với exit code 0 riêng biệt.
  7. Container disposable và fixture process đã được dọn dẹp sạch sẽ theo exact ID/PID (`docker ps` ghi nhận 0 container rò rỉ).
- **Trạng thái Gate:** **BLOCKED** theo đúng tiêu chuẩn nghiệm thu:
  - Gate đóng ở trạng thái **BLOCKED** cho tới khi Chủ dự án thực hiện review, phê duyệt đề xuất ngân sách hiệu năng, thực hiện commit trên repo và kích hoạt CI remote chạy xanh trên đúng cặp SHA FE / BE.
