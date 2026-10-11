// Điều chỉnh tồn kho: gọi đúng endpoint PATCH với { delta, reason? }.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const strip = (rel) =>
  fs
    .readFileSync(path.join(__dirname, rel), "utf8")
    .replace(/^import[\s\S]*?;\r?\n/gm, "")
    .replace(/^export /gm, "");

function setup() {
  const calls = [];
  const ctx = vm.createContext({
    process: { env: {} },
    BASE_URL: "/api",
    axiosConfig: {
      patch: async (url, body) => {
        calls.push({ method: "patch", url, body: JSON.parse(JSON.stringify(body)) });
        return { data: { success: true, data: { _id: "x", stock: 7 } } };
      },
      get: async () => ({}),
      post: async () => ({}),
      put: async () => ({}),
      delete: async () => ({}),
    },
  });
  // endpoints
  vm.runInContext(`${strip("../src/app/services/api/apiEndpoints.js")}\nthis.API_ENDPOINTS = API_ENDPOINTS;`, ctx);
  // services (một file một context con để tránh trùng tên khai báo)
  const out = {};
  for (const [rel, name] of [
    ["../src/app/services/api/productServices.js", "adjustProductStockApi"],
    ["../src/app/services/api/boxService.js", "adjustBoxStockApi"],
  ]) {
    const sub = vm.createContext({ process: { env: {} }, axiosConfig: ctx.axiosConfig, API_ENDPOINTS: ctx.API_ENDPOINTS, BASE_URL: "/api" });
    vm.runInContext(`${strip(rel)}\nthis.fn = ${name};`, sub);
    out[name] = sub.fn;
  }
  return { calls, ctx, ...out };
}

test("endpoint điều chỉnh tồn kho của sản phẩm và hộp", () => {
  const { ctx } = setup();
  assert.equal(ctx.API_ENDPOINTS.PRODUCTS.ADJUST_STOCK("p1"), "/products/adjust-stock/p1");
  assert.equal(ctx.API_ENDPOINTS.BOXES.ADJUST_STOCK("b1"), "/boxes/adjust-stock/b1");
});

test("adjustProductStockApi dùng PATCH với delta và reason", async () => {
  const { calls, adjustProductStockApi } = setup();
  const res = await adjustProductStockApi("p1", { delta: -3, reason: "hàng hỏng" });
  assert.deepEqual(calls, [
    { method: "patch", url: "/products/adjust-stock/p1", body: { delta: -3, reason: "hàng hỏng" } },
  ]);
  assert.equal(res.data.data.stock, 7);
});

test("adjustBoxStockApi dùng PATCH và cho phép bỏ reason", async () => {
  const { calls, adjustBoxStockApi } = setup();
  await adjustBoxStockApi("b1", { delta: 10 });
  assert.deepEqual(calls, [
    { method: "patch", url: "/boxes/adjust-stock/b1", body: { delta: 10 } },
  ]);
});

test("form sửa sản phẩm/hộp không còn gửi stock", () => {
  const read = (rel) => fs.readFileSync(path.join(__dirname, rel), "utf8");
  const productPage = read("../src/app/(admin)/admin-products/update/page.js");
  const boxPage = read("../src/app/(admin)/admin-box/update/page.js");
  assert.match(productPage, /if \(key !== "stock"\)/);
  assert.doesNotMatch(boxPage, /formData\.append\("stock"/);
});
