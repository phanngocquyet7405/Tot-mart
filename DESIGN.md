---
name: TotMart
description: Unified warm atelier commerce & workspace — warm cream canvas, deep terracotta actions, rich espresso typography, and olive/honey status accents.
colors:
  cream: "#FBF9F4"
  cream-card: "#FFFDF9"
  warm-beige: "#F7F4EE"
  beige-border: "#EAE4D9"
  espresso: "#2C1810"
  espresso-muted: "#6A5B52"
  terracotta: "#B14B2D"
  terracotta-hover: "#943D26"
  terracotta-wash: "#FFF0EB"
  olive-success: "#5A7D36"
  success-text: "#395221"
  honey-warning: "#C98A1C"
  warning-text: "#684814"
  destructive: "oklch(0.577 0.245 27.325)"
  destructive-text: "#8A2414"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1.1
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
---

# Design System: TotMart

## 1. Hệ Màu & Nguồn Sự Thật Duy Nhất (Single Source of Truth)

Mọi màu sắc trong TotMart được quản lý tập trung qua CSS variables trong `src/app/globals.css` và tiện ích thương mại `src/app/commerce.css`. Tuyệt đối không sử dụng mã màu cứng (`#hex`), màu xám lạnh (`gray-*`, `zinc-*`, `slate-*`), sắc hồng cũ, hay bảng màu mặc định (`stone-*`, `green-*`) trong JSX.

### 1.1 Bảng Màu Semantic (Tokens)

| Token CSS | Giá trị OKLCH / RGB ước tính | Mục đích sử dụng |
|---|---|---|
| `--background` | `oklch(0.985 0.012 75)` ≈ `#FBF9F4` | Nền chính: Trắng kem ấm, áp dụng cho toàn bộ body và layout canvas. |
| `--card` / `--popover` | `oklch(0.995 0.008 75)` ≈ `#FFFDF9` | Thẻ sản phẩm, hộp thoại modal, popover, dropdown (gần trắng ấm). |
| `--muted` / `--secondary` | `oklch(0.965 0.012 75)` ≈ `#F7F4EE` | Bề mặt phụ: be nhạt cho sidebar, badge trung tính, nền phụ (ảnh thẻ gói, gallery modal). |
| `--border` / `--input` | `oklch(0.92 0.012 75)` ≈ `#EAE4D9` | Đường viền mảnh: be nhạt ấm, phân tách bảng và input; không dùng xám lạnh. |
| `--foreground` | `oklch(0.22 0.035 45)` ≈ `#2C1810` | Chữ chính: Nâu espresso đậm, độ tương phản cao đạt chuẩn WCAG AAA trên nền kem. |
| `--muted-foreground` | `oklch(0.52 0.025 50)` ≈ `#6A5B52` | Chữ phụ, placeholder, nhãn phụ: Nâu xám ấm (WCAG AA). |
| `--primary` | `oklch(0.52 0.16 38)` ≈ `#B14B2D` | Nút chính & điểm nhấn thương hiệu: Terracotta đậm. Hover tối hơn 6–8% (`oklch(0.48 0.16 38)`). |
| `--primary-foreground` | `oklch(0.985 0.012 75)` ≈ `#FBF9F4` | Chữ trên nút chính: Trắng kem tương phản cao. |
| `--sidebar` | `oklch(0.975 0.012 75)` ≈ `#F8F5EF` | Nền sidebar workspace của Merchant và Admin. |
| `--sidebar-accent` | `oklch(0.955 0.018 75)` ≈ `#FFF0EB` | Mục active trên sidebar (terracotta wash). |
| `--sidebar-accent-foreground` | `oklch(0.52 0.16 38)` ≈ `#B14B2D` | Chữ / icon mục active trên sidebar. |
| `--success` | `oklch(0.58 0.11 135)` ≈ `#5A7D36` | Nền và viền trạng thái thành công: Xanh ô-liu tự nhiên. **Xanh lá KHÔNG làm màu thương hiệu hay nút.** |
| `--success-text` | `oklch(0.42 0.11 135)` ≈ `#395221` | Chữ trạng thái thành công: Xanh ô-liu đậm, đạt chuẩn WCAG AA/AAA trên nền kem và trên `success/15`. |
| `--warning` | `oklch(0.72 0.15 75)` ≈ `#C98A1C` | Nền và viền cảnh báo: Vàng mật ấm. |
| `--warning-text` | `oklch(0.44 0.12 65)` ≈ `#684814` | Chữ cảnh báo: Vàng nâu đậm, đảm bảo tương phản WCAG AA/AAA (≥ 4.5:1) trên cả nền kem và nền `warning/15`. |
| `--destructive` | `oklch(0.577 0.245 27.325)` | Nền và viền trạng thái nguy hiểm, hủy đơn, xóa sản phẩm: Đỏ đất nung đậm. |
| `--destructive-text` | `oklch(0.46 0.22 27.3)` ≈ `#8A2414` | Chữ trạng thái nguy hiểm: Đỏ đất nung đậm, đạt chuẩn WCAG AA trên cả nền kem và trên `destructive/15`. |
| `--ring` | `oklch(0.52 0.16 38)` ≈ `#B14B2D` | Vòng focus ring hỗ trợ trợ năng: Terracotta rõ nét trên nền kem. |

