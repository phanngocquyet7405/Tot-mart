// Giá hộp quà và dòng giỏ hàng: khớp cách BE tính (Math.round(box.value)),
// và hộp luôn được gửi bằng boxId (không phải productId).
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function load(rel, names) {
  const source = fs
    .readFileSync(path.join(__dirname, rel), "utf8")
    .replace(/^import[\s\S]*?;\r?\n/gm, "")
    .replace(/^export /gm, "");
  const ctx = vm.createContext({});
  vm.runInContext(`${source}\nthis.__out = { ${names.join(", ")} };`, ctx);
  return ctx.__out;
}

const { boxSalePrice, boxOriginalPrice, toBoxCartItem } = load(
  "../src/app/(client)/products/box/[id]/boxPricing.js",
  ["boxSalePrice", "boxOriginalPrice", "toBoxCartItem"],
);
const { toCartPayload } = load("../src/app/services/api/Checkoutpageservice.js", [
  "toCartPayload",
]);
const plain = (v) => JSON.parse(JSON.stringify(v));

test("hộp 100.000đ giảm 10%: BE lưu value=90.000, FE hiển thị 90.000 (không phải 81.000)", () => {
  const box = { value: 90000, discountPercent: 10 };
  assert.equal(boxSalePrice(box), 90000);
  assert.equal(boxOriginalPrice(box), 100000);
});

test("hộp không giảm giá: không có giá gốc gạch ngang", () => {
  assert.equal(boxSalePrice({ value: 120000, discountPercent: 0 }), 120000);
  assert.equal(boxOriginalPrice({ value: 120000, discountPercent: 0 }), null);
  assert.equal(boxOriginalPrice({ value: 120000 }), null);
});

test("làm tròn giống BE (Math.round(box.value))", () => {
  assert.equal(boxSalePrice({ value: 89999.6 }), 90000);
  assert.equal(boxSalePrice({ value: 89999.4 }), 89999);
});

test("dữ liệu thiếu hoặc lỗi không gây NaN", () => {
  assert.equal(boxSalePrice(null), 0);
  assert.equal(boxSalePrice({}), 0);
  assert.equal(boxSalePrice({ value: "abc" }), 0);
  assert.equal(boxOriginalPrice(null), null);
  assert.equal(boxOriginalPrice({ value: 0, discountPercent: 10 }), null);
  assert.equal(boxOriginalPrice({ value: 90000, discountPercent: 100 }), null);
});

test("dòng giỏ hàng của hộp mang itemType box, giá bán và ảnh dự phòng", () => {
  const item = toBoxCartItem(
    { _id: "b1", name: "Hộp tháng 10", value: 90000, discountPercent: 10, images: [] },
    "/placeholder.png",
  );
  assert.deepEqual(plain(item), {
    _id: "b1",
    itemType: "box",
    name: "Hộp tháng 10",
    image: "/placeholder.png",
    price: 90000,
  });
  const withImage = toBoxCartItem(
    { _id: "b1", name: "x", value: 1, images: [{ url: "https://img/x.jpg" }] },
    "/placeholder.png",
  );
  assert.equal(withImage.image, "https://img/x.jpg");
});

test("giỏ hàng → payload đồng bộ: hộp đi bằng boxId, sản phẩm đi bằng productId", () => {
  const box = toBoxCartItem({ _id: "b1", name: "Hộp", value: 90000 }, "/p.png");
  const [boxLine] = plain(toCartPayload([{ ...box, quantity: 2 }]));
  assert.equal(boxLine.boxId, "b1");
  assert.equal(boxLine.productId, undefined);
  assert.equal(boxLine.quantity, 2);

  const [productLine] = plain(
    toCartPayload([{ _id: "p1", name: "SP", price: 50000, quantity: 1 }]),
  );
  assert.equal(productLine.productId, "p1");
  assert.equal(productLine.boxId, undefined);
});

test("hồi quy: thiếu itemType thì hộp bị gửi như sản phẩm (lỗi cũ)", () => {
  const [line] = plain(toCartPayload([{ _id: "b1", name: "Hộp", price: 90000, quantity: 1 }]));
  assert.equal(line.productId, "b1");
  assert.equal(line.boxId, undefined);
});

test("trang hộp đang chạy dùng helper và không tự trừ giảm giá lần hai", () => {
  const page = fs.readFileSync(
    path.join(__dirname, "../src/app/(client)/products/box/[id]/page.js"),
    "utf8",
  );
  assert.match(page, /toBoxCartItem\(/);
  assert.match(page, /boxSalePrice\(/);
  assert.doesNotMatch(page, /discountPercent\s*\)\s*\/\s*100/);
  assert.equal(
    fs.existsSync(path.join(__dirname, "../src/app/(client)/products/box/[id]/BoxDetailClient.jsx")),
    false,
    "không giữ bản trùng của trang hộp",
  );
});
