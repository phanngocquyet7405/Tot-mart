# Báo cáo Chất lượng & Biên bản Nghiệm thu F06

> **Giai đoạn:** F06 (CRUD Admin/Combo, Catalog, Thanh toán không hợp lệ, Review/Rating, Safe Error 5xx + Request ID, Trải nghiệm & Chuyển động Emil, Tiếp cận A11y)  
> **Thời điểm hoàn thành:** 2026-10-25 13:15:00 +07:00  
> **Nhánh:** `fe/f-fix`  
> **FE Baseline Git Commit:** `3ddb8dad7456cc2c5670643fc77014399c7f7001`  
> **Trạng thái Git:** Chưa commit (tuân thủ nghiêm ngặt quy tắc `Không commit` của AGENTS.md)  
> **Môi trường:** Node `v24.14.1`, npm `11.11.0`, Windows (PowerShell)  
> **BE Snapshot ghim:** `C:\Users\84862\Desktop\totmart\be-pinned` (TOTMART_BE_ROOT)  
> **BE Git rev-parse HEAD:** `c7f4bb1dfcc8714ca9b1a7ed679975029b0c5706`  
> **Sửa đổi BE:** **KHÔNG** (0 file thay đổi, BE là read-only snapshot)  
> **Thay đổi dependencies (`package.json`):** **KHÔNG** (0 dependency mới được cài đặt)  
> **Dữ liệu thật / Bảo mật:** 100% fixture isolated trên `127.0.0.1`, không dùng ngân hàng thật, không chứa PII/cookie/token.

---

## 1. PHẦN 1 — Kiểm chứng Chức năng (Functional Browser E2E)

Kiểm thử tự động toàn diện qua Playwright và Fixture BE độc lập ([scripts/run-f06-suite.cjs](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/scripts/run-f06-suite.cjs) & [scripts/f06-browser-e2e.cjs](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/scripts/f06-browser-e2e.cjs)) bao phủ 5 nhóm chức năng:

### 1.1 CRUD Admin/Combo & Phân quyền chéo (Cross-Merchant Authorization)
- **Quyền sửa sản phẩm:** Merchant A cố tình gửi request sửa sản phẩm của Merchant B (`PUT /api/products/:id`) -> BE trả về HTTP 403/404 từ chối dứt khoát.
- **Quyền sửa combo:** Merchant A cố tình gửi request sửa combo của Merchant B (`PUT /api/boxes/update-box/:id`) -> BE trả về HTTP 403/404 từ chối dứt khoát.
- **Bất biến dữ liệu:** Đối chiếu DB snapshot trước và sau các request bị từ chối giống nhau 100%, xác nhận không có bất kỳ tác dụng phụ (side-effects) hay biến đổi ngầm nào trên cơ sở dữ liệu.
- **Owner selector & validation Admin:** Dialog tạo box của Admin có bộ chọn chủ sở hữu (`select#combo-owner`), validate chặn submit khi thiếu trường bắt buộc và hiển thị thông báo lỗi trực quan.

### 1.2 Danh mục sản phẩm (Catalog Integrity)
- **Phân trang $\ge 3$ trang:** Đã seed 26 sản phẩm thực tế cho Merchant A; chuyển tuần tự qua trang 1, 2, 3 với xác minh 0 sản phẩm bị trùng lặp hay thất lạc giữa các trang.
- **Tìm kiếm từ khóa:** Tìm kiếm từ khóa trả về chính xác sản phẩm tương ứng; tìm từ khóa không tồn tại hiển thị trạng thái rỗng `"Không tìm thấy sản phẩm phù hợp."` mà không dùng mock data che lỗi.
- **Tồn kho = 0:** Sản phẩm tồn kho = 0 hiển thị nhãn phủ "Hết hàng" và nút "HẾT HÀNG" bị vô hiệu hóa (`disabled`), ngăn chặn đặt hàng.
- **Giá = 0:** Sản phẩm chưa định giá hiển thị nhãn an toàn `"Liên hệ"` và vô hiệu hóa nút mua.
- **Ảnh lỗi:** `onError` fallback an toàn về `/assets/placeholder.png` mà không làm vỡ bố cục giao diện.
- **Lỗi 5xx:** Mô phỏng lỗi máy chủ 500 trả về thông báo an toàn `"Lỗi hệ thống. Vui lòng thử lại."` kèm `Request ID` (ví dụ: `req-f06-catalog-500`) và nút "Thử lại"; nhấn "Thử lại" khôi phục danh sách sản phẩm thành công.

