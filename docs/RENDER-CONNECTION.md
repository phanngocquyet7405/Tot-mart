# Kết nối FE → Render và tự kiểm tra phiên merchant

## Cập nhật staging — 16/10/2026

Origin thực tế do người dùng xác nhận: **https://tot-mart-git-staging-furiousfast189-3255s-projects.vercel.app**. Người dùng cho biết Render CORS_ORIGINS và FRONTEND_URL cùng dùng origin này. GET BE health với đúng Origin trả **200**, Access-Control-Allow-Origin khớp chính xác, Access-Control-Allow-Credentials=true. GET FE staging chưa xác thực trả **302 tới vercel.com**, nên chưa kiểm tra ứng dụng sau lớp Vercel Authentication.

Không cần đoán/thêm origin mới hay sửa Render trong đợt này. Dùng đúng alias staging, không lấy URL deployment ngẫu nhiên chưa được cho phép. Cấu hình Preview/staging, thứ tự ưu tiên và rollback nằm trong [STAGING-DEPLOYMENT.md](STAGING-DEPLOYMENT.md); Production chưa được xác minh và không bị thay đổi.

## Cấu hình đã áp dụng

`API_URL=https://totmartapi-1.onrender.com/api` chỉ dùng ở Next server. Axios luôn dùng `/api`, qua rewrite tới `${API_URL}/:path*`. Không còn fallback lấy backend từ biến public. `NEXT_PUBLIC_API_URL` giữ `/api` (hoặc bỏ); nếu trỏ domain khác, Next báo lỗi thay vì âm thầm có hai backend.

Đã sửa `next.config.mjs`, `src/app/services/api/apiEndpoints.js`, `.env.example` và chỉ hai khóa tương ứng trong FE `.env`. Không thay các giá trị khác hoặc in bí mật; không sửa BE, không deploy Render.

## Kết quả kiểm tra

- 53/53 test FE qua; lint phần thay đổi sạch; production build thành công, 59/59 trang.
- Next rewrite với auth fixture local qua: giữ path, Origin và X-TotMart-Request; chuyển tiếp riêng hai Set-Cookie với HttpOnly/Secure/SameSite/Path; gửi Cookie tới profile và refresh. Không tự đổi Origin, Domain hay cờ bảo mật.
- FE production thật → rewrite → Render, GET không có phiên: health trả 200 ready, users/me trả 401. GET health kèm Origin `http://localhost:3000` trả 403. Server smoke test đã dừng.
- Chưa đăng nhập vào Render, chưa có cookie phiên thật. Không gửi POST/PUT/PATCH/DELETE tới Render; không CRUD, tạo đơn hoặc thanh toán. POST login/refresh trong bài test chỉ tới fixture cục bộ.

## Luồng phiên theo source

1. Trang `/login` POST tới `/api/home/login` với email/password do bạn nhập. Axios bật `withCredentials` và `X-TotMart-Request: 1`; Next chuyển tiếp request, bao gồm Origin.
2. BE tạo phiên và trả access token trong JSON cùng hai cookie `token`/`refreshToken`. Source `sessionService.js` đặt HttpOnly, SameSite=Lax, Path=/, Secure khi production; không đặt Domain. Khi đi qua rewrite, browser phải lưu cookie cho **host FE**. Không đổi SameSite sang None hoặc bỏ Secure.
3. FE chỉ giữ access token trong bộ nhớ, không lưu vào localStorage/sessionStorage. Sau login, FE GET `/api/users/me` rồi điều hướng theo role hiện tại.
4. Khi tải lại trang, cookie phải xác thực GET profile. Nếu access token hết hạn, interceptor POST `/api/home/refresh` với cookie và header xác minh, nhận token mới rồi thử lại request một lần. Các request 401 đồng thời dùng chung một refresh. Refresh thất bại xóa phiên trong bộ nhớ.
5. Logout POST `/api/home/logout` thu hồi phiên và xóa cookie. Chưa thực hiện bước nào trong luồng này với tài khoản Render.

Cookie flags trên là từ **source**; fixture xác nhận khả năng chuyển tiếp của Next. Chưa có bằng chứng Render trả chính xác cùng flags cho phiên thật hoặc trình duyệt lưu/gửi cookie thành công. Không chia sẻ token, password, Set-Cookie hay cookie value trong chat/HAR chưa làm sạch.

## CORS: vì sao localhost chưa đăng nhập được

`src/app.js` dùng danh sách `(CORS_ORIGINS || FRONTEND_URL)`, so sánh origin chính xác, `credentials: true`. Next rewrite đổi Host upstream nhưng **không bỏ/đổi Origin**. Browser thường gửi Origin cho POST đăng nhập; lỗi 403 đã được xác nhận qua proxy bằng GET có cùng header. Vì vậy public GET không Origin thành công chưa đủ kết luận login hoạt động.

