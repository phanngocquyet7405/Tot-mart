# Triển khai shell dùng chung admin–merchant

Ngày: 16/10/2026. Theo [phương án đã duyệt](MERCHANT-ADMIN-DESIGN-ALIGNMENT.md). **Đã triển khai source và kiểm tra local; chưa nghiệm thu render/browser.**

## Kết quả

Admin và merchant cùng dùng `WorkspaceShell`, `SidebarNavigation`, `WorkspaceHeader`, `AccountMenu` và `WorkspacePageHeader` trong [src/components/workspace](../src/components/workspace). Sidebar rộng 256px, header sticky tối thiểu 64px, logo Box 40px/icon 24px + chữ sans 18px; menu chữ 14px/icon 16px, target tối thiểu 44px, nền active/hover và focus dùng cùng token sidebar. Tiêu đề dùng sans 24px bold; content padding 16px, lên 24px từ 768px.

Desktop có nút ẩn/hiện sidebar; dưới 768px là Sheet rộng `min(90vw,18rem)`, nút Đóng menu rõ ràng và vùng menu cuộn riêng. Điều hướng thành công đóng Sheet; hủy xác nhận bản nháp giữ menu. Ctrl/Cmd+B chỉ xử lý khi không nhập liệu và event chưa được xử lý. Không thêm icon rail hoặc cookie lưu trạng thái sidebar: mặc định mở trên mỗi lần mount, cùng hành vi cho hai role.

Giữ tên admin `TotBoxAdmin/Management`, merchant `TotMart/Quản lý cửa hàng` theo phương án đã duyệt; khác biệt là nhãn vai trò, không phải hệ thống hình thức khác. Admin có nhóm menu riêng và NotificationBell qua slot; merchant chỉ sáu mục phẳng. Cả hai có account fallback, tên tài khoản, logout trong account menu và footer sidebar. Không dùng avatar giả, không có search chưa có chức năng. Search sản phẩm thật tại trang merchant được giữ nguyên.

## Ranh giới và file thay đổi

- [WorkspaceShell.jsx](../src/components/workspace/WorkspaceShell.jsx): shell thuần props, brand nội bộ, desktop/sidebar Sheet, skip link và một main; không import AppContext, guard hoặc API.
- [SidebarNavigation.jsx](../src/components/workspace/SidebarNavigation.jsx): leaf/group dùng chung, aria-current, nhóm mở theo route. [navigation.mjs](../src/components/workspace/navigation.mjs) chọn một leaf cụ thể nhất theo ranh giới path segment, nên list/create không active đồng thời.
- [WorkspaceHeader.jsx](../src/components/workspace/WorkspaceHeader.jsx), [AccountMenu.jsx](../src/components/workspace/AccountMenu.jsx): presentation dùng chung, slot actions riêng, điều khiển có tên và expanded/controls. Logout pending/error từ adapter; lỗi hiển thị cả khi mobile Sheet đang mở. Main inert trong lúc logout để tránh sửa tiếp bản nháp giữa request.
- [useWorkspaceLogout.js](../src/components/workspace/useWorkspaceLogout.js): dùng chung pending/error và khóa synchronous để hai trigger không gửi logout đồng thời. False/rejection không được coi là thành công; lỗi cho phép thử lại. Hàm logout thật vẫn được cấp từ AppContext tại adapter từng role.
- [WorkspacePageHeader.jsx](../src/components/workspace/WorkspacePageHeader.jsx): heading/actions wrap chung. Merchant `WorkspaceUI.jsx` và heading riêng `ProductsWorkspace.jsx` sử dụng; admin `AdminPageHeader.js` giữ API component hiện tại, dùng pattern này và bỏ icon indigo hard-code/nút back thiếu tên.
- [ManagerShell.jsx](../src/app/manager/components/ManagerShell.jsx), [ManagerLayout.jsx](../src/app/manager/components/ManagerLayout.jsx): adapter merchant, giữ `withRole(...,['merchant'])`, loading/hash route/DraftContext và Toaster. [manager/lib/navigation.mjs](../src/app/manager/lib/navigation.mjs) chứa đúng Tổng quan, Sản phẩm, Combo, Gift, Đăng ký hàng tháng, Đơn hàng. Merchant không import cấu hình admin hoặc NotificationBell.
- [admin layout](<../src/app/(admin)/layout.js>) dùng cùng shell, giữ `withAdmin`, provider và slot NotificationBell riêng. [adminNavigation.mjs](<../src/app/(admin)/components/adminNavigation.mjs>) giữ toàn bộ menu/route admin cũ, gồm Hồ sơ; tài khoản merchant không có mục này. Hai file `app_sidebar.js` và `admin_header.js` cũ đã được xóa sau khi thay consumer duy nhất là admin layout, không để lại shell chết.
- [admin-operations/page.js](<../src/app/(admin)/admin-operations/page.js>) đổi wrapper main sang section và bỏ padding lặp để không lồng main trong main của shell; không sửa nghiệp vụ vận hành.
- [root layout](../src/app/layout.js): bỏ `AdminNotificationProvider` toàn ứng dụng. Đây là điều chỉnh so với giả định của đề xuất ban đầu: đọc implementation cho thấy provider tự polling `/admin/notifications` không kiểm tra role. Consumer duy nhất là NotificationBell trong admin; provider vẫn ở bên trong layout đã guard, tránh polling admin từ merchant/storefront và polling trùng trên admin. Không sửa API notification hoặc guard.
- `ProductsWorkspace.jsx` và `PackageEditor.jsx` truyền trạng thái dirty/busy khi lưu, reset busy sau kết quả; cảnh báo unload được tập trung tại ManagerLayout để không hỏi hai lần sau logout đã xác nhận. Xác nhận đóng/hủy editor còn nguyên. Payload, giá, stock, quote, ownership và các API không đổi.
- [DESIGN.md](../DESIGN.md), token sidecar và surface brief local được cập nhật cho pattern workspace. Không đổi globals hay thiết kế storefront, không thêm dependency, không đổi package/lockfile/workflow/next.config. Các sửa CI và việc di chuyển tài liệu trước đó được giữ nguyên.

