# Biên bản Nghiệm thu Kỹ thuật: Phase F05 — Quy hoạch Cấu trúc, Phân rã File & Progressive Typecheck

> **Ngày lập:** 22/10/2026  
> **Dự án:** TotMart Front-End (`fe_totmart`)  
> **Phạm vi:** Củng cố cây components song song (SSOT + re-export bridge), phân rã form/file lớn (>500 dòng), thay thế `console.*` bằng logger phân cấp & lọc dữ liệu nhạy cảm, progressive `checkJs` & JSDoc cho các domain module trọng yếu, chuẩn hóa mục lục docs (current vs historical).

---

## 1. Môi trường & Snapshot Hệ thống

| Tiêu chí | Thông số kiểm tra | Ghi chú |
| :--- | :--- | :--- |
| **Hệ điều hành** | Windows 11 / PowerShell | |
| **Thư mục làm việc** | `C:\Users\84862\Desktop\WorkSpace\totmart\fe_totmart` | Repo FE độc lập |
| **Git Branch** | `staging` | Tracking `origin/staging` |
| **Commit Base** | `6ecc0fe` | |
| **Node.js** | `v24.14.1` | |
| **npm** | `11.11.0` | |

---

## 2. Kết quả Chạy Kiểm tra Độc lập

| Lệnh thực thi | Mục đích kiểm tra | Exit Code | Kết quả chi tiết |
| :--- | :--- | :---: | :--- |
| `npm run lint` | ESLint toàn bộ source | **0** | 0 error, 0 warning |
| `npm run typecheck` | `tsc -p jsconfig.json --noEmit` | **0** | 0 type errors across TS & JSDoc `@ts-check` modules |
| `npm test` | Node test runner (`tests/*.test.cjs`) | **0** | **180 passed**, 0 failed, 0 skipped (27 test suites) |
| `$env:CI="true"; npm run build -- --webpack` | Production build Next.js (Webpack) | **0** | Build thành công toàn bộ static & dynamic routes |

---

## 3. Bảng Ánh xạ Quy hoạch Cấu trúc (SSOT & Re-exports)

### 3.1. Cây `src/components/components_client` → `src/app/(client)/components` (55 files)
Các file legacy trong `src/components/components_client` đã được chuyển đổi thành các **thin re-export wrappers** trỏ về bản chuẩn duy nhất (SSOT) tại `src/app/(client)/components/`, bảo toàn 100% tính tương thích ngược cho mọi import cũ nếu có.

