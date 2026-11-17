# FE TotMart — kiểm chứng checkout ngày 19/10/2026

Chỉ sửa FE; không commit, push, deploy hoặc sửa BE. Git FE sạch khi bắt đầu; Git BE kiểm tra cuối vẫn sạch. Các biên bản ngày 17–18 trong thư mục này được giữ nguyên, không cộng số test lịch sử vào kết quả dưới đây.

## Thay đổi và nguyên nhân

- P1 trước hash: `resolveAttempt` gọi terminate-with-body bằng đúng serialized body/key ban đầu, không gọi prepare để kết thúc và không tự tính hash. Ghi ý định kết thúc trước request; mất response thì recovery thông thường retry đúng endpoint/body. Chỉ giải phóng khi `invalidated` và `canRestart === true`. Lỗi validation, auth, capacity, timeout hoặc unknown giữ reference.
- P1 mua lần hai: thêm “Đặt đơn mới” và “Đăng ký mới”. Dưới Web Lock, chỉ giải phóng active reference đã xác nhận created sau khi lưu history reference bền vững. History chỉ giữ user/kind/key/hash, ID/mã giao dịch, số tiền/phương thức và thời điểm; bỏ serialized body, snapshot địa chỉ và summary chi tiết. Quota lỗi thì giữ active cũ.
- Tab giữ key đã quan sát; request tab cũ tìm đúng reference lịch sử, không ghi đè active mới. URL thanh toán cũ tra reference theo mã giao dịch, không tự nhận active giao dịch khác. Created dùng lookup/replay, không gửi terminate để hủy giao dịch.
- Replay không xóa giỏ. Chỉ phản hồi create trực tiếp có thể yêu cầu tiêu thụ giỏ; CartContext kiểm tra identity của mảng draft, bảo vệ cả giỏ mới có cùng nội dung. Bỏ lần clear thứ hai sau lookup thanh toán. Đồng bộ thay đổi giỏ giữa tab qua storage event.
- Kiểm tra identity sau khi lấy Web Lock và gắn `_requestUserId` vào Axios config cho prepare/create/lookup/terminate/quote/sync. Đây là config nội bộ, không phải header BE mới. UI kiểm tra owner của draft trước gửi và trước áp dụng kết quả.
- Kiểm tra ghi chú/coupon trước khi đóng băng attempt mới; giới hạn địa chỉ subscription theo schema BE. Không sửa body của reference cũ bị validation lỗi.
- Phân biệt copy created với yêu cầu chưa xác định. Prepare/kết thúc thành công dùng thông báo thông tin thay vì toast lỗi đỏ. Không gọi kết thúc attempt là hủy đơn. Không vẽ sao khi thiếu số đánh giá xác nhận; không suy ra “0 đánh giá” từ field thiếu. Bỏ log chứa URL QR và cảnh báo sai trong lúc QR chưa tải.

## Hợp đồng đã đối chiếu trực tiếp

Đọc `docs/checkout-attempt-contract.md`, `docs/be-handoff-verification.md` của BE tại `C:/Users/84862/Desktop/totmart/TotMartAPI`; đối chiếu `src/routes/checkOutRouter.js`, `subcribePlanRouter.js`, `middleware/validationHandler.js`, `validationSchemas.js`, controllers checkout/subscription và services `checkoutAttemptService`, `checkoutLifecycle`, `commercePolicy`.

