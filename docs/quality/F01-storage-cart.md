# Biên bản nghiệm thu chất lượng Phase F01: Storage Resilience & Cart State Transition

**Thời gian thực hiện**: 22/10/2026  
**Môi trường thực thi**: Windows 11 (PowerShell)  
**Tập trung**: Phục hồi lỗi Storage/Quota, phân tách dọn dẹp PasswordRecovery và chuyển trạng thái giỏ hàng nguyên tử (atomic reducer).

---

## 1. Snapshot môi trường & File thay đổi

- **Nhánh**: `staging`
- **Commit HEAD**: `6ecc0fe`
- **Môi trường**: Node.js `v24.14.1` | npm `11.11.0`
- **Danh sách file thay đổi**:
  - `src/app/context/WishlistContext.js`: Bọc an toàn getter và thao tác storage, bổ sung fallback bộ nhớ (`memoryFallback`).
  - `src/app/context/CartContext.js`: Bọc an toàn `read`/`store` và chuyển quản lý `items` + `version` sang `cartReducer` nguyên tử.
  - `src/app/(client)/components/ui/auth/PasswordRecovery.jsx`: Tách biệt API thành công khỏi cleanup best-effort; phân biệt lỗi 400 validation mật khẩu với link hết hạn; hiển thị 503 và `requestId`.
  - `tests/f01ResilienceRegression.test.cjs`: Bổ sung 13 ca kiểm thử hồi quy cho cả 3 lỗi, kiểm chứng items và version, hợp đồng checkout và UI smoke.

---

## 2. Xác minh từng lỗi trên source hiện tại & Cách tái hiện

### (a) WishlistProvider: Storage getter / ghi / xóa không bắt lỗi
- **Hiện trạng trước sửa**:
  `WishlistProvider` bọc ở root (`src/app/layout.js`). Gọi trực tiếp `localStorage.getItem`, `localStorage.setItem`, `localStorage.removeItem`.
- **Cách tái hiện**:
  Khi trình duyệt bật chế độ ẩn danh nghiêm ngặt hoặc chặn storage của bên thứ ba, việc truy cập `window.localStorage` ném `SecurityError`. Khi `useEffect` chạy, lỗi không được bắt làm nổ toàn bộ ứng dụng trước khi vẽ UI (rơi vào root Error Boundary).
- **Giải pháp & Kiểm chứng**:
  - Xây dựng `safeGetStorage()`, `readWishlistStorage()`, `writeWishlistStorage()`, `removeWishlistStorage()`.
  - Mọi ngoại lệ getter (`SecurityError`), ghi (`QuotaExceededError`), hoặc JSON hỏng đều được bắt và chuyển sang `memoryFallback` (`Map`).
  - Hợp đồng checkout: Khác với Wishlist (tiện ích hiển thị), Checkout bắt buộc lưu bền vững reference (`storeAttempt`) trước khi gửi giao dịch. Nếu storage bị chặn, checkout từ chối ngay (`'Hãy bật lưu trữ trình duyệt trước khi gửi yêu cầu.'`) để không sinh giao dịch mất dấu vết.

### (b) PasswordRecovery: Dọn dẹp storage thất bại sau API và gộp lỗi 400
- **Hiện trạng trước sửa**:
  1. `removeItem` nằm chung trong `try` với `resetPasswordApi`. Khi API thành công (BE đã tiêu thụ token 1 lần), nếu `removeItem` ném `SecurityError`, khối `catch` nhận lỗi và hiển thị thất bại cho người dùng. Token đã bị hủy trên BE nên người dùng không thể thử lại.
  2. Toàn bộ lỗi HTTP 400 đều bị quy thành: `"Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới."`, kể cả khi lỗi do validation mật khẩu (ví dụ < 8 ký tự, > 72 byte UTF-8). Người dùng bị đánh lừa là link hỏng dù token vẫn còn hạn.
- **Cách tái hiện**:
  1. Giả lập `localStorage.removeItem` ném ngoại lệ khi API trả về 200. UI cũ rơi vào `setError`.
  2. Gửi request reset với mật khẩu 6 ký tự. BE trả 400 `{ success: false, message: 'Validation failed', errors: [...] }`. UI cũ báo link hết hạn.
- **Giải pháp & Kiểm chứng**:
  - Tách biệt: Khi `resetPasswordApi` thành công, đặt `apiSuccess = true; setDone(true);`. Thao tác dọn dẹp storage và `clearSession()` chạy độc lập dạng best-effort trong `try...catch` an toàn.
  - Hàm `getResetErrorMessage(err)`: Phân tách rõ ràng giữa lỗi validation (`errors` hoặc `message: 'Validation failed'`) $\rightarrow$ thông báo yêu cầu mật khẩu; lỗi token hết hạn (`Invalid or expired reset password token`) $\rightarrow$ thông báo link hết hạn; lỗi 503 $\rightarrow$ thông báo hệ thống bận; lỗi có `requestId` $\rightarrow$ hiển thị `requestId`.

### (c) CartContext.clearCart: Items giữ draft mới nhưng version bị reset ngoài điều kiện
- **Hiện trạng trước sửa**:
  Hàm `clearCart(expectedItems)` có logic bảo vệ giỏ mới trong updater của `setCartItems`, nhưng lệnh `setCartVersion(0)` lại được gọi độc lập bên ngoài. Khi clear giỏ cũ mà giỏ hiện tại đã là draft mới, items được giữ lại nhưng `version` bị ép về 0, gây lệch pha version/items.