### 1.2 Kiểm Tra Tỉ Lệ Tương Phản (WCAG Contrast Ratios)

Mọi cặp màu văn bản và bề mặt nền đều được kiểm thử đạt chuẩn **WCAG 2.2 Level AA (tối thiểu 4.5:1 cho text thông thường)**:

| Cặp màu kiểm tra | Bề mặt nền | Token chữ áp dụng | Giá trị màu chữ | Tỉ lệ tương phản | Đánh giá WCAG |
|---|---|---|---|:---:|:---:|
| **Chữ chính / Nền kem** | `--background` (`#FBF9F4`) | `--foreground` | `oklch(0.22 0.035 45)` | **16.69 : 1** | Đạt **WCAG AAA** (vượt xa 7:1) |
| **Chữ phụ / Nền kem** | `--background` (`#FBF9F4`) | `--muted-foreground` | `oklch(0.52 0.025 50)` | **5.32 : 1** | Đạt **WCAG AA** (> 4.5:1) |
| **Chữ nút chính** | `--primary` (`oklch(0.52 0.16 38)`) | `--primary-foreground` | `oklch(0.985 0.012 75)` | **5.70 : 1** | Đạt **WCAG AA** (> 4.5:1) |
| **Chữ Success trên nền kem** | `--background` (`#FBF9F4`) | `--success-text` | `oklch(0.42 0.11 135)` | **7.73 : 1** | Đạt **WCAG AAA** (> 7:1) |
| **Chữ Success trên badge** | `bg-success/15` | `--success-text` | `oklch(0.42 0.11 135)` | **6.52 : 1** | Đạt **WCAG AA** (> 4.5:1) |
| **Chữ Warning trên nền kem** | `--background` (`#FBF9F4`) | `--warning-text` | `oklch(0.44 0.12 65)` | **7.66 : 1** | Đạt **WCAG AAA** (> 7:1) |
| **Chữ Warning trên badge** | `bg-warning/15` | `--warning-text` | `oklch(0.44 0.12 65)` | **6.75 : 1** | Đạt **WCAG AA** (> 4.5:1) |
| **Chữ Destructive trên nền kem** | `--background` (`#FBF9F4`) | `--destructive-text` | `oklch(0.46 0.22 27.3)` | **6.88 : 1** | Đạt **WCAG AA** (> 4.5:1) |
| **Chữ Destructive trên badge** | `bg-destructive/15` | `--destructive-text` | `oklch(0.46 0.22 27.3)` | **5.29 : 1** | Đạt **WCAG AA** (> 4.5:1) |

### 1.3 Bảng Chart Tokens
- `--chart-1`: `oklch(0.52 0.16 38)` (Terracotta)
- `--chart-2`: `oklch(0.78 0.08 75)` (Cát ấm)
- `--chart-3`: `oklch(0.58 0.11 135)` (Ô-liu)
- `--chart-4`: `oklch(0.72 0.15 75)` (Vàng mật)
- `--chart-5`: `oklch(0.38 0.06 45)` (Nâu đất espresso)

