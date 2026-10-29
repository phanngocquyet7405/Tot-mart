# Biên bản kiểm tra chất lượng: Bước 6 – Client nhóm C (Tài khoản & Hồ sơ)

## 1. Snapshot môi trường & Git
- **Nhánh hiện tại**: `redesign/cream`
- **Commit gốc (HEAD)**: `8d8a1e4b634c8f2431a13e883e331a42448f7f23` (redesign: client purchase flow)
- **Node.js**: `v22.14.0`
- **npm**: `10.9.2`
- **OS**: Windows 11 (PowerShell)
- **Working Tree**:
  - 31 files modified (`+1306 -1813`)
  - 1 uncommitted doc: `docs/quality/F12-step6-client-account.md`
  - Các script scratch và ảnh chụp màn hình lưu hoàn toàn NGOÀI repo tại:
    `C:\Users\Admin\.gemini\antigravity\brain\df0ba1f3-1fa1-461b-ae39-4c7216217560\`

---

## 2. Kết quả kiểm tra lệnh (Exit Code riêng từng lệnh)

| Lệnh kiểm tra | Exit Code | Kết quả | Ghi chú |
| :--- | :---: | :---: | :--- |
| `npm run lint` | **0** | PASS | Không còn lỗi hoặc cảnh báo ESLint nào |
| `npm test` | **0** | PASS | 205/205 tests pass (0 fail, 0 skipped, 0 cancelled) |
| `npm run build` (`$env:CI='true'; $env:ALLOW_SITEMAP_FALLBACK='true'`) | **0** | PASS | Compiled trong 8.1s, static export 63/63 routes thành công |
| `test:e2e` | **N/A** | SKIPPED | Không chạy test e2e do không có backend cục bộ (theo quy định) |

---

## 3. Danh sách màn hình & Thành phần chuẩn hóa trong Bước 6

### 3.1. Các route tài khoản & xác thực
- `/login`: Form đăng nhập với `autoComplete="username email"`, `autoComplete="current-password"`, nút bật/tắt hiển thị mật khẩu có `aria-label`, vùng chạm $\ge 44$px (`min-h-11`), thông báo lỗi token chuẩn `text-destructive-text` / `bg-destructive/10`, thông báo đổi mật khẩu `text-warning-text`.
- `/register`: Form đăng ký với `autoComplete="name"`, `autoComplete="email"`, `autoComplete="new-password"`, thước đo độ mạnh mật khẩu dùng token semantic, nút ẩn/hiện mật khẩu có `aria-label`, checkbox điều khoản chuẩn token.
- `/forgot-password` & `/reset-password`: Hợp nhất qua `PasswordRecovery.jsx`, bảo toàn 100% logic `getResetErrorMessage`, xóa session khi reset mật khẩu, thông báo thành công không làm lộ PII/tồn tại tài khoản.

### 3.2. Các route hồ sơ cá nhân
- `/profile`: Chuẩn hóa bố cục, header phân cấp rõ ràng, liên kết chuyển sang `/profile/orders` bằng token. Skeleton tải trang dùng `bg-muted`.
- `ProfileTabs.jsx`: Tab chuyển trang cá nhân / sổ địa chỉ / giỏ hàng với `min-h-11`, tương thích mobile.
- `ProfileInfo.jsx`: Form họ tên, email, ảnh đại diện hoàn toàn tiếng Việt, nhãn gắn `htmlFor`/`id`, inline error, touch target $\ge 44$px.
- `AddressManager.jsx`: Sổ địa chỉ thêm/sửa/xóa, dialog chỉnh sửa dùng token semantic, vùng chạm $\ge 44$px.
- `CartManager.jsx`: Danh sách giỏ hàng cá nhân, số lượng tăng/giảm nút tối thiểu 40px, số tiền định dạng `tabular-nums`.

### 3.3. Đơn hàng & Gói đăng ký
- `/profile/orders`: Bộ lọc trạng thái trực quan với số đếm `tabular-nums`, thanh tìm kiếm, thẻ đơn hàng responsive chuyển đổi linh hoạt dưới 768px, giá tiền `tabular-nums`, badge trạng thái phân biệt rõ ràng (`text-warning-text`, `text-primary`, `text-success-text`, `text-destructive-text`), đủ 5 trạng thái (skeleton, rỗng, lỗi có Thử lại, đang xác nhận, thành công).
- `/profile/my-subscriptions`:
  - `Subscriptioncard.js`: Thẻ combo đăng ký, tiến độ giao hàng, hiển thị số tiền `tabular-nums`, nút xem chi tiết combo và sản phẩm trong hộp.
  - `Deliverytimeline.js`: Timeline đợt giao trực quan với trạng thái đã giao / kế tiếp / chờ giao dùng token `bg-primary`.
  - `Canceldialog.js`: Hộp thoại xác nhận hủy cuối kỳ hoặc hủy ngay lập tức với token cảnh báo rõ ràng.
  - `Emptysubscription.js`: Trạng thái rỗng với CTA dẫn tới danh mục gói đăng ký.

### 3.4. Chuẩn hóa Re-export legacy
- Toàn bộ 12 file trong `src/components/components_client/components/profile/*` và `ui/auth/*` đã được chuyển thành re-export trực tiếp từ `@/app/(client)/components/...`, loại bỏ triệt để mã trùng lặp và giữ tương thích ngược 100%.

---

## 4. Bằng chứng ảnh chụp màn hình (1440px và 390px)
Tất cả ảnh chụp lưu ngoài repo tại thư mục:
`C:\Users\Admin\.gemini\antigravity\brain\df0ba1f3-1fa1-461b-ae39-4c7216217560\screenshots\step6\`

1. `login-1440.png` & `login-390.png`
2. `register-1440.png` & `register-390.png`
3. `forgot-password-1440.png` & `forgot-password-390.png`
4. `reset-password-1440.png` & `reset-password-390.png`
5. `profile-1440.png` & `profile-390.png`
6. `orders-1440.png` & `orders-390.png`
7. `my-subscriptions-1440.png` & `my-subscriptions-390.png`

---

## 5. Bảng thống kê Diff (`git diff --stat HEAD`)

```text
 src/app/(client)/checkout/payment-result/page.js   |  73 ++++-
 .../(client)/components/profile/AddressManager.jsx | 233 +++++++++------
 .../(client)/components/profile/CartManager.jsx    | 170 ++++++-----
 .../components/profile/MySub/Canceldialog.js       | 126 ++++----
 .../components/profile/MySub/Deliverytimeline.js   |  48 ++-
 .../components/profile/MySub/Emptysubscription.js  |  39 +--
 .../components/profile/MySub/Subscriptioncard.js   | 153 +++++-----
 .../(client)/components/profile/ProfileInfo.jsx    |  63 ++--
 .../(client)/components/profile/ProfileTabs.jsx    |  22 +-
 .../components/ui/auth/PasswordRecovery.jsx        | 105 +++++--
 src/app/(client)/components/ui/auth/auth_button.js |  25 +-
 src/app/(client)/components/ui/auth/auth_card.js   |  12 +-
 .../(client)/components/ui/auth/auth_container.js  |   4 +-
 src/app/(client)/components/ui/auth/form_input.js  |  83 +++---
 src/app/(client)/login/page.js                     | 136 +++++----
 src/app/(client)/profile/my-subscriptions/page.js  | 176 ++++++-----
 src/app/(client)/profile/orders/page.js            | 328 +++++++++++++++++----
 src/app/(client)/profile/page.js                   |  37 ++-
 src/app/(client)/register/page.js                  | 190 ++++++++----
 .../components/profile/AddressManager.jsx          | 258 +---------------
 .../components/profile/CartManager.jsx             | 114 +------
 .../components/profile/MySub/Canceldialog.js       | 167 +----------
 .../components/profile/MySub/Deliverytimeline.js   |  89 +-----
 .../components/profile/MySub/Emptysubscription.js  |   4 +-
 .../components/profile/MySub/Subscriptioncard.js   | 276 +----------------
 .../components/profile/ProfileInfo.jsx             |  99 +------
 .../components/profile/ProfileTabs.jsx             |  45 +--
 .../components/ui/auth/auth_button.js              |   4 +-
 .../components/ui/auth/auth_card.js                |   4 +-
 .../components/ui/auth/auth_container.js           |   4 +-
 .../components/ui/auth/form_input.js               |  32 +-
 31 files changed, 1306 insertions(+), 1813 deletions(-)
```

---

## 6. Rủi ro & Cách quay lui
- **Rủi ro**: Thấp. Không có API endpoint hay hợp đồng dữ liệu backend nào bị sửa đổi. Validation phía client và luồng xác thực auth/token/cookie được giữ nguyên 100%.
- **Cách quay lui**: `git checkout -- src/` sẽ hoàn tác toàn bộ giao diện về trạng thái commit `8d8a1e4`.