### 1.3 Thanh toán & Trạng thái QR không hợp lệ (Payment & Non-Payable QR States)
- **Pending:** Đơn hàng tạo thành công ở trạng thái chờ thanh toán hiển thị mã QR VietQR và số tiền cần chuyển.
- **Underpaid:** Mô phỏng thanh toán một phần qua SePay webhook có xác thực (`Authorization: Apikey ...`); giao diện thông báo rõ số tiền đã nhận một phần và hiển thị mã QR kèm số tiền còn lại (`remainingAmount`).
- **Paid:** Webhook nhận đủ số tiền còn lại; giao diện tự động chuyển sang màn hình thành công [OrderSuccessScreen.js](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/(client)/components/Checkout_component/OrderSuccessScreen.js) và không yêu cầu chuyển thêm tiền.
- **Mã không payable (Cancelled, Expired, On-Hold):** Khi mở URL thanh toán cũ (`/checkout?code=...`), các đơn huỷ, hết hạn hoặc tạm giữ tồn kho bị loại bỏ hoàn toàn mã QR, không hiển thị số tài khoản ngân hàng, không hiển thị nút sao chép, và xuất hiện cảnh báo giải thích rõ ràng không nhận chuyển khoản.

### 1.4 Đánh giá & Chính sách quà tặng (Rating/Reviews & Gift Policy)
- **Đánh giá:** Sản phẩm có dữ liệu hiển thị đúng số sao và điểm đánh giá thực tế (4.8 sao, 24 đánh giá). Sản phẩm không có dữ liệu đánh giá thì ẩn toàn bộ sao, không tự ý gán mặc định 5.0 hoặc 0; thông báo trung thực `"TotMart chưa cung cấp dữ liệu đánh giá cho sản phẩm này."`.
- **Chính sách mua nhiều & quà tặng:** Hộp quà tặng chỉ hiển thị chính sách chiết khấu mua nhiều (ví dụ: "Từ 3 hộp: giảm 10% giá hộp") và tiện ích kèm theo ("Thiệp viết tay thủ công: +5.000 ₫/hộp") từ chính sách `giftPolicy` của chủ sở hữu được xác nhận từ BE.

### 1.5 Safe Error 5xx / 503 trong Manager
- Hàm `managerError` trích xuất `requestId` từ response lỗi và trả về chuỗi an toàn `"Lỗi hệ thống. Vui lòng thử lại. (Request ID: ...)"`, bảo vệ thông tin nội bộ máy chủ.

---

## 2. PHẦN 2 — Trải nghiệm & Chuyển động Emil (Impeccable Audit & Execution)

Tuân thủ nghiêm ngặt quy trình: Chạy audit ở chế độ REPORT ONLY -> Lập danh sách phân loại theo độ nghiêm trọng -> Chờ USER duyệt -> Chỉ sửa đúng 6 file được USER chấp thuận -> Tuân thủ nguyên tắc chuyển động của Emil (tôn trọng `prefers-reduced-motion`, không thêm thư viện mới) -> Tuyệt đối không đụng chạm logic checkout attempt recovery, auth, storage, tính tiền hay sanitizer.

