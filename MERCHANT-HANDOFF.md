# Bàn giao merchant — 16/10/2026

## Source đã hoàn thiện

- `/manager`: Tổng quan lấy `pagination.total` từ năm API merchant, đơn gần đây lấy danh sách thật; lỗi từng nguồn không biến thành số 0. Không tính doanh thu/sắp hết hàng khi thiếu hợp đồng. Liên kết tới danh sách tương ứng.
- `/manager/products`: giữ phần đã làm, thêm bộ lọc brand/category/minPrice/maxPrice đúng BE; tìm kiếm chờ 300 ms, phân trang server; tạo/sửa multipart/ảnh, ID catalog-options, điều chỉnh delta/reason và xóa mềm. Validation tên/giá/ảnh/tồn khớp source BE; stock không gửi lại khi sửa.
- `/manager/combos`: chọn sản phẩm riêng qua danh mục nhiều trang, tìm cấu phần, số lượng, giảm %, tồn tạo mới, hạn bán, ảnh tối đa 10×5 MiB; giá trước lưu ghi ước tính, giá đã lưu dùng `value` BE. Hiển thị version; 409 khóa sửa/xóa giữ form/lỗi, không lách version.
- `/manager/gifts`: tạo từ combo riêng, bậc giảm và tiện ích có phí, tồn/hạn; xem trước tiền hàng/giảm/phí rõ là ước tính. Gift đã lưu có báo giá từ `/checkout/quote`, không tạo đơn; không nhân giảm combo thêm lần nữa. Source combo cố định khi sửa.
- `/manager/subscriptions`: tạo từ combo hoặc hàng lẻ, kỳ 1/3/6/12 tháng; tổng thu trước và bình quân tháng riêng; sửa mẫu theo source, không đổi cấu phần hàng lẻ qua form sửa mẫu. Có mở/ngừng bán mẫu khi API hỗ trợ (mẫu hàng lẻ mới tạo theo mặc định BE). Xóa mẫu không đồng nghĩa hủy đăng ký khách hay hoàn tiền; không tạo quyền merchant mới.
- `/manager/orders`: phân trang và mở chi tiết chỉ đọc, trạng thái đơn/thanh toán, mặt hàng/giá BE, người nhận/địa chỉ được cấp. Không bộ lọc hoặc quyền đổi trạng thái chưa có BE; không dựng vận đơn/lịch sử/phí vận chuyển thiếu trong projection.
- Layout chung: sidebar desktop và Sheet mobile, tài khoản thật/đăng xuất, guard merchant, trạng thái đang xác minh phiên, tín hiệu phiên hết hạn từ refresh 401/403. Trang có loading/empty/error/retry/saving, field errors và giữ dữ liệu khi save lỗi. Các URL hash cũ được chuyển từ `/manager#...` sang trang con.

Các route sử dụng thật không import dữ liệu mock. `manager-design` và legacy component được giữ làm tham chiếu, không dùng làm backend fallback. Không thay đổi storefront/cart/checkout hay các sửa giá đã nghiệm thu.

## Kiểm thử thực sự đã chạy

- `npm test`: **60/60 qua**, gồm hồi quy cũ, xử lý phiên hết hạn, package pricing/draft/validation/service/pagination mới.
- ESLint phần source/test/script thay đổi: qua; không tắt quy tắc, không bỏ test.
- `npm run build -- --webpack`: **qua**, 64/64 trang, có đủ sáu route merchant. API_URL local khớp base staging đã xác nhận; không phải bằng chứng deployment cloud thành công.
- Smoke test bản production local: GET cả sáu route merchant trả **HTTP 200**. Đây chỉ là kiểm tra routing/server, không phải E2E hoặc xác nhận phiên merchant browser. Đã dừng server smoke test.
- `scripts/verify-manager-backend.cjs`: **38 tình huống qua**, actual Express/auth/Joi/controllers/models với **MongoDB replica set mới tạo**. Không dùng `.env` hay DB hiện hữu. Đã kiểm tra CRUD gói/sản phẩm, quyền hai merchant, 401/403/404/409, version combo bị khóa bởi nghĩa vụ đơn, projection đơn, giá gift 555.000 và đăng ký 270.000/90.000. Đã dừng/xóa tài nguyên DB tạm do memory-server tạo.
- Các test này không upload Cloudinary. Auth/rewrite fixture local đã có bài `scripts/verify-api-rewrite.cjs`; không gửi login/refresh/CRUD tới Render.
- Render: chỉ GET công khai; CORS đúng origin staging 200/credentials=true. Staging FE GET chưa xác thực bị Vercel Authentication 302. Không có bằng chứng phiên merchant browser trên staging.

