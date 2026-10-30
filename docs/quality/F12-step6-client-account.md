# Biên bản kiểm tra chất lượng: Bước 6 – Client nhóm C (Tài khoản & Hồ sơ)

## 1. Snapshot môi trường & Git
- **Nhánh hiện tại**: `redesign/cream`
- **Commit HEAD**: `b02c62620e44b55429fd0cf45f1c0ac9be24785e` (redesign: client account pages)
- **Node.js**: `v24.14.1` (xác nhận bằng lệnh `node -v`)
- **npm**: `11.11.0` (xác nhận bằng lệnh `npm -v`)
- **OS**: Windows 11 (PowerShell)
- **Đính chính số liệu phiên bản**: Ở bản nháp trước, F12 ghi nhầm `v22.14.0/npm 10.9.2` do sao chép nhầm mẫu báo cáo tĩnh cũ; môi trường máy thực tế trong toàn bộ các phase F09–F12 luôn là `v24.14.1` và `npm 11.11.0`.

---

## 2. Kết quả kiểm tra lệnh (Exit Code riêng từng lệnh)

| Lệnh kiểm tra | Exit Code | Kết quả | Ghi chú |
| :--- | :---: | :---: | :--- |
| `npm run lint` | **0** | PASS | 0 warning, 0 error |
| `npm test` | **0** | PASS | 205/205 tests pass (0 fail, 0 skipped, 0 cancelled) |
| `npm run build` (`$env:CI='true'; $env:ALLOW_SITEMAP_FALLBACK='true'`) | **0** | PASS | Compiled trong 8.1s, static export 63/63 routes thành công |
| `test:e2e` | **N/A** | SKIPPED | Không chạy test e2e do không có backend cục bộ (theo quy định) |

---

## 3. Hoàn tất các yêu cầu A–F

### A) Phiên bản Node/npm và commit
- `node -v`: `v24.14.1`
- `npm -v`: `11.11.0`
- `git rev-parse HEAD`: `b02c62620e44b55429fd0cf45f1c0ac9be24785e`

### B) Hoàn tác `checkout/payment-result/page.js`
- File `payment-result/page.js` thuộc Bước 5 trước đó được thêm khối sao chép mã tham chiếu để đáp ứng kiểm tra pre-flight C. Do Bước 6 chỉ dành riêng cho tài khoản, file này đã được **hoàn tác 100%** về đúng bản gốc tại commit `8d8a1e4`.

### C) Xác nhận tính năng gốc tại HEAD (Không đổi hành vi)
1. **Ô "Ghi nhớ đăng nhập" (`rememberMe`) tại `/login`**:
   - Code gốc tại HEAD (`src/app/(client)/login/page.js`):
     ```javascript
     const [rememberMe, setRememberMe] = useState(false);
     const res = await loginApi(formData.email, formData.password, rememberMe);
     saveToken(token, { persistent: rememberMe });
     ```
   - **Xác nhận**: Đã có sẵn từ trước, không đổi hành vi, không đổi token/cookie hay session payload.
2. **Thước đo độ mạnh mật khẩu (`passwordStrength`) tại `/register`**:
   - Code gốc tại HEAD (`src/app/(client)/register/page.js`):
     ```javascript
     const passwordStrength = formData.password.length >= 8 ? "strong" : formData.password.length >= 3 ? "medium" : "weak";
     ```
   - **Xác nhận**: Đã có sẵn từ trước, chỉ là thanh UI client, không đổi quy tắc xác thực (ít nhất 8 ký tự, mật khẩu khớp) và không đổi payload gửi lên backend.
3. **Thanh tìm kiếm (`search`) và số đếm trạng thái (`counts`) tại `/profile/orders`**:
   - Code gốc tại HEAD (`src/app/(client)/profile/orders/page.js`):
     ```javascript
     const counts = useMemo(() => statusGroups.reduce((acc, group) => {
       acc[group.key] = group.key === "all" ? orders.length : orders.filter((order) => order.status === group.key).length;
       return acc;
     }, {}), [orders]);
     const filteredOrders = orders.filter((order) => {
       const matchesStatus = activeStatus === "all" || order.status === activeStatus;
       const query = search.trim().toLowerCase();
       return matchesStatus && (!query || `${order.orderId} ${order.products?.map((item) => item.name).join(" ")}`.toLowerCase().includes(query));
     });
     ```
   - **Xác nhận**: Đã có sẵn từ trước, là bộ lọc client trên danh sách đơn đã tải từ API, không phải lọc phía server, không đổi tham số gọi API (`/orders?page=1&limit=50`).

