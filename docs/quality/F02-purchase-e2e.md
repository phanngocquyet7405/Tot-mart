# Biên bản nghiệm thu chất lượng Phase F02: Purchase E2E & Idempotency Resilience

**Thời gian thực hiện**: 22/10/2026  
**Môi trường thực thi**: Windows 11 (PowerShell)  
**Phạm vi**: F02 — Rà soát toàn diện vòng đời giao dịch (`attemptLifecycle`, `purchaseAttempt`, `Checkoutpageservice`, `subscribePlanService`, UI Checkout & Subscription), xử lý trạng thái kết quả chưa rõ (timeout 35s, 5xx, 503, Code 91 recovery), đối chiếu dữ liệu qua DB fixture observation (`/__fixture/evidence`) bằng Playwright E2E.

---

## 1. Snapshot môi trường & File thay đổi

- **Nhánh**: `staging`
- **Commit HEAD**: `6ecc0fe` (`update s 19/10`)
- **Môi trường**: Node.js `v24.14.1` | npm `11.11.0`
- **Backend**: `C:\Users\84862\Desktop\totmart\TotMartAPI` (chỉ đọc, không sửa đổi source BE)
- **Danh sách file thay đổi & bổ sung**:
  - `src/app/util/attemptLifecycle.mjs`:
    - Bổ sung cấu hình timeout client `ATTEMPT_CLIENT_TIMEOUT_MS = 35000` (35 giây) và các khoảng trễ backoff `LOOKUP_BACKOFF_DELAYS = [2000, 4000, 8000, 12000]`.
    - Thêm hàm `isAmbiguousError(err)` nhận diện timeout (`ECONNABORTED`, `ETIMEDOUT`, `TimeoutError`), đứt kết nối mạng và lỗi máy chủ 5xx/503.
    - Cập nhật `resolveAttempt`: Khi gặp lỗi kết quả chưa rõ trong quá trình create/prepare/terminate, chuyển trạng thái sang `'confirming'` ("đang xác nhận"), bảo toàn nguyên vẹn `key` và `serializedBody`, thực hiện tra cứu tự động (backoff lookup). Khi BE trả về `processing`, giữ nguyên `confirming` (không ghi đè); khi BE trả về `created`, khôi phục đơn hàng thành công.
    - Đảm bảo `terminate` trước khi có hash luôn gửi `terminate-with-body` với body gốc; hash 100% nhận từ BE; `serializedBody` byte-immutable.
  - `src/app/util/purchaseAttempt.mjs`:
    - Bổ sung cơ chế bảo vệ CAS (Compare-And-Swap) trong `storeAttempt`: Khi một tab khác đã sinh key mới độc lập, response cũ đến trễ bị chuyển hướng ghi an toàn sang `referenceScope(scope, value.key)`, tuyệt đối không ghi đè active scope, không can thiệp giỏ hàng hoặc `cartVersion` mới.
    - Giữ nguyên archive tối thiểu (chỉ lưu trữ sau khi đơn hàng được BE xác nhận `created`).
    - Bảo vệ Web Lock `totmart:lock:checkout:products` / `subscription` đa tab.
  - `src/app/services/api/Checkoutpageservice.js`:
    - Truyền `backoffDelays`, bắt lỗi kết quả chưa rõ trả về `confirming: true`, xử lý `response.confirming` an toàn.
  - `src/app/services/api/subscribePlanService.js`:
    - Truyền `backoffDelays`, xử lý `confirming` tương thích với subscription flow.
  - `src/app/middleware/axiosMiddleware.js`:
    - Cấu hình `config.timeout ||= 35000` cho các endpoint attempt và subscription create/prepare.
    - Chuẩn hóa ESM import `./tokenMiddleware.js`.
  - `src/app/hook/checkout/useCheckout.js`:
    - Xử lý `result.confirming`: hiển thị toast thông tin ("Hệ thống đang xác nhận kết quả giao dịch..."), không quăng ngoại lệ, không đánh dấu thất bại.
  - `src/app/(client)/checkout/page.jsx`:
    - Khi `state === 'confirming'`: hiển thị tiêu đề *"Đang xác nhận kết quả giao dịch"*, thông báo chi tiết, ẩn/vô hiệu hóa *"Đặt đơn mới"*, hiển thị nút *"Kiểm tra lại kết quả"*.
    - Khi `terminationRequested === true`: giữ nút *"Kết thúc lần thử"* để người dùng thử lại việc hủy yêu cầu nếu mạng chập chờn.
    - Khi mất toàn bộ storage: hiển thị hướng dẫn hỗ trợ rõ ràng với liên kết đến `/profile/orders` và `/pages/contact-us`, tuyệt đối không tự dựng mã đơn ảo.
  - `src/app/(client)/components/Subsciber_components/ChoosePlanModal.js`:
    - Xử lý `res.confirming` trong `resumePending`, cập nhật thông báo đang xác nhận.
  - `tests/helpers/attemptHarness.cjs`:
    - Phơi bày `setTimeout` và `clearTimeout` vào sandbox VM context cho backoff timer.
  - `tests/f02PurchaseE2E.test.cjs`:
    - Bộ 8 unit/integration test hồi quy chuyên sâu cho Phase F02.
  - `scripts/f02-browser-e2e.cjs` & `scripts/run-f02-suite.cjs`:
    - Runner tự động hóa Playwright E2E kiểm chứng 7 kịch bản nghiệp vụ đối chiếu trực tiếp với database thông qua `/__fixture/evidence`.

