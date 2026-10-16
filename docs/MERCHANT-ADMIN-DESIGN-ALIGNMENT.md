# Đề xuất đồng bộ thiết kế merchant và admin

Ngày khảo sát: 16/10/2026. Trạng thái cập nhật: **đã được duyệt và triển khai source cho cả hai khu vực**; xem [kết quả triển khai](MERCHANT-ADMIN-IMPLEMENTATION.md). Phần khảo sát/đề xuất bên dưới giữ hiện trạng tại thời điểm khảo sát, không mô tả source sau triển khai. Chưa nghiệm thu render.

## Kết luận và phương pháp

Merchant và admin đã cùng nền tảng thiết kế, nhưng chưa đủ nhất quán ở lớp nhận diện workspace. Token màu, font nội dung, icon và primitive giống nhau; logo, header, typography tiêu đề, mật độ menu và hành vi sidebar khác rõ trong source. Đề xuất lấy **khung admin hiện có làm chuẩn**, dùng chung phần trình bày, giữ riêng menu, quyền và nghiệp vụ. Không cần thêm thư viện.

Impeccable, chế độ **Operate**. Hai đánh giá độc lập: A `/root/design_compare` đọc thiết kế/source không xem detector; B `/root/design_evidence` chạy detector và kiểm chứng implementation. Tổng hợp sau khi hai đánh giá hoàn tất. Đây là so sánh định tính từ source; không đặt phần trăm tương đồng hay điểm pixel khi chưa có ảnh render.

Đã đọc [AGENTS.md](../AGENTS.md), [PRODUCT.md](../PRODUCT.md), [DESIGN.md](../DESIGN.md), [bàn giao merchant](MERCHANT-HANDOFF.md), [kế hoạch lịch sử](MERCHANT-DESIGN-PLAN.md), [báo cáo CI và audit](CI-MANAGER-VERIFICATION.md), cùng layout/component thực tế. Prototype đã xóa không được dùng làm bằng chứng hiện trạng. Các kết quả test trong báo cáo trước vẫn là bằng chứng lịch sử, không phải lần chạy mới.

Browser inventory lần này trả `apps: []`, `browsers: []`. Không mở được phiên browser để chụp cặp desktop/mobile; không có screenshot, overlay hoặc xác minh layout render. Các kích thước dưới đây suy từ class/CSS theo thang Tailwind mặc định, không phải phép đo trên browser. Chưa xác minh computed style, contrast, focus trap, touch hay breakpoint thực tế nếu runtime có tùy biến.

## 1. Component đang sử dụng thật

### Admin

- [src/app/layout.js](../src/app/layout.js): nạp font Playfair Display/Plus Jakarta Sans, globals, AppContext và các provider chung. Đây là tổ tiên của cả hai khu vực.
- [src/app/(admin)/layout.js](<../src/app/(admin)/layout.js>): export `withAdmin(AdminLayout)`; bên trong là `AdminNotificationProvider` → `SidebarProvider` (controlled `sidebarOpen`) → `AppSidebar` + `SidebarInset`. Trong inset có `AdminHeader` và main `page-canvas flex-1 overflow-auto p-6`.
- `app_sidebar.js` (file cũ, đã thay bằng [adminNavigation.mjs](<../src/app/(admin)/components/adminNavigation.mjs>) và shared shell): tại thời điểm khảo sát, `AppSidebar` chứa logo, cấu hình menu admin, Collapsible submenu và logout footer. Dùng primitives `SidebarHeader/Content/Footer/Menu/Button/Sub` từ UI sidebar. Không phải component thuần trình bày vì chứa route admin, AppContext/logout và đọc pathname.
- `admin_header.js` (file cũ, đã thay bằng [WorkspaceHeader.jsx](../src/components/workspace/WorkspaceHeader.jsx)): tại thời điểm khảo sát, `AdminHeader` dùng `useSidebar().toggleSidebar`, thanh tìm kiếm mở rộng, `NotificationBell`, avatar/account DropdownMenu và logout. Có AppContext/router, không phù hợp import nguyên vào merchant.
- [src/components/ui/sidebar.jsx](../src/components/ui/sidebar.jsx): provider, desktop offcanvas, mobile Sheet, scroll vùng menu và các trạng thái menu dùng token sidebar; dùng [use-mobile.js](../src/hooks/use-mobile.js).
- [components/shared/index.js](<../src/app/(admin)/components/shared/index.js>): export `AdminPageHeader`, `AdminLoadingState`, `AdminEmptyState`, `AdminStatsCard`. Thực tế dashboard/products/brands/orders dùng PageHeader và LoadingState; ProductTable, BrandTable, OrderTable dùng EmptyState. Không giả định mọi page admin đã dùng một pattern thống nhất, hay StatsCard chỉ vì được export là đã có consumer.

