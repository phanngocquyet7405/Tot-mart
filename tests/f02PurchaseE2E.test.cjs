const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const setupAttempt = require('./helpers/attemptHarness.cjs');

test('F02: Client timeout constant is 35000ms and middleware configures attempt timeout', async () => {
  const { ATTEMPT_CLIENT_TIMEOUT_MS, LOOKUP_BACKOFF_DELAYS, isAmbiguousError } = await import('../src/app/util/attemptLifecycle.mjs');
  assert.equal(ATTEMPT_CLIENT_TIMEOUT_MS, 35000);
  assert.deepEqual(LOOKUP_BACKOFF_DELAYS, [2000, 4000, 8000, 12000]);

  // Test isAmbiguousError helper
  assert.equal(isAmbiguousError({ code: 'ECONNABORTED' }), true);
  assert.equal(isAmbiguousError({ code: 'ETIMEDOUT' }), true);
  assert.equal(isAmbiguousError({ name: 'TimeoutError' }), true);
  assert.equal(isAmbiguousError({ message: 'timeout of 35000ms exceeded' }), true);
  assert.equal(isAmbiguousError({ response: { status: 500 } }), true);
  assert.equal(isAmbiguousError({ response: { status: 502 } }), true);
  assert.equal(isAmbiguousError({ response: { status: 503 } }), true);
  assert.equal(isAmbiguousError({ response: { status: 504 } }), true);
  assert.equal(isAmbiguousError({ response: { status: 400 } }), false);
  assert.equal(isAmbiguousError({ response: { status: 404 } }), false);
  assert.equal(isAmbiguousError({ response: { status: 409 } }), false);

  // Test middleware injects 35000ms timeout for attempt endpoints
  let capturedConfig;
  const mockInstance = {
    interceptors: {
      request: {
        use(handler) {
          capturedConfig = handler({ headers: {}, url: '/checkout/check-out' });
        },
      },
      response: { use() {} },
    },
  };
  const { setupAxiosMiddleware } = await import('../src/app/middleware/axiosMiddleware.js');
  setupAxiosMiddleware(mockInstance);
  assert.equal(capturedConfig.timeout, 35000);
});

test('F02: Create encountering 503 transitions to confirming state and keeps key and body', async () => {
  const h = setupAttempt();
  const input = { addressId: 'addr-1', paymentMethod: 'cod', cartItems: [{ _id: 'prod-1', quantity: 1 }] };

  // 1. Prepare succeeds
  const prepared = await h.context.placeOrder(input);
  assert.equal(prepared.prepared, true);
  const pending = h.context.getPendingCheckout();
  assert.ok(pending.key);
  assert.ok(pending.serializedBody);

  // 2. Create fails with 503 (ambiguous result)
  h.context.checkoutService.createOrder = async () => {
    const err = new Error('Service Unavailable');
    err.response = { status: 503, data: { message: 'Lỗi hệ thống. Vui lòng thử lại.' } };
    throw err;
  };
  // Lookup during backoff still returns processing
  h.context.axiosConfig.get = async () => ({
    success: true,
    data: { state: 'processing', canRestart: false },
  });

  const result = await h.context.placeOrder({ ...input, confirm: true, backoffDelays: [1, 2] });
  assert.equal(result.success, false);
  assert.equal(result.confirming, true);

  // Reference is preserved byte-for-byte in storage
  const current = h.context.getPendingCheckout();
  assert.equal(current.key, pending.key);
  assert.equal(current.serializedBody, pending.serializedBody);
  assert.equal(current.state, 'confirming');
});

