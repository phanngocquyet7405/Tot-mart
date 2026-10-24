# Tài liệu dự án

[README dự án](../README.md) · [Sản phẩm](../PRODUCT.md) · [Thiết kế](../DESIGN.md)

## Tài liệu Kiểm chứng & Bàn giao Hiện hành (Current Verification & Quality Gates)

- [quality/FE-SEC.md](quality/FE-SEC.md): kế hoạch và biên bản nghiệm thu FE-SEC — xử lý triệt để lỗ hổng npm audit production (next, follow-redirects), đánh giá phơi nhiễm và kiểm chứng cổng chất lượng.
- [quality/F-FIX2.md](quality/F-FIX2.md): nghiệm thu chất lượng Phase F-FIX2 — hoàn thiện attempt lifecycle, CSP analysis, sitemap ISR, 74 cặp component, hook recovery và dual-run verification.
- [quality/F-FIX.md](quality/F-FIX.md): nghiệm thu chất lượng Phase F-FIX — rà soát toàn diện và xử lý các tồn đọng.
- [quality/F05-structure-types.md](quality/F05-structure-types.md): nghiệm thu chất lượng Phase F05 — quy hoạch component SSOT & re-export bridges, phân rã file lớn (`BoxFormDialog`), hiện đại hóa logging (`@/app/util/Logger`), progressive `checkJs`/JSDoc cho domain module trọng yếu và chuẩn hóa mục lục docs.
- [quality/F04-security-session.md](quality/F04-security-session.md): nghiệm thu chất lượng Phase F04 — XSS defense allowlist không regex, bảo vệ phiên khi refresh 5xx/503/timeout, chuẩn hóa login passwordChangeRequired & lỗi 503/403, CSP report-only, làm sạch log và rà soát file tracked đáng ngờ.
- [quality/F03-seo-rendering.md](quality/F03-seo-rendering.md): nghiệm thu chất lượng Phase F03 — SEO, sitemap phục hồi snapshot last-known-good, Server Component shells và phân tách quote checkout.
- [quality/F02-purchase-e2e.md](quality/F02-purchase-e2e.md): nghiệm thu chất lượng Phase F02 — E2E purchase & subscription idempotency, xử lý kết quả chưa rõ (timeout 35s, 5xx, 503, Code 91 recovery), Playwright DB observation.
- [quality/F01-storage-cart.md](quality/F01-storage-cart.md): nghiệm thu chất lượng Phase F01 — storage resilience, Wishlist memory fallback, PasswordRecovery phân tách và atomic cart reducer.
- [quality/F00-baseline.md](quality/F00-baseline.md): thẩm định đường cơ sở hệ thống, đối chiếu commit và tóm tắt hợp đồng BE.
- [be-contract/FE-BE-contract-handoff.md](be-contract/FE-BE-contract-handoff.md): bàn giao hợp đồng kỹ thuật FE-BE chi tiết.
- [FE-CHECKOUT-ACCEPTANCE-2026-10-19.md](FE-CHECKOUT-ACCEPTANCE-2026-10-19.md): sửa hai lỗi P1, hợp đồng terminate-with-body, mua/đăng ký lần hai, kết quả kiểm thử tách cấp và phần còn thiếu trước phát hành.

## Cấu hình và Vận hành (Configuration & Operations)

- [RENDER-CONNECTION.md](RENDER-CONNECTION.md): kết nối proxy FE → Render, CORS và kiểm tra phiên merchant.
- [STAGING-DEPLOYMENT.md](STAGING-DEPLOYMENT.md): cấu hình Vercel staging, kiểm tra và rollback do người dùng thực hiện.

## Tài liệu Lịch sử và Lưu trữ (Historical Specifications & Archives)

- [STOREFRONT-UI-REFINEMENT.md](STOREFRONT-UI-REFINEMENT.md): critique/audit từ source, thay đổi UI sản phẩm–gói–box/gift, giới hạn browser và checklist nghiệm thu local.
- [CHECKOUT-SUBSCRIPTION-RECOVERY.md](CHECKOUT-SUBSCRIPTION-RECOVERY.md): tích hợp prepare/lookup/terminate ngày 18/10, kiểm chứng FE–BE local và browser; giữ nguyên bằng chứng và giới hạn của bản ghi 17/10.
- [CHECKOUT-RECOVERY-GAP-VERIFICATION.md](CHECKOUT-RECOVERY-GAP-VERIFICATION.md): kiểm chứng bổ sung auth/address/storage/tab/merchant-admin với Redis local thật; phân biệt module browser, UI smoke và HTTP, cùng điều kiện nghiệm thu staging.
- [MERCHANT-ADMIN-IMPLEMENTATION.md](MERCHANT-ADMIN-IMPLEMENTATION.md): kết quả triển khai shell dùng chung, kiểm tra local mới và checklist browser còn thiếu.
- [MERCHANT-ADMIN-DESIGN-ALIGNMENT.md](MERCHANT-ADMIN-DESIGN-ALIGNMENT.md): khảo sát ban đầu và phương án đồng bộ admin/merchant đã duyệt.
- [CI-MANAGER-VERIFICATION.md](CI-MANAGER-VERIFICATION.md): sửa lỗi lint, loại bỏ prototype, kết quả kiểm tra local và audit mã nguồn `/manager`; ghi rõ phần chưa xác minh trên browser/Actions.
- [MERCHANT-HANDOFF.md](MERCHANT-HANDOFF.md): phạm vi sáu màn hình merchant, hành vi API và giới hạn bàn giao.
- [MERCHANT-VERIFICATION.md](MERCHANT-VERIFICATION.md): các đợt kiểm chứng merchant và checklist browser còn cần thực hiện.
- [MERCHANT-DESIGN-PLAN.md](MERCHANT-DESIGN-PLAN.md): kế hoạch đã duyệt và bối cảnh prototype đã được loại bỏ.
- [MERCHANT-CHANGES.md](MERCHANT-CHANGES.md): lịch sử ghép FE/BE, quy tắc nghiệp vụ và bàn giao ngày 14/10/2026.
- [ACCEPTANCE.md](ACCEPTANCE.md): bằng chứng nghiệm thu ngày 14/10/2026 và giới hạn kiểm chứng.
- [FIXES.md](FIXES.md): hướng dẫn chạy FE cùng BE và các sửa đã bàn giao.

---

> [!NOTE]
> Các kết quả kiểm thử trong từng báo cáo thuộc thời điểm được ghi, không tự chứng nhận checkout hoặc deployment hiện tại. Nội dung nghiệp vụ và bằng chứng lịch sử được giữ nguyên khi chuyển thư mục.
>
> Trừ khi tài liệu ghi rõ khác, đường dẫn source/config và lệnh shell tính từ **gốc repository**, không phải `docs/`. Liên kết Markdown tính từ thư mục chứa tài liệu. Các tên tài liệu trong manifest ZIP cũ mô tả cấu trúc artifact tại thời điểm tạo và được giữ nguyên.