### Merchant

- [src/app/manager/layout.jsx](../src/app/manager/layout.jsx) → [components/ManagerLayout.jsx](../src/app/manager/components/ManagerLayout.jsx). Layout giữ loading gate AppContext, `withRole(ProtectedLayout, ['merchant'])`, DraftContext, hash URL cũ và xác nhận rời bản nháp; sau đó render `ManagerShell`.
- [components/ManagerShell.jsx](../src/app/manager/components/ManagerShell.jsx): tự dựng sidebar desktop, hàm `Navigation` dùng lại trong Sheet mobile, nhận diện, header tài khoản, logout với pending/error và main. Không dùng UI SidebarProvider hiện tại của admin.
- `/manager/page.jsx` → `OverviewWorkspace`; `/manager/products/page.jsx` → `ProductsWorkspace`; `/manager/combos`, `/manager/gifts`, `/manager/subscriptions` → `PackagesWorkspace` theo `kind`; `/manager/orders` → `OrdersWorkspace`. Đây là sáu route hiện hành.
- [components/WorkspaceUI.jsx](../src/app/manager/components/WorkspaceUI.jsx): `PageTitle`, `ErrorPanel`, `LoadingList`, `EmptyList`, `Pagination`, `FieldError`. ProductsWorkspace có heading và các pattern danh sách riêng, nên chỉ sửa PageTitle sẽ chưa đồng bộ hết sáu trang.
- [services/managerApi.js](../src/app/manager/services/managerApi.js), form và model merchant cung cấp dữ liệu/nghiệp vụ. Không thuộc phần shell được đề xuất tách.

Guard hai vai trò nằm ở [roleMiddleware.js](../src/app/middleware/roleMiddleware.js). Dùng chung shell không hợp nhất guard; ẩn menu không thay thế kiểm tra quyền/ownership tại BE.

## 2. Đối chiếu hiện trạng

### Sidebar, logo và mật độ

- **Chiều rộng:** admin desktop `16rem` (thường 256px), mobile `18rem` (288px); merchant desktop `w-64` (256px), mobile `min(90vw,320px)`. Sidebar desktop admin bắt đầu ở `md`/768px, merchant ở `lg`/1024px. Hai khu vực giống chiều rộng desktop nhưng khác trải nghiệm tablet 768–1023px.
- **Cố định/cuộn:** admin dùng fixed sidebar và layout gap; SidebarContent có `min-h-0 flex-1 overflow-auto`, logo/footer ngoài vùng cuộn. Merchant dùng sticky `h-dvh` với padding 20px, không có vùng menu cuộn riêng; Sheet mobile cũng chưa khai báo vùng cuộn riêng. Khi viewport thấp hoặc text zoom lớn, khả năng chạm tới mục cuối cần kiểm tra.
- **Nhận diện:** admin có ô icon Box 40×40px, icon 24px, wordmark sans `TotBoxAdmin` 18px bold và nhãn `Management` 10px uppercase; header vùng logo padding 16px, separator. Merchant dùng chữ `TotMart` serif 24px và nhãn `Quản lý cửa hàng` 14px; không có emblem, khoảng cách sau logo 36px.
- **Menu:** cả hai dùng chữ 14px, icon Lucide 16px. Admin có khoảng 10 mục cấp đầu, nhóm CRUD mở rộng; item mặc định 32px, `rounded-md`, padding 8px, submenu thụt vào. Merchant có sáu mục phẳng, ít nhất 44px, `rounded-xl`, gap 12px, padding ngang 12px, không submenu. Sáu mục phẳng là phù hợp nghiệp vụ, không cần sao chép nhóm CRUD admin.

