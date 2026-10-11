// Trang sản phẩm: không quảng cáo tính năng backend chưa hỗ trợ (giảm giá mua nhiều,
// gói quà), hiển thị giảm giá theo salePercent (đúng field của backend), và token
// đặt lại mật khẩu đi trong body thay vì URL.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const read = (rel) => fs.readFileSync(path.join(__dirname, rel), "utf8");
const exists = (rel) => fs.existsSync(path.join(__dirname, rel));
const PAGE = "../src/app/(client)/products/[slug]/page.js";
const COMP = "../src/app/(client)/components/Product/";

test("trang sản phẩm không gắn giảm giá mua nhiều và gói quà", () => {
  const page = read(PAGE);
  assert.doesNotMatch(page, /BulkDiscounts|Bulk_Discounts/);
  assert.doesNotMatch(page, /GiftOptions/);
});

test("không giữ bản trùng của trang sản phẩm", () => {
  assert.equal(exists("../src/app/(client)/products/[slug]/ProductDetailClient.jsx"), false);
});

test("hiển thị giảm giá theo salePercent, không dùng field discount không tồn tại", () => {
  assert.match(read(PAGE), /discountPercent=\{product\.salePercent \|\| 0\}/);
  assert.match(read(COMP + "ProductPurchasePanel.js"), /product\.salePercent/);
  assert.doesNotMatch(read(COMP + "ProductPurchasePanel.js"), /product\.discount\b/);
  const related = read(COMP + "RelatedProducts.js");
  assert.match(related, /p\.salePercent/);
  assert.doesNotMatch(related, /p\.discount\b/);
});

test("mật khẩu tối thiểu 8 ký tự ở đăng ký, đặt lại và tạo người dùng admin", () => {
  const register = read("../src/app/(client)/register/page.js");
  assert.match(register, /password\.length < 8/);
  assert.doesNotMatch(register, /password\.length < 6/);
  const recovery = read("../src/app/(client)/components/ui/auth/PasswordRecovery.jsx");
  assert.doesNotMatch(recovery, /minLength=\{6\}/);
  assert.equal((recovery.match(/minLength=\{8\}/g) || []).length, 2);
  const dialog = read("../src/app/(admin)/components/users/UserDialog.js");
  assert.match(dialog, /password\.length < 8/);
});

test("resetPasswordApi gửi token trong body, không đặt vào URL hay params", async () => {
  const calls = [];
  const strip = (rel) =>
    read(rel).replace(/^import[\s\S]*?;\r?\n/gm, "").replace(/^export /gm, "");
  const ctx = vm.createContext({
    process: { env: {} },
    axiosConfig: { post: async (...args) => { calls.push(args); return {}; } },
  });
  vm.runInContext(`${strip("../src/app/services/api/apiEndpoints.js")}\nthis.API_ENDPOINTS = API_ENDPOINTS;`, ctx);
  vm.runInContext(`${strip("../src/app/services/api/authService.js")}\nthis.resetPasswordApi = resetPasswordApi;`, ctx);
  await ctx.resetPasswordApi("a".repeat(40), "MatKhauMoi123");
  assert.equal(calls.length, 1);
  const [url, body, config] = JSON.parse(JSON.stringify(calls[0]));
  assert.equal(url, "/home/reset-password");
  assert.deepEqual(body, { token: "a".repeat(40), password: "MatKhauMoi123" });
  assert.equal(config, undefined);
});
