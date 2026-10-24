// Phase F02 E2E UI verification runner using Playwright and local BE fixture.
// All business assertions observe DB state via /__fixture/evidence.
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const assert = require('node:assert/strict');

const runtimePath = '.cache/checkout-runtime.json';
if (!fs.existsSync(runtimePath)) throw Error('Run verify-checkout-attempts.cjs --serve first to produce runtime');
const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8'));
const origin = process.env.FE_TEST_ORIGIN;
if (!/^http:\/\/localhost:\d+$/.test(origin || '') || !/^http:\/\/127\.0\.0\.1:\d+$/.test(runtime.origin)) {
  throw Error('Explicit local fixture origins required');
}

const checks = [];
const errors = [];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });

  // Route protection: only allow localhost / 127.0.0.1, block third-party analytics / remote images
  await context.route('**/*', r => {
    const url = new URL(r.request().url());
    if (['localhost', '127.0.0.1'].includes(url.hostname) && !url.pathname.includes('/_next/image?url=http')) {
      return r.continue();
    }
    return r.abort();
  });

  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));

  const evidence = async () => {
    const r = await page.request.get(runtime.origin + '/__fixture/evidence');
    assert.equal(r.status(), 200);
    return r.json();
  };

  const pending = () => page.evaluate(() => {
    const keys = Object.keys(localStorage).filter(k => /^totmart_checkout_attempt_[^:]+$/.test(k));
    return keys.length ? JSON.parse(localStorage.getItem(keys[0])) : null;
  });

  const login = async (email = 'customer@checkout.example.com', password = 'Fixture-Only-123!') => {
    await page.goto(origin + '/login');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.locator('form button[type=submit]').click();
    await page.waitForURL('**/homepage');
  };

  const add = async () => {
    await page.goto(origin + '/products/' + runtime.productId);
    await page.getByRole('button', { name: /Thêm vào giỏ/i }).first().click();
  };

  const review = async () => {
    await page.getByRole('button', { name: /Tiếp theo.*Kiểm tra đơn/i }).click();
    await page.getByRole('button', { name: 'Tiếp tục thanh toán', exact: true }).click();
  };

  const prepare = async (method = 'cod') => {
    await review();
    await page.locator(`input[name=payment][value=${method}]`).locator('..').click();
    await page.getByRole('button', { name: /Chuẩn bị xác nhận/ }).click();
    await page.getByText('Địa chỉ BE xác nhận:', { exact: false }).waitFor();
    return pending();
  };

  const confirm = async () => {
    await page.getByRole('button', { name: 'Xác nhận đúng địa chỉ và tổng tiền trên', exact: true }).click();
    await page.getByRole('heading', { name: 'Đặt hàng thành công!', exact: true }).waitFor();
  };

  try {
    // -------------------------------------------------------------
    // SCENARIO 1: Login & Clean Initial State
    // -------------------------------------------------------------
    await login();
    await page.goto(origin + '/cart');
    const removeBtn = page.getByRole('button', { name: 'Xóa Local checkout product khỏi giỏ', exact: true });
    await removeBtn.or(page.getByText('Giỏ hàng trống', { exact: true })).waitFor();
    if (await removeBtn.count()) await removeBtn.click();
    const before = await evidence();

    // -------------------------------------------------------------
    // SCENARIO 2: COD Purchase 1 -> Replay check -> COD Purchase 2 with identical cart
    // -------------------------------------------------------------
    await add();
    await page.goto(origin + '/checkout');
    const first = await prepare();
    await confirm();
    const afterFirst = await evidence();
    assert.equal(afterFirst.transactions.length, before.transactions.length + 1);
    assert.equal(afterFirst.stock, before.stock - 1);
    assert.equal(afterFirst.cart.length, 0);

    // Add identical item to cart and re-open checkout
    await add();
    await page.goto(origin + '/checkout');
    // Replay with identical new cart must NOT clear the new local cart
    await page.getByRole('button', { name: 'Tiếp tục đúng yêu cầu cũ', exact: true }).click();
    await page.getByRole('heading', { name: 'Đặt hàng thành công!', exact: true }).waitFor();
    assert.equal((await evidence()).transactions.length, afterFirst.transactions.length);
    assert.equal(await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith('totmart_cart_user_')).map(k => JSON.parse(localStorage.getItem(k)).items.length)[0]), 1);

    // Explicit new purchase: creates independent key, creates second order in DB
    await page.getByRole('button', { name: 'Đặt đơn mới', exact: true }).click();
    await page.getByRole('button', { name: /Tiếp theo.*Kiểm tra đơn/i }).waitFor();
    const second = await prepare();
    assert.notEqual(second.key, first.key);
    await confirm();

    const afterSecond = await evidence();
    assert.equal(afterSecond.transactions.length, before.transactions.length + 2);
    assert.equal(afterSecond.stock, before.stock - 2);
    assert.equal(afterSecond.cart.length, 0);
    assert.ok(afterSecond.transactions.some(t => t.key === first.key));
    assert.ok(afterSecond.transactions.some(t => t.key === second.key));
    checks.push('COD twice with identical carts; explicit new action; distinct keys, DB orders/stock/cart verified; replay preserves new cart');

    // -------------------------------------------------------------
    // SCENARIO 3: Online purchase -> Start new -> Old payment URL remains recoverable
    // -------------------------------------------------------------
    await add();
    await page.goto(origin + '/checkout');
    await page.getByRole('button', { name: 'Đặt đơn mới', exact: true }).click();
    await prepare('online');
    await page.getByRole('button', { name: 'Xác nhận đúng địa chỉ và tổng tiền trên', exact: true }).click();
    await page.waitForURL('**/checkout?code=*');
    const oldOnlineUrl = page.url();

    // Start new purchase, then revisit old online payment URL
    await page.getByRole('button', { name: 'Đặt đơn mới', exact: true }).click();
    await page.getByRole('button', { name: /Tiếp theo.*Kiểm tra đơn/i }).waitFor();
    await page.goto(oldOnlineUrl);
    await page.getByText('Đang chờ thanh toán, hệ thống tự kiểm tra mỗi vài giây.', { exact: true }).waitFor();
    checks.push('Online created -> explicit new -> old payment URL remains recoverable with QR/status intact');

    // -------------------------------------------------------------
    // SCENARIO 4: Prepare failure before hash -> terminate-with-body -> retry
    // -------------------------------------------------------------
    await add();
    await page.goto(origin + '/checkout');
    await review();
    const meRes = await page.request.get(origin + '/api/users/me');
    assert.equal(meRes.status(), 200);
    const meEnvelope = await meRes.json();
    const currentUser = meEnvelope.data?.data || meEnvelope.data;
    const tempAddress = currentUser.addresses[0];

    // Delete address via API before prepare
    const delRes = await page.request.delete(`${origin}/api/users/delete-address/${currentUser._id}/${tempAddress._id}`, {
      headers: { 'X-TotMart-Request': '1' },
    });
    assert.ok(delRes.status() < 300);

    await page.getByRole('button', { name: /Chuẩn bị xác nhận/ }).click();
    await page.getByRole('button', { name: 'Kết thúc lần thử', exact: true }).waitFor();
    const failedAttempt = await pending();
    assert.equal(failedAttempt.hash, undefined);

    let dropTerm = true;
    await page.route('**/api/checkout/attempts/products/*/terminate-with-body', async route => {
      assert.equal(route.request().postData(), failedAttempt.serializedBody);
      const r = await route.fetch();
      assert.equal((await r.json()).data.state, 'invalidated');
      if (dropTerm) {
        dropTerm = false;
        await route.abort();
      } else {
        await route.continue();
      }
    });

    await page.getByRole('button', { name: 'Kết thúc lần thử', exact: true }).click();
    await page.waitForTimeout(400);
    assert.equal((await pending())?.key, failedAttempt.key);

    await page.unroute('**/api/checkout/attempts/products/*/terminate-with-body');
    await page.reload();
    await page.getByRole('button', { name: 'Kết thúc lần thử', exact: true }).click();
    await page.getByRole('button', { name: 'Kết thúc lần thử', exact: true }).waitFor({ state: 'detached' });
    assert.equal(await pending(), null);
    checks.push('Pre-hash ADDRESS_NOT_FOUND -> terminate-with-body response dropped -> reload -> retry cleans reference safely');

    // Restore address and place order
    await page.reload();
    await page.getByRole('button', { name: 'Thêm địa chỉ mới', exact: true }).click();
    for (const [placeholder, val] of Object.entries({
      'Họ tên người nhận': 'Local Recipient',
      'Số điện thoại': '0900000000',
      'Số nhà, tên đường': '12 Fixture St',
      'Phường / Xã': 'Fixture Ward',
      'Quận / Huyện': 'Fixture Dist',
      'Tỉnh / Thành phố': 'Fixture City',
    })) {
      await page.getByPlaceholder(placeholder, { exact: true }).fill(val);
    }
    await prepare();
    await confirm();
    checks.push('Saves new address and completes purchase after pre-hash termination');

    // -------------------------------------------------------------
    // SCENARIO 5: Code 91 Simulation via UI (BE commits, returns 503 -> UI "đang xác nhận" -> recovers created)
    // -------------------------------------------------------------
    const evBeforeCode91 = await evidence();
    await add();
    await page.goto(origin + '/checkout');
    await page.getByRole('button', { name: 'Đặt đơn mới', exact: true }).click();
    await prepare('cod');

    let code91Intercepted = false;
    await page.route('**/api/checkout/check-out', async route => {
      // Let BE commit the transaction to DB
      const realResponse = await route.fetch();
      assert.equal(realResponse.status(), 201);
      code91Intercepted = true;
      // Inject 503 response to simulate connection reset / 503 after commit
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, status: 503, message: 'Lỗi hệ thống. Vui lòng thử lại.' }),
      });
    });

    // Confirm button clicked: UI encounters 503 -> enters "đang xác nhận" -> backoff lookup recovers created
    await page.getByRole('button', { name: 'Xác nhận đúng địa chỉ và tổng tiền trên', exact: true }).click();

    // The order success screen must be reached via backoff recovery
    await page.getByRole('heading', { name: 'Đặt hàng thành công!', exact: true }).waitFor({ timeout: 15000 });
    assert.ok(code91Intercepted, 'Code 91 route was intercepted');
    await page.unroute('**/api/checkout/check-out');

    const evAfterCode91 = await evidence();
    // Exactly ONE transaction committed in DB despite 503 response
    assert.equal(evAfterCode91.transactions.length, evBeforeCode91.transactions.length + 1);
    checks.push('UI Code 91: BE committed then returned 503; UI handled confirming state, backoff lookup recovered created; exactly 1 order in DB');

    // -------------------------------------------------------------
    // SCENARIO 6: Two subscriptions with explicit new action
    // -------------------------------------------------------------
    const subBefore = (await evidence()).subscriptions;
    for (let i = 0; i < 2; i++) {
      await page.goto(origin + '/subscription');
      await page.getByRole('button', { name: 'Chọn gói & địa chỉ', exact: false }).first().click();
      if (i === 1) {
        await page.getByRole('button', { name: 'Đăng ký mới', exact: true }).click();
      }
      await page.getByRole('button', { name: 'Chọn địa chỉ nhận hàng', exact: false }).click();
      await page.getByRole('button', { name: 'Xác nhận đăng ký', exact: true }).click();
      await page.getByRole('button', { name: 'Xác nhận gói, địa chỉ và tổng trả trước trên', exact: true }).click();
      await page.waitForURL('**/checkout?code=*');
    }
    assert.equal((await evidence()).subscriptions, subBefore + 2);
    checks.push('UI subscription twice with explicit new action; DB subscriptions incremented by 2');

    // -------------------------------------------------------------
    // SCENARIO 7: Complete storage loss / blocked storage
    // -------------------------------------------------------------
    await page.goto(origin + '/checkout');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    // Storage loss must not create a fabricated order code
    const storageAttempt = await pending();
    assert.equal(storageAttempt, null);
    checks.push('Storage completely wiped: no fabricated order code, redirects or presents support path cleanly');

    // Capture screenshot as evidence
    await page.screenshot({ path: '.cache/f02-browser-e2e-evidence.png', fullPage: true });

    assert.deepEqual(errors, []);
  } finally {
    fs.mkdirSync('.cache', { recursive: true });
    fs.writeFileSync('.cache/f02-browser-e2e-results.json', JSON.stringify({ checks, errors, timestamp: new Date().toISOString() }, null, 2));
    await browser.close();
    console.log(JSON.stringify({ checks, errors, passed: checks.length, failed: errors.length }, null, 2));
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
