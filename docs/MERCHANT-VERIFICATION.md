# Kiểm chứng merchant — 15/10/2026

## Kết quả mới nhất — 16/10/2026

Source hiện có đủ sáu route merchant. Lần chạy mới nhất: **60/60 test FE**, lint phần sửa sạch, **38 tình huống BE thật + MongoDB tạm** qua; build sáu route thành công. Chi tiết hiện hành ở [MERCHANT-HANDOFF.md](MERCHANT-HANDOFF.md) và [STAGING-DEPLOYMENT.md](STAGING-DEPLOYMENT.md). Các số 53/16 trong phần lịch sử dưới đây là kết quả các đợt trước, không phải tổng hiện tại.

Origin staging đã được người dùng xác nhận: `https://tot-mart-git-staging-furiousfast189-3255s-projects.vercel.app`; GET BE health với đúng Origin trả 200, exact CORS match và credentials=true. FE staging trả 302 sang xác thực Vercel cho truy cập công khai; chưa nghiệm thu phiên browser. Không có browser kết nối; chỉ cung cấp checklist thủ công, không công bố E2E đã qua.

## Cấu hình FE/BE

Đã đọc source BE tại `C:/Users/84862/Desktop/totmart/TotMartAPI`, gồm `src/routes/index.js`, `managerRouter.js`, `middleware/validationSchemas.js`, `uploadMiddleware.js`, `controllers/productController.js`, `services/merchantScope.js`, cấu hình server/CORS và `.env.example`. Không sửa source BE hay `.env` BE. Theo yêu cầu nối Render tiếp theo, FE `.env` chỉ cập nhật hai khóa API, giữ các giá trị khác; giá trị bí mật không được in ra.

Kiểm tra cấu hình hiệu lực FE bằng bộ nạp `@next/env` ở chế độ development, chỉ xuất các kết luận an toàn:

- FE hiện đặt `API_URL=https://totmartapi-1.onrender.com/api`; Next server chỉ lấy target từ `API_URL`. Browser base cố định `/api`; `NEXT_PUBLIC_API_URL` phải là `/api` hoặc không đặt. Bộ nạp môi trường đã xác nhận hai giá trị hiệu lực khớp cấu hình được yêu cầu.
- Trình duyệt FE dùng proxy cùng origin `/api`. Vì vậy rewrite của Next phải trỏ tới origin BE **kèm `/api`**, không chỉ origin.
- `.env` BE hiện chọn cổng **3000**, trùng cổng mặc định FE; CORS chưa cho phép `http://localhost:3000`.
- DB cấu hình trong `.env` BE không ở localhost. Không khởi động server hay chạy migration với cấu hình đó trong lần kiểm tra này.
- Đã xác minh endpoint công khai Render dưới `/api`, nhưng chưa xác minh toàn bộ bản triển khai đồng bộ với source. Build thành công không chứng minh phiên merchant hoạt động.
- Mẫu FE hiện trỏ Render; mẫu BE ghi cổng 3001. Với test riêng có thể ghi đè FE về `http://localhost:3001/api` trong terminal.

Biến môi trường đã được đặt sẵn trong terminal sẽ ưu tiên hơn `.env`. Các lệnh dưới chỉ ghi đè trong phiên chạy, không thay file cấu hình. Nếu đã có `.env.development.local` hoặc biến shell khác, kiểm tra chúng trước khi dùng.

## Kiểm tra Render chỉ đọc

Đích người dùng cung cấp: `https://totmartapi-1.onrender.com`. Source `src/routes/index.js` mount các router tại `/api/...`; `homeRouter.js` khai báo `/live` và `/health` bên dưới `/api/home`. Đã kiểm tra trực tiếp bằng GET, không gửi cookie/token, không đăng nhập, không gọi POST/PUT/PATCH/DELETE. Không lưu/in bản ghi sản phẩm; chỉ kiểm tra cấu trúc response.