### 1.4 Dark Mode
Dark mode sử dụng tông nâu espresso ấm, loại bỏ hoàn toàn ánh xanh/xanh lạnh:
- Nền chính: `oklch(0.18 0.025 45)` (Nâu espresso sâu)
- Card & Popover: `oklch(0.22 0.025 45)`
- Đường kẻ: `oklch(0.32 0.02 45 / 35%)`
- Chữ chính: `oklch(0.97 0.012 75)` (Kem sáng)
- Chữ phụ: `oklch(0.70 0.02 50)` (Nâu be sáng)
- Điểm nhấn Primary: `oklch(0.65 0.16 38)` (Terracotta sáng cho độ tương phản)
- Chữ thành công: `--success-text: oklch(0.82 0.12 135)` (Tương phản 11.23:1 trên nền tối)
- Chữ cảnh báo: `--warning-text: oklch(0.85 0.14 75)` (Tương phản cao trên nền tối)
- Chữ nguy hiểm: `--destructive-text: oklch(0.82 0.16 27.3)` (Tương phản 9.08:1 trên nền tối)

---

## 2. Quy Tắc Thay Thế Màu Cứng (Token Mapping Proposal)

| Mã màu cứng hiện tại | Token thay thế chuẩn | Mục đích áp dụng |
|---|---|---|
| `bg-white`, `#fff`, `#ffffff` | `bg-card` hoặc `bg-background` | Nền thẻ sản phẩm, panel, modal, trang |
| `text-white` (trên nút/thẻ thông thường) | `text-primary-foreground` hoặc `text-card` | Chữ trên nền primary terracotta |
| `text-white` (trên banner/ảnh/overlay tối) | **Giữ nguyên `text-white`** | **Ngoại lệ:** Chữ màu trắng trên lớp phủ hình ảnh, banner video, hoặc nền tối có sẵn giữ nguyên `text-white`, không đổi sang token. |
| `border-gray-100`, `border-gray-200`, `border-stone-200`, `border-stone-100` | `border-border` | Đường kẻ mảnh, viền bảng, viền ô nhập liệu |
| `text-gray-900`, `text-slate-900`, `text-stone-900`, `#111827`, `#292524` | `text-foreground` | Tiêu đề, chữ chính (Espresso) |
| `text-gray-600`, `text-gray-500`, `text-stone-600`, `text-stone-500`, `text-slate-500` | `text-muted-foreground` | Mô tả, phụ đề, nhãn phụ, ngày tháng |
| `bg-gray-50`, `bg-gray-100`, `bg-stone-50`, `bg-stone-100`, `bg-slate-50` | `bg-muted` hoặc `bg-secondary` | Nền hàng xen kẽ trong bảng, nền ô tìm kiếm, chip |
| `bg-green-600`, `bg-green-700`, `bg-green-800`, `#15803d`, `#166534` (làm nút bấm) | `bg-primary hover:bg-primary/90 text-primary-foreground` | Nút mua hàng, nút CTA, nút chính |
| `text-green-600`, `text-green-700` (làm link/accent) | `text-primary` | Liên kết, điểm nhấn thương hiệu |
| `bg-green-50`, `bg-green-100`, `text-green-800` (trạng thái thành công) | `bg-success/15 text-success-text border-success/30` | **Badge thành công:** Đã giao hàng, Đã thanh toán (dùng `text-success-text` đạt chuẩn AA 6.52:1) |
| `bg-yellow-50`, `bg-amber-50`, `text-yellow-800`, `text-amber-700` | `bg-warning/15 text-warning-text border-warning/30` | **Badge cảnh báo:** Chờ duyệt, lưu ý đơn hàng, cảnh báo hết hàng (dùng `text-warning-text` đạt chuẩn AA 6.75:1) |
| `bg-red-50`, `text-red-700`, `bg-red-600` | `bg-destructive/15 text-destructive-text border-destructive/30` | **Badge nguy hiểm:** Lỗi đơn hàng, hủy gói, xóa dữ liệu (dùng `text-destructive-text` đạt chuẩn AA 5.29:1) |

---

## 3. Kế Hoạch Thay Thế & Quy Trình Kiểm Soát (Staged Rollout Plan)