### Màu, chữ, trạng thái

- Cùng [globals.css](../src/app/globals.css): primary sáng `oklch(0.205 0 0)`, foreground `oklch(0.145 0 0)`, radius gốc 10px; body font sans Plus Jakarta Sans. Có cả token dark, nhưng chưa kiểm tra theme runtime.
- Admin sidebar dùng `bg-sidebar` gần trung tính (`oklch(0.985 0 0)`); merchant dùng `bg-card` ấm hơn (`oklch(0.995 0.008 75)`). Background chung ấm (`oklch(0.985 0.012 75)`); admin main thêm `page-canvas` pha 78% background với transparent, merchant phủ background riêng. Không nên mô tả hai vùng đều trắng tuyệt đối; computed layering cần browser.
- Admin active dùng `sidebar-accent` nhẹ, font-medium; hover/focus cũng từ token sidebar. Merchant active nền primary đậm/chữ primary-foreground, hover muted và focus ring riêng. Sự khác biệt active là nguồn lệch nhận diện lớn dù dùng cùng palette.
- Admin PageHeader là sans 24px bold; merchant PageTitle và heading sản phẩm chỉ định serif 30px, lên 36px ở `sm`. Đây là điểm nên đồng bộ về sans; DESIGN.md quy định sans cho UI chrome. Không thay font storefront hoặc bỏ font serif toàn ứng dụng.
- Admin PageHeader icon dùng indigo hard-code; LoadingState cũng dùng indigo. Đây là drift so với hướng ink/neutral trong DESIGN.md, không phải chuẩn cần đưa sang merchant.

### Header, tài khoản và content

- Admin header sticky top, cao 64px, padding ngang 16px, icon toggle/search 20px; trigger thường 36px. Merchant header không sticky, min-height 80px, padding 16px/32px; có nút menu mobile 44px, account text và logout 44px nhìn thấy trực tiếp.
- Admin account có avatar 32px, tên/email từ user, text ẩn dưới `md`; dùng ảnh placeholder và fallback tên `Admin`. Merchant ưu tiên `fullName/name/username/email`, truncate tên, không avatar. Merchant có pending/error logout; admin gọi logout trực tiếp ở cả header và sidebar, không có phản hồi lỗi tại hai component đó.
- Admin có NotificationBell và thanh search mở rộng; search hiện chỉ mở input, không có xử lý query/results trong component này. Merchant có tìm kiếm sản phẩm hoạt động tại trang danh sách. Không đưa search giả hoặc notification admin vào merchant để làm giống hình thức.
- Admin main padding 24px, không có max-width tại layout; merchant 16px/32px, max-width 1440px. Dữ liệu bảng admin có thể cần rộng hơn; khác biệt max-width có thể giữ qua prop cấu hình.

### Mobile, bàn phím và accessibility

