# FE đi cùng BE mới

Node 22 hoặc 24. Cài bằng `npm ci`; sao chép `.env.example` thành `.env.local`.

- `API_URL=http://localhost:3001/api` chỉ ở server. Trình duyệt gọi `/api` và Next chuyển tiếp tới BE.
- `npm run dev`: FE cổng 3000.
- `npm test`: kiểm thử logic checkout/QR và dữ liệu.
- `npm run lint`.
- `npm run build -- --webpack`; sau đó `npm start`.
- Nếu môi trường không cho tạo tiến trình phụ, đặt `BUILD_WORKER_THREADS=1` để dùng worker threads cho build. Cấu hình này đã được kiểm tra trong môi trường bàn giao.

Token không còn lưu vào localStorage/sessionStorage. Profile tải bằng cookie HttpOnly; `/home/refresh` cấp access token mới và xoay refresh token. Nút đăng xuất cần kết nối BE để thu hồi phiên.

Cart/wishlist tách theo tài khoản. Giỏ local cập nhật ở trình duyệt; khi checkout mới đồng bộ BE kèm version. Nếu giỏ trên thiết bị khác đổi, tải lại và kiểm tra trước khi đặt; không tự ghi đè.

Tổng tiền checkout và coupon lấy từ BE. Sản phẩm và box giữ đúng loại khi gửi lên BE. Retry lỗi mạng giữ cùng Idempotency-Key, không tạo lại một đơn đã được nhận.

Subscription: giá hiển thị là tổng trả trước; số tiền/tháng là tổng chia số tháng. Trang chủ chỉ hiển thị gói thật đang bán, dùng chung form địa chỉ với trang subscription. Khách được chuyển sang QR sau khi tạo gói chờ thanh toán.

Quản trị `/admin-operations`: lượt giao định kỳ, khoản hoàn tiền và giao dịch cần đối soát. Dispatch phải có vận đơn; số lượt chỉ giảm khi xác nhận đã giao. Ghi nhận hoàn tiền chỉ sau khi đã chuyển tiền bên ngân hàng.

Chưa hợp nhất toàn bộ component trùng của bản gốc. Đã dùng lại component chung cho ChoosePlan/modal và product grid; các trang quản trị cũ và một số danh sách còn cần tiếp tục cải thiện phân trang.