- `GET /api/home/live`: **200**, `success: true`, `status: alive`.
- `GET /api/home/health`: **200**, `success: true`, `status: ready`.
- `GET /api/products/get-all-products?limit=1&page=1`: **200**, mảng `data`, metadata `page/limit/total/totalPages`, các trường sản phẩm khớp cấu trúc source.
- `GET /api/commerce-policy`: **200**, version `commerce-v2-delivery-separate`, các khóa policy khớp source hiện tại. Đây là version policy, **không phải** commit/version toàn BE.
- `GET /api/manager/products?limit=1&page=1` và `GET /api/manager/catalog-options`: **401**, `No token provided`. Source có auth ở cấp router, nên kết quả này chỉ chứng minh prefix manager đang có bảo vệ, **chưa chứng minh** từng handler hoặc đầy đủ thay đổi mới đã được deploy.
- `GET /api/home/health` với header `Origin: http://localhost:3000`: **403**, `Origin không được phép truy cập`. Endpoint hoạt động khi không có Origin, nhưng origin FE local chưa được Render cho phép. Không sửa/bỏ qua CORS hay giả mạo origin được phép.

Base API được **source và endpoint công khai đang chạy cùng xác nhận** là `https://totmartapi-1.onrender.com/api`. FE hiện đã nối qua Next rewrite và browser dùng `/api` cùng origin. Không thay đổi dữ liệu hay triển khai BE.

Cặp cấu hình đã áp dụng:

```dotenv
API_URL=https://totmartapi-1.onrender.com/api
NEXT_PUBLIC_API_URL=/api
```

Cần khởi động/build lại FE sau đổi cấu hình và giải quyết origin FE trong allowlist BE theo cấu hình được duyệt; thay API_URL không tự sửa CORS. Không kiểm thử ghi trên Render này. Chưa có deployment SHA/version endpoint để chứng minh Render đồng bộ hoàn toàn với source; CRUD/ownership/ảnh/giá và các route bảo vệ vẫn chưa xác minh trên bản triển khai.

## Hợp đồng Sản phẩm đã đối chiếu với source

- `GET /api/manager/products`: `page`, `limit` tối đa 100, `keyword`; trả `data` và `pagination` gồm `total`, `totalPages`. Brand/category trong danh sách là ID, không populate; FE đối chiếu tên bằng catalog-options.
- `GET /api/manager/catalog-options`: thương hiệu lọc theo merchant hiện tại, danh mục dùng danh sách chung; cả hai có `_id` thật.
- `POST /api/manager/products`, `PUT /api/manager/products/:_id`: multipart `images`; tên 3–100 ký tự, mô tả bắt buộc khi tạo/tối đa 500, giá nguyên dương, tồn tạo mới nguyên không âm. BE bỏ qua stock khi sửa.
- Ảnh: tối đa 10 file mỗi request, tối đa 2 MiB/file, MIME và đuôi JPEG/JPG/PNG/WebP. Sửa không gửi `existingImages` thì BE giữ ảnh cũ và thêm ảnh mới. Chưa thêm thao tác xóa ảnh cũ ở FE.
- `PATCH /api/manager/products/:_id/stock`: `delta` nguyên khác 0, từ -1.000.000 đến 1.000.000; `reason` tối đa 200 ký tự. Giảm quá tồn trả 409.
- `DELETE /api/manager/products/:_id`: xóa mềm bằng `archivedAt`; sản phẩm đang thuộc combo có thể bị từ chối 409.
- Middleware lấy role hiện tại từ DB, chỉ merchant dùng manager; kiểm tra owner trực tiếp và thương hiệu. Không mở rộng quyền FE.

## Kiểm tra tự động

- FE: `npm test` — **53/53 qua**, gồm validation merchant, hồi quy gift/subscription, cấu hình rewrite và refresh cookie/token.
- ESLint: `npx eslint src/app/manager tests/managerProducts.test.cjs scripts/verify-manager-backend.cjs` — qua.
- Production build: `npm run build -- --webpack` — **qua**, biên dịch và sinh đủ 59/59 trang. Worker build/test cần quyền tạo tiến trình ngoài sandbox.
- `node scripts/verify-api-rewrite.cjs` — **qua**, dùng Next dev thật và fixture auth local: đường dẫn, Origin, header xác minh, hai Set-Cookie và cookie gửi profile/refresh được giữ nguyên. Không có request tới Render. HTTP client tự gửi lại fixture cookie; chưa kiểm chứng cookie jar trình duyệt.
- Smoke test FE production trên `127.0.0.1:3102` qua rewrite tới Render: GET health **200 ready**, GET users/me không phiên **401**, GET health kèm Origin localhost:3000 **403**. Không gửi login/refresh/CRUD tới Render; đã dừng server test.
- BE thật + MongoDB tạm: `scripts/verify-manager-backend.cjs` — **16 tình huống qua**. Không mock route, controller, auth, Joi hay model MongoDB; không đọc `.env`, không khởi động scheduler/server production, không gọi dịch vụ upload.

