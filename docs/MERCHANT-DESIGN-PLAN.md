# Đề xuất hoàn thiện merchant `/manager`

Ngày đề xuất: 15/10/2026. Người dùng đã duyệt thứ tự và cho triển khai. Cập nhật 16/10/2026: source sáu route merchant đã được thực hiện; xem [MERCHANT-HANDOFF.md](MERCHANT-HANDOFF.md) cho kết quả và các phần chưa nghiệm thu browser. Nội dung dưới giữ brief đã duyệt, không phải lời khẳng định mọi kiểm tra trong kế hoạch đã hoàn tất.

## Mục tiêu và phạm vi

Merchant quản lý sản phẩm và gói của chính mình bằng tiếng Việt trên desktop và mobile. Sáu màn hình: Tổng quan, Sản phẩm, Combo, Gift, Đăng ký hàng tháng, Đơn hàng. Thành công là hoàn thành tác vụ với API thật, hiểu đúng giá và trạng thái, không vượt quyền BE. Theo Impeccable, cả sáu màn hình thuộc chế độ **Operate**: ưu tiên thao tác, khả năng quét và phản hồi chính xác.

Giữ hệ thống hiện có; không mở một hướng thẩm mỹ mới, không sửa storefront/admin hay luồng thanh toán trong bước này. `PRODUCT.md` giữ sự thật sản phẩm; tài liệu này giữ đề xuất bố cục, tương tác và thứ tự làm. Không thay `DESIGN.md` ở bước đề xuất.

## Cơ sở từ source (lịch sử tại thời điểm đề xuất)

Cập nhật 16/10/2026: prototype `manager-design`, dữ liệu `manager/lib/mock.js` và `LegacyManager.jsx` đã được loại bỏ vì không còn phụ thuộc thật. Các nhắc đến prototype bên dưới giữ lại lý do và hướng triển khai ban đầu; tham chiếu giao diện hiện tại là sáu route `/manager` và các workspace/component đang dùng.

- `/manager/page.jsx` đang có năm tab, API thật, phân trang, tìm sản phẩm chờ 300 ms, thao tác lưu/xóa/tồn kho và guard merchant; chưa có Tổng quan.
- `manager/services/managerApi.js` và bốn form ProductForm, ComboForm, GiftForm, SubscriptionForm là điểm tái sử dụng nghiệp vụ. Không thay bằng logic lưu mẫu của prototype.
- `manager-design` có shell sáu mục, component chung, danh sách sản phẩm và chi tiết đơn hàng. Tổng quan/Sản phẩm/Đơn hàng lấy từ `manager/lib/mock`; ba màn hình khác mới là empty state. Một số thao tác chỉ cập nhật local state hoặc toast.
- Shell prototype có ngày/tên merchant cố định. Sidebar mang `hidden ... lg:flex` được dùng cả trong Sheet mobile nên nội dung menu bị ẩn trên mobile. PageHeader giấu CTA chính dưới breakpoint `sm`. Đây là các điểm cần khắc phục khi nối vào `/manager`.
- Tài liệu nghiệm thu ghi nhận sửa quyền, gift quote và giá đăng ký. Đã đọc source các test `cartQuote.test.cjs`, `subscriptionDisplay.test.cjs`; chưa chạy lại test hay xác minh trình duyệt trong bước tài liệu này.

## Hướng thiết kế chung

Kế thừa bố cục và component từ `manager-design`, dùng token của hệ thống hiện tại. Giữ chữ sans có dấu tiếng Việt cho nội dung, số liệu và điều khiển; tiêu đề serif sẵn có chỉ dùng tiết chế. Nền sáng, đường phân cách nhẹ, điểm nhấn hiện có cho hành động chính và trạng thái chọn; trạng thái luôn có nhãn chữ, không chỉ màu. Không đưa phong cách trang quà tặng vào toàn bộ workspace.

