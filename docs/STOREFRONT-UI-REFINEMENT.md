# Giao diện storefront — 17/10/2026

## Phạm vi và bằng chứng

Đợt này tiếp nối [CHECKOUT-SUBSCRIPTION-RECOVERY.md](CHECKOUT-SUBSCRIPTION-RECOVERY.md). Toàn bộ thay đổi chưa commit có sẵn được giữ; không reset, checkout đè, chép ZIP, commit, push, deploy hoặc sửa BE. Báo cáo cũ là bằng chứng của đợt trước, không phải chứng nhận trực quan cho giao diện mới.

Đã đọc hướng dẫn dự án, Git status/diff, PRODUCT.md, DESIGN.md, báo cáo khôi phục, guide Image hiện cài trong Next và bốn playbook Impeccable: critique, audit, adapt, polish. Context được nạp bằng launcher Windows của skill, không giả định rằng tên workflow là một lệnh CLI.

Đã mở bảy ảnh tham chiếu được cung cấp. Chỉ tham khảo gallery/thumbnail, khoảng trắng, phân cấp và cách đặt các kỳ hạn cạnh nhau. Không dùng sao, chính sách, số liệu, giá hoặc cam kết trong ảnh làm dữ liệu TotMart. Không tạo ảnh kết quả giả; chưa có ảnh trước/sau của bản chạy.

## Đối chiếu báo cáo khôi phục

Source lúc bắt đầu vẫn có `purchaseAttempt.mjs`, `Checkoutpageservice`, `subscribePlanService`, hook checkout và các test đúng như báo cáo trước: giữ key/payload, tóm tắt che địa chỉ, cảnh báo draft đổi, TTL đối chiếu, chặn lần thử mới khi chưa có kết luận BE an toàn. Bộ 90 test cũ đã chạy lại đạt; bộ hiện tại có thêm sáu test hành vi UI.

Đợt này không sửa các service giao dịch, helper idempotency, hook checkout, quy tắc giá hoặc hợp đồng BE. Chỉ trình bày lại vùng chờ đối chiếu và đồng bộ trạng thái disabled với chốt thiếu fingerprint đã có trong service. Không thêm thao tác xóa/bỏ qua yêu cầu cũ. Link liên hệ không có nghĩa yêu cầu đã được đối chiếu.

## Critique và audit ban đầu

Method: dual-agent — Assessment A `/root/design_review`, Assessment B `/root/design_evidence`, độc lập. A hoàn tất trước khi kết quả detector B được đưa vào tổng hợp. Các điểm dưới đây là đánh giá source trước sửa, không phải điểm chất lượng của bản chạy sau sửa.

Design specificity: TotMart có nhận diện “Dual Shop” rõ trong tài liệu, nhưng các mặt mua hàng pha trộn amber/red/emerald và nhiều hộp thông tin ngang cấp. Gallery và giá chưa dẫn đường tốt đến hành động mua; modal dài và thiếu cơ chế bàn phím. Điểm tốt cần giữ là tóm tắt giao dịch cũ, giá trả trước/bình quân tháng, và cấu phần box lấy từ API.

Nielsen, mỗi mục tối đa 4: trạng thái 3; ngôn ngữ thực tế 3; kiểm soát người dùng 2; nhất quán 1; phòng lỗi 3; nhận biết thay vì ghi nhớ 2; hiệu quả 2; tối giản 2; khôi phục lỗi 2; trợ giúp 2. Tổng **22/40**, đánh giá từ source.

Audit source: accessibility 2/4, performance 2/4, theming 1/4, responsive 3/4, integrity 2/4; tổng **10/20**. Không có số đo runtime, kiểm tra screen reader, contrast thực render hoặc viewport để nâng các điểm này thành chứng nhận.

Ưu tiên đã xử lý trong source:

- P1: modal thiếu Dialog/focus/Escape, label chưa gắn input; đổi sang primitive Dialog hiện có và native radio/form semantics.
- P1: box có nút Heart/Share rỗng, lỗi tải cấu phần bị biến thành empty; bỏ nút rỗng và tách lỗi khỏi dữ liệu trống, thêm retry.
- P1: yêu cầu cũ bị chặn nhưng người mua thiếu bước tiếp theo; nhóm tóm tắt, nhấn mạnh trạng thái, thêm đường liên hệ với mã đối chiếu. Chốt an toàn không bị nới.
- P2: gallery/giá/nút mua và catalog box/gift không cùng hệ; dùng gallery chung, màu market/atelier và token CSS storefront có scope.
- P2: thẻ gói lặp số tiền, cross-sell lặp dataset và chọn sẵn tất cả; dùng so sánh kỳ hạn chung, bỏ khối gợi ý trùng và yêu cầu khách chủ động chọn.