- Cả hai dùng [Sheet](../src/components/ui/sheet.jsx) trên Radix Dialog; đây là nền tảng focus/dismiss dùng chung, không phải chứng nhận hành vi thực tế đã qua.
- Merchant có tên Sheet tiếng Việt, nút Đóng menu, đóng sau điều hướng thành công, `aria-current="page"`, focus ring và skip link tới main có `tabIndex=-1`. Các hành vi này cần được giữ khi đổi shell.
- Admin có nút toggle được đặt tên và phím Ctrl/Cmd+B. Tuy nhiên shortcut trong provider chưa loại trừ input/textarea/contenteditable; không đưa hành vi chiếm phím lúc nhập liệu sang shell mới.
- Admin mobile ẩn nút close mặc định qua `[&>button]:hidden`, không thêm nút đóng rõ trong AppSidebar; tiêu đề/description Sheet còn tiếng Anh. Link menu không chủ động đóng drawer sau chọn route. Escape/outside-click do primitive hỗ trợ cần kiểm chứng; không kết luận drawer bị kẹt chỉ từ source.
- Admin truyền `isActive`/data-active, thiếu aria-current. `pathname.startsWith` khiến cả Danh sách và Thêm mới có thể active ở `/admin-products/create`; nhóm mở mặc định chỉ Sản phẩm, không theo route hiện tại. Nên exact-match leaf, nhóm active theo descendant, tự mở nhóm chứa route.
- `SidebarInset` render `<main>`, admin layout lồng thêm `<main>`: landmark lồng nhau được xác nhận từ source. Admin cũng chưa có skip link ở layout này. Shell chung phải chỉ có **một main**, dùng wrapper div hoặc khả năng composition được triển khai rõ ràng; primitive hiện chưa có prop `asChild` cho SidebarInset, không giả định đã hỗ trợ.
- Menu admin 32px/trigger 36px kém thoải mái cho chạm hơn merchant 44px. Không tự coi 32px là vi phạm WCAG AA; đề xuất chuẩn 44px cho điều khiển shell để đồng nhất và dễ dùng.
- Search admin expanded rộng 256px trên mobile, cạnh toggle/bell/avatar: nguy cơ overflow, chưa đo. Input dựa vào placeholder, nút X thiếu tên riêng; không tái sử dụng phần này.

## 3. Phương án tái sử dụng được đề nghị

### Dùng trực tiếp

Giữ các primitive sẵn có: [Button](../src/components/ui/button.jsx), [Input](../src/components/ui/input.jsx), [Avatar](../src/components/ui/avatar.jsx), [DropdownMenu](../src/components/ui/dropdown-menu.jsx), [Sheet](../src/components/ui/sheet.jsx), [Separator](../src/components/ui/separator.jsx), Collapsible khi admin cần submenu. Chúng không tự gọi API admin. Merchant form/validation/loading/error/pagination tiếp tục dùng logic hiện hành.

UI sidebar là nền tái sử dụng về layout/state, **cần điều chỉnh trước khi áp dụng**, không import AppSidebar nguyên khối. Những thay đổi trong `src/components/ui/sidebar.jsx` có thể tác động admin: semantics inset, mobile close/title, shortcut và state persistence. Cần props tương thích ngược; không sửa toàn bộ defaults hoặc globals chỉ để đổi merchant.

### Tách lớp trình bày vừa đủ

Đề xuất thư mục `src/components/workspace/`, chưa tạo source trong bước này:

- **WorkspaceShell.jsx:** ghép sidebar/header/content; nhận `brand`, `navigation`, `currentPath`, `onNavigate`, `account`, `onLogout`, `logoutPending`, `logoutError`, `headerActions`, `contentClassName`. Không import AppContext, admin provider, API hay guard. Có main ID/skip link, breakpoint và vùng cuộn thống nhất.
- **SidebarNavigation.jsx:** render items cấu hình `{id,label,href,icon,match,children?}`. Merchant truyền đúng sáu leaf; admin có thể truyền nhóm. Có aria-current, focus ring, state active/expanded, close mobile chỉ sau điều hướng được chấp nhận. Chặn điều hướng bản nháp phải giữ nguyên menu đang mở. Tôn trọng Ctrl/Cmd-click và hành vi anchor.
- **WorkspaceHeader.jsx:** nhận action slots và account presentation; dùng toggle state của shell, tên tiếng Việt/aria-expanded/aria-controls theo panel. Không chứa query, notification subscription hay routing theo role.
- **AccountMenu.jsx:** avatar/fallback/tên/vai trò và logout pending/error từ props; không tự lấy dữ liệu hoặc gọi endpoint. Trong giai đoạn đầu chỉ có đăng xuất cho merchant để giữ sáu menu nghiệp vụ; không tự thêm Hồ sơ hay quyền mới. Giữ tên tài khoản nhìn thấy/truy cập được trên mobile.
- **WorkspaceBrand** có thể là hàm nội bộ shell trước, chưa cần một file riêng. **WorkspacePageHeader.jsx** chỉ tách khi chuyển heading sáu trang: slot title/description/actions, sans, wrap trên mobile. AdminPageHeader giữ wrapper tương thích khi admin tham gia sau.