- **Desktop:** sidebar sáu mục cố định; đầu trang là tên màn hình, mô tả ngắn và một CTA chính. Bộ lọc đặt ngay trên danh sách. Dữ liệu giá/tồn căn phải, tên và ảnh bên trái. Chi tiết bên cạnh khi cần giữ ngữ cảnh danh sách.
- **Mobile:** menu Sheet có đủ sáu mục, mục hiện tại rõ ràng; CTA chính luôn nhìn thấy. Bộ lọc nâng cao trong Sheet, hiển thị số bộ lọc đang áp dụng và nút xóa lọc. Danh sách chuyển thành các hàng/thẻ gọn với thông tin ưu tiên; không ép người dùng kéo ngang bảng để tìm thao tác.
- **Biểu mẫu:** nhóm thông tin theo công việc; desktop dùng panel rộng hoặc trang chỉnh sửa cho cấu hình dài, mobile dùng trang/panel toàn màn hình. Có nút Lưu/Hủy ở cuối dễ chạm, không bị bàn phím che; cảnh báo rời khi có thay đổi chưa lưu. Combo/Gift/Đăng ký không nhét vào dialog nhỏ.
- **Điểm nhấn chức năng:** luôn cho thấy nguồn của gói và phần tóm tắt giá/cấu phần sát biểu mẫu. Merchant nhìn được sản phẩm → combo → gift hoặc nguồn đăng ký mà không phải ghi nhớ giữa các bước. Giá chưa được BE xác nhận phải ghi “Ước tính”, không mang nhãn giá thanh toán.
- **Component:** tận dụng Button, Input, Select, Sheet, Dialog, AlertDialog, Badge, Skeleton và các mẫu PageHeader, EmptyState, StatusBadge, StockBadge, LoadingRows. Tách phần trình bày khỏi mock; giữ adapter/API và hợp đồng payload hiện hành. ProductSheet/StockDialog/ConfirmDialog cần chờ API và giữ lỗi, không sao chép nguyên hành vi giả lập.

## Đề xuất sáu màn hình

### Tổng quan

Trang vào `/manager`: tiêu đề “Tổng quan”, hành động “Thêm sản phẩm”; ưu tiên danh sách “Cần chú ý” và “Đơn hàng gần đây”. Các mục dẫn đến danh sách có bộ lọc tương ứng. Desktop có vùng tóm tắt phía trên và hai vùng công việc phía dưới; mobile xếp dọc, cảnh báo trước.

Chỉ hiện tổng số từ metadata/endpoint merchant được xác nhận. Chưa có hợp đồng summary trong client đã đọc; không dùng API vận hành admin và không coi số bản ghi của một trang là tổng toàn cửa hàng. Nếu chỉ tải được một phần, ghi rõ “Trong danh sách đã tải” hoặc bỏ số tổng. Ngưỡng “sắp hết hàng” cần xác nhận; số 10 ở prototype chưa phải quy tắc nghiệp vụ. Không dựng doanh thu hay số đơn “cần xử lý” khi merchant chỉ có quyền xem.

### Sản phẩm

Danh sách gồm ảnh/tên, thương hiệu, danh mục, giá và tồn; menu hành động Sửa, Điều chỉnh tồn, Xóa theo API. Bộ lọc tên, thương hiệu, danh mục, khoảng giá cần gửi đúng query BE hỗ trợ; phân trang theo server. Mobile đưa tên/giá/tồn lên trước, thông tin còn lại ở chi tiết.

Tạo/sửa tái sử dụng ProductForm và multipart hiện tại; thương hiệu chỉ lấy từ catalog-options, không có trường owner hay chuyển chủ. Khi chưa được gán thương hiệu, giải thích “Admin cần gán thương hiệu cho cửa hàng” và chặn lưu thiếu điều kiện. Tồn kho dùng dialog nhập tăng/giảm, lý do và tồn dự kiến; BE quyết định kết quả cuối. Kiểm tra quy tắc số nguyên, ảnh và payload trước khi nối UI.

### Combo

Danh sách gồm tên, cấu phần, giá BE, tồn khả dụng, hạn bán; loại trừ gift và combo nội bộ chỉ phục vụ đăng ký. Biểu mẫu có thông tin chung, chọn sản phẩm thuộc merchant kèm số lượng, mức giảm và hạn bán; cạnh đó là tóm tắt cấu phần. Mobile dùng danh sách sản phẩm có tìm kiếm, không checkbox dài không giới hạn.

Giữ tên “Combo” trên giao diện và `boxId`/kiểu box trong hợp đồng. Khi BE khóa sửa cấu phần vì đã có nghĩa vụ bán, giữ dữ liệu nhập và trình bày lý do; không tự tạo luồng version mới hoặc hướng dẫn lách khóa.

### Gift