Tuyệt đối **không thay thế hàng loạt** trên toàn repo để tránh lỗi gãy hiển thị hoặc mất kiểm soát hồi quy. Kế hoạch thay màu cứng phải chạy tuần tự theo từng thư mục/bước tương ứng:
1. **Bước 1**: Chuẩn hóa thư mục `src/components/workspace/*` và `src/components/ui/*`.
2. **Bước 2**: Chuẩn hóa thư mục `src/app/manager/*`.
3. **Bước 3**: Chuẩn hóa thư mục `src/app/(admin)/*`.
4. **Bước 4**: Chuẩn hóa Client Discovery (`products`, `brands`, `categories`, `box`, `gift`, `subscription`, `components_main`).
5. **Bước 5**: Chuẩn hóa Client Purchase (`cart`, `checkout`, `wishlist`).
6. **Bước 6**: Chuẩn hóa Client Account (`login`, `register`, `profile`).
7. **Bước 7**: Chuẩn hóa Client Content (`pages/*`, footer, header, layout).
8. **Mỗi bước bắt buộc có báo cáo diff chi tiết**, chạy kiểm tra lint, build và kiểm thử hành vi trước khi được xác nhận sang bước tiếp theo.

---

## 4. Nguyên Tắc Thiết Kế (Impeccable Principles)

### 4.1 Ngôn Ngữ Đồng Nhất
Storefront, Merchant Workspace (`/manager`) và Admin Workspace (`/(admin)`) chia sẻ chung một hệ thống token, bo góc (`rounded-lg`, `rounded-xl`), đổ bóng mềm (`shadow-sm`, `shadow-md`), nhịp khoảng cách (4px base grid), và kiểu chữ:
- **Plus Jakarta Sans**: Phông chữ chuẩn mực cho toàn bộ UI, bảng điều khiển, nhãn, nút bấm, và nội dung tiếng Việt.
- **Playfair Display**: Chỉ dùng riêng cho tiêu đề hiển thị biên tập (editorial display headings) ở Storefront (trang chủ hero, unboxing TotMartBox). Tuyệt đối không dùng cho UI controls hay workspace.

### 4.2 Phân Cấp Thị Giác Rõ Ràng (Visual Hierarchy)
- **Mỗi màn hình 1 hành động chính**: Nút chính nổi bật bằng terracotta đậm (`bg-primary`). Các hành động phụ dùng nút viền be (`variant="outline"`) hoặc nút mờ (`variant="ghost"`).
- **Định dạng số liệu**: Toàn bộ giá tiền VND, số lượng, ngày tháng, mã đơn hàng bắt buộc dùng `font-variant-numeric: tabular-nums` (`tabular-nums`) để hàng cột thẳng tắp, dễ quét mắt.

### 4.3 Đầy Đủ Trạng Thái (Zero Blind Spots)
Mọi màn hình và thành phần dữ liệu phải có đủ 5 trạng thái:
1. **Loading**: Hiển thị Skeleton đúng hình dạng nội dung, không xoay spinner che toàn trang.
2. **Empty**: Trạng thái rỗng có hình ảnh minh họa nhẹ, thông điệp rõ ràng và nút bấm dẫn dắt hành động kế tiếp.
3. **Error**: Hiển thị thông báo lỗi thân thiện kèm nút "Thử lại" (Retry). Lỗi 5xx hiển thị `requestId` an toàn.
4. **Disabled**: Trạng thái vô hiệu hóa rõ ràng (`opacity-50 pointer-events-none`).
5. **Success**: Phản hồi tức thì qua Toast hoặc Badge xác nhận.

### 4.4 Bảng Dữ Liệu Chuyên Nghiệp (Data Tables)
- Header cố định (`sticky top-0`) với nền `bg-muted` hoặc `bg-card`.
- Chiều cao hàng nhất quán, dễ quét, căn lề đúng chuẩn (chữ căn trái, số và tiền căn phải).
- Responsive: Trên màn hình hẹp (< 768px), bảng chuyển đổi tự nhiên sang dạng thẻ danh sách (card view), không cuộn ngang gãy layout.

### 4.5 Khả Năng Truy Cập & Trợ Năng (Accessibility - WCAG 2.2 AA)
- Mọi trường nhập liệu đều có `<Label>` liên kết ID chuẩn.
- Thứ tự tab tự nhiên, focus ring terracotta rõ nét (`outline-3 outline-primary`).
- Toàn bộ Dialog, Sheet, Dropdown menu có thuộc tính ARIA chuẩn mực từ Radix UI.
- Vùng chạm cảm ứng trên thiết bị di động tối thiểu 44 × 44px.