---

## 2. Rà soát & Xác minh chi tiết các yêu cầu kỹ thuật

### 2.1. Terminate gửi body, Hash lấy từ BE, Serialized Body không đổi
- **Terminate gửi body**: Khi prepare thất bại trước khi có hash (ví dụ: `ADDRESS_NOT_FOUND`), client không thể gọi `POST /terminate` (vốn đòi hỏi header `Attempt-Payload-Hash`). Client bắt buộc gọi `POST /checkout/attempts/:kind/:key/terminate-with-body` với body gốc để BE xác minh và ghi durable tombstone (`invalidated`).
- **Hash 100% từ BE**: FE không tự tính hash sha256 ở client (tránh sai lệch thứ tự JSON hoặc encoding). Hash chỉ được lưu khi BE trả về trong response `prepare` hợp lệ dạng `^[a-f0-9]{64}$`.
- **Serialized Body bất biến**: Chuỗi JSON `serializedBody` được sinh một lần duy nhất lúc bắt đầu luồng và giữ nguyên byte-for-byte qua mọi bước `prepare`, `terminate-with-body`, `confirm` và `replay`.

### 2.2. Trạng thái Created $\rightarrow$ "Mua mới" & Đa tab Web Lock
- **Archive tối thiểu**: Chỉ cho phép chuyển sang trạng thái archive (`archiveAttempt`) sau khi trạng thái `created` đã được BE xác thực đầy đủ kèm mã đơn hàng (`result.orderCode`).
- **Khóa nhiều tab**: Sử dụng `navigator.locks.request` với `mode: 'exclusive'` để tránh 2 tab cùng sinh đơn từ một draft giỏ hàng.
- **Key mới độc lập**: Khi người dùng chủ động bấm *"Đặt đơn mới"*, client cấp phát UUID mới độc lập. Tab cũ vẫn giữ nguyên key cũ và vẫn tra cứu/thanh toán đúng mã tham chiếu cũ mà không bị xung đột.

### 2.3. Bảo vệ Response cũ đến trễ (Late Response CAS Protection)
- Trong `storeAttempt(targetScope, value)`: Kiểm tra CAS (`readAttempt(targetScope)`). Nếu active scope hiện thời đã mang key khác (do tab khác hoặc action "đặt đơn mới" đã sinh draft mới), response đến trễ sẽ bị chuyển hướng lưu trữ vào `referenceScope(targetScope, value.key)`.
- Tuyệt đối không ghi đè active scope, không xóa giỏ hàng mới và không hạ `cartVersion` mới.

### 2.4. Xử lý lỗi trước Hash và mất gói tin (Lost Responses)
- **Prepare lỗi trước hash**: Khi prepare ném lỗi 400 (địa chỉ bị xóa), `hash` là `undefined`. Gọi `terminate-with-body` giải phóng reference.
- **Mất response prepare/create/terminate**: Nếu response bị rớt giữa chừng, retry cùng key và serialized body sẽ khôi phục kết quả từ BE mà không tạo bản ghi trùng lặp.
- **Legacy attempt**: Bản ghi cũ thiếu body/hash không thể gửi `create` mới; client khóa luồng và hiển thị thông tin đối soát hỗ trợ.

