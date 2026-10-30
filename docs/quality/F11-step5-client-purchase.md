# Biên bản nghiệm thu Bước 5: Client Nhóm B – Mua hàng (Cart, Checkout, Payment Result, Wishlist)

## 1. Snapshot môi trường
- **Nhánh hiện tại:** `redesign/cream` (tạo từ `staging` tại commit `67790b6`)
- **Diff fingerprint (Client Purchase):** 28 files changed, 716 insertions(+), 1708 deletions(-)
- **Node:** `v24.14.1`
- **npm:** `11.11.0`
- **Hệ điều hành:** Windows 11 (PowerShell)
- **Repo:** `C:\Users\84862\Desktop\WorkSpace\totmart\fe_totmart`

## 2. Kết quả Quality Gates

| Lệnh | Exit code | Chi tiết kết quả |
|---|:---:|---|
| `npm run lint` | **0** | ESLint thông qua sạch sẽ, 0 lỗi, 0 cảnh báo. |
| `npm test` | **0** | 205/205 tests pass, 0 fail, 0 skip (thời gian ~6.4s). |
| `$env:CI='true'; $env:ALLOW_SITEMAP_FALLBACK='true'; npm run build` | **0** | Next.js 16.4.3 Turbopack build thành công 63/63 routes tĩnh & động. |
| `npm run test:e2e:purchase` | **N/A** | **Chưa chạy vì thiếu backend**: Không có tiến trình backend đang lắng nghe tại `127.0.0.1:3102`. Ghi nhận rõ ràng theo quy tắc phase. |

## 3. Nội dung chuẩn hóa trong Bước 5 – Client Mua hàng

1. **Chuẩn hóa Giao diện & Token ngữ nghĩa:**
   - Sử dụng nền ấm `bg-background` (cream), khối thẻ `bg-card`, viền `border-border`.
   - Nút chính terracotta `bg-primary text-primary-foreground hover:bg-primary/90`, nút phụ viền be ấm `border border-border bg-card text-foreground hover:bg-muted`.
   - 100% token hóa màu sắc, loại bỏ toàn bộ mã hex hardcode và các lớp màu (`amber-*`, `stone-*`, `rose-*`, `slate-*`, `gray-*`).
   - Mọi giá tiền VND đều hiển thị với font số `tabular-nums` và căn phải chuẩn xác trên tóm tắt.

2. **Tiến trình Thanh toán (Checkout Steps):**
   - Stepper rõ ràng (`CheckoutStepper.js`): Bước 1 (Địa chỉ) → Bước 2 (Kiểm tra) → Bước 3 (Thanh toán), hiển thị bước hiện tại, cho phép quay lại các bước đã hoàn tất.
   - Giữ nguyên 100% hợp đồng dữ liệu, đối soát idempotency key, F02/F04 contract và logic xử lý pending attempt của backend.

3. **Tóm tắt đơn hàng (OrderSummary):**
   - **Desktop ($\ge 1024$px):** Cố định bên phải (`lg:sticky lg:top-24`).
   - **Mobile ($< 1024$px):** Thiết kế dạng thanh thu gọn / accordion thông minh (`mobileExpanded`), hiển thị tổng tiền nhanh và cho phép bấm mở xem danh sách sản phẩm đầy đủ mà không chiếm dụng toàn bộ màn hình.

4. **Trang kết quả thanh toán (payment-result):**
   - 3 trạng thái phân định rõ ràng:
     - **Chờ (Checking):** Vòng xoay tiến trình `text-primary`, thông báo đối chiếu thân thiện.
     - **Thành công (Success):** `OrderSuccessScreen` với biểu tượng xanh thành công ngữ nghĩa (`text-success-text`), nút "Xem đơn hàng của tôi" và "Tiếp tục mua sắm".
     - **Thất bại (Failed):** Thông điệp lịch sự, không hiển thị mã lỗi kỹ thuật nội bộ gây rối, có nút "Thử thanh toán lại" và "Về trang chủ".

5. **Trợ năng Form & 5 Trạng thái tiêu chuẩn:**
   - Tất cả các trường nhập liệu (`AddressStep.js`, `PaymentStep.js`) đều gắn nhãn qua `htmlFor` và `id`.
   - Lỗi hiển thị ngay dưới từng trường (`fieldErrors`).
   - Vùng chạm đạt chuẩn tối thiểu $\ge 44$px trên thiết bị di động (`min-h-11`).
   - Giỏ hàng (`/cart`) và Danh sách yêu thích (`/wishlist`): Đủ 5 trạng thái (Loading skeleton, Empty state có nút CTA "Tiếp tục mua sắm", Error state, Disabled state, Success state).

