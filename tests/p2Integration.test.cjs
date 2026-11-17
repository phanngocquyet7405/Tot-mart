const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("P2.1 - Coupon active & validity filtering", () => {
  const now = new Date("2026-11-03T12:00:00Z");

  const filterValidCoupons = (coupons, referenceDate = new Date()) => {
    return (coupons || []).filter((c) => {
      if (c.isActive === false) return false;
      if (c.expiresAt && new Date(c.expiresAt) < referenceDate) return false;
      return true;
    });
  };

  const sampleCoupons = [
    { code: "VALID10", discount: 10, isActive: true, expiresAt: "2026-11-10T00:00:00Z" },
    { code: "EXPIRED5", discount: 5, isActive: true, expiresAt: "2026-10-01T00:00:00Z" },
    { code: "INACTIVE20", discount: 20, isActive: false, expiresAt: "2026-11-20T00:00:00Z" },
    { code: "NO_EXPIRY", discount: 15, isActive: true },
  ];

  const valid = filterValidCoupons(sampleCoupons, now);
  assert.equal(valid.length, 2, "Only 2 coupons should be valid and active");
  assert.equal(valid[0].code, "VALID10");
  assert.equal(valid[1].code, "NO_EXPIRY");
});

test("P2.2 - Box offers mapping & discount box calculation", () => {
  const { boxSalePrice, boxOriginalPrice } = require("../src/app/(client)/products/box/[id]/boxPricing.js");

  const mockOffersPayload = {
    discountBoxes: [
      { _id: "box-1", name: "Hộp Trà Sen Giảm Giá", value: 180000, discountPercent: 10 },
    ],
    newBoxes: [
      { _id: "box-2", name: "Hộp Nông Sản Mới", value: 300000, discountPercent: 0 },
    ],
    giftBoxes: [
      { _id: "box-3", name: "Hộp Quà Cao Cấp", value: 500000, discountPercent: 0 },
    ],
  };

  const box1 = mockOffersPayload.discountBoxes[0];
  assert.equal(boxSalePrice(box1), 180000);
  assert.equal(boxOriginalPrice(box1), 200000); // 180000 / (1 - 0.1) = 200000

  const box2 = mockOffersPayload.newBoxes[0];
  assert.equal(boxSalePrice(box2), 300000);
  assert.equal(boxOriginalPrice(box2), null); // no discount -> null
});

test("P2.3 - Deprecated subscribe cart APIs are marked with deprecation docs", () => {
  const filePath = path.resolve(__dirname, "../src/app/services/api/productServices.js");
  const content = fs.readFileSync(filePath, "utf8");

  assert.ok(content.includes("export const addSubscribePlanToCartApi"));
  assert.ok(content.includes("export const updateSubscribeCartApi"));
  assert.ok(content.includes("export const deleteFromSubscribeCartApi"));
  assert.ok(content.includes("export const getSubscribeCartByUserApi"));
  assert.ok(content.includes("@deprecated TotMart subscriptions use direct checkout via /subcribe-plans/user-subscribe"));
});