Cognitive load ban đầu: nhóm hành động mua, biểu tượng, metadata và các khối chính sách cạnh tranh; modal đặt nhiều nội dung trước quyết định kỳ hạn; hai khối sản phẩm liên quan lặp cùng dữ liệu. Các thay đổi giảm phần lặp, đưa giá trả trước vào một cấu trúc chung và giữ từng quyết định trong nhóm riêng.

Persona đã xét: Casey cần nút chạm lớn và đường mua ngắn; Jordan cần biết tổng phải trả và bước tiếp theo khi chưa rõ đơn; Sam cần tên điều khiển, label đúng trường, focus và thao tác bàn phím. Các sửa source hỗ trợ các nhu cầu này; thao tác thực vẫn cần browser kiểm chứng.

Detector B: **5 advisory, 2 rule**. `design-system-font-size`: hai CTA 12px ở ProductPurchasePanel, một CTA 12px ở box detail và badge khóa 8px ở modal; `bounce-easing`: icon Gift animate-bounce trong modal. Các match nguồn đều có thật; bounce là nhận xét phong cách, không phải bằng chứng chắc chắn về lỗi accessibility vì source đã có reduced motion cho bounce. Những markup này đã được thay trong đợt sửa; không chạy vòng detector lặp trong parent để tìm điểm số đẹp. Hook thiết kế tiếp tục hoạt động khi chỉnh file.

Questions skipped: người dùng đã chốt thứ tự triển khai, nhận diện, phạm vi, điều kiện nghiệp vụ và yêu cầu tiếp tục; không hỏi lại các quyết định đã có.

## Sidecar thiết kế

`impeccable doctor --json` báo đúng một finding `design-sidecar-stale`, severity `mention`. DESIGN.md có LastWriteTime 17/10/2026 10:43:49, sidecar 16/10/2026 08:09:03; `generatedAt` trong sidecar cũng ghi ngày 16/10. Đây là bằng chứng thứ tự thời gian, không tự chứng minh mọi token đều sai.

Đối chiếu cụ thể: canonical terracotta/cream/leaf và hai font vẫn phù hợp nhận diện; sidecar còn snippet promo “Save up to 70%”, trong khi source đã loại lời hứa này; snippet button dùng 0.75rem, chip 10px, khác một số mô tả type ramp trong DESIGN.md. Chính DESIGN.md cũng còn ví dụ promo 70% trong đoạn mô tả màu và mô tả label 10px trong prose, bên cạnh khai báo label 0.6875rem. Không khôi phục claim hoặc ép chữ nhỏ để khớp snippet cũ.

Theo quy trình severity `mention`, chỉ báo phần lệch và đề xuất `/impeccable document` để đối chiếu, đồng bộ sidecar trong một công việc riêng giữ nguyên ý nghĩa DESIGN.md. Đợt này không ghi đè DESIGN.md, PRODUCT.md hoặc sidecar. Nhãn thao tác mới dùng 14px, input 16px, khoảng chạm tối thiểu 44px trong các component được sửa.

## Route và component thực sự được sửa

