# Bàn giao Vercel staging — 16/10/2026

## Các cấu hình đã biết và mức xác minh

- Người dùng xác nhận Preview chung có `API_URL` mẫu example.com; Preview riêng nhánh `staging` có `API_URL=https://totmartapi-1.onrender.com/api`. Chưa có connector/CLI Vercel được kết nối để đọc lại giá trị cloud; không trình bày đây là một cuộc kiểm tra dashboard độc lập.
- Người dùng xác nhận `CORS_ORIGINS` và `FRONTEND_URL` trên Render dùng origin `https://tot-mart-git-staging-furiousfast189-3255s-projects.vercel.app`.
- GET trực tiếp BE health với **đúng origin staging được cung cấp** trả 200 và `Access-Control-Allow-Origin` khớp toàn bộ URL trên, `Access-Control-Allow-Credentials: true`. Không giả mạo một origin khác để vượt kiểm tra.
- GET URL FE staging công khai trả 302 sang `vercel.com` (bảo vệ đăng nhập Vercel). Chưa đọc được ứng dụng/phản hồi proxy staging sau lớp bảo vệ đó; cần người có quyền Vercel tự đăng nhập, không tắt bảo vệ để kiểm thử.
- Production `API_URL` và `NEXT_PUBLIC_API_URL` chưa được xác minh. Không thay đổi hay triển khai Production. Không suy ra nhánh staging dùng DB test: Render này vẫn chỉ được agent kiểm tra GET công khai.

## Cấu hình chính xác cho deployment nhánh staging

Trong đúng Vercel Project của FE, **Environment = Preview, Git branch = staging**:

```dotenv
API_URL=https://totmartapi-1.onrender.com/api
NEXT_PUBLIC_API_URL=/api
```

Có thể bỏ `NEXT_PUBLIC_API_URL` vì browser base đã cố định `/api`; nếu giữ tương thích thì chỉ được đặt `/api`. Không đặt domain Render vào biến public. Không dùng URL gốc thiếu `/api`, không dùng `/api/api`, không để placeholder example.com. Source hiện báo lỗi build rõ cho các trường hợp này.

Các biến ảnh (nếu cần): `IMAGE_HOSTS=res.cloudinary.com,images.unsplash.com,qr.sepay.vn,img.vietqr.io`, theo mẫu repo. Không đưa JWT secret, DB URI, Cloudinary secret hoặc token Vercel/Render vào FE.

### Thứ tự ưu tiên