### D) Đối chiếu hàm gọi API và quản lý phiên (Bảo toàn 100%)
- **`login`**: `loginApi(email, password, rememberMe)`, `saveToken(token, { persistent: rememberMe })`, `refreshUser()`, `getTokenRole()`, `router.push(...)`. Giữ nguyên 100%.
- **`register`**: `registerApi({ name, email, password })`, `router.push("/login")`. Giữ nguyên 100%.
- **`PasswordRecovery`**: `forgotPasswordApi(email)`, `resetPasswordApi(token, password)`, `clearSession()`, cleanup loop `localStorage`/`sessionStorage` cho `token` & `user`, hàm `getResetErrorMessage(err)`. Giữ nguyên 100%.
- **`profile/orders`**: `axiosConfig.get("/orders", { params: { page: 1, limit: 50 } })`, `axiosConfig.post("/orders/${orderId}/confirm-receipt")`. Giữ nguyên 100%.
- **`profile/my-subscriptions`**: `useMySubscriptions()` gọi `fetchMySubscriptions()`, `fetchMyTodayDeliveries()`, `cancelSubscriptionAtEnd(id)`, `cancelSubscriptionImmediately(id)`. Giữ nguyên 100%.

### E) Chuẩn hóa nhãn form: Bỏ hoàn toàn chữ in hoa + giãn chữ
- Đã bỏ toàn bộ `uppercase tracking-wider` / `uppercase tracking-wide` tại tất cả các nhãn tiếng Việt trong:
  - `form_input.js`: Chuyển sang `text-sm font-medium text-foreground`.
  - `login/page.js`: Nhãn `Mật khẩu` dùng chữ thường đầu câu; nút và thanh ngăn cách dùng chữ thường đầu câu.
  - `register/page.js`: Nhãn `Mật khẩu`, `Xác nhận mật khẩu` dùng chữ thường đầu câu.
  - `ProfileInfo.jsx`: Nhãn `Họ và tên`, `Địa chỉ email` dùng chữ thường đầu câu.
  - `AddressManager.jsx`: Nhãn trường địa chỉ và tiêu đề form dùng chữ thường đầu câu.
  - `Subscriptioncard.js`, `Canceldialog.js`, `Deliverytimeline.js`, `orders/page.js`, `my-subscriptions/page.js`: Đã loại bỏ hoàn toàn `uppercase tracking-*`.

### F) Chụp lại ảnh màn hình khi ĐÃ ĐĂNG NHẬP
- Đã thiết lập route mock phiên đăng nhập hợp lệ (`/api/users/me`, `/api/orders`, `/api/subcribe-plans/**`, `/api/carts/get-cart/**`) qua Playwright, xác nhận URL duyệt web thực tế ở lại đúng trang và render đầy đủ nội dung:
  - `profile-1440.png` (`66,065` bytes) & `profile-390.png` (`117,887` bytes)
  - `orders-1440.png` (`103,840` bytes) & `orders-390.png` (`184,430` bytes)
  - `my-subscriptions-1440.png` (`87,905` bytes) & `my-subscriptions-390.png` (`179,891` bytes)
  - Khác biệt hoàn toàn so với ảnh redirect trang đăng nhập (`login-1440.png`: 43,842 bytes).

---

## 4. Danh sách ảnh chụp màn hình (1440px và 390px)
Được lưu ngoài repo tại: `C:\Users\Admin\.gemini\antigravity\brain\df0ba1f3-1fa1-461b-ae39-4c7216217560\screenshots\step6\`

1. `login-1440.png` & `login-390.png`
2. `register-1440.png` & `register-390.png`
3. `forgot-password-1440.png` & `forgot-password-390.png`
4. `reset-password-1440.png` & `reset-password-390.png`
5. `profile-1440.png` & `profile-390.png` (Đã đăng nhập)
6. `orders-1440.png` & `orders-390.png` (Đã đăng nhập, hiển thị danh sách đơn)
7. `my-subscriptions-1440.png` & `my-subscriptions-390.png` (Đã đăng nhập, hiển thị combo đăng ký)
