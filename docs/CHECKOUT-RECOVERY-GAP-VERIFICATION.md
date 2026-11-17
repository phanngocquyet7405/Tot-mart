# Kiểm chứng bổ sung checkout recovery — 18/10/2026

Tiếp tục thay đổi FE có sẵn, không reset/reimplement, không sửa BE, commit, push hay deploy. Bằng chứng trước đợt này trong [báo cáo gốc](CHECKOUT-SUBSCRIPTION-RECOVERY.md) được giữ nguyên. Không tính lại 27 bước browser, 12 kiểm tra HTTP hoặc Redis integration BE trước đó thành kết quả mới.

## Môi trường và an toàn dữ liệu

Đã kiểm tra listener Windows bằng `netstat -ano -p tcp` và `Get-NetTCPConnection` ngoài sandbox; kiểm tra listener Ubuntu bằng `ss -ltn`. Cổng 3000 và MongoDB 27017 đã có dịch vụ, không dùng để ghi test. Docker daemon chưa chạy. Ubuntu WSL chưa có Redis; cài gói Redis từ repository Ubuntu, chạy Redis **7.0.15** riêng trên `127.0.0.1:16427`, tắt persistence. Không dùng service Redis mặc định cho suite.

FE test: `http://localhost:3217`; BE test: `http://127.0.0.1:18479`. Các cổng này được chọn sau kiểm tra listener, không sao chép cổng 3100 của đợt cũ. Next output `.cache/next-test`; build output `.cache/next-build`, không thay `.env` đang trỏ remote. Harness vô hiệu dotenv trước import BE, dùng `NODE_ENV=test`, MongoMemoryReplSet một member mới mỗi lượt và tên DB riêng, Redis namespace UUID riêng. `startRedis()`/subscriber BE thật được bật; có PONG, ready và key rate-limit thật. Không chạy suite Redis primitive BE như một phần của kết quả này.

Fixture customer/merchant/admin và session được tạo trong DB disposable; JWT secret sinh ngẫu nhiên trong process, không ghi ra báo cáo. Browser chặn remote requests và image optimizer remote. Email/upload keys rỗng, không chạy scheduler/server production, không gửi thông báo ra ngoài, không gọi provider QR, webhook hoặc chuyển tiền thật. Session browser được seed bằng `sessionService.createSession` thật, không tính đây là kiểm thử form login.

## Cách chạy lại

Kiểm tra và chọn cổng trống lại trước mỗi lần chạy. Các giá trị dưới đây là cấu hình đã chạy trong đợt này, không phải cổng mặc định cho máy khác.

```powershell
wsl -d Ubuntu -- redis-server --port 16427 --bind 127.0.0.1 --save '' --appendonly no --daemonize no
```

Terminal FE:

```powershell
$env:API_URL='http://127.0.0.1:18479/api'
$env:NEXT_PUBLIC_API_URL='/api'
$env:TOTMART_TEST_DIST='1'
npm run dev -- --port 3217
```

Terminal kiểm chứng:

```powershell
$env:TEST_REDIS_URL='redis://127.0.0.1:16427'
$env:FE_TEST_ORIGIN='http://localhost:3217'
$env:FE_TEST_API_PORT='18479'
$env:PLAYWRIGHT_MODULE='<absolute-path-to-installed-playwright-module>'
node scripts/verify-checkout-attempts.cjs C:/Users/84862/Desktop/totmart/TotMartAPI --gaps
```

`--gaps` yêu cầu Redis loopback, FE origin và API port tường minh; không rơi về Redis disabled. Harness đóng API/Mongo/Redis clients khi kết thúc. Redis process và Next test riêng cần dừng sau suite; không dừng dịch vụ có sẵn. Playwright dùng bản cache local đã cài từ đợt trước, không thêm dependency production.

Sau kiểm chứng đã dừng Next/Redis test riêng; xác nhận các cổng 3217, 18479 và 16427 đều đóng. Không dừng server/DB có sẵn.

## Kết quả cuối

58 ca thực sự chạy: **58 pass, 0 fail, 0 skip**. Không có `pageerror` trên các trang được gắn listener. Bằng chứng máy đọc: `.cache/checkout-gap-results.json`, bản theo timestamp `.cache/checkout-gap-results-*.json`, ảnh `.cache/checkout-gap-redis-ui.png`. Các file này được ignore, không đưa runtime/token/ảnh tạm vào Git. Danh mục ca và kết quả không chứa credential được giữ trong báo cáo này.

