# Biên Bản Kiểm Thử & Nghiệm Thu Chất Lượng (Quality Gate) - Phase 3: Tái Thiết Kế Trang Đăng Ký Nhận Hộp Định Kỳ (Subscription) Chuẩn Bokksu.com

- **Thời gian**: 2026-11-01
- **Nhánh git**: `staging`
- **Môi trường**: Node.js `v24.14.1`, npm `11.11.0`
- **Mục tiêu**:
  1. Chuyển đổi trang `/subscription` và `/products/Subscriber` từ một danh sách phẳng thô sơ thành một **Landing Page Trải Nghiệm Định Kỳ Đẳng Cấp Quốc Tế** tương xứng với **[bokksu.com](https://bokksu.com/)**.
  2. Xây dựng Hero Section mang dấu ấn nghệ nhân & nông sản Việt, kết hợp unboxing thị giác và điểm đánh giá 4.9/5 từ cộng đồng người dùng.
  3. Xây dựng khối "Bên trong mỗi chiếc hộp có gì?" (What's in the Box): 4 nhóm sản vật (Trà hoa Shan tuyết, Bánh mứt gia truyền, Gốm sứ độc bản, Cẩm nang văn hóa nghệ nhân).
  4. Xây dựng khối "Hành trình 3 bước nhận hộp quà" (How It Works) trực quan, thanh thoát.
  5. Nâng cấp thẻ chọn hộp `PlanCard.js`: Khung ảnh nổi bật, thẻ Hộp định kỳ tuyển chọn, bảng so sánh kỳ hạn và nút CTA "Chọn gói & Nhận quà ngay".
  6. Xây dựng khối "Chủ đề 4 mùa trong năm" (Seasonal Themes) và khu vực "Giải đáp thắc mắc thường gặp" (FAQ Accordion).
  7. Bảo toàn 100% logic kinh doanh và modal đăng ký (`ChoosePlanModal`, `ChoosePlan`) của backend TotMart.

---

## 1. Danh sách file thay đổi
- `src/app/(client)/components/Subsciber_components/SubscriptionExperience.jsx`: Xây dựng toàn bộ kiến trúc Landing Page Subscription theo chuẩn Bokksu.
- `src/app/(client)/components/Subsciber_components/PlanCard.js`: Nâng cấp giao diện card chọn hộp quà định kỳ, hình ảnh bo góc và nút CTA ấn tượng.
- `src/app/(client)/subscription/page.jsx`: Chuyển sang sử dụng `SubscriptionExperience` hoàn chỉnh.
- `src/app/(client)/products/Subscriber/page.js`: Chuyển sang sử dụng `SubscriptionExperience` đồng bộ.

---

## 2. Kết quả kiểm thử & Kiểm định chất lượng

| Lệnh thực thi | Mục đích | Exit Code | Kết quả chi tiết |
| :--- | :--- | :---: | :--- |
| `npm test` | Chạy 205 bài kiểm thử unit/integration tự động | `0` | **205 passed**, 0 failed, 0 skipped |
| `npm run lint` | Kiểm tra cú pháp và quy chuẩn mã nguồn ESLint | `0` | Không có cảnh báo hay lỗi cú pháp nào |
| `$env:CI="true"; $env:ALLOW_SITEMAP_FALLBACK="true"; npm run build` | Next.js production build & compile pages | `0` | Biên dịch toàn bộ 63/63 static & dynamic routes thành công |

---

## 3. Rủi ro & Cách quay lui (Rollback)
- **Rủi ro**: Không có rủi ro logic do API gọi các gói đăng ký (`subscriptionApi.getActive`) và quy trình thanh toán vẫn dùng chung instance `ChoosePlan` chuẩn.
- **Cách quay lui**: `git checkout HEAD -- src/app/(client)/components/Subsciber_components/ src/app/(client)/subscription/ src/app/(client)/products/Subscriber/`