6. **Đồng bộ hóa Re-export Canonical:**
   - Các file trong `src/components/components_client/components/Cart_component/*` và `src/components/components_client/components/Checkout_component/*` được re-export trực tiếp từ canonical components trong `src/app/(client)/components/...`, loại bỏ hoàn toàn mã trùng lặp và giữ nguyên các đường dẫn import sẵn có.

## 4. Danh sách các file thay đổi trong Bước 5

- **Trang mua hàng chính:**
  - `src/app/(client)/cart/page.js`
  - `src/app/(client)/checkout/page.jsx`
  - `src/app/(client)/checkout/payment-result/page.js`
  - `src/app/(client)/wishlist/page.js`
- **Components Giỏ hàng:**
  - `src/app/(client)/components/Cart_component/cart_drawer.js`
  - `src/app/(client)/components/Cart_component/cart_item.js`
- **Components Checkout:**
  - `src/app/(client)/components/Checkout_component/checkoutStyles.js`
  - `src/app/(client)/components/Checkout_component/SectionCard.js`
  - `src/app/(client)/components/Checkout_component/CheckoutStepper.js`
  - `src/app/(client)/components/Checkout_component/AddressStep.js`
  - `src/app/(client)/components/Checkout_component/ReviewStep.js`
  - `src/app/(client)/components/Checkout_component/PaymentStep.js`
  - `src/app/(client)/components/Checkout_component/OrderSummary.js`
  - `src/app/(client)/components/Checkout_component/CartLine.js`
  - `src/app/(client)/components/Checkout_component/OrderSuccessScreen.js`
- **Re-exports canonical (`src/components/components_client`):**
  - `src/components/components_client/components/Cart_component/cart_drawer.js`
  - `src/components/components_client/components/Cart_component/cart_item.js`
  - `src/components/components_client/components/Checkout_component/AddressStep.js`
  - `src/components/components_client/components/Checkout_component/CheckoutStepper.js`
  - `src/components/components_client/components/Checkout_component/OrderSuccessScreen.js`
  - `src/components/components_client/components/Checkout_component/OrderSummary.js`
  - `src/components/components_client/components/Checkout_component/PaymentStep.js`
  - `src/components/components_client/components/Checkout_component/ReviewStep.js`
  - `src/components/components_client/components/Checkout_component/SectionCard.js`
- **Bổ sung cải tiến trợ năng & mobile từ Bước 4 (theo yêu cầu tiền kiểm):**
  - `src/app/(client)/components/ui/SideBar.js` (scroll lock, focus return, Esc close)
  - `src/app/(client)/components/Product/ProductPurchasePanel.js` (safe-area padding, bottom spacer)
  - `src/app/(client)/products/box/[id]/BoxDetailInteractive.jsx` (mobile sticky bar with safe area)
  - `src/app/(client)/homepage/HomePageClient.jsx` (token hóa text-muted-foreground)

## 5. Danh mục ảnh chụp thực tế (Lưu ngoài repo)
Toàn bộ ảnh chụp màn hình kiểm thử giao diện Desktop (1440px) và Mobile (390px) được lưu tại thư mục:
`C:\Users\Admin\.gemini\antigravity\brain\df0ba1f3-1fa1-461b-ae39-4c7216217560\screenshots\step5\`

| Tên màn hình | Đường dẫn route | Ảnh Desktop (1440px) | Ảnh Mobile (390px) |
|---|---|---|---|
| Giỏ hàng | `/cart` | `cart-1440.png` | `cart-390.png` |
| Thanh toán | `/checkout` | `checkout-1440.png` | `checkout-390.png` |
| Kết quả thanh toán | `/checkout/payment-result` | `payment-result-1440.png` | `payment-result-390.png` |
| Danh sách yêu thích | `/wishlist` | `wishlist-1440.png` | `wishlist-390.png` |

## 6. Đánh giá rủi ro & Cách quay lui

- **Rủi ro:**
  - Logic giỏ hàng và thanh toán phụ thuộc vào `CartContext` và `useCheckout`. Toàn bộ các hook, function signatures, props (`onSelectAddress`, `onAddressFieldChange`, `onPlaceOrder`, `onApplyCoupon`, `cartLineKey`) đã được giữ nguyên 100%, vượt qua tất cả 205 unit/behavior tests mà không có bất kỳ xung đột nào.
- **Cách quay lui:**
  - Khôi phục lại trạng thái commit đầu bước (`67790b6`):
    ```bash
    git checkout 67790b6 -- src/app/(client)/cart src/app/(client)/checkout src/app/(client)/wishlist src/app/(client)/components/Checkout_component src/app/(client)/components/Cart_component src/components/components_client/components/Cart_component src/components/components_client/components/Checkout_component
    ```