ManagerLayout tiếp tục làm adapter dữ liệu/guard/draft, truyền props cho shell. AdminLayout và các component admin hiện hành tiếp tục làm adapter riêng. Không dựng một menu admin rồi lọc theo role để tạo merchant, không kéo admin imports vào bundle merchant. Việc chia sẻ chỉ nằm ở cấu trúc và phong cách trình bày.

### Chỉ lấy token/style hoặc giữ riêng

- `AdminPageHeader`: lấy bố cục heading/actions, sans và hierarchy; bỏ phụ thuộc tên admin, xử lý tên nút back và icon tone trước khi tách. Không mang indigo vào merchant.
- `AdminEmptyState/LoadingState`: tham khảo bố cục, chưa thay `ErrorPanel/LoadingList` merchant vì merchant đã có status/alert/retry rõ. Nếu chuẩn hóa sau, giữ semantics và reduced-motion, không chỉ đổi spinner.
- `AdminStatsCard`: chưa cần cho alignment shell; không thêm số liệu/dashboard mới hoặc chart giả.
- `AppSidebar`, `AdminHeader`, `NotificationBell`, `AdminNotificationProvider`, các hook/services admin: **không dùng trực tiếp cho merchant**. Logo block/account visual có thể tách nhưng route, subscription và hành vi đặc quyền ở lại adapter admin. RootLayout hiện đã bọc provider notification chung và admin bọc thêm; đề xuất không đổi cấu trúc provider trong đợt alignment và không thêm consumer admin vào manager.

## 4. Chuẩn thiết kế cụ thể xin duyệt

1. **Khung:** sidebar desktop 16rem, dùng token sidebar của admin; header sticky min-height 64px, các nút shell 44px; padding content 16px mobile, 24px desktop. Sidebar tắt/mở toàn bộ theo offcanvas như admin, không thêm chế độ rail icon 3rem chỉ vì primitive có constant đó. Merchant giữ max-width 1440px; admin giữ khả năng content rộng.
2. **Breakpoint:** thống nhất desktop từ 768px theo admin, Sheet dưới 768px; mobile width `min(90vw,18rem)`. Tablet 768/1024px phải được so sánh trước khi chốt rollout; nếu panel hẹp, cho phép đóng sidebar chứ không ép bảng merchant kéo ngang.
3. **Nhận diện:** lấy hình thức ô Box 40px/icon 24px + wordmark sans 18px của admin. Merchant dùng chữ `TotMart` và nhãn `Quản lý cửa hàng`. Admin giữ `TotBoxAdmin/Management` trong giai đoạn đầu để tránh đổi tên ngoài phạm vi; đổi admin sang `TotMart/Quản trị` là quyết định nhận diện riêng cần duyệt, không tự thực hiện.
4. **Menu:** chữ 14px/icon 16px, cùng padding/radius theo admin, nền active nhẹ sidebar-accent + font-medium + aria-current; giữ độ tương phản nhận biết, focus ring và target 44px. Có vùng menu cuộn riêng, logo/footer ổn định. Không cần submenu cho merchant.
5. **Heading:** sans 24px bold, description 14px; title/actions wrap ở mobile. Áp dụng cả PageTitle và heading riêng ProductsWorkspace. Không thay nội dung form, giá, CTA đang hoạt động hoặc tạo business flow mới.
6. **Account:** giữ phản hồi pending/error của merchant, bổ sung avatar fallback theo cùng pattern admin; menu/logout cần qua draft guard, không mất dữ liệu. Chưa đưa search/notification vào header merchant; admin có thể dùng slots riêng.

Menu merchant duy nhất, thứ tự và route cố định:

- Tổng quan → `/manager` (exact match).
- Sản phẩm → `/manager/products`.
- Combo → `/manager/combos`.
- Gift → `/manager/gifts`.
- Đăng ký hàng tháng → `/manager/subscriptions`.
- Đơn hàng → `/manager/orders`.

