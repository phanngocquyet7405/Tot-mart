// getAllProductsApi: không params → gom đủ mọi trang; có params → đúng một trang.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs
  .readFileSync(path.join(__dirname, "../src/app/services/api/productServices.js"), "utf8")
  .replace(/^import[\s\S]*?;\r?\n/gm, "")
  .replace(/^export /gm, "");
const plain = (v) => JSON.parse(JSON.stringify(v));

function setup(total) {
  const calls = [];
  const all = Array.from({ length: total }, (_, i) => ({ _id: "p" + i }));
  const ctx = vm.createContext({
    axiosConfig: {
      get: async (_url, { params }) => {
        calls.push(plain(params));
        const start = (params.page - 1) * params.limit;
        return {
          success: true,
          data: all.slice(start, start + params.limit),
          pagination: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
        };
      },
    },
    API_ENDPOINTS: { PRODUCTS: { GET_ALL: "/products/get-all-products" } },
  });
  vm.runInContext(source + "\nthis.api = { getAllProductsApi, getProductsPageApi };", ctx);
  return { api: ctx.api, calls };
}

test("250 products → 3 requests of 100, all products returned once", async () => {
  const { api, calls } = setup(250);
  const res = await api.getAllProductsApi();
  assert.equal(res.data.length, 250);
  assert.equal(new Set(res.data.map((p) => p._id)).size, 250);
  assert.equal(calls.length, 3);
});

test("few products → single request", async () => {
  const { api, calls } = setup(7);
  assert.equal((await api.getAllProductsApi()).data.length, 7);
  assert.equal(calls.length, 1);
});

test("concurrent callers share one load but own their arrays", async () => {
  const { api, calls } = setup(7);
  const [a, b] = await Promise.all([api.getAllProductsApi(), api.getAllProductsApi()]);
  assert.equal(calls.length, 1);
  a.data.pop();
  assert.equal(b.data.length, 7);
});

test("explicit params fetch exactly that page", async () => {
  const { api, calls } = setup(250);
  const res = await api.getAllProductsApi({ page: 2, limit: 20 });
  assert.equal(res.data.length, 20);
  assert.deepEqual(calls, [{ page: 2, limit: 20 }]);
});
