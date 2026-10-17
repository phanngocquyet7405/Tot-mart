# Tài liệu dự án

[README dự án](../README.md) · [Sản phẩm](../PRODUCT.md) · [Thiết kế](../DESIGN.md)

## Kiểm chứng và bàn giao hiện tại

- [MERCHANT-ADMIN-IMPLEMENTATION.md](MERCHANT-ADMIN-IMPLEMENTATION.md): kết quả triển khai shell dùng chung, kiểm tra local mới và checklist browser còn thiếu.
- [MERCHANT-ADMIN-DESIGN-ALIGNMENT.md](MERCHANT-ADMIN-DESIGN-ALIGNMENT.md): khảo sát ban đầu và phương án đồng bộ admin/merchant đã duyệt.
- [CI-MANAGER-VERIFICATION.md](CI-MANAGER-VERIFICATION.md): sửa lỗi lint, loại bỏ prototype, kết quả kiểm tra local và audit mã nguồn `/manager`; ghi rõ phần chưa xác minh trên browser/Actions.
- [MERCHANT-HANDOFF.md](MERCHANT-HANDOFF.md): phạm vi sáu màn hình merchant, hành vi API và giới hạn bàn giao.
- [MERCHANT-VERIFICATION.md](MERCHANT-VERIFICATION.md): các đợt kiểm chứng merchant và checklist browser còn cần thực hiện.

## Cấu hình và triển khai

- [RENDER-CONNECTION.md](RENDER-CONNECTION.md): kết nối proxy FE → Render, CORS và kiểm tra phiên merchant.
- [STAGING-DEPLOYMENT.md](STAGING-DEPLOYMENT.md): cấu hình Vercel staging, kiểm tra và rollback do người dùng thực hiện.

## Kế hoạch và lịch sử

- [MERCHANT-DESIGN-PLAN.md](MERCHANT-DESIGN-PLAN.md): kế hoạch đã duyệt và bối cảnh prototype đã được loại bỏ.
- [MERCHANT-CHANGES.md](MERCHANT-CHANGES.md): lịch sử ghép FE/BE, quy tắc nghiệp vụ và bàn giao ngày 14/10/2026.
- [ACCEPTANCE.md](ACCEPTANCE.md): bằng chứng nghiệm thu ngày 14/10/2026 và giới hạn kiểm chứng.
- [FIXES.md](FIXES.md): hướng dẫn chạy FE cùng BE và các sửa đã bàn giao.

Các kết quả kiểm thử trong từng báo cáo thuộc thời điểm được ghi, không tự chứng nhận checkout hoặc deployment hiện tại. Nội dung nghiệp vụ và bằng chứng lịch sử được giữ nguyên khi chuyển thư mục.

Trừ khi tài liệu ghi rõ khác, đường dẫn source/config và lệnh shell tính từ **gốc repository**, không phải `docs/`. Liên kết Markdown tính từ thư mục chứa tài liệu. Các tên tài liệu trong manifest ZIP cũ mô tả cấu trúc artifact tại thời điểm tạo và được giữ nguyên.
