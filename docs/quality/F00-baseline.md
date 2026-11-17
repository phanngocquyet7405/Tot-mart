# Biên bản thẩm định đường cơ sở (Baseline Verification) — F00

**Thời gian thực hiện**: 22/10/2026  
**Môi trường thực thi**: Windows 11 (PowerShell)  
**Phạm vi**: F00 — Chỉ đọc và kiểm tra hệ thống, bảo toàn 100% mã nguồn hiện trạng.

---

## 1. Snapshot môi trường và sai khác với GitHub Staging

### 1.1. Thông tin thực thi & Git
- **Thư mục làm việc (cwd)**: `C:\Users\84862\Desktop\WorkSpace\totmart\fe_totmart`
- **Nhánh hiện tại**: `staging`
- **Commit HEAD**: `6ecc0fe` (`update s 19/10`) — đồng bộ với `origin/staging`
- **Node.js**: `v24.14.1`
- **npm**: `11.11.0`

### 1.2. Git Status hiện trạng
- **File có chỉnh sửa chưa commit (đang được giữ nguyên)**:
  - `src/app/(client)/components/ui/auth/PasswordRecovery.jsx`
  - `src/app/context/CartContext.js`
  - `src/app/context/WishlistContext.js`
- **File / thư mục untracked**:
  - `docs/be-contract/` (chứa tài liệu hợp đồng `FE-BE-contract-handoff.md`)
  - `tests/f01ResilienceRegression.test.cjs` (bộ test phục hồi cho Phase F01)