---

## 5. Chuyển Động & Tương Tác (Emil Kowalski Motion Principles)

Chuyển động trong TotMart nhằm tạo cảm giác chắc chắn, nhạy bén và sống động, không gây xao nhãng hay chậm trễ công việc của người dùng.

### 5.1 Quy Tắc Easing & Thời Lượng
- Đường cong chuyển động chuẩn: **Strong Ease-out** `cubic-bezier(0.23, 1, 0.32, 1)`. Bắt đầu nhanh, tiếp đất êm, mang lại phản hồi tức thì.
- Thời lượng: **150ms – 250ms**. Tuyệt đối không kéo dài quá 300ms.
- Thuộc tính được phép animate: **Chỉ animate `transform` và `opacity`** (chạy trên GPU compositor). Không bao giờ animate `width`, `height`, `margin`, `top`, hay `left`.

### 5.2 Chi Tiết Tương Tác
- **Nhấn nút (Button Press)**: Khi người dùng bấm nút, nút thu nhỏ nhẹ `scale(0.97)` trong 100ms rồi nhả về.
- **Dropdown / Popover**: Mở từ đúng điểm neo kích hoạt (`transform-origin: var(--radix-popover-content-transform-origin)`). Bắt đầu từ `scale(0.95)` và `opacity: 0` (tuyệt đối không xuất hiện từ `scale(0)`).
- **Dialog / Modal**: Fade in mượt mà kết hợp dịch nhẹ từ dưới lên 8–12px (`translateY(12px)` -> `0`).
- **Danh sách (List Entrance)**: Khi tải trang lần đầu, các thẻ danh sách xuất hiện so le nhẹ (stagger 30–40ms). Không chạy lại stagger khi người dùng lọc hay đổi trang.
- **Thao tác thường nhật**: Không animate các thao tác lặp lại hàng trăm lần mỗi ngày (chuyển tab, mở menu điều hướng, duyệt từng hàng bảng).

### 5.3 Trợ Năng Giảm Chuyển Động (prefers-reduced-motion)
Khi người dùng bật chế độ giảm chuyển động trong hệ điều hành:
- Tắt toàn bộ chuyển động marquee, bounce, fade, slide.
- Chuyển `transition` thành tức thời hoặc chỉ giữ thay đổi độ mờ tĩnh, đảm bảo trải nghiệm êm ái tuyệt đối.

---

## 6. Quy Chuẩn Thành Phần Dùng Chung (Workspace & UI Primitives)

Hệ thống thành phần dùng chung phục vụ Storefront, Merchant và Admin tại `src/components/ui/*` và `src/components/workspace/*`:

1. **Button**:
   - `default`: Nền terracotta `bg-primary`, chữ kem `text-primary-foreground`, hover 6-8% đậm hơn. Active `scale(0.97)`.
   - `outline`: Nền kem, viền be `border-border`, chữ espresso `text-foreground`, hover `bg-muted`.
   - `secondary`: Nền be nhạt `bg-secondary`, chữ espresso.
   - `ghost`: Chữ terracotta hoặc espresso, không viền, hover `bg-muted`.
   - `destructive`: Nền đỏ đất nhạt `bg-destructive/10`, chữ đỏ `text-destructive-text`.
2. **Badge**:
   - `default`: `bg-primary text-primary-foreground`
   - `secondary`: `bg-secondary text-secondary-foreground`
   - `outline`: `border-border text-foreground`
   - `success`: `bg-success/15 text-success-text border-success/30`
   - `warning`: `bg-warning/15 text-warning-text border-warning/30`
   - `destructive`: `bg-destructive/15 text-destructive-text border-destructive/30`
3. **Workspace Shell**:
   - Sidebar cố định 256px trên desktop, nền be nhạt `--sidebar`, đường kẻ be mảnh `--sidebar-border`.
   - Mục đang chọn (active nav item): Nền terracotta wash `bg-sidebar-accent`, chữ terracotta `text-sidebar-accent-foreground`.
   - Tablet (768px–1024px): Cho phép thu gọn icon-only hoặc hiển thị linh hoạt.
   - Mobile (< 768px): Sidebar biến thành Drawer/Sheet trượt từ bên trái với vùng chạm rộng rãi ≥ 44px.