Những khác biệt phải giữ: admin có người dùng/thương hiệu/danh mục/vận hành và quyền rộng; merchant chỉ danh mục/gói sở hữu và đơn được cấp quyền xem. Merchant tạo/sửa qua CTA/Sheet, không cần menu CRUD con. Gift quote và prepaid/monthly, khả năng draft/409/retry, ownership và projection đơn không bị thay đổi để trông giống admin.

## 5. Ưu tiên, file ảnh hưởng và triển khai sau duyệt

**P1 — Bảo vệ thao tác trước khi dùng chung** (`$impeccable harden`): sửa contract navigation/logout để không bỏ draft hoặc mutation đang chạy; giữ cảnh báo khi đóng form. Khảo sát Back/Forward SPA theo audit hiện có, không coi beforeunload là đủ. Sửa active route/aria-current, mobile close và main landmark ở phần dùng chung. Không chuyển lỗi admin sang merchant.

**P1 — Đồng bộ shell trước** (`$impeccable adapt`, `$impeccable typeset`): thêm nhóm workspace presentation ở trên; chuyển `manager/components/ManagerShell.jsx` thành adapter mỏng. `ManagerLayout.jsx` chỉ điều chỉnh wiring cần thiết, giữ guard/hash/draft; `WorkspaceUI.jsx` và `ProductsWorkspace.jsx` đổi heading presentation. Các page/form/service/model không đổi nghiệp vụ. Không sửa globals/font storefront.

**P2 — Admin tham gia có kiểm soát:** chuyển phần presentation của `(admin)/components/app_sidebar.js`, `admin_header.js`, `(admin)/layout.js` sang cùng shell sau khi merchant ổn định. Giữ export/wrapper và nội dung menu admin để các route hiện tại không đổi. NotificationBell chỉ cắm qua slot admin. Chuẩn hóa AdminPageHeader ở lượt sau nếu cần; không refactor đồng loạt bảng/forms admin.

Phạm vi admin ở giai đoạn đầu: giao diện/route/provider vẫn giữ; nếu cần sửa primitive sidebar dùng chung thì admin vẫn bị ảnh hưởng và bắt buộc kiểm tra hồi quy tương ứng. Giai đoạn admin migration thay đổi shell tất cả route trong `(admin)`, vì vậy phải review riêng trước rollout. Cách này cho merchant giống chuẩn admin ngay mà không buộc hợp nhất logic hai vai trò một lượt.

**P2 — Sau khi có ảnh:** điều chỉnh spacing/radius/contrast theo phép đo, rồi `$impeccable polish`. Không mở rộng nghiệp vụ hoặc làm lại design system. Hướng ẩn menu không được xem là chứng minh bảo mật; phải kiểm tra guard FE và quyền BE riêng.

## 6. Hồi quy và tiêu chí nghiệm thu sau triển khai

- Trước sửa: chụp admin `/dashboard`, `/admin-products`, `/admin-products/create` và merchant `/manager`, `/manager/products` cùng viewport 1440×900, 390×844; thêm 320×740, 768px và 1024px để kiểm reflow/breakpoint. Hai role dùng session test riêng, cùng theme/zoom, tránh dữ liệu cá nhân trong ảnh. So sánh sidebar mở/đóng, menu mobile, account, title/actions và long names.
- Kiểm header/logo/menu có cùng tỷ lệ, surface, icon và active/focus style; merchant vẫn đúng sáu mục. Kiểm scroll ở màn hình thấp, 200% text zoom/400% reflow theo khả năng browser, không che CTA/nút logout.
- Tab/Shift+Tab, Enter/Space, Escape/outside-dismiss, focus về trigger, skip link, main landmark duy nhất, aria-current/expanded/controls; phím tắt không chiếm thao tác nhập. Touch target 44px, mobile bàn phím không che Lưu; không tuyên bố pass chỉ từ viewport emulation.
- Draft dirty: hủy/đồng ý điều hướng, menu không đóng khi hủy, logout/Back/Forward/reload, mutation đang chạy; lỗi logout giữ feedback. Không thử các thao tác ghi trên Render.
- Admin: active chính xác list/create/update, tự mở nhóm hiện tại, sidebar toggle/mobile close và account/notification không đổi quyền; search chưa có nghiệp vụ không được quảng cáo là đã hoạt động. Smoke các route dashboard/products/brands/categories/box/plans/registered/orders/users/operations bằng test session thích hợp.
- Merchant: giữ loading/empty/error/retry, form không mất khi 409/save fail, lưu thành công nhưng refresh fail báo riêng. Trên BE/DB test được xác nhận mới kiểm giá gift 555.000, prepaid 270.000/bình quân 90.000, stock/version; không thay payload/API bằng admin endpoints.
- Quyền: chưa đăng nhập, admin, merchant A/B, khách; route trực tiếp/cross-role vẫn bị chặn đúng, merchant không phát request API admin từ shell mới. Network mock/test không chứng nhận quyền BE thật; BE kiểm riêng trên DB test.
- Khi có code: lint toàn repo, `npm test`, webpack production build theo cấu hình đã ghi trong [báo cáo CI](CI-MANAGER-VERIFICATION.md), không dùng `CI=true` để né validation local. Bổ sung test hành vi navigation/active/draft có giá trị, không snapshot class thuần túy. Chỉ nói GitHub Actions xanh khi run đúng commit thành công.