- **Cách tái hiện**:
  Khởi tạo giỏ draft 1 (version 1). Đổi sang draft 2 (version 2) có cùng sản phẩm hoặc khác object identity. Gọi `clearCart(draft1)`. Ở phiên bản cũ, items vẫn là draft 2 nhưng version bị hạ về 0.
- **Giải pháp & Kiểm chứng**:
  - Chuyển đổi toàn bộ trạng thái giỏ hàng sang `useReducer(cartReducer, { items: [], version: 0 })`.
  - Action `CLEAR`: Nếu `action.expectedItems && state.items !== action.expectedItems`, reducer trả về nguyên vẹn `state` (giữ cả items và version). Khi clear thành công, cả items và version đồng thời reset về `[]` và `0` trong đúng một state transition duy nhất, loại bỏ hoàn toàn side-effect khỏi updater.

---

## 3. Kết quả các lệnh kiểm tra (Lệnh riêng biệt & Exit Code)

| Lệnh | Exit Code | Kết quả | Trạng thái |
| :--- | :---: | :--- | :---: |
| `npm run lint` | **0** | ESLint kiểm tra toàn bộ project: 0 errors, 0 warnings. | **PASS** |
| `npm test` | **0** | Chạy 24 test suites (`tests/*.test.cjs`):<br>- **Passed**: 143 tests<br>- **Failed**: 0<br>- **Skipped**: 0<br>- **Duration**: 3.22s | **PASS** |
| `$env:CI="true"; npm run build -- --webpack` | **0** | Biên dịch Webpack cho Next.js 16.4.0 hoàn tất trong 16.7s, sinh 62 routes tĩnh/động không lỗi. | **PASS** |

### Chi tiết các ca test hồi quy trong `tests/f01ResilienceRegression.test.cjs` (13 tests):
1. `Wishlist: mount storage denied falls back to memory and does not throw`: PASS
2. `Wishlist: write quota failure retains in-memory fallback without throwing`: PASS
3. `Wishlist: corrupt stored JSON removes corrupted key safely and returns empty array`: PASS
4. `Checkout contract: wishlist memory fallback does not cause checkout to bypass durable storage requirement`: PASS
5. `Password Recovery: reset success with cleanup failure displays success and clears auth session memory`: PASS
6. `Password Recovery: 400 password validation error distinguishes password flaw from expired token`: PASS
7. `CartContext: stale clear with identical new draft preserves new draft and new version`: PASS
8. `CartContext: clearCart with active draft clears both items and version atomically`: PASS
9. `CartContext: clearCart without expectedItems resets both items and version`: PASS
10. `CartContext: SET_VERSION updates version and retains items`: PASS
11. `CartContext: storage denied read and store operate safely without throwing`: PASS
12. `CartContext and Wishlist: user switch scopes storage keys without cross-contamination`: PASS
13. `UI Smoke: WishlistProvider and CartProvider mount safely when storage is completely blocked`: PASS

---

## 4. UI Smoke Test: Khả năng chống chịu khi Storage bị chặn

- **Kịch bản**: Giả lập trình duyệt chặn hoàn toàn quyền truy cập Web Storage (cả `window.localStorage` và `window.sessionStorage` ném `SecurityError: The operation is insecure` ngay tại getter).
- **Kiểm thử**: Render `WishlistProvider` và `CartProvider` bọc quanh layout nội dung ứng dụng.
- **Kết quả**: Ứng dụng render thành công nội dung (`TotMart Content`), không ném ngoại lệ chưa xử lý, không làm kích hoạt React Error Boundary.

---

## 5. Các ca chưa chạy & Giới hạn kiểm thử

- **Không thực hiện**:
  - Không test thanh toán thật qua cổng SePay hoặc chuyển khoản thật (tuân thủ nguyên tắc an toàn).
  - Không gửi email reset password thật đến máy chủ SMTP production.
  - Không thay đổi hoặc thao tác trên database MongoDB / Redis thật ngoài phạm vi test harness.

---

## 6. Đánh giá rủi ro & Phương án quay lui (Rollback Plan)

- **Rủi ro**: Khi người dùng duyệt web trong môi trường chặn hoàn toàn storage (ví dụ trình duyệt nhúng đặc thù), giỏ hàng và danh sách yêu thích sẽ lưu trên RAM của tab hiện tại và không lưu qua các lần reload. Tuy nhiên, hành vi này là an toàn và có chủ đích: hệ thống chặn checkout nếu storage không thể lưu bền vững, bảo vệ người dùng khỏi việc mất dấu vết đơn hàng.
- **Phương án quay lui**:
  Nếu cần hoàn tác các thay đổi của Phase F01:
  ```powershell
  git checkout origin/staging -- src/app/(client)/components/ui/auth/PasswordRecovery.jsx src/app/context/CartContext.js src/app/context/WishlistContext.js
  Remove-Item tests/f01ResilienceRegression.test.cjs
  ```

---

## 7. Kết luận Gate Phase F01

- [x] Cả ba lỗi (a), (b), (c) không còn tái hiện trên mã nguồn.
- [x] Có đầy đủ unit & integration test hồi quy cho `items` VÀ `version` trong CartContext.
- [x] Storage bị chặn không làm ứng dụng rơi vào Error Boundary.
- [x] Lint, test (143 pass), build (exit code 0) đạt 100% tiêu chí cổng chất lượng.
