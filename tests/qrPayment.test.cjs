const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const source = fs
  .readFileSync(
    path.join(__dirname, "../src/app/services/api/qrPaymentService.js"),
    "utf8",
  )
  .replace(/^import .*;\r?\n/gm, "")
  .replace(/^export /gm, "");
function setup(env = {}) {
  let now = 0,
    sequence = 0;
  const timers = new Map();
  const context = vm.createContext({
    URLSearchParams,
    AbortController,
    process: { env },
    axiosConfig: {},
    Date: { now: () => now },
    setTimeout: (fn, ms) => {
      const id = ++sequence;
      timers.set(id, { fn, at: now + ms });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
  });
  vm.runInContext(source, context);
  const flush = async () => {
    for (let i = 0; i < 8; i++) await Promise.resolve();
  };
  return {
    context,
    timers,
    flush,
    advance: async (ms) => {
      now += ms;
      for (const [id, t] of [...timers])
        if (t.at <= now) {
          timers.delete(id);
          t.fn();
          await flush();
        }
    },
  };
}
test("VietQR encodes amount, code and account name; missing configuration fails", () => {
  const { context } = setup({
    NEXT_PUBLIC_VIETQR_BANK_ID: "970436",
    NEXT_PUBLIC_VIETQR_ACCOUNT_NO: "001234",
    NEXT_PUBLIC_VIETQR_ACCOUNT_NAME: "NGUYEN VAN A",
  });
  const url = new URL(
    context.buildVietQrUrl({ totalAmount: 130000, orderCode: "TMART&123" }),
  );
  assert.equal(url.pathname, "/image/970436-001234-compact2.jpg");
  assert.equal(url.searchParams.get("addInfo"), "TMART&123");
  assert.equal(url.searchParams.get("amount"), "130000");
  assert.equal(url.searchParams.get("accountName"), "NGUYEN VAN A");
  assert.throws(() =>
    setup().context.buildVietQrUrl({ totalAmount: 1, orderCode: "X" }),
  );
});
test("polls immediately then at 3 seconds, paid callback fires once and timers stop", async () => {
  const s = setup();
  let reads = 0,
    paid = 0;
  s.context.pollOrderPayment("id", {
    read: async () => ({ status: ++reads === 1 ? "pending" : "paid" }),
    onPaid: () => paid++,
    onError: assert.fail,
  });
  await s.flush();
  assert.equal(reads, 1);
  await s.advance(2999);
  assert.equal(reads, 1);
  await s.advance(1);
  assert.equal(reads, 2);
  assert.equal(paid, 1);
  assert.equal(s.timers.size, 0);
});
test("closing/unmount aborts an outstanding request and suppresses late paid callbacks", async () => {
  const s = setup();
  let resolve,
    signal,
    paid = 0;
  const stop = s.context.pollOrderPayment("id", {
    read: (_id, sig) => {
      signal = sig;
      return new Promise((r) => {
        resolve = r;
      });
    },
    onPaid: () => paid++,
    onError: assert.fail,
  });
  stop();
  assert.equal(signal.aborted, true);
  resolve({ status: "paid" });
  await s.flush();
  assert.equal(paid, 0);
  assert.equal(s.timers.size, 0);
});
for (const status of ["cancelled", "request-error"])
  test(`${status} stops polling and reports error`, async () => {
    const s = setup();
    let errors = 0;
    s.context.pollOrderPayment("id", {
      read: async () => {
        if (status === "request-error") throw new Error("offline");
        return { status };
      },
      onPaid: assert.fail,
      onError: () => errors++,
    });
    await s.flush();
    assert.equal(errors, 1);
    assert.equal(s.timers.size, 0);
  });
test("slow requests never overlap and deadline aborts a hanging request", async () => {
  const s = setup();
  let reads = 0,
    errors = 0,
    signal;
  s.context.pollOrderPayment("id", {
    read: (_id, sig) => {
      reads++;
      signal = sig;
      return new Promise(() => {});
    },
    onPaid: assert.fail,
    onError: () => errors++,
  });
  await s.advance(3000);
  assert.equal(reads, 1);
  await s.advance(600000);
  assert.equal(errors, 1);
  assert.equal(signal.aborted, true);
  assert.equal(s.timers.size, 0);
});
test("payment reader uses the unwrapped Axios body and authenticated customer endpoint", async () => {
  const s = setup();
  let url;
  s.context.axiosConfig.get = async (value) => {
    url = value;
    return {
      success: true,
      status: "paid",
      data: {
        status: "processing",
        checkout: { orderId: "id", orderCode: "TMART123", totalAmount: 1 },
      },
    };
  };
  assert.equal((await s.context.getPaymentOrder("id")).status, "paid");
  assert.equal(url, "/orders/id");
});
test("checkout success consumes the actual unwrapped response shape", async () => {
  const src = fs
    .readFileSync(
      path.join(__dirname, "../src/app/services/api/Checkoutpageservice.js"),
      "utf8",
    )
    .replace(/^import[\s\S]*?;\r?\n/gm, "")
    .replace(/^export /gm, "");
  const c = vm.createContext({
    userService: {},
    paymentGatewayService: {},
    getTokenUserId: () => null,
    logger: { error() {} },
    syncCartApi: async () => ({ success: true, skipped: [], data: {} }),
    checkoutService: {
      createOrder: async () => ({
        success: true,
        data: { orderId: "id", orderCode: "TMART123", totalAmount: 10 },
      }),
    },
  });
  vm.runInContext(src, c);
  const result = await c.placeOrder({
    addressId: "address",
    paymentMethod: "online",
    cartItems: [],
  });
  assert.equal(result.success, true);
  assert.equal(result.orderId, "id");
  assert.equal(result.orderCode, "TMART123");
  assert.equal(result.totalAmount, 10);
});
