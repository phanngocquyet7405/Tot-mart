# Biên Bản Kiểm Thử & Nghiệm Thu Chất Lượng (Quality Gate) - Phase 1: Sửa Lỗi Layout Cốt Lõi & Tích Hợp Skill Thiết Kế

- **Thời gian**: 2026-11-01
- **Nhánh git**: `staging`
- **Môi trường**: Node.js `v24.14.1`, npm `11.11.0`
- **Mục tiêu**:
  1. Tải và tích hợp 2 bộ kỹ năng thiết kế chuyên sâu vào `.agents/skills/`: `frontend-design` (Anthropic) và `ui-ux-pro-max` (NextLevelBuilder).
  2. Khắc phục triệt để lỗi Header che khuất Tiêu đề, Thương hiệu, Đánh giá và Giá bán trên trang Chi tiết sản phẩm (`/products/[slug]`).
  3. Khắc phục lỗi đường kẻ viền cam/đỏ bất thường cắt ngang qua SKU trên toàn bộ màn hình do `ProductInfoTabs` thiếu định vị `relative`.
  4. Chuẩn hóa thanh thông báo `AnnouncementBar`: loại bỏ việc các nút điều hướng và dấu chấm chỉ mục đè lên nhau.
  5. Đồng bộ hóa khoảng cách padding top (`pt-[112px]`/`pt-[124px]`) trên toàn bộ các trang client (`/products`, `/products/[slug]`, `/products/Subscriber`, `/subscription`, `/box`, `/gift`) để bảo toàn hiển thị khi có Header + Announcement Bar cố định 100px.

---

## 1. Danh sách file thay đổi
- `.agents/skills/frontend-design/SKILL.md`: Cài đặt skill chỉ đạo nghệ thuật D2C & phòng chống AI slop từ Anthropic.
- `.agents/skills/ui-ux-pro-max/SKILL.md`: Cài đặt thư viện 190+ bảng màu và chuẩn component UI/UX e-commerce.
- `src/app/(client)/products/[slug]/page.js`: Thay `pt-25` không hợp lệ bằng `pt-[112px] lg:pt-[124px] pb-12`.
- `src/app/(client)/components/Product/ProductInfoTabs.js`: Bổ sung `relative` cho tab button để scope thanh chỉ mục active không bị văng ra toàn trang.
- `src/components_box/announcement-bar.js`: Tinh chỉnh bố cục flex, ẩn dot indicators gây dính nút, tách nhóm controls cân xứng.
- `src/app/(client)/components/CommerceCatalog.jsx`: Bổ sung bù trừ chiều cao header `pt-[112px] sm:pt-[124px]` cho `/box`, `/gift`, `/subscription`.
- `src/app/(client)/products/Subscriber/page.js`: Bổ sung bù trừ chiều cao header `pt-[112px] sm:pt-[124px]`.
- `src/app/(client)/products/page.js`: Bỏ bọc thẻ cha sticky xung quanh AnnouncementBar/Header cố định và thiết lập khoảng đệm hero `pt-[124px]`.

---

## 2. Kết quả kiểm thử & Kiểm định chất lượng

| Lệnh thực thi | Mục đích | Exit Code | Kết quả chi tiết |
| :--- | :--- | :---: | :--- |
| `npm test` | Chạy 205 bài kiểm thử unit/integration tự động | `0` | **205 passed**, 0 failed, 0 skipped |
| `npm run lint` | Kiểm tra cú pháp và quy chuẩn mã nguồn ESLint | `0` | Không có cảnh báo hay lỗi cú pháp nào |
| `$env:CI="true"; $env:ALLOW_SITEMAP_FALLBACK="true"; npm run build` | Next.js production build & compile pages | `0` | Biên dịch 63/63 static & dynamic routes thành công |

---

## 3. Rủi ro & Cách quay lui (Rollback)
- **Rủi ro**: Không có rủi ro logic nghiệp vụ do toàn bộ thay đổi tập trung vào thuộc tính CSS layout & positioning.
- **Cách quay lui**: `git restore src/app/(client)/ src/components_box/announcement-bar.js`