- `POST /api/checkout/attempts/products/:key/terminate-with-body` và đường dẫn tương ứng `subscription`. Auth như lookup. Body JSON gốc qua cùng create schema, conversion/defaults/stripUnknown của Joi; không cần `Attempt-Payload-Hash` hay `Idempotency-Key`. HTTP 200 trả `{success:true,data:{key,hash,state,canRestart,result?}}`. Hash từ BE, không phải hash raw JSON ở FE.
- Validation 400 không ghi tombstone, không cho restart. `ADDRESS_NOT_FOUND`/`ADDRESS_CHANGED` là lỗi nghiệp vụ; body hợp lệ vẫn terminate được mà không tra địa chỉ/template. Mất response: retry nguyên path/body; sau khi có hash có thể lookup tombstone.
- Hash terminate cũ vẫn là `POST /api/checkout/attempts/:kind/:key/terminate`, body trống, header `Attempt-Payload-Hash`. Prepare/create giữ `Idempotency-Key`; create products `/api/checkout/check-out`, subscription `/api/subcribe-plans/user-subscribe`.
- `processing`: đã tiếp nhận, chưa xác nhận kết quả; `unknown`: chưa tìm thấy, không chứng minh chưa tạo; `rejected`: BE đã lưu từ chối, cần kết thúc trước đổi body; `invalidated + canRestart:true`: được key mới; `created`: giao dịch đã tồn tại, chỉ người dùng chủ động mới mở giao dịch độc lập.
- Cookie POST dùng `X-TotMart-Request: 1` và credentials theo middleware hiện có. Thanh toán lấy `payable`, `remainingAmount`, `paymentStatus`, `qrUrl` hiện tại từ order-status; không lấy replay làm bằng chứng đã trả tiền.
- BE Product hiện có `rate`, không có hợp đồng reviewCount/rating aggregate. FE không đổi rate thành sao giả. Không thêm hệ thống đánh giá hoặc hardcode policy/giá mới. Gift identity vẫn phân biệt product/box/wrap/message; giá và coupon từ BE quote.

## Môi trường và kết quả thực chạy

Windows, Node 24.14.1; Next thực cài 16.4.0. Đã đọc guide rewrites trong `node_modules/next/dist/docs` trước sửa. FE test 3111, `/api` rewrite đến BE loopback 3211 bằng biến môi trường của process; không sửa `.env`. Build dùng `CI=true`, API local và dist riêng `.cache/next-build`; dev dùng `.cache/next-test`.

MongoMemoryReplSet 7.0.14, wiredTiger, một member, database UUID mới mỗi lượt; không dùng MongoDB 27017 đang có. Redis 7.4 container riêng `totmart-fe-test-20261019`, publish loopback 6380, namespace UUID từng lượt; không dùng Redis 6379 đang có. Tài khoản/catalog/coupon/address đều fixture. Không in token hoặc địa chỉ người thật vào báo cáo.

Cleanup cuối đã xác nhận: fixture server/replica set đóng với exit 0; FE test 3111 dừng chủ động; container test đúng ID đã được xóa. Cổng 3111/3211/3212/6380 không còn listener; các process có sẵn trên 3000/27017/6379 vẫn giữ nguyên PID. BE Git vẫn sạch. Giữ `.cache` để đọc bằng chứng, không xóa tài nguyên của người dùng.

Kết quả được tách theo cấp kiểm tra:

- Lint: `npm run lint`, exit 0.
- Unit/component: `npm test`, **130 pass, 0 fail, 0 skip**, exit 0. Bao gồm regression trước hash, created/new, quota, key cũ, account switch chờ lock và termination intent.
- Build: `npm run build -- --webpack`, exit 0, 62 static pages; một lượt trước có cảnh báo cache parser của next-intl, lượt build cuối không có compile error.
- API HTTP với BE thật: **15 kiểm tra pass**, exit 0 ở lượt API kết thúc; lượt serve cũng hoàn tất 15 assertion trước mở UI. Kiểm tra Order/Checkout/Attempt, giỏ, tồn kho, snapshot và key; coupon `usedCount` chỉ tăng một lần qua mất response/replay và không tăng do COD mới. Không chỉ HTTP 200.
- Chromium service/API: **60 pass, 0 fail**, exit 0. Chạy source FE modules trong document test; transport, refresh cookie, Mongo, Redis, localStorage và Web Locks thật. Các ca này **không phải toàn bộ E2E bấm UI**. Trong bộ này có smoke UI snapshot/COD/subscription và form tạo/sửa combo merchant; quyền chéo được kiểm tra HTTP và DB không đổi.
- UI smoke desktop 1365×960 và mobile 390×844: **27 bước pass**, exit 0; login/logout, catalog detail, giỏ, coupon, prepare, mất response create, payment URL/reload, subscription, orders và role guard/admin owner selector.
- UI P1 riêng trên mobile: **6 nhóm pass**, exit 0; hai COD giống nhau, replay giữ giỏ mới, online cũ sau mua mới, terminate trước hash mất response, lưu địa chỉ mới mua tiếp, focus keyboard và hai subscription. Số Checkout/stock/cart/Subscription được đọc từ endpoint quan sát chỉ có trong FE fixture runner; không thêm endpoint vào BE source.
- `git diff --check`: exit 0. `npm audit --omit=dev --json` hiện trả 0 vulnerability runtime; đây không phải đánh giá bảo mật toàn hệ thống.