Nhãn điều hướng “Gift”; mô tả “Quà tặng từ combo”. Danh sách hiển thị combo nguồn, tồn, hạn bán, mức giảm lượng và tiện ích kèm phí. Form theo thứ tự: chọn combo nguồn → thông tin bán → các bậc giảm theo số lượng → tiện ích/phí → rà soát.

Khi sửa, không mở lại nguồn nếu API hiện hành không cho đổi. Nêu rõ cấu phần/giá được giữ theo combo tại thời điểm tạo và tiện ích nằm trong mỗi hộp theo nghiệp vụ bàn giao. Cho xem tình huống số lượng để dễ hiểu, nhưng phần tính cục bộ phải ghi ước tính. Nếu cần giá thanh toán chính xác, xác nhận endpoint quote dành cho ngữ cảnh này trước; không tự giả định merchant có quyền gọi endpoint checkout.

### Đăng ký hàng tháng

Danh sách hiển thị tên, nguồn Combo/Hàng lẻ, kỳ, **Tổng thu trước** và **Bình quân mỗi tháng** thành hai trường riêng. Ví dụ nghiệm thu: 270.000 ₫ / kỳ 3 tháng, bình quân 90.000 ₫ / tháng; đây là dữ liệu kiểm thử, không đưa thành dữ liệu bán hàng mẫu.

Form bắt đầu bằng nguồn gói, sau đó chọn combo hoặc cấu phần hàng lẻ; kỳ 1/3/6/12 tháng và mức giảm theo hợp đồng hiện tại. Tồn/hạn nhận đăng ký cho nguồn hàng lẻ giữ theo form hiện hành. Khi sửa phải xác minh `sourceType` từ response, không mặc định mọi gói là combo. Dòng giải thích: “Giao hàng mỗi tháng, thu tiền trước cho cả kỳ”; không gọi là tự động trích tiền hàng tháng. Không dùng một formatter gom nhiều kỳ để làm mất từng gói quản lý riêng.

### Đơn hàng

Danh sách chỉ đọc, gồm mã/ngày, mặt hàng thuộc phạm vi BE trả về, trạng thái đơn, trạng thái thanh toán và số tiền với nhãn đúng ý nghĩa response. Desktop mở Sheet chi tiết; mobile chi tiết toàn màn hình. Chỉ hiển thị địa chỉ và thông tin người nhận BE cho phép; không tự ghép thêm từ API admin.

Đổi mô tả prototype từ “xử lý đơn hàng” sang “Theo dõi đơn hàng trong phạm vi cửa hàng”. Không có đổi trạng thái, hoàn tiền, xác nhận giao hay điều phối. Bộ lọc chỉ bật khi BE hỗ trợ; lọc cục bộ phải ghi “Trong trang hiện tại”. Timeline chỉ hiện bước có thể suy ra từ trạng thái BE; không dựng thời điểm sự kiện hoặc coi một trạng thái lạ là đã giao.

## API và phần phải xác minh trước khi triển khai

Hợp đồng dưới đây được quan sát từ FE, chưa phải OpenAPI/BE đã xác minh:

- Danh sách: `GET /manager/products`, `/manager/combos?kind=combo|gift`, `/manager/subscriptions`, `/manager/orders`; client đang đọc `data` và `pagination.totalPages`. Catalog: `GET /manager/catalog-options`. Cần kiểm tra interceptor chuẩn hóa response, phân trang, query và trường thực tế.
- Sản phẩm/Combo: tạo POST, sửa PUT, multipart có `images`; Gift tạo POST `/manager/gifts`, sửa PATCH `/manager/gifts/:id`, nhưng danh sách/xóa/tồn dùng resource combos theo client hiện tại. Không đổi các đường dẫn bất đối xứng chỉ vì tên UI.
- Đăng ký: POST `/manager/subscriptions` từ combo; POST `/manager/retail-subscriptions` từ hàng lẻ; sửa PATCH `/manager/subscriptions/:id`. Xác minh các trường được sửa và giá BE trả về.
- Tồn kho: PATCH `/manager/products/:id/stock` hoặc `/manager/combos/:id/stock` với `delta`, `reason`; xóa theo resource hiện hành. Cần đối chiếu validation và các ràng buộc khi đã bán.
- Chưa có backend source/OpenAPI trong workspace: cần xác minh ownership, lỗi 401/403/409/validation, semantics số tiền đơn có nhiều merchant, bộ lọc ngoài sản phẩm, summary và quote trước khi bật tính năng tương ứng. Không dựng endpoint hoặc coi client là bằng chứng đầy đủ của quyền BE.