### 2.5. Xử lý Kết quả chưa rõ (Ambiguous Outcome) & Phục hồi Code 91
- **Client timeout**: Đặt cố định `ATTEMPT_CLIENT_TIMEOUT_MS = 35000` (35 giây) thông qua Axios config và middleware.
- **5xx / 503 / Timeout**: Khi xảy ra, chuyển sang trạng thái `'confirming'` ("đang xác nhận").
  - Giữ nguyên `key` và `serializedBody`.
  - Thực hiện backoff lookup tự động với các chu kỳ `[2000, 4000, 8000, 12000]` ms.
  - UI hiển thị rõ *"Đang xác nhận kết quả giao dịch từ phía máy chủ"*, vô hiệu hóa và ẩn nút *"Đặt đơn mới"*, không cho phép người dùng đặt lại bằng key mới nhằm tránh đơn trùng lặp.
- **Hợp đồng Code 91**: Trường hợp BE đã commit thành công vào DB rồi mới trả 503 (ví dụ mất kết nối sau commit), client duy trì trạng thái "đang xác nhận". Lần lookup hoặc replay tiếp theo sẽ phát hiện trạng thái `created`, thu hồi mã đơn cũ mà DB chỉ ghi nhận **đúng 1 đơn hàng duy nhất**.

### 2.6. Mất toàn bộ Storage (Storage Loss)
- Khi `localStorage` và `sessionStorage` bị xóa hoàn toàn hoặc bị chặn bởi chính sách quyền riêng tư, hệ thống bắt lỗi an toàn:
  - Không tự bịa / dựng mã đơn ảo.
  - Hiển thị hướng dẫn hỗ trợ rõ ràng với liên kết đến Lịch sử đơn hàng (`/profile/orders`) và Trang liên hệ (`/pages/contact-us`).

---

## 3. Bằng chứng kiểm chứng E2E qua UI Browser & DB Observation

Toàn bộ các ca kiểm thử E2E trên trình duyệt Chromium (`viewport: 390x844`) chạy thông qua Next.js server (port 3217) kết nối với Backend fixture in-memory (`MongoMemoryReplSet`). Mọi khẳng định nghiệp vụ đều đối chiếu trực tiếp dữ liệu cơ sở dữ liệu qua endpoint `GET /__fixture/evidence`:

```json
{
  "checks": [
    "COD twice with identical carts; explicit new action; distinct keys, DB orders/stock/cart verified; replay preserves new cart",
    "Online created -> explicit new -> old payment URL remains recoverable with QR/status intact",
    "Pre-hash ADDRESS_NOT_FOUND -> terminate-with-body response dropped -> reload -> retry cleans reference safely",
    "Saves new address and completes purchase after pre-hash termination",
    "UI Code 91: BE committed then returned 503; UI handled confirming state, backoff lookup recovered created; exactly 1 order in DB",
    "UI subscription twice with explicit new action; DB subscriptions incremented by 2",
    "Storage completely wiped: no fabricated order code, redirects or presents support path cleanly"
  ],
  "errors": [],
  "passed": 7,
  "failed": 0
}
```

