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
        checkout: { orderId: "id", orderCode: "original", totalAmount: 1 },
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
  const {context:c}=require('./helpers/attemptHarness.cjs')({loseFirstCreate:false});
  await c.placeOrder({addressId:'address',paymentMethod:'online'});
  const result = await c.placeOrder({
    confirm: true,
    addressId: "address",
    paymentMethod: "online",
    cartItems: [],
  });
  assert.equal(result.success, true);
  assert.equal(result.orderId, "id");
  assert.equal(result.orderCode, "original");
  assert.equal(result.totalAmount, 12345);
});


test("readOrderStatus derives paid, cancelled, on_hold, underpaid and payable flags without client clock drift", () => {
  const { context: c } = require("./helpers/attemptHarness.cjs")();

  // Paid
  const paid = c.readOrderStatus({ data: { paymentStatus: "paid", totalAmount: 100000, payable: true } });
  assert.equal(paid.status, "paid");
  assert.equal(paid.payable, false);
  assert.equal(paid.remainingAmount, 0);

  // Cancelled via paymentStatus
  const cancelled1 = c.readOrderStatus({ data: { paymentStatus: "cancelled", totalAmount: 100000, payable: true } });
  assert.equal(cancelled1.status, "cancelled");
  assert.equal(cancelled1.cancelled, true);
  assert.equal(cancelled1.payable, false);

  // Cancelled via order status
  const cancelled2 = c.readOrderStatus({ data: { paymentStatus: "pending", totalAmount: 100000, payable: true, orders: [{ status: "cancelled" }] } });
  assert.equal(cancelled2.status, "cancelled");
  assert.equal(cancelled2.cancelled, true);
  assert.equal(cancelled2.payable, false);

  // Clock drift: BE says pending + payable=true, client clock should NOT force expired
  const past = new Date(Date.now() - 60000).toISOString();
  const clientClockDrift = c.readOrderStatus({ data: { paymentStatus: "pending", totalAmount: 100000, payable: true, expiresAt: past } });
  assert.equal(clientClockDrift.status, "pending");
  assert.equal(clientClockDrift.payable, true);
  assert.equal(clientClockDrift.cancelled, false);

  // On-hold: in BE reality, on_hold occurs after payment is settled (paymentStatus === 'paid')
  const onHold = c.readOrderStatus({
    data: {
      paymentStatus: "paid",
      totalAmount: 100000,
      payable: false,
      orders: [{ orderId: "ORD-HOLD", status: "on_hold", paymentStatus: "paid" }],
    },
  });
  assert.equal(onHold.status, "on_hold");
  assert.equal(onHold.onHold, true);
  assert.equal(onHold.payable, false);

  // Underpaid (partially paid, still active)
  const future = new Date(Date.now() + 600000).toISOString();
  const underpaid = c.readOrderStatus({ data: { paymentStatus: "pending", totalAmount: 100000, receivedAmount: 40000, payable: true, expiresAt: future, qrUrl: "https://qr" } });
  assert.equal(underpaid.status, "underpaid");
  assert.equal(underpaid.underpaid, true);
  assert.equal(underpaid.remainingAmount, 60000);
  assert.equal(underpaid.payable, true);
  assert.equal(underpaid.qrUrl, "https://qr");

  // Normal pending
  const pending = c.readOrderStatus({ data: { paymentStatus: "pending", totalAmount: 100000, payable: true, expiresAt: future, qrUrl: "https://qr" } });
  assert.equal(pending.status, "pending");
  assert.equal(pending.payable, true);
});

for (const terminalStatus of ["paid", "cancelled", "on_hold"]) {
  test(`pollPaymentStatus stops immediately when status is ${terminalStatus}`, async () => {
    const { context: c } = require("./helpers/attemptHarness.cjs")();
    let pollCalls = 0;
    const history = [];

    const mockResponse = {
      paid: { data: { paymentStatus: "paid" } },
      cancelled: { data: { paymentStatus: "cancelled" } },
      on_hold: { data: { paymentStatus: "paid", orders: [{ status: "on_hold", paymentStatus: "paid" }] } },
    }[terminalStatus];

    c.paymentGatewayService = {
      getOrderStatus: async () => {
        pollCalls++;
        return mockResponse;
      },
    };

    const stop = c.pollPaymentStatus("CODE123", {
      intervalMs: 20,
      timeoutMs: 500,
      onStatusChange: (info) => history.push(info),
    });

    await new Promise((r) => setTimeout(r, 80));
    stop();

    assert.equal(pollCalls, 1, `Polling must stop after 1 call on ${terminalStatus}`);
    assert.equal(history.length, 1);
    assert.equal(history[0].status, terminalStatus);
  });
}

test("pollPaymentStatus continues polling on underpaid and pending until stopped", async () => {
  const { context: c } = require("./helpers/attemptHarness.cjs")();
  let pollCalls = 0;
  const history = [];

  const future = new Date(Date.now() + 600000).toISOString();
  c.paymentGatewayService = {
    getOrderStatus: async () => {
      pollCalls++;
      if (pollCalls === 1) {
        return { data: { paymentStatus: "pending", totalAmount: 100000, expiresAt: future } };
      }
      return { data: { paymentStatus: "pending", totalAmount: 100000, receivedAmount: 30000, expiresAt: future } };
    },
  };

  const stop = c.pollPaymentStatus("CODE123", {
    intervalMs: 25,
    timeoutMs: 500,
    onStatusChange: (info) => history.push(info),
  });

  await new Promise((r) => setTimeout(r, 90));
  stop();

  assert.ok(pollCalls >= 3, `Expected at least 3 polls, got ${pollCalls}`);
  assert.equal(history[0].status, "pending");
  assert.equal(history[1].status, "underpaid");
});
