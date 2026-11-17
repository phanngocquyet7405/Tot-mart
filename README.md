Required: 

```bash
NextJS
Lucide-React
axios
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Tài liệu

Xem [mục lục tài liệu dự án](docs/README.md) để tìm báo cáo kiểm chứng, bàn giao merchant và hướng dẫn staging/Render. [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md) và `AGENTS.md` (tệp cấu hình cá nhân, không được đóng gói) được giữ tại gốc.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Commerce FE v2 — 17/10/2026

Cập nhật kiểm chứng ngày 19/10: [báo cáo sửa P1, hợp đồng BE, ma trận nghiệm thu và lệnh tái lập](docs/FE-CHECKOUT-ACCEPTANCE-2026-10-19.md). Các ghi chú phía dưới là lịch sử ngày 17, không thay thế báo cáo mới. Runner dùng Playwright dev dependency của repo; `test:e2e:ui` là UI smoke, `test:browser:services` là Chromium service/API, không gộp hai loại thành E2E.

Source này gồm impeccable-cleaned, order companion và các phần hardening đã tích hợp có kiểm tra. Không chép lại overlay OrdersWorkspace cũ vì thiếu orderModel.mjs và không khớp hook/API.

Route mới: /subscription, /box, /gift; admin Gift: /admin-gifts. Checkout lưu địa chỉ API chuẩn addresses, keyword tìm kiếm đi tới BE, yêu cầu thanh toán chưa rõ kết quả giữ nguyên key/payload khi thử lại. Ship khách trả trực tiếp bên giao hàng, ngoài tiền đơn TotMart. Gói tháng trả ship theo từng lần giao.

Chạy cùng backend bản Commerce v2, đối chiếu /api/commerce-policy. API_URL trong .env.example mặc định local; deployment phải cấu hình URL BE staging HTTPS ở phía server. Trình duyệt dùng /api. Không đóng gói .env thật.

Chưa nghiệm thu browser trên bản mới hoặc tài khoản staging có quyền. Nếu storage bị chặn và tab đóng/refresh sau lỗi mạng, kiểm tra lịch sử đơn trước khi tạo yêu cầu mới. Dữ liệu legacy phải đối chiếu ở BE bằng migration mặc định chỉ đọc.