## 7. Bằng chứng detector và giới hạn

Assessment B chạy `impeccable.cmd detect --json` cho `src/app/manager`, `src/app/(admin)/components`, `src/components/ui/sidebar.jsx`: **26 advisory `design-system-font-size`**, 21 lần 11px và 5 lần 9px, đều trong admin; manager và shared sidebar không có findings. Đã kiểm literal class khớp ở từng vị trí, không có false positive được xác nhận. Đây là cảnh báo lệch thang chữ, không tự động là lỗi WCAG.

Các vị trí trong `src/app/(admin)/components/`:

- `SubscribePlans/PlanTemplate/PlanFormDialog.jsx`: 63, 167, 383.
- `SubscribePlans/Subscribe/SubscriberDetailDialog.js`: 27, 48, 85, 192, 198, 201.
- `SubscribePlans/Subscribe/SubscriberTable.js`: 94, 103, 137, 162; `Subscriberstatusbadge.js`: 12.
- `box/BoxFormDialog.jsx`: 710; `box/createbox/ProductList.jsx`: 256.
- `notifications/NotificationBell.jsx`: 89, 130, 157.
- `orders/OrderDetailDialog.jsx`: 28; `orders/OrderStatusBadge.jsx`: 13.
- `users/UserDialog.js`: 81, 92, 103, 116, 127.

Không mở rộng lượt alignment để sửa hết các advisory trong forms/bảng admin. Các vấn đề source đáng ưu tiên hơn là draft/logout, route active, landmark, mobile close, scroll và error semantics. Không có finding ở sidebar không có nghĩa các vấn đề này đã được detector kiểm hết.

Điểm mạnh cần giữ: nền tảng primitive chung, menu merchant gọn theo công việc, account thật, quyền riêng, trạng thái lỗi/tải lại rõ và xác nhận lưu từ BE. Với người thao tác thường xuyên, ưu tiên active/collapse ổn định; với người dùng bàn phím/screen reader, giữ skip link/aria-current/focus; với merchant dùng điện thoại, giữ menu đóng được và target đủ lớn.

Lượt này chỉ thêm báo cáo và liên kết mục lục; không sửa source UI, guard, API, test, workflow, cấu hình production hoặc bằng chứng CI. Không chạy lại test/build cho thay đổi tài liệu. Không có server tạm/overlay/browser tab cần dọn. Chưa có ảnh render, chưa nghiệm thu WCAG hay luồng browser, chưa có run Actions mới.

**Phương án đã duyệt:** shell chung theo nhận diện admin, giữ riêng menu/quyền/nghiệp vụ. Người dùng sau đó cho triển khai cả hai khu vực và kiểm tra hồi quy; source đã chuyển sang cùng shell. Kết quả, điều chỉnh provider cần thiết và giới hạn render được ghi trong [báo cáo triển khai](MERCHANT-ADMIN-IMPLEMENTATION.md).
