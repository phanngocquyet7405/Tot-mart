const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// Exercise the real service without Next's alias loader; only HTTP is mocked.
function loadService(raw) {
  const root = path.join(__dirname, "../src/app/(admin)");
  const parsers = fs.readFileSync(path.join(root, "utils/parseApiResponse.js"), "utf8");
  const service = fs.readFileSync(path.join(root, "admin-orders/services/ordersAdminService.js"), "utf8");
  const context = vm.createContext({
    orderService: {
      getAllOrders: async () => ({ success: true, data: [raw] }),
      getOrderById: async () => ({ success: true, data: raw }),
    },
  });
  vm.runInContext(
    (parsers + "\n" + service.replace(/^import .*;\r?\n/gm, "")).replace(/^export /gm, ""),
    context,
  );
  return context;
}

for (const [label, brand, expected] of [
  ["populated Brand", { _id: "brand-id", name: "  Test Brand  " }, "Test Brand"],
  ["deleted Brand", null, "—"],
  ["legacy missing Brand", undefined, "—"],
  ["unpopulated ID", "507f1f77bcf86cd799439011", "—"],
  ["blank name", { name: "  " }, "—"],
]) {
  test(`${label}: list and detail preserve Brand, prices, quantity and product ID`, async () => {
    const service = loadService({
      _id: "order-id",
      products: [{ productId: "product-id", name: "Item", brand, unitPrice: 250, quantity: 2 }],
    });
    const list = await service.fetchAdminOrders();
    const detail = await service.fetchAdminOrderById("order-id");
    for (const order of [list[0], detail]) {
      assert.equal(order.items[0].brandName, expected);
      assert.equal(order.items[0].productId, "product-id");
      assert.equal(order.items[0].price, 250);
      assert.equal(service.getOrderItemsCount(order), 2);
    }
  });
}
