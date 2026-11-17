const test = require("node:test");
const assert = require("node:assert/strict");

test("P1.1 - Order cancellation eligibility & payload", () => {
  const eligibleStatuses = ["pending", "processing", "on_hold"];
  const ineligibleStatuses = ["shipped", "delivered", "cancelled", "returned"];

  const canCancelOrder = (status) => eligibleStatuses.includes(status);

  for (const s of eligibleStatuses) {
    assert.equal(canCancelOrder(s), true, `Status ${s} must be eligible for cancellation`);
  }
  for (const s of ineligibleStatuses) {
    assert.equal(canCancelOrder(s), false, `Status ${s} must NOT be eligible for cancellation`);
  }

  // Reason payload check
  const buildCancelPayload = (preset, custom) => {
    const reason = preset === "Lý do khác" ? custom?.trim() : preset;
    return { reason };
  };

  assert.deepEqual(buildCancelPayload("Muốn thay đổi địa chỉ nhận hàng"), {
    reason: "Muốn thay đổi địa chỉ nhận hàng",
  });
  assert.deepEqual(buildCancelPayload("Lý do khác", "Đổi ý muốn mua món khác"), {
    reason: "Đổi ý muốn mua món khác",
  });
});

test("P1.2 - Multi-merchant package grouping", () => {
  function groupCartItemsByMerchant(cartItems = []) {
    const groupMap = new Map();
    for (const item of cartItems) {
      let key = "totmart-standard";
      let title = "TotMart Tuyển Chọn";
      let badge = "Kho TotMart";

      if (item.itemType === "box" || item.boxId) {
        key = "totmart-box";
        title = "Hộp quà TotMart Tuyển Chọn";
        badge = "Đóng hộp đặc biệt";
      } else {
        const brandName =
          typeof item.brand === "object" && item.brand?.name
            ? item.brand.name
            : typeof item.brand === "string" && item.brand.trim()
            ? item.brand.trim()
            : item.brandName || null;

        const merchantId = item.merchantId || item.merchant || null;

        if (brandName) {
          key = `brand-${brandName}`;
          title = brandName;
          badge = "Đối tác chính hãng";
        } else if (merchantId) {
          key = `merchant-${merchantId}`;
          title = `Nhà cung ứng #${String(merchantId).slice(-6)}`;
          badge = "Giao trực tiếp";
        }
      }

      if (!groupMap.has(key)) {
        groupMap.set(key, { key, title, badge, items: [] });
      }
      groupMap.get(key).items.push(item);
    }
    return Array.from(groupMap.values());
  }

  const sampleItems = [
    { _id: "1", name: "Trà Oolong", brand: "Trà Cầu Đất", price: 150000 },
    { _id: "2", name: "Cà phê Robusta", brand: { name: "Cà phê Buôn Ma Thuột" }, price: 180000 },
    { _id: "3", name: "Hộp quà Tết Sum Vầy", itemType: "box", boxId: "box-123", price: 650000 },
    { _id: "4", name: "Trà Sen", brand: "Trà Cầu Đất", price: 200000 },
  ];

  const packages = groupCartItemsByMerchant(sampleItems);
  assert.equal(packages.length, 3, "Must split into 3 packages based on brands & box");

  const cauDatPkg = packages.find((p) => p.title === "Trà Cầu Đất");
  assert.ok(cauDatPkg);
  assert.equal(cauDatPkg.items.length, 2);

  const bmtPkg = packages.find((p) => p.title === "Cà phê Buôn Ma Thuột");
  assert.ok(bmtPkg);
  assert.equal(bmtPkg.items.length, 1);

  const boxPkg = packages.find((p) => p.key === "totmart-box");
  assert.ok(boxPkg);
  assert.equal(boxPkg.items.length, 1);
});

test("P1.3 - Box sale validity & countdown logic", () => {
  const evaluateBoxValidity = (box, now = new Date()) => {
    const validFrom = box?.validFrom ? new Date(box.validFrom) : null;
    const validTo = box?.validTo ? new Date(box.validTo) : null;

    const isNotYetOpen = Boolean(validFrom && now < validFrom);
    const isExpired = Boolean(validTo && now > validTo);
    const isSaleActive = !isNotYetOpen && !isExpired;

    const daysRemaining =
      validTo && isSaleActive
        ? Math.max(0, Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : null;

    const stock = box?.stock ?? 0;
    const canBuy = isSaleActive && stock > 0;

    return { isNotYetOpen, isExpired, isSaleActive, daysRemaining, canBuy };
  };

  const now = new Date("2026-11-03T12:00:00Z");

  // Case 1: Active box expiring in 5 days
  const activeBox = {
    validFrom: "2026-11-01T00:00:00Z",
    validTo: "2026-11-08T12:00:00Z",
    stock: 10,
  };
  const activeResult = evaluateBoxValidity(activeBox, now);
  assert.equal(activeResult.isSaleActive, true);
  assert.equal(activeResult.isExpired, false);
  assert.equal(activeResult.canBuy, true);
  assert.equal(activeResult.daysRemaining, 5);

  // Case 2: Expired box
  const expiredBox = {
    validFrom: "2026-10-01T00:00:00Z",
    validTo: "2026-11-01T00:00:00Z",
    stock: 5,
  };
  const expiredResult = evaluateBoxValidity(expiredBox, now);
  assert.equal(expiredResult.isSaleActive, false);
  assert.equal(expiredResult.isExpired, true);
  assert.equal(expiredResult.canBuy, false);

  // Case 3: Future box (not yet open)
  const futureBox = {
    validFrom: "2026-11-10T00:00:00Z",
    validTo: "2026-11-20T00:00:00Z",
    stock: 20,
  };
  const futureResult = evaluateBoxValidity(futureBox, now);
  assert.equal(futureResult.isSaleActive, false);
  assert.equal(futureResult.isNotYetOpen, true);
  assert.equal(futureResult.canBuy, false);
});