Trong `src/config/environmentChecks.js`, `validateProductionEnv()` từ chối HTTP **và localhost** trong cả `FRONTEND_URL` và `CORS_ORIGINS`. Nếu Render đang chạy đúng source này với NODE_ENV=production, chỉ thêm `http://localhost:3000` vào CORS_ORIGINS sẽ làm startup thất bại. Không đổi NODE_ENV sang development, không tắt CORS và không dùng wildcard để xử lý.

Phương án tương thích nguyên trạng source production là dùng **một origin FE HTTPS cụ thể**, ví dụ URL của FE test đã triển khai. Cấu hình Render BE cần người quản trị thực hiện, chưa được agent áp dụng:

- Biến **CORS_ORIGINS**: origin staging đã được cấu hình theo người dùng và được GET xác nhận là `https://tot-mart-git-staging-furiousfast189-3255s-projects.vercel.app`. Giữ các origin hợp lệ khác đang hoạt động; không cần thêm localhost hoặc wildcard.
- Biến **FRONTEND_URL**: người dùng xác nhận `https://tot-mart-git-staging-furiousfast189-3255s-projects.vercel.app`; đây là origin dùng cho link FE. Chưa tự đọc dashboard hoặc sửa giá trị cloud.
- Không cần sửa COOKIE_DOMAIN hoặc COOKIE_SAMESITE: source không cung cấp các biến này. Không thay JWT secret, TRUST_PROXY hoặc cấu hình cookie chỉ để chữa CORS.

Nếu bắt buộc dùng localhost:3000 với Render production, **không có cách giải quyết chỉ bằng biến môi trường tương thích với source hiện tại**. Cần một thay đổi BE được review để cho phép đúng dev origin trong một chế độ có kiểm soát, hoặc dùng BE test riêng. Chưa thực hiện/thay đổi/deploy phương án đó. Cũng chưa xác minh Render đang chạy commit nào; không suy ra production validator đã có chỉ từ GET thành công.

## Khởi động lại FE

Dừng FE cũ bằng Ctrl+C. Mở PowerShell mới tại repo để tránh biến môi trường cũ ghi đè `.env`, rồi chạy:

```powershell
cd C:\Users\84862\Desktop\WorkSpace\totmart\fe_totmart
$env:API_URL = "https://totmartapi-1.onrender.com/api"
$env:NEXT_PUBLIC_API_URL = "/api"
npm run dev -- --port 3000
```

Mở `http://localhost:3000/api/home/health` để kiểm tra đường proxy, sau đó `http://localhost:3000/login`. Health có thể ready trong khi login vẫn 403 do Origin. **Với cấu hình Render hiện tại, chưa coi localhost login là sẵn sàng.** Sau khi có origin FE HTTPS được phép, dùng URL FE đó để tự đăng nhập. Cookie production giữ Secure; không dựa vào ngoại lệ localhost của từng trình duyệt.

Nếu chạy bản production FE, build lại sau thay API_URL rồi start; rewrite được ghi vào output build:

```powershell
npm run build -- --webpack
npm start -- --port 3000
```

## Checklist tự đăng nhập — chỉ đọc catalog trên Render

- [ ] Chốt origin FE HTTPS được BE cho phép, hoặc có phương án localhost đã được duyệt; không thử login liên tục khi còn 403. Đăng nhập bằng tài khoản merchant hiện hữu, không tạo tài khoản/quyền mới để thử.
- [ ] Trong Network, request là **host FE** `/api/home/login`, không gọi trực tiếp domain Render. Nếu 403 với thông báo Origin, xử lý allowlist; nếu 401 mới kiểm tra tài khoản. Không gửi thông tin đăng nhập cho agent.
- [ ] Login 200: kiểm tra response có hai Set-Cookie; Application → Cookies có token/refreshToken dưới host FE, HttpOnly và các cờ phù hợp. Nếu bị chặn, đọc lý do blocked trong DevTools; không copy giá trị cookie.
- [ ] GET `/api/users/me` 200, role merchant; header `/manager` đúng người dùng. Refresh trang vẫn giữ phiên; profile không rơi vào vòng lặp 401/refresh.
- [ ] Khi phiên cần refresh, `/api/home/refresh` có cookie và X-TotMart-Request, trả 200 rồi request gốc thành công. Không sửa token ở DevTools để ép kiểm tra trên Render; nếu chưa quan sát được thì đánh dấu chưa xác minh.
- [ ] Chỉ xem danh sách/phân trang/tìm kiếm/catalog-options được tài khoản cho phép. Không bấm Thêm/Lưu/Xóa/Điều chỉnh tồn, không tạo đơn hay thanh toán.
- [ ] Tự đăng xuất nếu muốn kiểm tra kết thúc phiên: request logout phải thành công, cookie được xóa, reload `/manager` trở về login. Đây là thao tác xác thực do bạn thực hiện, không phải CRUD sản phẩm.

Không có browser kết nối trong phiên này. Phần thực sự còn thiếu là login/cookie jar/refresh/logout của trình duyệt với Render và phản hồi dữ liệu merchant sau xác thực; các test local không thay thế được những kiểm tra đó.