| Đường dẫn cũ (Legacy re-export) | Đường dẫn chuẩn duy nhất (Canonical SSOT) | Trạng thái |
| :--- | :--- | :--- |
| `src/components/components_client/components/Cart_component/cart_drawer.js` | `src/app/(client)/components/Cart_component/cart_drawer.js` | Re-export SSOT |
| `src/components/components_client/components/Cart_component/cart_item.js` | `src/app/(client)/components/Cart_component/cart_item.js` | Re-export SSOT |
| `src/components/components_client/components/Category_component/category_item.js` | `src/app/(client)/components/Category_component/category_item.js` | Re-export SSOT |
| `src/components/components_client/components/Checkout_component/AddressStep.js` | `src/app/(client)/components/Checkout_component/AddressStep.js` | Re-export SSOT |
| `src/components/components_client/components/Checkout_component/CheckoutStepper.js` | `src/app/(client)/components/Checkout_component/CheckoutStepper.js` | Re-export SSOT |
| `src/components/components_client/components/Checkout_component/OrderSuccessScreen.js` | `src/app/(client)/components/Checkout_component/OrderSuccessScreen.js` | Re-export SSOT |
| `src/components/components_client/components/Checkout_component/OrderSummary.js` | `src/app/(client)/components/Checkout_component/OrderSummary.js` | Re-export SSOT |
| `src/components/components_client/components/Checkout_component/PaymentStep.js` | `src/app/(client)/components/Checkout_component/PaymentStep.js` | Re-export SSOT |
| `src/components/components_client/components/Checkout_component/ReviewStep.js` | `src/app/(client)/components/Checkout_component/ReviewStep.js` | Re-export SSOT |
| `src/components/components_client/components/Checkout_component/SectionCard.js` | `src/app/(client)/components/Checkout_component/SectionCard.js` | Re-export SSOT |
| `src/components/components_client/components/Subsciber_components/BoxSkeleton.js` | `src/app/(client)/components/Subsciber_components/BoxSkeleton.js` | Re-export SSOT |
| `src/components/components_client/components/Subsciber_components/MonthlyThemes.js` | `src/app/(client)/components/Subsciber_components/MonthlyThemes.js` | Re-export SSOT |
| `src/components/components_client/components/Subsciber_components/SubPlanSkeleton.js` | `src/app/(client)/components/Subsciber_components/SubPlanSkeleton.js` | Re-export SSOT |
| `src/components/components_client/components/Subsciber_components/SubscribePlans.js` | `src/app/(client)/components/Subsciber_components/SubscribePlans.js` | Re-export SSOT |
| `src/components/components_client/components/Subsciber_components/SubscriberCTA.js` | `src/app/(client)/components/Subsciber_components/SubscriberCTA.js` | Re-export SSOT |
| `src/components/components_client/components/Subsciber_components/SubscriberFAQ.js` | `src/app/(client)/components/Subsciber_components/SubscriberFAQ.js` | Re-export SSOT |
| `src/components/components_client/components/Subsciber_components/SubscriberFeatures.js` | `src/app/(client)/components/Subsciber_components/SubscriberFeatures.js` | Re-export SSOT |
| `src/components/components_client/components/Subsciber_components/SubscriberHowItWorks.js` | `src/app/(client)/components/Subsciber_components/SubscriberHowItWorks.js` | Re-export SSOT |
| `src/components/components_client/components/Subsciber_components/SubscriberTestimonials.js` | `src/app/(client)/components/Subsciber_components/SubscriberTestimonials.js` | Re-export SSOT |
| `src/components/components_client/components/Subsciber_components/hero_section_subscriber.js` | `src/app/(client)/components/Subsciber_components/hero_section_subscriber.js` | Re-export SSOT |
| `src/components/components_client/components/layout/brand/BrandBaseLayout.js` | `src/app/(client)/components/layout/brand/BrandBaseLayout.js` | Re-export SSOT |
| `src/components/components_client/components/layout/brand/brand_card.js` | `src/app/(client)/components/layout/brand/brand_card.js` | Re-export SSOT |
| `src/components/components_client/components/layout/brand/brand_grid.js` | `src/app/(client)/components/layout/brand/brand_grid.js` | Re-export SSOT |
| `src/components/components_client/components/layout/brand/brand_sidebar.js` | `src/app/(client)/components/layout/brand/brand_sidebar.js` | Re-export SSOT |
| `src/components/components_client/components/layout/category/category_base_layout.js` | `src/app/(client)/components/layout/category/category_base_layout.js` | Re-export SSOT |
| `src/components/components_client/components/layout/category/category_card.js` | `src/app/(client)/components/layout/category/category_card.js` | Re-export SSOT |
| `src/components/components_client/components/layout/category/category_sidebar.js` | `src/app/(client)/components/layout/category/category_sidebar.js` | Re-export SSOT |
| `src/components/components_client/components/layout/home/product_categories_showcase.js` | `src/app/(client)/components/layout/home/product_categories_showcase.js` | Re-export SSOT |
| `src/components/components_client/components/layout/product/featured_products.js` | `src/app/(client)/components/layout/product/featured_products.js` | Re-export SSOT |
| `src/components/components_client/components/layout/product/product_card.js` | `src/app/(client)/components/layout/product/product_card.js` | Re-export SSOT |
| `src/components/components_client/components/layout/product/product_layout.js` | `src/app/(client)/components/layout/product/product_layout.js` | Re-export SSOT |
| `src/components/components_client/components/layout/product_section.js` | `src/app/(client)/components/layout/product_section.js` | Re-export SSOT |
| `src/components/components_client/components/layout/totmart_landing.js` | `src/app/(client)/components/layout/totmart_landing.js` | Re-export SSOT |
| `src/components/components_client/components/layout/totmart_suppport.js` | `src/app/(client)/components/layout/totmart_suppport.js` | Re-export SSOT |
| `src/components/components_client/components/profile/AddressManager.jsx` | `src/app/(client)/components/profile/AddressManager.jsx` | Re-export SSOT |
| `src/components/components_client/components/profile/CartManager.jsx` | `src/app/(client)/components/profile/CartManager.jsx` | Re-export SSOT |
| `src/components/components_client/components/profile/MySub/Canceldialog.js` | `src/app/(client)/components/profile/MySub/Canceldialog.js` | Re-export SSOT |
| `src/components/components_client/components/profile/MySub/Deliverytimeline.js` | `src/app/(client)/components/profile/MySub/Deliverytimeline.js` | Re-export SSOT |
| `src/components/components_client/components/profile/MySub/Emptysubscription.js` | `src/app/(client)/components/profile/MySub/Emptysubscription.js` | Re-export SSOT |
| `src/components/components_client/components/profile/MySub/Subscriptioncard.js` | `src/app/(client)/components/profile/MySub/Subscriptioncard.js` | Re-export SSOT |
| `src/components/components_client/components/profile/ProfileInfo.jsx` | `src/app/(client)/components/profile/ProfileInfo.jsx` | Re-export SSOT |
| `src/components/components_client/components/profile/ProfileTabs.jsx` | `src/app/(client)/components/profile/ProfileTabs.jsx` | Re-export SSOT |
| `src/components/components_client/components/ui/AnnouncementBar.js` | `src/app/(client)/components/ui/AnnouncementBar.js` | Re-export SSOT |
| `src/components/components_client/components/ui/SideBar.js` | `src/app/(client)/components/ui/SideBar.js` | Re-export SSOT |
| `src/components/components_client/components/ui/auth/auth_button.js` | `src/app/(client)/components/ui/auth/auth_button.js` | Re-export SSOT |
| `src/components/components_client/components/ui/auth/auth_card.js` | `src/app/(client)/components/ui/auth/auth_card.js` | Re-export SSOT |
| `src/components/components_client/components/ui/auth/auth_container.js` | `src/app/(client)/components/ui/auth/auth_container.js` | Re-export SSOT |
| `src/components/components_client/components/ui/auth/form_input.js` | `src/app/(client)/components/ui/auth/form_input.js` | Re-export SSOT |
| `src/components/components_client/components/ui/cart_box.js` | `src/app/(client)/components/ui/cart_box.js` | Re-export SSOT |
| `src/components/components_client/components/ui/drop_menu.js` | `src/app/(client)/components/ui/drop_menu.js` | Re-export SSOT |
| `src/components/components_client/components/ui/footer.js` | `src/app/(client)/components/ui/footer.js` | Re-export SSOT |
| `src/components/components_client/components/ui/main_header.js` | `src/app/(client)/components/ui/main_header.js` | Re-export SSOT |
| `src/components/components_client/components/ui/nav_menu.js` | `src/app/(client)/components/ui/nav_menu.js` | Re-export SSOT |
| `src/components/components_client/components/ui/pag.js` | `src/app/(client)/components/ui/pag.js` | Re-export SSOT |
| `src/components/components_client/components/ui/search_bar.js` | `src/app/(client)/components/ui/search_bar.js` | Re-export SSOT |