Lỗi runner đã xử lý: sandbox EPERM khi spawn được chạy lại có quyền; selector sai tên nút/empty-state và giỏ chưa hydrate được sửa theo component thật; một lượt service dùng port 3212 trong khi FE rewrite 3211 bị loại. Runner nay kiểm tra identity fixture qua `/api/users/me` trước bộ service. Không bỏ test, không nới kiểm tra số đơn/tồn kho để làm xanh.

## Ma trận nghiệm thu và giới hạn

1. COD lần một → giỏ mới → COD lần hai: UI pass; key khác, DB tăng đúng hai Checkout, stock giảm đúng hai đơn vị, giỏ BE bị tiêu thụ.
2. Hai giỏ giống hệt: UI pass; replay không tăng Checkout, không xóa local cart mới; API kiểm tra giỏ BE và stock không đổi khi replay.
3. Online created → mua mới → thanh toán đơn cũ: UI pass bằng URL/reference cũ. QR provider bị chặn; không chuyển tiền.
4. Subscription hai lần: UI pass, hành động “Đăng ký mới”, DB tăng hai subscription. Unit kiểm tra key khác và template mới.
5. ADDRESS_NOT_FOUND trước hash → body terminate → địa chỉ mới → mua: UI pass; xóa địa chỉ fixture bằng API sau khi UI đã tải. Địa chỉ mới được nhập/lưu qua form UI thật. Không tạo Checkout cho key invalidated.
6. Mất response terminate → reload → retry body: UI pass; abort sau response commit thật là mô phỏng mất ACK. Mất response prepare có unit coverage; chưa có ca UI riêng làm mất ACK prepare. Mất response create có UI coverage.
7. Hai tab cạnh tranh mua mới, kết quả cũ đến muộn: Chromium module/service pass với Web Locks thật và HTTP lookup giữ response; kiểm tra active mới và DB hai key. Chưa tự động bấm hai nút mua mới đồng thời trên hai trang UI.
8. Session hết hạn/thu hồi tại prepare/create/lookup/terminate: Chromium service pass cho products và subscription, JWT hết hạn được bơm tại dispatch; refresh/session BE thật. Đổi account khi refresh/chờ lock có regression. Chưa lặp mọi điểm đổi account bằng form login UI riêng.
9. Storage đầy/chặn/JSON hỏng: Chromium service pass, gồm quota native trước prepare và sau prepare/create recovery; unit kiểm tra archive quota không giải phóng active. Chưa UI thao tác toàn bộ tổ hợp storage lỗi sau created.
10. Merchant/admin: form combo merchant tạo/sửa UI pass và đối chiếu owner/value/name DB; admin owner selector và role guard UI pass; quyền chéo/invalid component HTTP pass, catalog không đổi. **Chưa nghiệm thu toàn bộ form sản phẩm/admin combo CRUD/image upload và mọi thao tác đơn bằng UI.**
11. Redis thật: pass trên container test riêng, shared auth/rate limiter/session I/O thật. Không phải Redis Cluster/outage/load test mới.
12. Desktop/mobile smoke và focus nút mua mới pass, pageerror rỗng. Request mạng ngoài bị chặn chủ động; abort mất ACK là lỗi mạng có chủ đích. Cảnh báo ảnh Next logo/sizes còn trong dev console; không chứng nhận sạch mọi console warning hoặc WCAG audit đầy đủ. Capture phải chờ animation kết thúc.