- `/products/[slug]`: page → `useProductDetail` → `ProductGallery`, `ProductPurchasePanel`, `ProductInfoTabs`, `ProductLoadingState`, `ProductNotFoundState`, `FrequentlyBought`. Gallery desktop có dải thumbnail dọc, mobile cuộn ngang; ảnh object-contain và có sizes. Giá, kho, số lượng, CTA chính/phụ phân cấp lại; điều khiển có tên. Bỏ cam kết bảo hành/đổi trả chưa xác minh. Lỗi kết nối có retry, khác trạng thái không tìm thấy. “Gợi ý mua thêm” dùng dữ liệu liên quan API; không chọn sẵn và không chọn hàng hết kho. `RelatedProducts` không còn render lặp dataset trên route này.
- `/`, `/subscription`, `/products/Subscriber`: dùng `components_box/ChoosePlan` → `PlanCard` → `ChoosePlanModal`. `/subscription` đi qua `CommerceCatalog`; route Subscriber nay dùng trực tiếp ChoosePlan thay vì giữ vòng fetch/render riêng.
- `/profile/my-subscriptions`: phần gói khác dùng `useOtherPlans` → `normalizeSubscriptionPlans` → cùng PlanCard/modal; thêm trạng thái lỗi/retry của gói gợi ý.
- `PlanComparison` là phần trình bày chung nằm trong hệ component đang hoạt động, được dùng bởi cả PlanCard và modal. Có tiêu đề “Tổng trả trước”, bình quân tháng và trạng thái chọn radio; không sinh kỳ hạn hay số tiền thiếu.
- `ChoosePlanModal`: giữ flow hai bước và payload hiện có; dùng `Dialog` dự án cho focus/Escape, trả focus về nút mở, label/input/error/autocomplete, loading/empty/error, và tóm tắt pending. Gallery vẫn có trên mobile, dùng bố cục gọn. CTA mới bị khóa khi yêu cầu cũ còn chờ, đúng chốt service vốn có.
- `/box`, `/gift`: route → `CommerceCatalog`; thẻ có ảnh thật/placeholder, tên, giá, kho, số lượng, chi tiết ưu đãi/tiện ích API, CTA và link cấu phần.
- `/products/box`, `/products/box?type=gift`: route cũ nay dùng cùng CommerceCatalog, giữ phân loại theo query và không thêm bộ lọc available vào request của route cũ; có phân trang thay vì tự tải toàn bộ trang dữ liệu.
- `/products/box/[id]`: dùng cùng ProductGallery, loại nút không có handler và claim “độc quyền/premium/7 ngày” chưa được chứng minh; giữ helper `boxSalePrice`, `boxOriginalPrice`, `toBoxCartItem` và phép tạm tính gift hiện có. Phân biệt lỗi fetch với empty/404.
- `/checkout`: chỉ sửa vùng trình bày pending, kích thước nút quay lại và đường liên hệ. Giữ mọi guard giao dịch.
- `src/app/commerce.css` được import từ root layout, nhưng selector đều có scope `.tm-commerce` hoặc lớp `tm-` chỉ dùng ở storefront. Không sửa shell merchant/admin.

Các file `src/components/product-details.tsx`, `product-gallery.tsx`, `gift-options.tsx`, `suggested-products.tsx` không nằm trong chuỗi import của các route đang sửa; không dùng chúng để tạo bản giao diện song song. Bản PlanCard legacy vẫn re-export canonical component. Retail Product/GiftOptions và Bulk_Discounts không được gắn vào chi tiết retail vì chưa có luồng/API được xác nhận cho các tùy chọn đó. Gift amenities chỉ hiển thị dữ liệu được cấu hình từ API, không tạo tùy chọn giả.

## Kiểm chứng code

- `npm run lint`: đạt sau khi sửa tên biến của module loader trong test mới theo quy tắc Next.js.
- `npm run test`: **96/96 đạt**, gồm toàn bộ 90 test cũ và 6 test mới dùng SSR component thật cho kỳ hạn/giá, checked radio, stock/pending, thumbnail semantics, cross-sell opt-in và rating có dữ liệu. Không có test chỉ soi CSS.
- `npm run build`: đạt, 62 trang. Build/test cần chạy ngoài sandbox để worker Node hoạt động.
- `git diff --check`: đạt.

Các kết quả trên chỉ chứng minh lint, test và build. SSR tests không chứng minh focus trap, cảm ứng, font render, contrast thực tế, không tràn ngang hoặc giống ảnh tham chiếu.

## Phần browser chưa nghiệm thu

Inventory CUA không có browser; lần mở iab trả `Browser is not available: iab`. Sau chỉ dẫn tiếp tục, thử Chrome một lần cũng trả `Browser is not available: chrome`. Không gọi lại iab, không khởi động server/overlay chỉ để critique, không có server cần dừng. Không có screenshot desktop/mobile hoặc kết quả overlay. Chưa nghiệm thu E2E, staging, thanh toán thật, thiết bị thật, screen reader, zoom hoặc reduced-motion trên browser.

### Khởi động local

FE tại repository này: cài dependency nếu máy chưa có, rồi chạy trong PowerShell:

```powershell
$env:API_URL = "http://localhost:3001/api"
$env:NEXT_PUBLIC_API_URL = "/api"
npm run dev -- --port 3000
```

BE dùng source `C:/Users/84862/Desktop/totmart/TotMartAPI`: mở terminal riêng tại thư mục BE, cấu hình MongoDB và các biến phiên/xác thực cho môi trường kiểm thử độc lập, dùng cổng 3001 tương ứng rồi `npm run dev`. Không trỏ thử nghiệm mất phản hồi vào dữ liệu khách hàng/shared deployment. Đợt này không thay `.env` hoặc khởi động BE cho người dùng.

### URL cần mở