Chạy lại bài tích hợp từ thư mục FE (BE cần có `node_modules`):

```powershell
node scripts/verify-manager-backend.cjs "C:\Users\84862\Desktop\totmart\TotMartAPI" "C:\Users\Admin\.cache\mongodb-binaries\mongod-x64-win32-7.0.14.exe"
```

Đối số binary thứ hai có thể bỏ nếu muốn mongodb-memory-server dùng binary trong cache hoặc tải MongoDB 7.0.14. Script luôn tạo replica set mới và tự dừng sau khi xong; không dùng `MONGODB_URI`/`TEST_MONGODB_URI` bên ngoài.

## CRUD đã kiểm chứng với BE thật

Trong Express app thật nạp từ source BE, qua HTTP nội bộ của Supertest và DB replica set tạm:

- Đọc catalog-options, danh sách có tìm kiếm/phân trang và metadata.
- Tạo sản phẩm bằng multipart với ID thật; BE ghi đúng chủ merchant.
- Sửa tên/giá qua multipart; tồn không bị ghi đè.
- Tăng tồn nguyên tử; từ chối giảm âm và delta vượt giới hạn.
- Xóa mềm; bản ghi được đánh dấu archived và không còn trong danh sách.
- Chặn truy cập chưa đăng nhập, role khách, sửa/xóa/list dữ liệu merchant khác và tạo với thương hiệu của merchant khác; từ chối giá 0.

Đây **không phải** kết quả CRUD trên dịch vụ BE đang chạy với DB cấu hình sẵn, cũng chưa phải kiểm tra luồng UI → Next proxy → BE. Không gửi request ghi vào DB hiện hữu.

## Khởi động để kiểm tra thủ công

Chỉ dùng database, tài khoản và dịch vụ thử. Không chạy migration hoặc xóa dữ liệu để chuẩn bị bài kiểm tra này. Cần Node 22/24, dependency FE/BE đã cài và MongoDB **replica set** riêng, không dùng standalone.

Nếu chưa có MongoDB thử, có thể tạo container riêng (cần Docker; không dùng volume dữ liệu hiện hữu):

```powershell
docker run -d --name totmart-merchant-dev -p 127.0.0.1:27019:27019 mongo:7 mongod --replSet rs0 --bind_ip_all --port 27019
docker exec totmart-merchant-dev mongosh --port 27019 --quiet --eval 'rs.initiate()'
```

Nếu tên container đã tồn tại, kiểm tra container đó trước; không xóa hoặc tái dùng một container chưa biết nguồn dữ liệu. Chờ replica set bầu primary rồi chạy BE.

**Terminal BE** (kiểm tra các khóa bắt buộc theo `.env.example` và `server.js`; dùng khóa thử cho Cloudinary/email/thanh toán, không gửi chúng vào chat):

```powershell
cd C:\Users\84862\Desktop\totmart\TotMartAPI
$env:NODE_ENV = "development"
$env:PORT = "3001"
$env:MONGODB_URI = "mongodb://127.0.0.1:27019/totmart_manager_dev?replicaSet=rs0&directConnection=true"
$env:REDIS_URL = ""
$env:FRONTEND_URL = "http://localhost:3000"
$env:CORS_ORIGINS = "http://localhost:3000"
npm run dev
```

BE kiểm tra sự hiện diện các biến DB/JWT/Cloudinary/SePay khi khởi động. Cấu hình test các biến đó trước, kể cả khi chỉ kiểm tra catalog. Không dùng lệnh trên nếu cổng 27019 đang là DB khác; URI phải trỏ đúng replica set thử vừa chuẩn bị. Với development một instance, source cho phép Redis trống.

**Terminal FE:**

