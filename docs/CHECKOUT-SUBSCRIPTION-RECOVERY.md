# Checkout và subscription

## Bổ sung kiểm chứng khoảng trống — cuối ngày 18/10/2026

Đọc [báo cáo kiểm chứng bổ sung](CHECKOUT-RECOVERY-GAP-VERIFICATION.md) trước các giới hạn lịch sử bên dưới. Đợt bổ sung chạy Redis local thật, 58 ca: 58 pass, 0 fail, 0 skip; gồm 44 ca Chromium (một ca chỉ kiểm tra primitive sandbox) và 14 ca HTTP mutation merchant/admin. Ba ca có kiểm tra UI render; các ma trận còn lại thực thi module FE trong browser và API thật, không gọi toàn bộ là UI E2E. Giữ nguyên các kết quả 27 bước browser/12 HTTP và giới hạn tại thời điểm trước đó làm lịch sử.

Sửa bổ sung chỉ ở FE: ràng buộc retry sau refresh với tài khoản của request ban đầu, không ghi token hoặc phát sự kiện hết phiên sang tài khoản vừa chuyển; dọn token legacy chịu được storage không khả dụng. Thêm hồi quy auth/storage. Báo cáo bổ sung nêu cấu hình, cách tái chạy, bằng chứng, kết quả cuối và các điều kiện nghiệm thu staging còn phải xác minh.

## Cập nhật hợp đồng attempt — 18/10/2026

Phần này thay thế hành vi TTL và các khoảng trống API nêu trong bản ghi 17/10 phía dưới. Giữ bản ghi cũ làm bằng chứng lịch sử.

Đã đối chiếu hai tài liệu bàn giao BE và source routes, Joi validation, controllers, attempt/lifecycle/subscription services, auth, cookie-CSRF, error handler và cấu hình local tại `C:/Users/84862/Desktop/totmart/TotMartAPI`. Không sửa BE. Git FE sạch khi bắt đầu.

- Products: lưu user/kind/key/serialized body, sync giỏ và lấy quote mới; `POST /api/checkout/attempts/products/prepare`; hiển thị snapshot BE và tổng tiền để khách xác nhận; `POST /api/checkout/check-out` giữ nguyên key/body. Không thêm response addressHash vào body create.
- Subscription: `POST /api/checkout/attempts/subscription/prepare`, sau xác nhận mới gọi `POST /api/subcribe-plans/user-subscribe`; body chứa templateId, expectedTotalAmount và shippingAddress đúng schema. Không dùng chung key với products.
- Prepare/create gửi Idempotency-Key. Lookup `GET /api/checkout/attempts/:kind/:key` và `POST .../terminate` gửi Attempt-Payload-Hash do BE trả. Auth dùng client hiện hữu với credentials và X-TotMart-Request; không coi hash là credential.
- Chỉ xóa reference để mở lần thử mới sau `success:true`, `state:invalidated`, `canRestart:true`. Không xóa theo tuổi, 4xx, timeout, unknown hoặc created. Reference created khôi phục giao dịch cũ và order-status; màn QR dùng payable/remainingAmount/qrUrl từ BE. Mua mới sau giao dịch created cần workflow kinh doanh riêng; chưa có nút tự mở lần mua thứ hai trong recovery.
- localStorage chia sẻ reference giữa tab, Web Locks serialize thao tác cùng scope. Trình duyệt thiếu Web Locks hoặc không ghi được storage bị chặn trước prepare/create. Subscription legacy theo template được tìm trong storage cùng tài khoản. Thiếu body/hash, reference không hợp lệ hoặc dữ liệu hỏng giữ trạng thái cần hỗ trợ; không đoán hash. Reference có hash nhưng mất body vẫn lookup/terminate được.
- Tóm tắt địa chỉ được che; snapshot đầy đủ chỉ phục vụ xác nhận giao hàng. Body subscription bắt buộc giữ địa chỉ để replay chính xác. Replay result lưu tối thiểu ID/code/tổng tiền, không lưu thêm bản snapshot subscription chứa PII. Không log payload/token khi đăng ký lỗi. Mất toàn bộ storage vẫn không có API liệt kê attempt để bootstrap; cần hỗ trợ đối chiếu.
- Admin create combo ở cả dialog và `/admin-box/create` yêu cầu merchant ownerId; đổi owner xóa cấu phần; lọc theo chủ và kiểm tra ID duy nhất/số lượng nguyên dương. Không gửi price/value làm nguồn tin cậy. Form thường không sửa ownership/cờ nội bộ. Catalog BE lọc cả internalSubscription và mirror subscriptionOnly.