## Kiểm chứng local mới

- `npm run lint`: **PASS**, toàn repository, 0 lỗi/0 warning. Không thêm eslint-disable hoặc tắt rule.
- `npm test`: **68/68 PASS**, không skip. 60 bài cũ giữ nguyên; thêm 8 bài kiểm navigation, boundary notification, static markup hai shell, active leaf, cancel/logout lock/failure/retry.
- `npm run build -- --webpack`: **PASS**, Next 16.4.0 từ lockfile, 58 trang, giữ route admin và đủ sáu route merchant. `API_URL=https://totmartapi-1.onrender.com/api`, CI unset. Không dùng worker/config shortcut. Build không phải kiểm chứng API persistence.
- `npm audit --omit=dev --audit-level=high`: **PASS**, 0 lỗ hổng production.
- Impeccable detector cho workspace, role shell/layout và AdminPageHeader: `[]`. Hook cũng không có finding trên các edit được quét; điều này không chứng nhận WCAG hay render.
- `git diff --check` và kiểm tra đích link tài liệu được chạy trước bàn giao. Các đường dẫn API/guard và bản sửa `apiConnection.test.cjs` được đối chiếu; không đổi so với đầu lượt này.

Test thực tế render JSX bằng preset Babel có sẵn của Next và `react-dom/server`, bao gồm các primitive Radix; không thay bằng markup fixture. Đây là **static render**, không phải browser test. Test chỉ kiểm được DOM/logic đã nêu, không kiểm được layout, chuyển focus, click/keyboard hoặc quyền BE thật. Không thêm thư viện test.

Môi trường local Windows, Node 24.14.1/npm 11.11.0, khác Actions Ubuntu/Node 22. Sandbox chặn tạo process test với `spawn EPERM`; các lần test/build thành công được chạy ngoài sandbox có cấp quyền. Một lỗi loader Babel và tên biến test bị lint từ chối trong quá trình phát triển đã được sửa; kết quả trên là lượt cuối cùng sau sửa, không phải kết quả tạm.