test('F02: Code 91 — BE commits then returns 503; lookup backoff recovers created with single order', async () => {
  const h = setupAttempt();
  const input = { addressId: 'addr-1', paymentMethod: 'online', cartItems: [{ _id: 'prod-1', quantity: 2 }] };

  await h.context.placeOrder(input);
  const pending = h.context.getPendingCheckout();

  let committedToDb = false;
  h.context.checkoutService.createOrder = async (payload, key) => {
    // BE committed the transaction to DB first
    committedToDb = true;
    // But connection dropped / 503 returned
    const err = new Error('Gateway Timeout');
    err.response = { status: 503 };
    throw err;
  };

  // When lookup queries attempt by key and hash, BE returns created order
  h.context.axiosConfig.get = async url => {
    if (committedToDb && url.includes(pending.key)) {
      return {
        success: true,
        data: {
          state: 'created',
          canRestart: false,
          result: { orderCode: 'ORD-CODE-91', totalAmount: 250000 },
        },
      };
    }
    return { success: true, data: { state: 'processing', canRestart: false } };
  };

  const response = await h.context.placeOrder({ ...input, confirm: true, backoffDelays: [5, 10] });
  assert.equal(response.success, true);
  assert.equal(response.orderCode, 'ORD-CODE-91');
  assert.equal(response.consumeCart, true);

  const stored = h.context.getPendingCheckout();
  assert.equal(stored.state, 'created');
  assert.equal(stored.result.orderCode, 'ORD-CODE-91');
  assert.equal(stored.key, pending.key);
});

test('F02: Confirming state prevents startNewPurchase with a new key', async () => {
  const h = setupAttempt();
  const input = { addressId: 'addr-1', paymentMethod: 'cod', cartItems: [{ _id: 'p-1', quantity: 1 }] };
  await h.context.placeOrder(input);
  const attempt = h.context.getPendingCheckout();

  // Set attempt to confirming state
  h.context.storeAttempt('totmart_checkout_attempt_recovery-user', { ...attempt, state: 'confirming' });

  // Starting new purchase must be rejected
  await assert.rejects(
    h.context.startNewCheckout(attempt.key),
    /Cần xác nhận giao dịch cũ đã tồn tại trước khi bắt đầu giao dịch mới/
  );
  assert.equal(h.context.getPendingCheckout().key, attempt.key);
});

test('F02: Late response to old attempt does not overwrite active scope or new cart version', async () => {
  const storage = new Map();
  const scope = 'totmart_checkout_attempt_recovery-user';
  const h1 = setupAttempt({ storage, loseFirstCreate: false });

  // Tab 1 creates attempt 1
  const input1 = { addressId: 'addr-1', paymentMethod: 'cod', cartItems: [{ _id: 'prod-1', quantity: 1 }] };
  await h1.context.placeOrder(input1);
  await h1.context.placeOrder({ ...input1, confirm: true });
  const attempt1 = h1.context.getPendingCheckout();
  assert.equal(attempt1.state, 'created');

  // Tab 2 starts a new purchase and creates attempt 2
  const h2 = setupAttempt({ storage, loseFirstCreate: false });
  await h2.context.startNewCheckout(attempt1.key);
  assert.equal(h2.context.getPendingCheckout(), null);

  const input2 = { addressId: 'addr-2', paymentMethod: 'online', cartItems: [{ _id: 'prod-2', quantity: 5 }] };
  await h2.context.placeOrder(input2);
  const attempt2 = h2.context.getPendingCheckout();
  assert.notEqual(attempt2.key, attempt1.key);

  // Now, late response from Tab 1 writes attempt 1
  h1.context.storeAttempt(scope, { ...attempt1, note: 'late update from tab 1' });

  // Verify Tab 2's active attempt in scope was NOT overwritten
  const activeNow = JSON.parse(storage.get(scope));
  assert.equal(activeNow.key, attempt2.key);
  assert.equal(activeNow.payload.addressId, 'addr-2');

  // Verify Tab 1's write was safely routed to referenceScope
  const archiveKey = `${scope}:created:${attempt1.key}`;
  const archived = JSON.parse(storage.get(archiveKey));
  assert.equal(archived.key, attempt1.key);
  assert.equal(archived.note, 'late update from tab 1');
});