1. Vercel chọn môi trường deployment. Với Preview, biến **riêng nhánh staging ghi đè biến Preview chung cùng tên**. Biến Production là scope riêng, không phải fallback cho Preview. Nguồn: [Vercel Environment variables](https://vercel.com/docs/environment-variables).
2. Giá trị được Vercel cấp vào `process.env` đứng trước các file môi trường của Next.
3. Next tìm theo thứ tự: `process.env` → `.env.$NODE_ENV.local` → `.env.local` (bỏ qua khi test) → `.env.$NODE_ENV` → `.env`. Đã đối chiếu tài liệu shipped trong `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md`.
4. `.env.example` chỉ là mẫu, không tự được Next nạp. ZIP không chứa `.env` thật. Preview build vẫn dùng `NODE_ENV=production`; không đặt `NODE_ENV=staging`.
5. `API_URL` được Next dùng để tạo rewrite trong build; chỉnh biến cloud không sửa deployment đã build. Cần deployment/rebuild mới đúng branch/scope. `NEXT_PUBLIC_API_URL` không còn điều khiển Axios.

### Biến dư hoặc mâu thuẫn cần người dùng xử lý

- Preview chung example.com: đề xuất xóa placeholder hoặc thay bằng BE Preview hợp lệ cho từng nhánh có nhu cầu. Source sẽ chặn build nếu placeholder là giá trị hiệu lực. Không tự sửa scope này; branch staging vẫn phải có override riêng.
- Preview staging: giữ đúng API_URL nêu trên; xóa các bản ghi cùng tên sai scope/branch sau khi kiểm tra. Biến public có domain khác phải bỏ hoặc đổi về `/api` **trong scope staging**, không làm ảnh hưởng Production.
- Production: kiểm kê riêng giá trị hiện tại, domain FE Production, CORS và deployment cuối đang phục vụ. Không dùng thao tác chọn “all environments” để dọn biến, không promote staging lên Production trong đợt này.
- `FRONTEND_URL` Render là **origin FE** để tạo link, không phải API base. CORS_ORIGINS là danh sách origin phân cách dấu phẩy, không có path. Origin staging đã xác nhận; không thêm wildcard hay localhost. Source production hiện từ chối localhost/HTTP.

## Các bước triển khai do người dùng thực hiện

1. Ghi lại deployment staging đang tốt (deployment ID/URL/commit) và cấu hình Preview/staging hiện tại để rollback. Không sao chép secret vào log/chat.
2. Giải nén ZIP vào một thư mục mới; kiểm tra source/diff trước khi đưa vào nhánh `staging`. ZIP có cả các sửa chưa commit của phiên làm việc; không dùng nó để ghi đè một checkout đang có việc khác mà chưa so sánh.
3. Chạy `npm ci`, đặt API_URL/API browser theo trên trong terminal local, chạy `npm test`, lint phần thay đổi và `npm run build -- --webpack`. Các script tích hợp BE/fixture là local opt-in, không cần cho Vercel build.
4. Trong Vercel kiểm tra đúng Project, Framework Next.js, Root Directory chứa package.json, Production Branch không phải staging nếu đang muốn Preview. Giữ Install Command chuẩn `npm ci`; Build Command `npm run build -- --webpack`; Output Directory mặc định Next.js. Node 22 hoặc 24 theo package engines.
5. Kiểm tra hai biến **Preview + staging**; giữ CORS Render nguyên origin đã xác nhận. Không tự thay bất kỳ cấu hình Production nào.
6. Sau khi review source, người dùng tự commit/push nhánh staging hoặc redeploy deployment của nhánh staging với source đã đưa lên. Agent không commit/push/deploy. Không chọn Promote to Production. Deployment cũ không tự nhận ZIP hay source local.
7. Mở đúng branch alias `https://tot-mart-git-staging-furiousfast189-3255s-projects.vercel.app`, vượt lớp Vercel Authentication bằng quyền của chính bạn; không dùng origin URL deployment ngẫu nhiên chưa có trong allowlist.
8. GET `/api/home/health` phải ready qua FE. Tự đăng nhập merchant hiện hữu; xác minh cookie/profile/refresh theo `RENDER-CONNECTION.md`. Chỉ xem dữ liệu được phép trên Render; chưa nghiệm thu CRUD bằng deployment này.
9. CRUD/giá/tồn/hủy lỗi chỉ thử trên BE + DB test riêng đã được xác nhận. Kiểm tra desktop/mobile theo `MERCHANT-HANDOFF.md`.

## Rollback staging

- Nếu build mới lỗi, giữ deployment trước đang phục vụ; không sửa Production để cứu Preview.
- Trong đúng project/branch staging, đưa branch alias về deployment staging đã ghi ở bước 1 bằng cơ chế rollback/redeploy staging được project hỗ trợ. Kiểm tra environment/alias trước thao tác; tránh nút Promote to Production.
- Nếu cần rollback source, người dùng tạo commit revert các thay đổi đợt này trên nhánh staging rồi deploy lại, giữ nguyên việc của người khác. Không dùng reset/force push hoặc xóa dữ liệu BE.
- Khôi phục cấu hình **Preview/staging** đã ghi nếu cấu hình là nguyên nhân, sau đó rebuild/redeploy đúng nhánh. Chỉ chuyển alias về source cũ không tự đảo ngược biến cloud đã sửa.
- Kiểm tra lại health, origin và phiên trên alias staging. Không có migration/schema BE nào trong gói này, nên không có bước rollback dữ liệu BE.

## Chưa xác minh

Dashboard Vercel/Render, giá trị cloud hiện tại ở Production, SHA source của Render, phiên merchant browser trên staging, ảnh Cloudinary thật và việc triển khai ZIP. GET health/CORS không chứng nhận các mục đó.