- **13 ca auth products**: prepare/create/lookup/terminate × refresh thành công, refresh thất bại, session thu hồi = 12; thêm refresh cookie thuộc admin trong khi attempt thuộc customer. Giữ nguyên key/body, lookup/terminate không mở key mới trái hợp đồng, không có checkout dưới tài khoản khác hoặc trùng key.
- **6 ca địa chỉ products**: sửa/xóa qua API địa chỉ thật ở trước prepare, sau prepare và sau create HTTP 201 nhưng mất response. Trước prepare: sửa được snapshot mới, xóa bị ADDRESS_NOT_FOUND và không tạo checkout. Sau prepare: snapshot/addressHash giữ nguyên; UI render địa chỉ cũ, xác nhận COD và Order trong DB dùng địa chỉ đó. Sau mất response: lookup giữ snapshot/hash/key và Order dùng đúng địa chỉ ban đầu.
- **6 ca storage/tab**: quota localStorage thật đầy trước prepare; quota đầy sau prepare; iframe sandbox opaque origin thực sự phát SecurityError; Chromium `--disable-local-storage`; JSON hỏng trong localStorage thật; hai tab đồng thời prepare rồi create. Quota trước prepare và localStorage bị tắt đều chặn gửi prepare. JSON hỏng giữ nguyên bytes và chặn cấp key. Hai tab dùng Web Locks thật, một key và một checkout, cùng orderCode.
- **14 ca merchant/admin HTTP thật**: admin create owner merchant hợp lệ; merchant sửa combo của mình; bảy từ chối khi thiếu owner, owner customer, sản phẩm khác chủ, sản phẩm thiếu, archived, merchant khác sửa chéo và merchant gọi admin create; merchant create hợp lệ; admin sửa combo giữ owner; ba edit cấu phần foreign/archived/missing. Các yêu cầu bị từ chối đối chiếu Box/Product/Brand/SubscriptionTemplate trước/sau và không đổi dữ liệu. Không coi đây là 14 ca thao tác form UI.
- **12 ca auth subscription**: cùng ma trận bốn thao tác × ba trạng thái auth, dùng `subscribePlanService`, interceptor và cookies/refresh API thật trong Chromium; reference/key/serializedBody bất biến, không có checkout trùng.
- **6 ca địa chỉ subscription**: profile sửa/xóa ở cùng ba thời điểm. Hợp đồng subscription mang shippingAddress inline trong serializedBody; profile thay đổi không viết lại body cũ. Hash/key/body được giữ; mất response sau 201 khôi phục giao dịch cũ. Không gán addressHash của products cho subscription.
- **1 ca smoke UI subscription**: chọn gói/địa chỉ, prepare, xác nhận, create, màn chờ thanh toán và reload giữ payment URL, DB có đúng một checkout. FE rewrite → BE → Mongo và Redis security/rate-limit thật đều được bật.

Trong 44 ca Chromium có ba ca chạm UI render thực tế: hai ca địa chỉ products sau prepare và smoke subscription. Các ma trận service chạy source FE được nạp dưới ES modules bằng Playwright route test-only; axios, interceptor, token middleware, storage, Web Locks, lifecycle, cart sync và subscription service là mã thật. Client giữ base `/api`, JSON headers, credentials và timeout như app. Các dependency userService/paymentGateway không được gọi trong phần service harness; UI smoke dùng bundle Next thật. Không thêm endpoint/module test vào ứng dụng production.

## Phát hiện và sửa FE

Interceptor cũ chấp nhận token refresh bất kỳ rồi retry request cũ. Nếu cookies chuyển sang tài khoản khác, có thể gửi body/key của customer dưới token tài khoản đó trước khi lifecycle phát hiện đổi user. Nay request giữ identity ban đầu, kiểm tra identity token refresh và tài khoản hiện tại trước lưu token/retry. Refresh cũ thất bại không clear session hoặc phát session-expired sang tài khoản vừa chuyển. Hồi quy gồm refresh cùng user, cookie khác user, đổi user đang chờ refresh, refresh cũ bị từ chối sau đổi user.