### Chi tiết 7 kịch bản Browser E2E:
1. **COD liên tiếp giỏ giống nhau**: Đặt đơn COD lần 1 thành công $\rightarrow$ thêm sản phẩm giống hệt vào giỏ mới $\rightarrow$ re-open checkout và replay đơn cũ $\rightarrow$ giỏ hàng mới của người dùng trong DB và local storage vẫn giữ nguyên 1 sản phẩm $\rightarrow$ bấm *"Đặt đơn mới"* $\rightarrow$ sinh key mới độc lập $\rightarrow$ xác nhận đơn thứ 2 $\rightarrow$ DB tăng đúng 2 giao dịch (`transactions.length == before + 2`), tồn kho giảm 2 (`stock == before - 2`), 2 mã key hoàn toàn khác biệt.
2. **Thanh toán Online cũ sau mua mới**: Đặt đơn Online $\rightarrow$ BE trả mã đơn $\rightarrow$ bấm *"Đặt đơn mới"* để chuẩn bị giỏ khác $\rightarrow$ truy cập lại URL thanh toán cũ (`/checkout?code=...`) $\rightarrow$ UI khôi phục nguyên vẹn màn hình chờ thanh toán kèm QR code và trạng thái payable của đơn cũ.
3. **Pre-hash ADDRESS_NOT_FOUND & Terminate-with-body**: Xóa địa chỉ trên BE trước khi bấm prepare $\rightarrow$ prepare báo lỗi và không có hash $\rightarrow$ bấm *"Kết thúc lần thử"* gửi `terminate-with-body` $\rightarrow$ cố tình chặn/drop response terminate $\rightarrow$ tải lại trang $\rightarrow$ bấm thử lại *"Kết thúc lần thử"* $\rightarrow$ BE ghi nhận `invalidated`, reference được dọn dẹp sạch sẽ, DB không có đơn hàng nào được tạo.
4. **Lưu địa chỉ mới & hoàn tất đơn**: Sau khi hủy lần thử lỗi, thêm địa chỉ giao hàng hợp lệ qua form UI $\rightarrow$ prepare và confirm đơn thành công.
5. **Mô phỏng Code 91 qua UI (503 sau commit)**: Bấm xác nhận đơn $\rightarrow$ Playwright chặn request `POST /api/checkout/check-out`, để BE commit thành công vào DB rồi fulfill HTTP 503 $\rightarrow$ UI bắt lỗi kết quả chưa rõ, chuyển sang trạng thái "đang xác nhận" $\rightarrow$ backoff lookup kích hoạt, tra cứu cùng key và phát hiện đơn đã tạo $\rightarrow$ UI tự động chuyển đến màn hình *"Đặt hàng thành công!"* $\rightarrow$ DB xác nhận chỉ có **duy nhất 1 giao dịch**.
6. **Hai Subscription liên tiếp**: Thực hiện đăng ký subscription lần 1 $\rightarrow$ bấm *"Đăng ký mới"* $\rightarrow$ thực hiện đăng ký lần 2 $\rightarrow$ DB tăng chính xác 2 bản ghi `UserSubscription`.
7. **Xóa sạch Storage giữa chừng**: `localStorage.clear()` và `sessionStorage.clear()` $\rightarrow$ tải lại trang $\rightarrow$ không phát sinh mã đơn ảo, không crash trang.

---

## 4. Bảng tổng hợp kết quả kiểm thử (Test Command Table)

| Lệnh kiểm thử | Exit Code | Kết quả | Trạng thái |
| :--- | :---: | :--- | :---: |
| `npm run lint` | **0** | ESLint kiểm tra toàn bộ project: 0 lỗi, 0 cảnh báo. | **PASS** |
| `npm test` | **0** | Chạy 25 test suites (`tests/*.test.cjs`):<br>- **Passed**: 151 tests<br>- **Failed**: 0<br>- **Duration**: 3.19s | **PASS** |
| `node scripts/verify-checkout-attempts.cjs C:/Users/84862/Desktop/totmart/TotMartAPI` | **0** | 15/15 HTTP integration checks đối chiếu trực tiếp với BE in-memory replica set. | **PASS** |
| `node scripts/run-f02-suite.cjs C:/Users/84862/Desktop/totmart/TotMartAPI` | **0** | - F02 Playwright Browser E2E: 7/7 checks passed.<br>- Purchase UI Regression Suite: 6/6 checks passed.<br>- Process cleanup an toàn. | **PASS** |
| `$env:CI="true"; npm run build -- --webpack` | **0** | Webpack Next.js 16.4.0 biên dịch thành công 62/62 static & dynamic routes trong 15.1s. | **PASS** |

---

## 5. Ma trận ca kiểm thử (Test Case Matrix)