```powershell
cd C:\Users\84862\Desktop\WorkSpace\totmart\fe_totmart
$env:API_URL = "http://localhost:3001/api"
$env:NEXT_PUBLIC_API_URL = "/api"
npm run dev -- --port 3000
```

Kiểm tra `http://localhost:3001/api/home/health` và `http://localhost:3000/api/home/health`: cả hai phải trả ready. Đăng nhập bằng merchant fixture trong **DB thử** rồi mở `http://localhost:3000/manager`. Admin thử phải gán thương hiệu cho merchant và có danh mục trước khi tạo sản phẩm; tài khoản trên DB khác không tự xuất hiện ở DB mới. Chưa có script seed an toàn được xác minh nên không tự tạo tài khoản/quyền ở DB hiện hữu.

Development dùng lệnh trên; build production hiện yêu cầu URL HTTPS remote. Không hạ kiểm tra production để dùng localhost. Khi deploy thật, cấu hình `API_URL=https://<BE-test-host>/api`, giữ browser `/api`, cho phép origin FE tương ứng trên BE, rồi build lại.

## Checklist desktop/mobile

Thực hiện trên dữ liệu thử; desktop khoảng 1440 px, mobile khoảng 390 px và kiểm tra thêm 320 px. Có thể dùng responsive mode của DevTools; nếu dùng điện thoại thật qua LAN cần cấu hình origin/CORS và cookie tương ứng, chưa được kiểm chứng ở đây.

- [ ] Header hiện đúng tài khoản; desktop có sáu mục sidebar; mobile mở/đóng menu có đủ sáu mục, chọn mục sẽ đóng menu. CTA Thêm sản phẩm luôn thấy, trang không tràn ngang.
- [ ] Đăng nhập merchant A/B lần lượt: mỗi bên chỉ thấy sản phẩm của mình; khách/admin không vào được `/manager`. Kiểm tra đăng xuất thành công và trường hợp lỗi mạng.
- [ ] Danh sách có loading; tìm kiếm không kết quả khác với lỗi API; Thử lại hoạt động khi BE lên lại. Phân trang hoạt động với hơn 20 sản phẩm thử, tìm kiếm đưa về trang đầu.
- [ ] Tạo sản phẩm với thương hiệu/danh mục thật: Network gửi ID, không gửi tên hay ownerId; API thất bại không có thông báo thành công, form giữ dữ liệu; lưu thật rồi refresh vẫn thấy.
- [ ] Tên quá ngắn, giá 0, mô tả quá dài, ảnh quá 2 MB/quá 10 file/sai loại bị chặn. Thử ảnh hợp lệ bằng tài khoản Cloudinary test; ảnh preview và ảnh sau tải lại đều đúng.
- [ ] Sửa tên/giá/thương hiệu trong danh sách được phép; ảnh cũ được giữ, ảnh mới được thêm; không ghi đè tồn. Hủy/rời form bẩn có xác nhận; mobile nhập liệu không bị bàn phím che nút Lưu.
- [ ] Tồn: +3, -2 cập nhật từ BE; giảm quá tồn hoặc delta ngoài giới hạn không báo thành công; lý do tối đa 200 ký tự.
- [ ] Xóa sản phẩm thử chưa thuộc combo: hủy không xóa; xác nhận thành công thì biến mất sau refresh. Nếu đang thuộc combo và BE trả 409, giữ danh sách và hiển thị lỗi rõ.
- [ ] Tắt mạng khi lưu: không báo thành công giả. Nếu lưu đã thành công nhưng tải lại lỗi, thông báo phân biệt hai việc. Không tự bấm lưu lại khi chưa rõ kết quả.
- [ ] Combo/Gift/Đăng ký/Đơn hàng vẫn mở và dùng API hiện có. Kiểm tra Tab, Escape, focus sau đóng dialog, nhãn nút icon, tên sản phẩm dài và ảnh lỗi.

## Chưa xác minh

Trình duyệt desktop/mobile, cookie login/logout qua proxy, CRUD xuyên suốt UI, Cloudinary upload thật, dịch vụ BE đang triển khai và cặp FE/BE local chạy bằng cấu hình đề xuất. Chưa có browser kết nối; không thử lại iab. Impeccable visual review vẫn **recapture**, không coi các kiểm thử API là chứng nhận giao diện.
