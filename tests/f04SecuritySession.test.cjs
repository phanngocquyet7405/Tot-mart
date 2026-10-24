const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

// ─── 1. Kiểm thử axiosMiddleware: Cơ chế bảo vệ phiên ──────────────────────

function setupAxiosTest(refreshFn, initialUserId = "user-123") {
  let token = "active-token";
  let currentUserId = initialUserId;
  let clearedCount = 0;
  let savedCount = 0;
  const dispatchedEvents = [];

  const sandbox = vm.createContext({
    axios: { post: refreshFn },
    getAccessToken: () => token,
    getTokenUserId: () => currentUserId,
    jwtDecode: (t) => ({ userId: t.userId || t }),
    saveToken: (newToken) => {
      token = newToken;
      savedCount++;
    },
    clearSession: () => {
      token = null;
      clearedCount++;
    },
    window: {
      dispatchEvent: (evt) => dispatchedEvents.push(evt.type),
    },
    Event: class {
      constructor(type) {
        this.type = type;
      }
    },
  });

  const source = fs
    .readFileSync(
      path.resolve(__dirname, "../src/app/middleware/axiosMiddleware.js"),
      "utf8"
    )
    .replace(/^import[^\n]*\n/gm, "")
    .replace(/^export /gm, "");

  vm.runInContext(`${source}\nthis.setup = setupAxiosMiddleware;`, sandbox);

  let requestInterceptor;
  let responseErrorInterceptor;

  const fakeInstance = (config) => Promise.resolve({ data: { replayed: true, config } });
  fakeInstance.defaults = { baseURL: "/api" };
  fakeInstance.interceptors = {
    request: { use: (fn) => { requestInterceptor = fn; } },
    response: { use: (_ok, fail) => { responseErrorInterceptor = fail; } },
  };

  sandbox.setup(fakeInstance);

  return {
    trigger401: (reqUserId = initialUserId) => {
      const config = requestInterceptor({
        url: "/manager/products",
        headers: {},
        _requestUserId: reqUserId,
      });
      return responseErrorInterceptor({
        response: { status: 401 },
        config,
      });
    },
    switchUser: (newId) => {
      currentUserId = newId;
    },
    stats: () => ({
      token,
      clearedCount,
      savedCount,
      dispatchedEvents,
    }),
  };
}

test("axiosMiddleware: Refresh trả về 401 xóa phiên và bắn sự kiện session-expired", async () => {
  const harness = setupAxiosTest(async () => {
    throw { response: { status: 401 } };
  });

  await assert.rejects(harness.trigger401());
  assert.equal(harness.stats().clearedCount, 1);
  assert.equal(harness.stats().token, null);
  assert.deepEqual(harness.stats().dispatchedEvents, ["totmart:session-expired"]);
});

test("axiosMiddleware: Refresh trả về 403 xóa phiên và bắn sự kiện session-expired", async () => {
  const harness = setupAxiosTest(async () => {
    throw { response: { status: 403 } };
  });

  await assert.rejects(harness.trigger401());
  assert.equal(harness.stats().clearedCount, 1);
  assert.equal(harness.stats().token, null);
  assert.deepEqual(harness.stats().dispatchedEvents, ["totmart:session-expired"]);
});

test("axiosMiddleware: Refresh gặp 503 (CSOT timeout) KHÔNG xóa phiên, giữ nguyên token", async () => {
  const harness = setupAxiosTest(async () => {
    // Giả lập backend MongoDB/Redis gặp 503 timeout
    throw { response: { status: 503, data: { message: "Lỗi hệ thống.", requestId: "req-503-test" } } };
  });

  await assert.rejects(harness.trigger401());
  // PHIÊN PHẢI ĐƯỢC GIỮ NGUYÊN (clearedCount === 0)
  assert.equal(harness.stats().clearedCount, 0);
  assert.equal(harness.stats().token, "active-token");
  assert.deepEqual(harness.stats().dispatchedEvents, []);
});

test("axiosMiddleware: Refresh gặp lỗi mạng/timeout (không có status) KHÔNG xóa phiên", async () => {
  const harness = setupAxiosTest(async () => {
    // Giả lập ngắt kết nối mạng hoặc timeout client
    const networkError = new Error("Network Error");
    networkError.code = "ECONNABORTED";
    throw networkError;
  });

  await assert.rejects(harness.trigger401());
  // PHIÊN PHẢI ĐƯỢC GIỮ NGUYÊN
  assert.equal(harness.stats().clearedCount, 0);
  assert.equal(harness.stats().token, "active-token");
  assert.deepEqual(harness.stats().dispatchedEvents, []);
});

test("axiosMiddleware: Đổi tài khoản trong lúc refresh không xóa phiên của tài khoản mới", async () => {
  let release;
  const pendingRefresh = new Promise((resolve) => { release = resolve; });

  const harness = setupAxiosTest(async () => {
    await pendingRefresh;
    throw { response: { status: 401 } };
  });

  const requestPromise = harness.trigger401("user-123");

  // Người dùng chuyển sang user-456 trong lúc refresh đang chạy ngầm
  harness.switchUser("user-456");
  release();

  await assert.rejects(requestPromise);
  // Không xóa phiên của user-456
  assert.equal(harness.stats().clearedCount, 0);
});

