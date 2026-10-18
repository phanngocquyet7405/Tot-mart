# Checkout và subscription — 17/10/2026

Git sạch trước khi sửa. Không dùng ZIP; không commit, push, deploy hay sửa BE. Báo cáo này bổ sung, không thay thế bằng chứng kiểm chứng lịch sử.

## Route và chuỗi import thực tế

- `/checkout`: `src/app/(client)/checkout/page.jsx` → `useCheckout` → `Checkoutpageservice` → `checkoutService`.
- `/`: `src/app/page.js` → `components_box/ChoosePlan` → `PlanCard`, `ChoosePlanModal` trong `src/app/(client)/components/Subsciber_components`.
- `/subscription`: `subscription/page.jsx` → `CommerceCatalog` → cùng `ChoosePlan`, `PlanCard`, `ChoosePlanModal` trên.
- `/products/Subscriber`: page → `normalizeSubscriptionPlans` → cùng `PlanCard`, `ChoosePlanModal`.
- `/profile/my-subscriptions`: page → `useOtherPlans` → API active templates → cùng bộ chuẩn hóa, `PlanCard`, `ChoosePlanModal`. Hook trước đây dùng hằng số mẫu; nay dùng API và loại box đã có theo ID.
- Bản `PlanCard` trong `src/components/components_client` re-export component thật, tránh giữ bản đánh giá cố định.

## Hành vi đã sửa

Lần checkout chưa rõ kết quả giữ key, payload, fingerprint và phiên bản giỏ. Lần thử mới lưu thời điểm gửi, tên/số lượng sản phẩm, tổng quote BE và địa chỉ chỉ gồm quận/tỉnh, ba số cuối điện thoại. Không hiển thị tên người nhận, số nhà, đường hoặc toàn bộ điện thoại trong tóm tắt khôi phục. UI giải thích rõ khi giỏ hoặc ID địa chỉ hiện tại khác yêu cầu cũ. Retry không đồng bộ giỏ hiện tại và không thay payload cũ.

TTL đối chiếu phía FE là 24 giờ, không phải thời hạn thanh toán hay thời hạn idempotency của BE. Quá TTL, thiếu thời điểm gửi hoặc thiếu fingerprint ở checkout cũ: giữ nguyên lần thử, chặn gửi lại và yêu cầu đối chiếu. HTTP 4xx riêng lẻ không xóa yêu cầu chưa rõ kết quả. Chỉ phản hồi thành công có mã đơn/đăng ký mới giải phóng lần thử. Nếu không lưu được dữ liệu vào sessionStorage trước gửi, chặn gửi để tránh mất key khi tải lại. Dữ liệu đã lưu vẫn có thể mất nếu người dùng xóa storage hoặc đóng phiên trình duyệt; chưa có khôi phục theo key từ server cho trường hợp đó.

Subscription có tóm tắt yêu cầu cũ và thao tác tiếp tục riêng. Đổi gói/địa chỉ không âm thầm gửi lại payload của gói cũ. Gói hết TTL phải đối chiếu. Các kỳ hạn API 1/3/6/12 tháng của cùng box được nhóm để so sánh tổng trả trước và bình quân tháng. Không sinh kỳ hạn giả, giá khuyến mãi suy diễn, nhãn “phổ biến/giá tốt nhất” theo vị trí hoặc đánh giá 5.0. Thiếu ID, kỳ hạn hợp lệ hoặc giá hợp lệ thì không được mua.

Đã bỏ testimonial và thương hiệu đối tác mẫu khỏi trang chính; bỏ showcase, lịch chủ đề và trust badge không có dữ liệu xác nhận khỏi các route subscription đang dùng. Bỏ số liệu quy mô, lịch sử sáng lập và đội ngũ chưa xác minh trên about/our-makers, cùng lời hứa giảm đến 70%, tự gia hạn và hủy bất kỳ lúc nào. Không thay giá/khuyến mãi BE, chính sách khách trả ship trực tiếp mỗi lần giao hoặc quyền merchant/admin.

## Hợp đồng BE còn thiếu

Đã đọc source BE tại `C:/Users/84862/Desktop/totmart/TotMartAPI`, không gọi API ghi. `checkOutController.checkOut` gọi `checkoutLifecycle.replay(userId, key, hash)` trước khi tạo đơn; `Checkout` có unique index userId/requestKey và giữ kết quả sau hoàn tất. POST cùng key là thao tác có thể tạo đơn nếu chưa có kết quả, không phải API chỉ đọc trạng thái. Endpoint trạng thái thanh toán hiện cần paymentCode, là dữ liệu có thể bị mất cùng phản hồi đầu tiên.

Để cho phép bắt đầu lần thử mới an toàn sau yêu cầu mơ hồ, BE cần hợp đồng:

1. Tra cứu theo user đã xác thực + loại giao dịch + Idempotency-Key, đối chiếu hash payload; trả trạng thái đang xử lý, đã tạo (mã đơn/đăng ký/paymentCode), hoặc xác nhận không tạo.
2. Trạng thái “không tạo, được phép bắt đầu lại” phải là kết luận cuối, được bảo vệ trước request cũ còn chạy/đến trễ. Một 404 hoặc danh sách lịch sử trống không đủ làm bằng chứng.
3. Cam kết thời gian lưu kết quả và hash, ngữ nghĩa key sau thời hạn, mã lỗi xác định không phát sinh đơn, và cơ chế xử lý lần thử legacy. Cần xác nhận deployment có cùng hợp đồng source đã đọc.

Cho tới khi có hợp đồng này, FE không cung cấp nút xóa/bỏ lần thử mơ hồ hay giả lập trạng thái đã đối chiếu. Địa chỉ checkout hiện tham chiếu bằng addressId, chưa có version/hash snapshot địa chỉ trong hợp đồng; nếu sửa nội dung của chính ID cũ ở BE, FE chưa thể bảo đảm bản địa chỉ tại thời điểm gửi được dùng khi POST chưa từng commit. Cần BE hỗ trợ snapshot/version bất biến nếu phải bảo đảm cả trường hợp này.

## Kiểm chứng local

- `npm run lint`: đạt.
- `npm run test`: 90/90 đạt, gồm mất phản hồi, thay giỏ/địa chỉ/phương thức, tải lại bằng storage đã lưu, TTL/legacy, lỗi 409, storage bị chặn, nhóm giá trả trước và thiếu dữ liệu.
- `npm run build`: đạt, sinh 62 trang; không deploy.
- `git diff --check`: đạt.

Test/build trong sandbox ban đầu gặp `spawn EPERM`; chạy lại ngoài sandbox đạt. Các test khôi phục dùng VM và API doubles, không tạo đơn thật. Chưa kiểm thử tương tác desktop/mobile trên browser hay phiên khách hàng với BE triển khai; kết quả này không chứng nhận E2E hoặc giao dịch thật.