Catalog list/search/filter/pagination, dữ liệu thiếu/lỗi tải có unit/source coverage sẵn và detail UI smoke; **chưa kiểm chứng mọi tổ hợp bằng UI nhiều trang fixture**. Hủy/hết hạn/payment remaining có unit/API coverage nhưng chưa diễn tập đầy đủ UI trạng thái hủy/hết hạn trong đợt này. Legacy có body/hash hoặc thiếu cả hai được unit kiểm tra; chưa import dữ liệu legacy production vào trình duyệt. Không suy diễn các phần này là E2E pass.

## Tái lập

Từ gốc FE, cài dependency bằng `npm ci`, rồi `npx playwright install chromium`. Không cần module path/cache cá nhân. BE path phải có source và dependency; không chạy npm install/migration trong BE từ runner.

Terminal FE:

```powershell
$env:API_URL='http://127.0.0.1:3211/api'
$env:NEXT_PUBLIC_API_URL='/api'
$env:TOTMART_TEST_DIST='1'
npm run dev -- --port 3111
```

Terminal test (kiểm tra cổng/container trước, chỉ tạo nếu trống):

```powershell
$env:TOTMART_BE_ROOT='C:/Users/84862/Desktop/totmart/TotMartAPI'
$env:FE_TEST_ORIGIN='http://localhost:3111'
$env:FE_TEST_API_PORT='3211'
$env:TEST_REDIS_URL='redis://127.0.0.1:6380'
npm run test:api
npm run test:browser:services
npm run test:fixtures
```

Giữ terminal fixtures chạy; terminal thứ ba đặt cùng `FE_TEST_ORIGIN`, chạy tuần tự `npm run test:e2e:ui` và `npm run test:e2e:purchase`. Không chạy hai fixture BE cùng cổng; runner service phải dùng đúng cổng FE rewrite, không chỉ một BE loopback bất kỳ. Nhấn Enter trong terminal fixtures tương tác để đóng server, Redis client và replica set. Redis container chỉ dọn nếu chính lượt đó tạo; không FLUSHDB và không dừng dịch vụ 3000/27017/6379 có sẵn.

Evidence raw ở `.cache/checkout-api-results.json`, `checkout-gap-results.json`, `checkout-browser-results.json`, `purchase-ui-v2-results.json`; screenshot cũng ở `.cache`, không đưa token/cookie/storage dump vào Git. Endpoint `/__fixture/evidence` chỉ do `scripts/verify-checkout-attempts.cjs` bọc ngoài app BE trong process fixture, trả counts/key/code fixture phục vụ assertion.

CI hiện có chạy lint/unit/build, nên regression mới tự nằm trong CI. Repo CI không checkout BE hoặc cung cấp fixture Redis; chưa thêm job E2E giả xanh khi thiếu BE. Các npm script trên cho phép nối job có BE test và Redis riêng sau này.

## Điều kiện trước phát hành/staging

Hai lỗi P1 đã có bằng chứng local thật; **chưa kết luận toàn bộ FE sẵn sàng phát hành**. Còn chặn nghiệm thu toàn diện: form sản phẩm/admin CRUD/upload, full UI search/filter/pagination, mọi tổ hợp đổi account/storage giữa thao tác UI, và UI payment hủy/hết hạn/remaining. Không tìm thấy lỗi BE mới cần sửa trong những ca thực chạy; lỗi runner không được báo thành lỗi BE.

Staging cần BE đã deploy tombstone/body-terminate; dùng tài khoản/DB test và Redis namespace riêng, không thử trên dữ liệu thật. Lặp ma trận 1–12 còn thiếu, kiểm tra cookie/proxy/refresh trên HTTPS, Orders/Checkout/stock/coupon/subscription sau từng ca, dùng payment fixture/webhook local được phép. Không dùng canRestart của created hoặc lỗi mạng để tự mua lại. Không migration, chuyển tiền, gửi email/SMS hoặc upload dữ liệu thật trong smoke này.