Dependency không đổi và đã được cài sạch ở lượt sửa CI trước; không chạy lại npm ci cho lượt này. Workflow vẫn dùng localhost cho bước build nhờ ngoại lệ `CI=true` sẵn có trên Actions, như [báo cáo CI trước](CI-MANAGER-VERIFICATION.md) mô tả. Lượt local này dùng HTTPS và CI unset để giữ production validation. Chưa có run GitHub Actions của đúng commit nên **không khẳng định CI xanh**.

## Review và giới hạn còn lại

Impeccable finish review độc lập đã kiểm source. Hai sửa yêu cầu trong review được xác nhận resolved: copy tiếng Việt bị lỗi encoding đã phục hồi và listener beforeunload trùng đã gom về layout. Kết luận visual: **recapture**, chưa có browser/captures để chấp nhận giao diện. Documenter cập nhật system theo source, không coi đó là bằng chứng render.

**SPA Back/Forward vẫn chưa được chặn bởi draft guard.** Guard hiện bao phủ link trong shell, xác nhận logout và document unload; không giả định beforeunload chạy khi đi lịch sử SPA. Không cài popstate/history workaround thiếu kiểm chứng. Cần kiểm và xử lý riêng trước khi nghiệm thu bảo vệ draft đầy đủ. Đây là giới hạn đã có từ audit trước, không được đánh dấu đã sửa chỉ vì shell đã dùng chung.

Các vấn đề ngoài shell trong audit trước (liên kết/focus lỗi field package, tối ưu thumbnail, nội dung dài ở bảng/form) chưa được coi là đã giải quyết. Không mở rộng lượt này sang refactor nghiệp vụ hoặc bảng admin đồng loạt.

## Checklist browser còn phải thực hiện

Browser inventory trả `apps: []`, `browsers: []`. Không có ảnh trước/sau, không tạo screenshot giả và không chạy browser thay thế qua script. Không có server/browser tạm cần dừng. Dùng tài khoản và DB test được xác nhận; không ghi dữ liệu lên Render.

- [ ] Chụp admin `/dashboard`, `/admin-products`, `/admin-products/create`, `/admin-subscribe-plan/registered` và merchant `/manager`, `/manager/products` cùng 1440×900 và 390×844; thêm 320×740, tablet 768/1024px. Lưu cặp ảnh theo role/route/viewport, cùng theme/zoom và đã che dữ liệu cá nhân.
- [ ] So sidebar 256px, logo, tiêu đề, header 64px, active/hover/focus, spacing; mở/đóng sidebar và Sheet. Desktop hẹp có thể đóng sidebar để nhường diện tích; test tên dài, menu cuối và cuộn khi viewport thấp.
- [ ] Active chỉ một leaf trên list/create/update/registered, nhóm chứa route mở đúng; merchant luôn chỉ sáu mục. Chọn menu mobile đóng; hủy xác nhận draft không đóng.
- [ ] Tab/Shift+Tab, Enter/Space, Escape, outside-click, focus về trigger, skip link/main, screen reader aria-current/expanded/controls; Ctrl/Cmd+B không chiếm input/textarea/select/contenteditable. Đo contrast, 44px target và reflow/text zoom thực tế.
- [ ] Account tên/email dài, menu/alert không tràn ở 320px; logout chậm/lỗi/thử lại, click hai trigger không tạo request trùng, lỗi trong Sheet đọc được. Xác nhận hủy draft, busy-save chặn logout và link; kiểm riêng Back/Forward SPA theo giới hạn bên trên.
- [ ] Đăng nhập từng role và route trực tiếp/cross-role: guard/BE vẫn chặn; merchant Network không có `/admin/notifications` hoặc API admin, admin vẫn nhận notification đúng scope. Không dùng việc ẩn menu để kết luận quyền BE an toàn.
- [ ] Smoke các màn hình admin products/brands/categories/box/plans/registered/orders/users/operations và đủ sáu màn hình merchant; không đổi loading/empty/error/retry. Trên DB test mới thử CRUD/409/stock/quote/prepaid và xác minh reload; không chạy ghi trên Render.

Không commit, push, deploy, sửa cloud variables hoặc gửi request ghi tới Render trong lượt này.