## Trạng thái và tiêu chí chung

- Loading có Skeleton theo bố cục; phân biệt danh sách chưa có dữ liệu, không có kết quả lọc và lỗi tải. Lỗi có Thử lại; không thay lỗi bằng số 0 hoặc thông báo “Chưa có dữ liệu”.
- Lưu: khóa gửi lặp, giữ dữ liệu khi lỗi; chỉ báo thành công sau response xác nhận. Nếu lưu thành công nhưng tải lại thất bại, báo hai trạng thái riêng để tránh người dùng tạo bản ghi trùng.
- Lỗi quyền/phiên dùng cơ chế hiện hành; frontend không cấp quyền và không tải catalog admin làm fallback. Lỗi xung đột giữ ngữ cảnh và cho tải lại dữ liệu, không ghi đè âm thầm.
- Giá dùng vi-VN/VNĐ, giữ đúng giá trị 0, phân biệt dữ liệu thiếu; không biến giá chưa có thành miễn phí. Tên dài, nhiều cấu phần, nhiều bậc giảm và ảnh lỗi không phá layout; danh sách chọn phải có tìm kiếm/phân trang phù hợp.
- Bàn phím, focus khi mở/đóng panel, nhãn trường/nút icon, lỗi gắn trường và vùng thông báo đáp ứng WCAG 2.2 AA. Nút chạm nên đạt 44 px; kiểm tra desktop và mobile cả khi bàn phím mở.

## Thứ tự triển khai đề xuất

0. **Nền tảng chung:** chụp trạng thái git để bảo toàn thay đổi của người dùng; đối chiếu hợp đồng BE; nối shell sáu mục, phiên thật, điều hướng mobile, component phản hồi và adapter dữ liệu. Giữ luồng `/manager` đang hoạt động trong khi chuyển từng màn hình. Không chuyển mock thành fallback khi API lỗi.
1. **Sản phẩm:** hoàn thiện một luồng dọc danh sách → tạo/sửa → tồn → xóa với API thật. Đây là mẫu dùng chung về form, phân trang, lỗi và quyền thương hiệu cho các màn hình sau.
2. **Combo:** dựa trên sản phẩm đã hoạt động; kiểm tra chọn cấu phần, hạn bán, tồn và khóa sửa khi có nghĩa vụ.
3. **Gift:** dựa trên Combo; kiểm tra nguồn, bậc giảm và phí tiện ích, giữ nguyên quy tắc quote và giỏ gift đã nghiệm thu.
4. **Đăng ký hàng tháng:** hoàn thiện cả nguồn combo và hàng lẻ, tổng trả trước/bình quân tháng; không đổi nghiệp vụ thanh toán.
5. **Đơn hàng:** nối danh sách/chi tiết chỉ đọc và kiểm tra phạm vi dữ liệu giữa hai merchant. Có thể đẩy lên sớm hơn nếu cần theo dõi đơn trước, vì ít phụ thuộc form gói.
6. **Tổng quan:** tổng hợp các nguồn đã xác minh; liên kết có bộ lọc hoạt động, bỏ mọi KPI không có dữ liệu đúng phạm vi. Hoàn thiện cuối để không xây thống kê trên mock.

Thứ tự menu vẫn là Tổng quan → Sản phẩm → Combo → Gift → Đăng ký hàng tháng → Đơn hàng; thứ tự triển khai đi theo phụ thuộc dữ liệu.

## Cổng nghiệm thu cho đợt triển khai sau

Mỗi màn hình cần có luồng thật thành công, lỗi tải/lưu và kiểm tra desktop/mobile trước khi chuyển màn hình tiếp theo. Với thay đổi quyền, kiểm tra hai merchant và admin; BE phải từ chối truy cập trực tiếp ngoài phạm vi. Với giá, chạy lại các kiểm thử phù hợp đã có và xác minh fixture gift 555.000 ₫, đăng ký 270.000 ₫/3 tháng → 90.000 ₫/tháng trên môi trường test. Đây là kế hoạch kiểm tra, chưa phải kết quả lần này.

Trước khi bắt đầu code, duyệt hoặc chỉnh một vòng cho đề xuất này. Chưa coi hướng UI hoặc endpoint còn thiếu là quyết định đã chốt.