### Môi trường kiểm chứng

`.env` FE hiện trỏ remote Render, nên cổng FE 3000 hiện hữu không được dùng để ghi test. Không sửa `.env`. Đã xác minh listener 3000 và 27017; không dùng DB 27017. Docker daemon không sẵn sàng. Dùng `scripts/verify-checkout-attempts.cjs` để đọc Express app BE, vô hiệu dotenv trước import, tạo MongoMemoryReplSet một member mới với DB tên riêng và fixture customer/merchant/admin. Redis tắt cho một process test; không chứng nhận tích hợp Redis. Không khởi chạy scheduler/server production. Email/upload keys rỗng, ngân hàng là fixture; không gửi webhook/thanh toán thật.

Lệnh chạy harness từ root FE:

```powershell
node scripts/verify-checkout-attempts.cjs C:/Users/84862/Desktop/totmart/TotMartAPI --serve
$runtime = Get-Content .cache/checkout-runtime.json | ConvertFrom-Json
$env:API_URL = $runtime.origin + '/api'
$env:NEXT_PUBLIC_API_URL = '/api'
$env:TOTMART_TEST_DIST = '1'
npm run dev -- --port 3100
```

Harness không cần `--serve` nếu chỉ chạy kiểm tra HTTP. `FE_TEST_API_PORT` tùy chọn giữ cổng test sau khi tạo lại fixture; mặc định cấp cổng loopback ngẫu nhiên. Build test dùng `TOTMART_TEST_DIST=build`, `CI=true`, API_URL local để không ảnh hưởng thư mục `.next` của server cũ. Output test và runtime nằm trong `.cache` đã ignore.

Browser runner: `node scripts/checkout-browser-e2e.cjs <absolute-path-to-playwright-module>`. Playwright/Chromium tải từ npm/CDN chính thức vào cache máy, không thêm dependency production. Runner chặn request ngoài local, kể cả ảnh remote qua Next image optimizer. Mã QR là URL từ BE fixture; ảnh provider không được gọi. Mất phản hồi được mô phỏng bằng Playwright route.fetch tới BE thật rồi abort response sau HTTP 201; không phải network partition hay unknown commit-result thật.

### Kết quả kiểm chứng 18/10

- `npm run lint`: pass, exit 0.
- `npm test`: 106/106 pass, exit 0. Hồi quy thực thi service/engine với API doubles gồm body/key bất biến, hash-only recovery, 25 giờ không reset, user switch giữa prepare, storage bị chặn/hỏng, mất response prepare/terminate, lỗi không có code, unknown và điều kiện invalidated/canRestart. Đây là unit/service tests, không gọi chúng là browser E2E.
- `npm run build`: pass, exit 0, sinh 62 trang với API_URL local và output `.cache/next-build`.
- `node scripts/verify-checkout-attempts.cjs <BE-path>`: 12 kiểm tra pass, exit 0, Express và Mongo transaction thật trên replica set tạm mới. Có snapshot sau sửa địa chỉ, online/status, subscription/replay, quyền merchant, admin owner bắt buộc, race create/terminate thật, hash mismatch và COD. Không chạy toàn bộ suite BE 374 test của biên bản bàn giao như thể là kết quả mới.
- Chromium headless, desktop 1365×960 và viewport mobile 390×844: 27 bước browser pass, exit 0, không có pageerror trong trang chính của runner. Request API dùng FE rewrite tới BE local thật. Ảnh provider/analytics bị chặn; không chuyển tiền. Viewport mobile là mô phỏng Chromium, không phải điện thoại thật.
- `git diff --check`: pass, exit 0.

Browser đã thực sự chạy:

1. Login customer, chi tiết sản phẩm, thêm giỏ; coupon sai/đúng qua quote thật; prepare hiển thị snapshot BE trước create.
2. Reload prepared attempt; tab thứ hai đọc cùng reference; mất response create sau HTTP 201 thật; lookup khôi phục đúng code và màn chờ; reload payment URL; terminate từ tab thứ hai giữ giao dịch created.
3. Lịch sử đơn; subscription prepare/xác nhận/create/chờ thanh toán/reload; logout customer; login merchant, danh sách đơn và bị chặn dashboard admin; login admin và form combo yêu cầu chọn merchant.
4. Trên viewport mobile: tăng/giảm/xóa giỏ; thêm/chọn địa chỉ qua API thật; prepare COD, khách xác nhận và màn thành công.
5. Abort trước create gửi tới BE; reload/lookup giữ reference; terminate thật nhưng bỏ response; reference vẫn còn cho tới lookup thật xác nhận tombstone và mới mở lại.

Browser phát hiện và đã sửa: recovery lấy đúng code nhưng chưa chuyển step sang payment; sidebar tổng tiền hiện 0 sau khi cart bị tiêu thụ. Hồi quy browser xác minh màn payment và số tiền BE sau reload. Recovery cũng không xóa giỏ nháp mới nếu khác giỏ của attempt cũ.

Một số lượt đầu thất bại do fixture email không hợp lệ với Joi, assertion giá cố định sau khi giỏ test thay đổi, Next khởi động lại cấu hình và giới hạn đăng nhập sau nhiều lần lặp trên cùng process. Đã sửa runner/fixture và tạo lại process/DB test trước suite cuối; không nới rate limit. Sandbox ban đầu chặn Node test spawn (EPERM), nên các kiểm tra cần tiến trình con được chạy lại với quyền đã cấp.

Bằng chứng local (được ignore để không đưa fixture/log vào Git): `.cache/checkout-browser-results.json`, `.cache/checkout-api-results.json`, `.cache/checkout-browser.png`, `.cache/checkout-cod-mobile.png`. Runner và harness nằm trong `scripts/` để chạy lại; fixture chỉ tồn tại trong DB tạm. `checkout-browser-failure.png` nếu còn là ảnh debug lượt trước, không phải golden cuối.

### Giới hạn và điều kiện triển khai

Chưa kiểm chứng trên browser: sửa/xóa địa chỉ trong profile khi attempt đang chờ (snapshot sau sửa được kiểm tra HTTP thật), phiên hết hạn do đồng hồ, storage bị chặn/hỏng (đã có unit), hai tab đồng thời cấp key mới, race transaction từ hai browser request độc lập (đã chạy race HTTP thật), legacy rejected/invalidated mất hash, thao tác upload ảnh combo và mọi mutation merchant/admin. Các lượt mở danh sách đơn/dashboard không chứng nhận toàn bộ tác vụ vận hành. Chưa có Firefox/WebKit/thiết bị mobile thật.

Không thử network partition/kill process lúc commit, multi-node failover, Redis thật, thanh toán/webhook/email/Cloudinary thật hoặc migration production. Cơ chế mất response là fault injection có chủ đích; không diễn giải thành chứng minh mọi unknown commit-result. Không phát hiện lỗi BE trong phạm vi 12 kiểm tra local; không coi đó là kiểm chứng toàn bộ BE.

Phát hành BE hiểu CheckoutAttempt trước FE, xác minh unique indexes của CheckoutAttempt và Checkout, không TTL, và drain toàn bộ writer cũ bỏ qua tombstone. Migration/ownership conflict do người vận hành thực hiện theo kế hoạch BE sau backup/duyệt; đợt FE không chạy migration. Xác minh môi trường đích, API_URL/rewrite, cookie/CORS/custom headers và hỗ trợ Web Locks. Giữ cơ chế hỗ trợ legacy thiếu reference/hash và chính sách retention PII; không cho recovery tự bỏ key. Workflow mua mới sau created cần nghiệp vụ riêng được xác nhận, không tự giải phóng bằng terminate hay hết hạn thanh toán.

## Bản ghi lịch sử — 17/10/2026

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