test('F02: Prepare error before hash allows terminate-with-body and subsequent restart', async () => {
  const h = setupAttempt();
  const input = { addressId: 'deleted-addr', paymentMethod: 'cod', cartItems: [{ _id: 'p', quantity: 1 }] };

  // Prepare fails with 400 ADDRESS_NOT_FOUND, quote succeeds
  const origPost = h.context.axiosConfig.post;
  h.context.axiosConfig.post = async (url, body, options) => {
    if (url.endsWith('/prepare')) {
      const err = new Error('ADDRESS_NOT_FOUND');
      err.response = { status: 400, data: { code: 'ADDRESS_NOT_FOUND' } };
      throw err;
    }
    if (url.endsWith('/terminate-with-body')) {
      return {
        success: true,
        data: {
          key: h.context.getPendingCheckout()?.key,
          hash: 'c'.repeat(64),
          state: 'invalidated',
          canRestart: true,
        },
      };
    }
    return origPost(url, body, options);
  };

  const prepRes = await h.context.placeOrder(input);
  assert.equal(prepRes.success, false);
  const failed = h.context.getPendingCheckout();
  assert.ok(failed);
  assert.equal(failed.hash, undefined);

  // Terminate with body releases the failed attempt
  const termRes = await h.context.placeOrder({ terminate: true });
  assert.equal(termRes.invalidated, true);
  assert.equal(h.context.getPendingCheckout(), null);
});

test('F02: Complete storage loss or blocked storage provides clear support guidance without fake code', async () => {
  const h = setupAttempt({ storageFails: true });
  const input = { addressId: 'a', paymentMethod: 'cod' };

  const result = await h.context.placeOrder(input);
  assert.equal(result.success, false);
  assert.equal(result.error, 'Hãy bật lưu trữ trình duyệt trước khi gửi yêu cầu.');
  assert.equal(h.calls.length, 0);

  // Read attempt when storage is corrupt/denied
  const attempt = h.context.readAttempt('any-scope');
  assert.equal(attempt, null);
  // Never creates a fake orderCode
  assert.equal(result.orderCode, undefined);
});

test('F02: Subscription ambiguous create recovers created via backoff lookup', async () => {
  const h = setupAttempt({ loseFirstCreate: false });
  h.context.API_ENDPOINTS = { SUBSCRIBE_PLANS: {} };
  const subSource = fs.readFileSync(path.join(__dirname, '../src/app/services/api/subscribePlanService.js'), 'utf8')
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/^export /gm, '')
    .replace('const userSubscribeApi =', 'var userSubscribeApi =')
    .replace('const startNewSubscription =', 'var startNewSubscription =');
  vm.runInContext(subSource, h.context);

  // 1. Prepare subscription
  const prep = await h.context.userSubscribeApi({ templateId: 'tpl-1', expectedTotalAmount: 100000 });
  assert.equal(prep.prepared, true);

  // 2. Create fails with timeout / 503
  let committedSub = false;
  h.context.axiosConfig.post = async (url, body, options) => {
    if (url.includes('/subcribe-plans/user-subscribe')) {
      committedSub = true;
      const err = new Error('timeout of 35000ms exceeded');
      err.code = 'ECONNABORTED';
      throw err;
    }
    return { success: true };
  };

  h.context.axiosConfig.get = async url => {
    if (committedSub && url.includes('/checkout/attempts/subscription/')) {
      return {
        success: true,
        data: {
          state: 'created',
          canRestart: false,
          result: { orderCode: 'SUB-CODE-91', totalAmount: 100000 },
        },
      };
    }
    return { success: true, data: { state: 'processing', canRestart: false } };
  };

  const response = await h.context.userSubscribeApi({}, { resume: true, confirm: true, backoffDelays: [5, 10] });
  assert.equal(response.success, true);
  assert.equal(response.data.orderCode, 'SUB-CODE-91');
});