### 3.2. Cây `src/components/components_main` → `src/components_box` (12 files)

| Đường dẫn cũ (Legacy re-export) | Đường dẫn chuẩn duy nhất (Canonical SSOT) | Trạng thái |
| :--- | :--- | :--- |
| `src/components/components_main/announcement-bar.js` | `src/components_box/announcement-bar.js` | Re-export SSOT |
| `src/components/components_main/brand-marquee.js` | `src/components_box/brand-marquee.js` | Re-export SSOT |
| `src/components/components_main/hero-sections.js` | `src/components_box/hero-sections.js` | Re-export SSOT |
| `src/components/components_main/how-it-work.js` | `src/components_box/how-it-work.js` | Re-export SSOT |
| `src/components/components_main/intro-section.js` | `src/components_box/intro-section.js` | Re-export SSOT |
| `src/components/components_main/nav_box.js` | `src/components_box/nav_box.js` | Re-export SSOT |
| `src/components/components_main/newsletter.js` | `src/components_box/newsletter.js` | Re-export SSOT |
| `src/components/components_main/product-showcase.js` | `src/components_box/product-showcase.js` | Re-export SSOT |
| `src/components/components_main/products/description_editor.jsx` | `src/components_box/products/description_editor.jsx` | Re-export SSOT |
| `src/components/components_main/products/product_description.jsx` | `src/components_box/products/product_description.jsx` | Re-export SSOT |
| `src/components/components_main/testimonials.js` | `src/components_box/testimonials.js` | Re-export SSOT |
| `src/components/components_main/theme-provider.js` | `src/components_box/theme-provider.js` | Re-export SSOT |