// ─── 2. Kiểm thử luồng Đăng nhập & Bóc tách mã lỗi ──────────────────────────

async function getLoginErrorHelper() {
  const mod = await import("../src/app/util/authErrors.js");
  return mod.getLoginError;
}

test("Login: 401 hiển thị sai email/mật khẩu", async () => {
  const getLoginError = await getLoginErrorHelper();
  const err = { response: { status: 401, data: { message: "Sai tài khoản" } } };
  const res = getLoginError(err);
  assert.equal(res.message, "Sai tài khoản");
  assert.equal(res.isTransient, false);
});

test("Login: 403 hiển thị tài khoản bị khóa, TUYỆT ĐỐI KHÔNG báo sai mật khẩu", async () => {
  const getLoginError = await getLoginErrorHelper();
  const err = { response: { status: 403, data: { message: "Account suspended" } } };
  const res = getLoginError(err);
  assert.equal(res.message.includes("Account suspended"), true);
  assert.equal(res.message.includes("Email hoặc mật khẩu không đúng"), false);
  assert.equal(res.isTransient, false);
});

test("Login: 503 hiển thị hệ thống bận, TUYỆT ĐỐI KHÔNG báo sai mật khẩu, kèm requestId", async () => {
  const getLoginError = await getLoginErrorHelper();
  const err = { response: { status: 503, data: { requestId: "req-mongo-csot-123" } } };
  const res = getLoginError(err);
  assert.equal(res.message.includes("Hệ thống đang bận"), true);
  assert.equal(res.message.includes("Email hoặc mật khẩu không đúng"), false);
  assert.equal(res.requestId, "req-mongo-csot-123");
  assert.equal(res.isTransient, true);
});

test("Login: Lỗi mạng không có status báo lỗi kết nối và cho phép thử lại", async () => {
  const getLoginError = await getLoginErrorHelper();
  const err = new Error("Network Error");
  const res = getLoginError(err);
  assert.equal(res.message.includes("Không thể kết nối đến máy chủ"), true);
  assert.equal(res.isTransient, true);
});

// ─── 3. Kiểm thử Logger: Tự động che giấu thông tin nhạy cảm ───────────────

async function getLogger() {
  return await import("../src/app/util/Logger.js");
}

test("Logger: redactSensitive che giấu token, password, cookie, qrUrl và secret", async () => {
  const { redactSensitive } = await getLogger();

  const payload = {
    email: "customer@example.vn",
    password: "SuperSecretPassword123!",
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMifQ.abc",
    cookie: "refreshToken=abcdef123456",
    qrUrl: "https://qr.sepay.vn/img?acc=123456&bank=MB&amount=500000",
    order: {
      orderId: "ord-999",
      secret: "merchant-secret-key",
      totalAmount: 500000,
    },
  };

  const safe = redactSensitive(payload);

  assert.equal(safe.email, "customer@example.vn");
  assert.equal(safe.password, "[REDACTED]");
  assert.equal(safe.token, "[REDACTED]");
  assert.equal(safe.cookie, "[REDACTED]");
  assert.equal(safe.qrUrl, "[REDACTED]");
  assert.equal(safe.order.secret, "[REDACTED]");
  assert.equal(safe.order.totalAmount, 500000);
});

// ─── 4. Kiểm thử CSP: Header Content-Security-Policy-Report-Only ────────────

test("CSP: next.config.mjs xuất header Content-Security-Policy-Report-Only trong môi trường staging/test", async () => {
  const originalEnv = process.env.TOTMART_CSP_REPORT_ONLY;
  process.env.TOTMART_CSP_REPORT_ONLY = "1";

  try {
    const configModule = await import("../next.config.mjs");
    const nextConfig = configModule.default;
    const headerRules = await nextConfig.headers();

    assert.ok(Array.isArray(headerRules));
    const globalHeaderRule = headerRules.find((r) => r.source === "/:path*");
    assert.ok(globalHeaderRule);

    const cspHeader = globalHeaderRule.headers.find(
      (h) => h.key === "Content-Security-Policy-Report-Only"
    );
    assert.ok(cspHeader, "Phải có header Content-Security-Policy-Report-Only");

    const policy = cspHeader.value;
    assert.ok(policy.includes("default-src 'self'"));
    assert.ok(policy.includes("style-src 'self' 'unsafe-inline'"));
    assert.ok(policy.includes("font-src 'self'"));
    assert.ok(policy.includes("https://res.cloudinary.com"));
    assert.ok(policy.includes("https://qr.sepay.vn"));
    assert.ok(policy.includes("https://img.vietqr.io"));
  } finally {
    if (originalEnv === undefined) delete process.env.TOTMART_CSP_REPORT_ONLY;
    else process.env.TOTMART_CSP_REPORT_ONLY = originalEnv;
  }
});