### 2.1 Bảng Xử lý Vấn đề Trải nghiệm đã được Phê duyệt
| # | Mức độ | Vấn đề phát hiện | Giải pháp thực hiện | File chỉnh sửa |
| :-: | :---: | :--- | :--- | :--- |
| 1 | **Cao** | Phóng to ảnh catalog khi hover thiếu `prefers-reduced-motion` | Bổ sung `motion-reduce:transform-none motion-reduce:transition-none` vào thẻ Image | [product_card.js](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/(client)/components/layout/product/product_card.js) |
| 2 | **Cao** | Animation xoay/lò xo trong `OrderSuccessScreen` chạy cả khi bật reduced motion | Tích hợp hook `useReducedMotion()` từ `framer-motion` để vô hiệu hóa scale/rotate khi reduced motion bật | [OrderSuccessScreen.js](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/(client)/components/Checkout_component/OrderSuccessScreen.js) |
| 3 | **Cao** | Nút Wishlist dùng nhãn tiếng Anh cứng `aria-label="Add to wishlist"` | Chuyển sang tiếng Việt theo ngữ cảnh: `aria-label={isWishlisted ? "Bỏ yêu thích sản phẩm" : "Thêm vào danh sách yêu thích"}` | [product_card.js](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/(client)/components/layout/product/product_card.js) |
| 4 | **Trung bình** | Điều hướng tab dùng `role="group"` và `aria-pressed` | Chuẩn hóa WAI-ARIA Tabs: `role="tablist"` trên container, `role="tab"`, `aria-selected`, `aria-controls` cho nút tab và `role="tabpanel"`, `aria-labelledby` cho panel | [ProductInfoTabs.js](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/(client)/components/Product/ProductInfoTabs.js) |
| 5 | **Trung bình** | Cụm sao đánh giá thiếu nhãn đọc trợ năng tổng quan | Thêm `aria-label={`Đánh giá ${product.rating} trên 5 sao (${product.reviewCount} lượt đánh giá)`}` và ẩn cụm sao trang trí với `aria-hidden="true"` | [product_card.js](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/(client)/components/layout/product/product_card.js) |
| 6 | **Trung bình** | Skeleton pulse nhấp nháy liên tục khi bật reduced motion | Bổ sung `motion-reduce:animate-none` cho các ô skeleton | [products_grid.js](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/(client)/components/layout/product/products_grid.js) |
| 7 | **Trung bình** | Thumbnail và nút tăng giảm số lượng box thiếu `motion-reduce` | Bổ sung `motion-reduce:transition-none` cho các nút tương tác | [BoxDetailInteractive.jsx](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/(client)/products/box/[id]/BoxDetailInteractive.jsx) |
| 8 | **Thấp** | Fallback `alt="product"` bằng tiếng Anh | Đổi fallback thành `product.name || "Sản phẩm TotMart"` | [product_card.js](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/(client)/components/layout/product/product_card.js) |
| 9 | **Thấp** | Panel thông tin thanh toán có các vi tương tác thiếu `motion-reduce` | Bổ sung `motion-reduce:transition-none` vào nút copy và thẻ chọn phương thức | [PaymentStep.js](file:///C:/Users/84862/Desktop/WorkSpace/totmart/fe_totmart/src/app/(client)/components/Checkout_component/PaymentStep.js) |

---

## 3. PHẦN 3 — Tiếp cận (Accessibility A11y) & Ca chưa chạy

### 3.1 Tiêu chí Tiếp cận WCAG 2.2 AA đã Kiểm chứng
1. **Form error bindings:** Mọi thông báo lỗi form (`BoxFormDialog`, `PaymentStep`) gắn thẻ `role="alert"` hoặc `role="status"` kèm `aria-describedby` liên kết trực tiếp với trường input.
2. **Dialog focus trap & restore:** Dialog tạo Box quản trị sử dụng Radix UI Primitive, tự động khóa focus bên trong khi mở và hoàn trả focus về nút kích hoạt ban đầu khi đóng dialog.
3. **Semantics & Labels:** Nút Wishlist, nút sao chép, nút chọn tab, nút tăng giảm số lượng đều có nhãn tiếng Việt rõ ràng, không để trống `aria-label`.
4. **Live regions:** Vùng thông báo thanh toán thiếu tiền sử dụng `role="status"` giúp Screen Reader đọc ngay số tiền còn lại mà không cần tải lại trang. Các trường số lượng có `<output aria-live="polite">`.
5. **Contrast & Touch targets:** Màu Terracotta `#C85C3C` và Market Leaf `#15803d` đạt độ tương phản chuẩn trên nền trắng và cream `#FFFAF8`. Kích thước vùng bấm đạt tối thiểu 44px trên giao diện cảm ứng/di động.
6. **Decorative image alt tags:** Ảnh và icon mang tính trang trí thuần túy gắn `aria-hidden="true"`, các ảnh sản phẩm chính thức đều mang thuộc tính `alt` có ý nghĩa.

### 3.2 Ghi nhận Ca chưa chạy (Unrun Test Cases)
- **Trình duyệt chưa chạy tự động:** Firefox (Gecko), WebKit (Safari Desktop). E2E tự động hiện tại chạy trên Chromium headless của Playwright.
- **Thiết bị thật chưa chạy:** iOS Safari trên iPhone/iPad thực tế, Android Chrome trên thiết bị thực tế (đã mô phỏng viewport mobile qua Playwright nhưng chưa chạy trên phần cứng vật lý).

---

## 4. Tổng hợp Kết quả Nghiệm thu Kỹ thuật (Exit Codes)

Tất cả các lệnh kiểm tra được thực thi riêng biệt, ghi nhận exit code độc lập:

| Lệnh kiểm thử | Exit Code | Kết quả | Chi tiết / Phạm vi |
| :--- | :---: | :---: | :--- |
| `npm run lint` | **0** | **PASS** | Đạt 100% chuẩn ESLint (0 errors, 0 warnings mới). |
| `npm test` | **0** | **192 / 192 PASS** | 100% unit tests và integration tests đỗ. |
| `npm run build -- --webpack` | **0** | **PASS** | Biên dịch thành công 63/63 static pages và dynamic routes. |
| `node scripts/run-f06-suite.cjs` | **0** | **20 / 20 PASS** | 20/20 checks kiểm thử E2E chức năng F06 đạt chuẩn tuyệt đối. |
| `node scripts/run-f02-suite.cjs` | **0** | **32 / 32 PASS** | 15 HTTP checks + 11 F02 browser checks + 6 UI regression checks. |

---

## 5. Danh sách File Sửa đổi & Diff Fingerprint

```
 src/app/(admin)/components/box/BoxFormDialog.jsx   | 10 ++-
 .../Checkout_component/OrderSuccessScreen.js       | 23 +++----
 .../components/Checkout_component/PaymentStep.js   | 46 ++++++++++++--
 src/app/(client)/components/Product/GiftOptions.js | 52 +++++++++++----
 .../(client)/components/Product/ProductGallery.js  |  2 +-
 .../(client)/components/Product/ProductInfoTabs.js | 14 +++--
 .../components/layout/product/product_card.js      | 71 +++++++++++----------
 .../components/layout/product/products_grid.js     | 38 +++++++++--
 .../products/box/[id]/BoxDetailInteractive.jsx     |  4 +-
 src/app/(client)/products/page.js                  | 73 +---------------------
 src/app/hook/checkout/useCheckout.js               | 49 ++++++++++++---
 src/app/hook/useProductDetail.js                   | 11 +++-
 src/app/manager/lib/productModel.mjs               |  6 +-
 src/app/services/api/Checkoutpageservice.js        | 48 ++++++++++++--
 src/app/services/server/serverCatalog.js           |  2 +-
 src/app/util/cartLine.mjs                          |  4 +-
 16 files changed, 287 insertions(+), 166 deletions(-)
```

---

## 6. Đánh giá Rủi ro & Cách Quay lui (Rollback Plan)

### 6.1 Đánh giá Rủi ro
- **Rủi ro hồi quy thanh toán:** **RẤT THẤP**. Cả hai bộ test F06 và F02 đều chạy trên bản build production thực tế, xác nhận toàn bộ luồng thanh toán và cơ chế phục hồi attempt vẫn hoạt động chính xác.
- **Rủi ro bảo mật thông tin nội bộ:** **KHÔNG CÓ**. Tất cả lỗi 5xx/503 đều được che chắn an toàn bằng thông báo tiếng Việt kèm `Request ID`.
- **Rủi ro hiệu năng / Chuyển động:** **KHÔNG CÓ**. Các hiệu ứng chuyển động đã được kiểm soát chặt chẽ với `prefers-reduced-motion`, không thêm bất kỳ thư viện animation nào mới.

### 6.2 Cách Quay lui (Rollback)
Nếu cần khôi phục lại trạng thái checkpoint trước F06:
```powershell
git checkout 3ddb8dad7456cc2c5670643fc77014399c7f7001 -- src/
Remove-Item -Force scripts/f06-browser-e2e.cjs, scripts/run-f06-suite.cjs, scripts/verify-f06-fixture.cjs
```

---

## 7. Kết luận
Giai đoạn **F06** đã hoàn thành đầy đủ cả 3 phần:
1. Chức năng đạt 100% (20/20 test Playwright pass).
2. Trải nghiệm & chuyển động Emil hoàn tất trên đúng 6 file được phê duyệt.
3. Tiếp cận A11y chuẩn hóa, 192 unit tests pass, toàn bộ bộ kiểm thử hồi quy pass với exit code 0.
4. Tuân thủ tuyệt đối quy tắc **KHÔNG commit**.