- `http://localhost:3000/` — nhóm gói trên trang chủ.
- `http://localhost:3000/products` — lấy link sản phẩm thật.
- `http://localhost:3000/products/<slug>-<productId>` — gallery, mua hàng, mô tả và gợi ý; dùng link thật từ danh sách, không dùng nguyên placeholder.
- `http://localhost:3000/subscription` — so sánh gói và mở modal.
- `http://localhost:3000/products/Subscriber` — cùng bộ gói trên route hiện có.
- `http://localhost:3000/profile/my-subscriptions` — cần đăng nhập, kiểm tra gói gợi ý và modal.
- `http://localhost:3000/box` và `http://localhost:3000/gift` — catalog mới.
- `http://localhost:3000/products/box` và `http://localhost:3000/products/box?type=gift` — route danh sách cũ.
- `http://localhost:3000/products/box/<boxId>` — cấu phần/gallery, dùng link ID thật từ catalog combo và gift.
- `http://localhost:3000/checkout` — yêu cầu cũ chờ đối chiếu; cần phiên khách hàng và pending attempt của chính phiên đó.

### Dữ liệu thử cần có

Sản phẩm còn hàng có ít nhất ba ảnh, tên tiếng Việt dài và giảm giá do BE trả; một sản phẩm hết kho; một sản phẩm thiếu ảnh. Có các sản phẩm liên quan còn/hết hàng để thử opt-in. Combo và gift có ảnh, cấu phần và giá/tiện ích thật từ API. Một box có đủ template active 1/3/6/12 tháng; box khác thiếu kỳ hạn để xác nhận không sinh gói. Tài khoản khách có địa chỉ đã lưu, một địa chỉ thử khác và giỏ thử.

Pending checkout cần được tạo qua tình huống mất phản hồi trong BE/database kiểm thử độc lập hoặc fixture UI được ghi rõ là kiểm thử, không phải đơn thành công. Cần một attempt trong TTL và một attempt quá 24 giờ/legacy thiếu fingerprint. Không xóa hoặc sửa attempt của đơn thực để phục vụ QA. Không tạo đơn/thanh toán thật chỉ để chụp giao diện.

### Checklist một lượt desktop/mobile

1. Mở ở khoảng 1440px và 390px; thêm 320px hoặc zoom 200%. Kiểm tra tên dài, giá, thumbnail, bảng kỳ hạn và mã đối chiếu không làm trang tràn ngang. Ảnh không bị cắt mất sản phẩm.
2. Dùng Tab/Shift+Tab và Enter/Space trên thumbnail, số lượng và nút mua. Focus phải thấy rõ; giảm không dưới 1, tăng không vượt kho; hết hàng/đang gửi/thiếu giá không mua được. “Mua ngay” vẫn thanh toán chung giỏ hiện tại.
3. So sánh 1/3/6/12 tháng: tổng trả trước và bình quân nhất quán giữa card/modal. Kỳ hạn thiếu không xuất hiện thành gói mua được. Radio dùng phím mũi tên; không có best-seller, sao hay tiết kiệm tự bịa.
4. Mở modal bằng bàn phím: focus vào modal, Tab không lọt ra nền, Escape/đóng trả focus về nút mở. Thử địa chỉ lưu, nhập mới, lỗi từng trường, bàn phím điện thoại và scroll đến CTA. Khi đang gửi, không submit lặp.
5. Trên mobile, chạm/scroll thumbnail tự nhiên; thử chạm CTA, chọn radio và scroll modal. Bật reduced motion: vẫn nhận ra loading/trạng thái chọn nhờ chữ, viền và disabled; không cần chuyển động để hiểu.
6. Trong môi trường kiểm thử, thử loading, danh sách trống và lỗi mạng/retry của sản phẩm, gói, box/cấu phần. Lỗi tải không được biến thành khẳng định dữ liệu không tồn tại.
7. Với pending checkout, tải lại rồi đổi giỏ/địa chỉ: tóm tắt cũ và cảnh báo còn đúng; key/payload không đổi. Quá TTL/thiếu fingerprint: không gửi POST và không mở lần thử mới; có link liên hệ và mã đối chiếu. Modal subscription pending cũng không cho gửi gói mới.

Giới hạn BE từ báo cáo trước vẫn còn: cần tra cứu theo user/key/hash và kết luận cuối “không tạo đơn, được phép thử mới” được bảo vệ trước request cũ chạy/đến trễ; cần retention semantics và snapshot/version địa chỉ nếu muốn bảo đảm địa chỉ bất biến khi sửa chính ID cũ. FE không giả lập các kết luận này. Chưa nghiệm thu staging hoặc BE triển khai có cùng hợp đồng.