### 1.3. Scripts trong package.json
- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`
- `lint`: `eslint`
- `test`: `node --test tests/*.test.cjs`
- `test:api`: `node scripts/verify-checkout-attempts.cjs`
- `test:e2e:ui`: `node scripts/checkout-browser-e2e.cjs`
- `test:e2e:purchase`: `node scripts/purchase-ui-regression.cjs`
- `test:browser:services`: `node scripts/verify-checkout-attempts.cjs --gaps`
- `test:fixtures`: `node scripts/verify-checkout-attempts.cjs --serve`

### 1.4. Workflow CI thực tế (`.github/workflows/check.yml`)
- **Trigger**: `push`, `pull_request`
- **Runner**: `ubuntu-latest`
- **Node version**: `22` (khác Node `v24.14.1` ở local)
- **Các bước chạy**:
  1. `npm ci`
  2. `npm audit --omit=dev --audit-level=high`
  3. `npm run lint`
  4. `npm test`
  5. `npm run build -- --webpack` với `API_URL: http://localhost:3001/api`

### 1.5. So sánh Repo Local vs Bản GitHub Staging (`origin/staging`)
| Tiêu chí | Bản GitHub `origin/staging` | Bản Local hiện tại | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Commit tip** | `6ecc0fe` | `6ecc0fe` | Trùng khớp tuyệt đối |
| **Số file unit/integration test** | 23 file | 24 file | Local có thêm `tests/f01ResilienceRegression.test.cjs` (untracked) |
| **Scripts E2E** | 3 scripts (`checkout-browser-e2e.cjs`, `purchase-ui-regression.cjs`, `verify-checkout-attempts.cjs`) | 3 scripts tương tự | Trùng khớp trong `package.json` và `scripts/` |
| **File `playwright.config.*`** | Không có | Không có | Chạy Playwright qua runner script trực tiếp, không dùng file config chuẩn |
| **Tài liệu BE Contract** | Chưa có trên remote | Có `docs/be-contract/` | Bổ sung nội bộ phục vụ bàn giao hợp đồng |

---

## 2. Kết quả kiểm tra chu trình sạch (npm ci, lint, test, build)

| Lệnh | Exit Code | Kết quả chi tiết | Đánh giá Gate |
| :--- | :---: | :--- | :---: |
| `npm ci` | **0** | Đã cài đặt 734 packages, kiểm tra 735 packages trong 3m. Không có breaking changes. | **PASS** |
| `npm run lint` | **0** | ESLint thực thi thành công, 0 lỗi, 0 cảnh báo. | **PASS** |
| `npm test` | **0** | Chạy 24 file test suite:<br>- **Passed**: 141 tests<br>- **Failed**: 0<br>- **Skipped**: 0<br>- **Cancelled / Todo**: 0<br>- **Duration**: 3.39s | **PASS** |
| `npm run build -- --webpack` *(không có CI=true)* | **1** | Thất bại có chủ đích tại `next.config.mjs:30:11`: Chặn build production trỏ vào HTTP/localhost khi `process.env.CI !== "true"`. | **EXPECTED BEHAVIOR** |
| `$env:CI="true"; npm run build -- --webpack` *(mô phỏng CI)* | **0** | Biên dịch thành công 62 routes (static/dynamic) trong 42s bằng Webpack. | **PASS** |

---

## 3. Rà soát các file tracked đáng ngờ

*Ghi nhận danh sách file đang bị theo dõi trong Git index (chỉ báo cáo, không tự ý xóa):*
1. **`.env*`**: Chỉ duy nhất `.env.example` được track (mẫu cấu hình an toàn). Không có `.env` hay `.env.local` nào bị lộ vào Git.
2. **`.claude/settings.local.json`**: **ĐANG BỊ TRACK** trong Git. File cấu hình cục bộ của Claude cần được untrack và đưa vào `.gitignore` ở phase dọn dẹp.
3. **`.cursor/`**: **ĐANG BỊ TRACK** (143 files) gồm agents, hooks, detectors và skills của Cursor IDE.
4. **`.impeccable/`**: **ĐANG BỊ TRACK** (3 files: `.impeccable/config.json`, `.impeccable/design.json`, `.impeccable/live/config.json`).
5. **Logs / Artifacts**:
   - Git index: Không có file log hay artifact nào bị track nhầm.
   - Filesystem: Có `artifacts/TotMart-FE-merchant-staging-2026-10-16.manifest.json` và các thư mục `.cache/next-test/dev/logs/`, `.next/dev/logs/` (đã được gitignore an toàn).

---

## 4. Tóm tắt 10 dòng Hợp đồng Backend (`docs/be-contract/`)

1. **5xx Disclosure**: Ở staging/production, mọi lỗi 5xx qua errorHandler trả về message cố định `"Lỗi hệ thống. Vui lòng thử lại."` kèm `requestId`; FE bắt buộc hiển thị `requestId` cho người dùng.
2. **503 Availability**: Mã 503 phản ánh lỗi tạm thời (DB/Redis ngắt quãng ~5s); cấm coi là 401, cấm tự xoá phiên đăng nhập và cấm báo sai mật khẩu.
3. **Giao dịch kết quả chưa rõ**: Create, prepare và terminate gặp timeout, 5xx hoặc 503 đều là kết quả chưa rõ; bắt buộc giữ nguyên reference và serialized body gốc đã lưu trước khi gọi mạng.
4. **Bảo toàn Idempotency Key**: Tuyệt đối không sinh key mới dựa vào status code hoặc thời gian timeout; phải tiếp tục tra cứu (lookup) bằng cùng key/hash để đối soát.
5. **Replay Idempotent (code 91)**: Trường hợp DB đã commit nhưng lệnh create trả 503, replay cùng key/body sẽ trả 201 với dữ liệu đã tạo và chỉ tạo duy nhất một nghĩa vụ.
6. **Điều kiện tạo mới (Restart)**: Chỉ cho phép restart recovery khi nhận được xác nhận `invalidated` kèm `canRestart: true`; nếu đã `created` thì bắt buộc khôi phục kết quả cũ.
7. **Thời hạn Access Token & Session**: Access token tồn tại theo `JWT_EXPIRES_IN` (~15m); BE bắt buộc `sid`, user active và `tokenVersion` hợp lệ cho mỗi yêu cầu.
8. **Refresh Token & Header CSRF**: Refresh dùng HTTP-only cookie độc lập tối đa 30 ngày; mọi thao tác ghi dùng cookie bắt buộc đính kèm header `X-TotMart-Request: 1`; ngân sách tối đa 2 lần retry liên tiếp (<30s).
9. **Chống hoán đổi tài khoản (User Switch)**: FE phải kiểm tra đối tượng `subject`/`userId` trước khi replay; nếu người dùng chuyển tài khoản trong lúc chờ, huỷ ngay yêu cầu và không gửi chéo user.
10. **Bảo tồn Route Legacy**: Giữ nguyên route và chính tả đặc thù của BE gồm `subcribe` (`POST /api/subcribe-plans/user-subscribe`) và `check-out` (`POST /api/checkout/check-out`).

---

## 5. Số liệu hiện trạng mã nguồn (`src/`)

- **File trùng tên (Duplicate Basenames)**: **30 nhóm tên file** bị trùng lặp.
  - Phổ biến nhất là trùng lặp giữa hai cây thư mục `src/app/(client)/components/...` và `src/components/components_client/...` (`Canceldialog.js`, `cart_drawer.js`, `cart_item.js`, `category_item.js`, `main_header.js`, `nav_menu.js`, `SideBar.js`, v.v.).
  - Trùng lặp giữa `components_main` và `components_box`: `announcement-bar.js`, `brand-marquee.js`, `ChoosePlan.js`, `hero-sections.js`, `how-it-work.js`, `nav_box.js`, `product-showcase.js`, `testimonials.js`.
  - File quy ước Next.js: `page.js` (50 file), `page.jsx` (11 file), `layout.js` (4 file), `layout.jsx` (2 file).
- **File vượt quá 500 dòng (>500 LOC)**: **6 files**:
  1. `src/app/(admin)/components/box/BoxFormDialog.jsx`: **834 dòng**
  2. `src/components_box/nav_box.js`: **667 dòng**
  3. `src/components/ui/sidebar.jsx`: **634 dòng**
  4. `src/components/components_main/nav_box.js`: **590 dòng**
  5. `src/app/(admin)/admin-products/update/page.js`: **552 dòng**
  6. `src/app/(admin)/components/SubscribePlans/PlanTemplate/PlanFormDialog.jsx`: **503 dòng**
- **Số lượng `console.*`**: **63** lượt gọi trong thư mục `src`.
- **Số lượng `dangerouslySetInnerHTML`**: **3** vị trí (các khối render nội dung mô tả giàu định dạng).
- **Nơi lưu Access Token**:
  - Được lưu hoàn toàn **trong in-memory JavaScript variable** (`let accessToken = null` tại `src/app/middleware/tokenMiddleware.js`).
  - **Không** lưu trữ trong `localStorage` hay `sessionStorage` (hàm `saveToken` chủ động dọn dẹp các key `token` / `user` còn sót lại trong Web Storage).
  - Refresh token được quản lý qua **HttpOnly Cookie** do BE cấp, tự động gửi kèm qua `withCredentials: true` và header `X-TotMart-Request: 1`.

---

## 6. Đánh giá rủi ro & Phương án quay lui

- **Rủi ro hiện tại**:
  - Tồn tại file tracked đáng ngờ (`.claude/settings.local.json`, `.cursor/*`, `.impeccable/*`) có thể làm ô nhiễm lịch sử git nếu commit vô ý.
  - Sự tồn tại song song của hai cây component (`(client)/components` và `components/components_client`) dễ gây nhầm lẫn khi import/sửa lỗi.
- **Phương án quay lui (Rollback Plan)**:
  - Phase F00 chỉ đọc, không thay đổi bất kỳ file source nào. Nếu cần xóa bỏ cache build/test sinh ra: `git status` vẫn giữ nguyên 3 file sửa đổi của người dùng.