| Mã ca | Mô tả kiểm thử | Mức kiểm chứng | File kiểm chứng | Kết quả |
| :--- | :--- | :---: | :--- | :---: |
| **TC-F02-01** | Client timeout hằng số 35000ms và cấu hình middleware | Unit / Harness | `tests/f02PurchaseE2E.test.cjs` | **PASS** |
| **TC-F02-02** | Create gặp HTTP 503 chuyển trạng thái `confirming` | Unit / Harness | `tests/f02PurchaseE2E.test.cjs` | **PASS** |
| **TC-F02-03** | Code 91 recovery: BE commit rồi 503 $\rightarrow$ lookup ra created | Unit / Harness | `tests/f02PurchaseE2E.test.cjs` | **PASS** |
| **TC-F02-04** | Trạng thái `confirming` khóa không cho tạo key mới | Unit / Harness | `tests/f02PurchaseE2E.test.cjs` | **PASS** |
| **TC-F02-05** | CAS protection: Late response không ghi đè active scope mới | Unit / Harness | `tests/f02PurchaseE2E.test.cjs` | **PASS** |
| **TC-F02-06** | Pre-hash prepare error $\rightarrow$ terminate-with-body gửi body gốc | Unit / Harness | `tests/f02PurchaseE2E.test.cjs` | **PASS** |
| **TC-F02-07** | Storage bị mất hoàn toàn không tạo mã đơn ảo | Unit / Harness | `tests/f02PurchaseE2E.test.cjs` | **PASS** |
| **TC-F02-08** | Subscription gặp 503 chuyển sang confirming và khôi phục an toàn | Unit / Harness | `tests/f02PurchaseE2E.test.cjs` | **PASS** |
| **TC-F02-09** | HTTP prepare + BE delivery snapshot frozen | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-10** | HTTP create commits, lost response simulated, lookup recovers | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-11** | Online order-status payable + QR URL không gọi cổng thật | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-12** | Terminate created không cho phép restart | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-13** | Sửa địa chỉ sau prepare giữ nguyên snapshot ban đầu | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-14** | Unknown blocks restart; terminate ghi tombstone bền vững | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-15** | Chuẩn bị đơn merchant bị từ chối 403 Forbidden | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-16** | Admin combo tạo hộp yêu cầu chủ sở hữu tường minh | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-17** | Subscription prepare, confirm, create và lookup | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-18** | Đua đồng thời create/terminate để lại đúng 1 committed hoặc tombstone | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-19** | Lookup hash mismatch bị từ chối bằng machine code xác thực | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-20** | COD prepare/create không sinh payable bank transfer | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-21** | `ADDRESS_NOT_FOUND` trước hash; mất terminate response retry thành công; DB không có checkout | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-22** | Cả hai schema `terminate-with-body` từ chối payload sai không tạo tombstone | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-23** | Hai giỏ COD giống hệt tạo 2 keys; replay cũ bảo toàn giỏ và tồn kho DB | Integration / BE | `scripts/verify-checkout-attempts.cjs` | **PASS** |
| **TC-F02-24** | Browser UI: COD 2 lần giỏ giống nhau, đối chiếu DB stock/cart/orders | Browser E2E | `scripts/f02-browser-e2e.cjs` | **PASS** |
| **TC-F02-25** | Browser UI: Online payment URL khôi phục sau khi bấm mua mới | Browser E2E | `scripts/f02-browser-e2e.cjs` | **PASS** |
| **TC-F02-26** | Browser UI: Pre-hash error $\rightarrow$ drop terminate response $\rightarrow$ retry giải phóng reference | Browser E2E | `scripts/f02-browser-e2e.cjs` | **PASS** |
| **TC-F02-27** | Browser UI: Thêm địa chỉ mới sau khi terminate thành công | Browser E2E | `scripts/f02-browser-e2e.cjs` | **PASS** |
| **TC-F02-28** | Browser UI: Code 91 recovery (BE commit rồi 503) $\rightarrow$ lookup ra created, DB có đúng 1 đơn | Browser E2E | `scripts/f02-browser-e2e.cjs` | **PASS** |
| **TC-F02-29** | Browser UI: Hai subscription qua UI modal, DB tăng đúng 2 | Browser E2E | `scripts/f02-browser-e2e.cjs` | **PASS** |
| **TC-F02-30** | Browser UI: Wipe toàn bộ storage không dựng mã đơn ảo, dẫn hướng hỗ trợ sạch | Browser E2E | `scripts/f02-browser-e2e.cjs` | **PASS** |

---

## 6. Đánh giá Gate Phase F02

- **Tiêu chí Gate**:
  - [x] Luồng P1 và các ca edge cases đạt qua UI và Database observation (`/__fixture/evidence`).
  - [x] Không trùng lặp giao dịch (Zero duplicate transactions).
  - [x] Không tiêu thụ nhầm giỏ hàng hoặc giảm tồn kho sai lệch.
  - [x] Key, serialized body và kết quả không bị rò rỉ hay gán nhầm sang context/account mới.
  - [x] Không chỉnh sửa mã nguồn Backend (`TotMartAPI`).
  - [x] Đầy đủ bằng chứng hình ảnh và nhật ký kiểm thử (`.cache/f02-browser-e2e-evidence.png`, `.cache/f02-browser-e2e-results.json`).

**Kết luận**: Phase F02 đạt chuẩn nghiệm thu kỹ thuật toàn diện (**GATE PASSED**).