`saveToken` trước đó gọi removeItem trên localStorage/sessionStorage không bảo vệ; browser tắt/khóa storage có thể làm hỏng auth trong bộ nhớ. Nay dọn legacy storage theo best effort, giữ token trong memory; checkout vẫn bắt buộc lưu reference thành công trước prepare/create. Có hồi quy storage getter phát SecurityError và kiểm tra Chromium tắt localStorage thật.

Quota đầy sau prepare có thể vẫn đủ chỗ ghi confirmed nhưng không đủ ghi result sau create. Không kết luận sai rằng chưa tạo đơn: UI/service báo không lưu được kết quả; reference/body/hash cũ vẫn nằm trong storage. Ca thực tế giải phóng filler, reload để mất memory, rồi lookup khôi phục đúng một checkout. Đây là recovery sau lỗi ghi kết quả, không phải cam kết mọi lỗi storage đều khiến BE không tạo đơn.

Không phát hiện lỗi BE trong phạm vi đã chạy. Không sửa BE và không suy rộng kết luận sang toàn bộ backend.

## Mô phỏng, lỗi runner và phần chưa chứng nhận

JWT hết hạn được ký hợp lệ với exp trong quá khứ và chèn vào request đúng thao tác; server thực sự kiểm tra hết hạn và refresh thật. Không chờ 15 phút đồng hồ trình duyệt. Session thu hồi bằng xóa AuthSession fixture tại thời điểm dispatch trước auth BE. Mất response dùng route.fetch nhận 201 thật rồi abort, không phải network partition hoặc kill lúc Mongo commit. Quota, Web Locks, localStorage và JSON hỏng là hành vi browser thật; iframe sandbox chỉ chứng minh primitive bị chặn, không phải UI app bên trong iframe đó.

Các lượt xây runner đầu gặp Content-Type khác client app, unroute khi route đang xử lý và Mongoose fixture không đánh dấu addresses thay đổi sau mutation qua API. Đã sửa runner/fixture và tạo DB mới cho suite cuối. Không tính các assertion fail do runner thành lỗi sản phẩm hoặc cộng các lượt lặp vào 58 ca cuối. Một assertion ban đầu yêu cầu quota đầy tuyệt đối không có checkout là sai với trường hợp reference đã bền vững; thay bằng kiểm tra error rõ ràng, key tồn tại và reload/lookup không trùng đơn. Khi bộ test auth thêm identity dependency, ba mock cũ thiếu dependency; đã cập nhật và chạy lại suite. Sandbox chặn Node test spawn EPERM; chạy lại ngoài sandbox.

Chưa kiểm chứng toàn ma trận bằng thao tác bấm trên UI: auth expiry/revocation, form sửa/xóa địa chỉ profile, mọi mutation merchant/admin và upload ảnh. Chưa chạy Firefox/WebKit/mobile thật, thu hồi session giữa Mongo commit và response, network partition/unknown commit-result, Redis restart/failover đa node, mất toàn bộ storage, email/payment/webhook/upload provider thật. Không đưa các mục chưa chạy vào số skip của runner; chúng là giới hạn nghiệm thu riêng.

## Kiểm tra mã và quyết định staging

`npm run lint`: pass. `npm test`: 111/111 pass, fail 0, skip 0. `npm run build`: pass, 62 trang, API_URL local, CI=true và output test riêng. `git diff --check`: pass. Đã rà diff hiện có và file mới; không thêm secret/runtime/cache vào Git; giữ toàn bộ thay đổi cũ.

**Đủ điều kiện chuyển sang nghiệm thu staging có kiểm soát**, chưa phải chứng nhận production. Trước khi chạy staging phải có DB/Redis/tài khoản test riêng, cấu hình API_URL/rewrite/cookie/CORS/header đúng môi trường, BE attempt contract và unique indexes/no TTL đã triển khai, writer cũ đã drain. Không chạy migration trong đợt FE này. Trên staging cần nghiệm thu UI auth/profile/merchant-admin và upload fixture theo giới hạn trên; xác minh chính sách lưu reference/PII và workflow mua mới sau created. Các điều kiện deployment lịch sử trong báo cáo gốc vẫn áp dụng. Nếu chưa bố trí được staging cô lập với các điều kiện này thì chưa được bắt đầu ghi test staging.