### 3.3. Hooks Cây song song `src/hooks` → `src/app/hook` (6 files)

| Hook cũ (Re-export bridge) | Hook chuẩn duy nhất (Canonical SSOT) |
| :--- | :--- |
| `src/hooks/useBoxProducts.js` | `src/app/hook/useBoxProducts.js` |
| `src/hooks/use-mobile.js` | `src/app/hook/use-mobile.js` |
| `src/hooks/usePlanActions.js` | `src/app/hook/adminSub/usePlanActions.js` |
| `src/hooks/usePlanDialog.js` | `src/app/hook/adminSub/usePlanDialog.js` |
| `src/hooks/usePlanList.js` | `src/app/hook/adminSub/usePlanList.js` |
| `src/hooks/useTemplateForm.js` | `src/app/hook/adminSub/useTemplateForm.js` |

---

## 4. Phân rã File Lớn (Large File Decomposition)

### `src/app/(admin)/components/box/BoxFormDialog.jsx`
- **Hiện trạng ban đầu:** 834 dòng, gộp chọn sản phẩm, tính giá chiết khấu, preview ảnh bìa, xử lý API dialog.
- **Tái cấu trúc theo trách nhiệm:** Giảm từ **834 dòng** xuống **551 dòng** thông qua việc tách các sub-components độc lập:
  1. `src/app/(admin)/components/box/parts/ProductPicker.jsx`: Tìm kiếm, lọc và chọn sản phẩm đưa vào box.
  2. `src/app/(admin)/components/box/parts/ProductRow.jsx`: Hiển thị dòng sản phẩm đã chọn, điều chỉnh số lượng và xóa sản phẩm.
  3. `src/app/(admin)/components/box/parts/BoxImageSection.jsx`: Quản lý upload ảnh, URL preview và fallback image.
  4. `src/app/(admin)/components/box/parts/BoxPriceSummary.jsx`: Tóm tắt giá trị gốc, chiết khấu và giá bán theo quy tắc BE.
- **Bảo toàn:** 100% logic form, validation và contract API không bị thay đổi.

---

## 5. Hiện đại hóa Hệ thống Logging (`Logger.js`)

Thay thế toàn diện các lệnh `console.log`, `console.warn`, `console.error` trực tiếp tại 33 file client, admin pages và hooks sang wrapper chuẩn:
```javascript
import { logger } from "@/app/util/Logger";
```
- **Lọc dữ liệu nhạy cảm (`redactSensitive`):** Tự động mask các trường `password`, `token`, `accessToken`, `refreshToken`, `cookie`, `secret`, `qrUrl`, `qrPayload`, `authorization`.
- **Mức log (`level`):** Hỗ trợ `debug`, `info`, `warn`, `error` với timestamp và namespace rõ ràng.
- **Môi trường:** Chặn log debug/info nhạy cảm trên production client console.

---

## 6. Progressive Typechecking (`checkJs` & JSDoc)

Không chuyển đổi ồ ạt toàn repo sang TypeScript, thực hiện giải pháp chuẩn hóa tăng dần với `// @ts-check` và JSDoc trên các module domain trọng yếu:

1. `src/app/util/purchaseAttempt.mjs`:
   - `@typedef {AttemptRecord}`, `@typedef {AttemptResult}`.
   - Types cho `readAttempt`, `storeAttempt`, `clearAttempt`, `startNewPurchase`.
2. `src/app/util/attemptLifecycle.mjs`:
   - `@typedef {ResolveAttemptParams}`, `@typedef {ResolveAttemptResult}`.
   - Types cho `resolveAttempt`, `isAmbiguousError`.
3. `src/app/util/formatter.js`:
   - `@typedef {PlanPriceCalculation}`.
   - Types cho format tiền tệ VND, ngày tháng tiếng Việt, tính toán giá gói dịch vụ.
4. `src/app/services/api/Checkoutpageservice.js`:
   - `@typedef {CartItemInput}`, `@typedef {PlaceOrderParams}`.
   - Types cho `quoteCart`, `validateCoupon`, `placeOrder`, `pollPaymentStatus`.
5. `src/app/services/api/subscribePlanService.js`:
   - `@typedef {UserSubscribeData}`, `@typedef {SubscribeOptions}`.
   - Types cho `userSubscribeApi`, `startNewSubscription`.
6. **Sửa lỗi TypeScript có sẵn:**
   - `src/components/gift-options.tsx`: Bổ sung `className=""` cho Checkbox, khai báo explicit type `(e: any)` cho event handler.
   - `src/components/product-details.tsx`: Sửa implicit any tại `onChange={(e: any) => handleQuantityChange(Number(e.target.value))}`.
7. **CI Typecheck script:**
   - Thêm `"typecheck": "tsc -p jsconfig.json --noEmit"` vào `package.json`.
   - Kết quả: **Exit Code 0** trên toàn bộ modules được kích hoạt.

---

## 7. Chuẩn hóa Mục lục Tài liệu (`docs/README.md`)

Mục lục tài liệu được quy hoạch lại thành 3 phân nhóm rõ ràng:
1. **Tài liệu Kiểm chứng & Bàn giao Hiện hành (Current Verification & Quality Gates):** F00 đến F05, hợp đồng BE, acceptance criteria release.
2. **Cấu hình & Vận hành (Configuration & Operations):** Kết nối proxy Render, hướng dẫn triển khai Vercel staging.
3. **Tài liệu Lịch sử & Lưu trữ (Historical Specifications & Archives):** Các bản ghi chép khảo sát và bàn giao từ các đợt phát triển trước đó.

---

## 8. Các Bất biến Đã Giữ Vững

1. **Không đổi route/field API:** Giữ nguyên chính tả route `/subcribe-plans/user-subscribe`, `/checkout/check-out`, và thư mục component `Subsciber_components` theo yêu cầu hợp đồng BE (`FE-BE-contract-handoff.md`).
2. **Không xóa thư mục hàng loạt:** Giữ nguyên các re-export bridges để không làm gãy import của bất kỳ bên thứ ba hay branch khác.
3. **An toàn dữ liệu:** Không in secret, token, QR payload hoặc PII ra log hay console.
4. **Độc lập kiểm chứng:** Từng lệnh `lint`, `typecheck`, `test`, `build` đều có exit code riêng và đều đạt `0`.

---

## 9. Rủi ro & Cách Quay lui (Rollback Plan)

- **Rủi ro:** Khi thêm mới module ở nhánh khác, dev có thể import nhầm đường dẫn cũ (`components_client` thay vì `src/app/(client)/components`).
  - *Giải pháp:* Re-export bridge tự động chuyển hướng nên runtime vẫn hoạt động bình thường. CI có thêm bước `npm run typecheck` để nhắc nhở quy hoạch.
- **Cách quay lui:**
  - Nếu cần hoàn nguyên riêng Phase F05: `git restore src/components/ src/hooks/ src/app/(admin)/components/box/ src/app/services/api/ package.json docs/README.md`
  - Vì toàn bộ thay đổi đều giữ re-export tương thích ngược, không có breaking change nào đối với runtime hay build.