## Giới hạn BE được giữ đúng

- Chưa có endpoint summary merchant chuyên dụng; Tổng quan dùng tổng số metadata từng resource, không dùng số dòng của một trang. Có thể bổ sung summary đúng owner để giảm số request nếu BE phát triển tiếp; không bắt buộc để source hiện tại hoạt động.
- API đơn merchant chỉ có page/limit cố định 20 và projection hiện hành, không có filter trạng thái, vận đơn, trạng thái lịch sử hay phí giao. Nếu cần, BE phải bổ sung các trường được phép theo merchantId; FE không gọi admin API thay thế.
- Chưa có API manager quản lý đăng ký khách/hoàn tiền; chỉ CRUD SubscriptionTemplate. Không thêm hủy/hoàn tiền giả vào FE. Việc chỉnh sửa cấu phần nội bộ của mẫu hàng lẻ được giữ ngoài form sửa mẫu theo luồng hiện có.
- Giá mới chưa lưu không thể có quote BE cho chính sách chưa tồn tại; chỉ xem ước tính. Gift đã lưu mới lấy quote BE cho snapshot đã lưu. Không dùng giá ước tính để thanh toán.
- Không có xác nhận SHA/deployment version toàn bộ Render. Chỉ public endpoint/CORS/policy fingerprint khớp chưa chứng minh mọi thay đổi có trên cloud.

## Nghiệm thu thủ công

**Render/staging hiện chỉ xem dữ liệu**; các bước ghi dưới đây chỉ dành BE và DB test riêng đã xác nhận. Staging không tự tạo ra database test.

1. Desktop 1440 px, mobile 390 px và 320 px: đủ sáu mục, mở/đóng menu, CTA không mất, không tràn ngang; Tab/Escape/focus, tên dài, ảnh lỗi và bàn phím mobile.
2. Trên DB test: đăng nhập merchant A/B, kiểm tra danh mục chỉ của mình, role khách/admin không vào manager, hết phiên và logout. Không chia sẻ token/password/HAR thô.
3. Sản phẩm: tạo/sửa/ảnh, áp dụng/xóa lọc, hơn 20 bản ghi, tồn +3/-2 và reload, giảm quá tồn 409; xóa chưa liên kết và xóa đang thuộc combo 409. API lỗi giữ form, không toast thành công.
4. Combo: chọn/bỏ/tìm cấu phần, số lượng, giá giảm/thời hạn, ảnh; reload kiểm tra giá/tồn/version. Combo bị khóa phải báo 409 và giữ dữ liệu đang nhập, không tự đổi version/owner.
5. Gift: combo 200.000, từ 3 giảm 10%, thiệp 5.000 mỗi gift, số lượng 3 → 555.000. Trước lưu là ước tính; sau lưu báo giá BE phải khớp, thử lỗi quote và retry. Nguồn cố định khi sửa.
6. Đăng ký hàng lẻ 100.000 mỗi tháng ×3, giảm 10% → tổng thu trước 270.000, bình quân 90.000/tháng; sửa tên/mức giảm theo API, thử source combo, không thấy lời hứa auto-charge. Xóa mẫu không được mô tả là hoàn tiền/hủy khách.
7. Đơn: hơn 20 đơn test, mở chi tiết/giá/trạng thái/địa chỉ; không có nút quyền admin. Tổng quan phải khớp `pagination.total` kể cả khi trang chỉ hiện 20 dòng; lỗi nguồn không hiện 0.
8. Tắt BE/mạng khi tải/lưu: retry hoạt động, field errors dễ hiểu, không mất form. Khi lưu thành công nhưng reload thất bại phải báo rõ, không khuyên tạo trùng.

Không có browser kết nối tại lần kiểm tra inventory cuối (apps/browsers rỗng); không thử iab liên tục, không tuyên bố desktop/mobile E2E đã qua. Impeccable visual review vẫn cần **recapture**.

## Gói nguồn và triển khai

ZIP được tạo bởi `python scripts/package-fe.py`: allowlist source/config/public/tests/scripts/docs, chỉ `.env.example` an toàn; không `.env` thật, node_modules, .next, git, bộ nhớ agent, cloud config, logs hoặc private-key files. Có kiểm CRC và manifest SHA-256/tên file. Scan pattern secret chỉ là kiểm tra bổ sung, không thay thế việc giữ secret ngoài source.

Không commit, push, deploy hoặc sửa biến cloud. Người dùng review ZIP/diff rồi làm theo `STAGING-DEPLOYMENT.md` để deploy đúng Preview/staging và rollback. Production chưa được xác minh, nằm ngoài đợt này.
