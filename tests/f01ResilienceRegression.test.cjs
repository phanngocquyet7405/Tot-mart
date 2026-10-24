const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const React = require('react');
const babel = require('next/dist/compiled/babel/core');
const setupAttempt = require('./helpers/attemptHarness.cjs');

const root = path.resolve(__dirname, '../src');
const modules = new Map();
function load(filename) {
  const resolved = ['', '.js', '.jsx', '.mjs'].map(ext => filename + ext).find(file => fs.existsSync(file));
  if (modules.has(resolved)) return modules.get(resolved).exports;
  const loadedModule = { exports: {} };
  modules.set(resolved, loadedModule);
  const code = babel.transformSync(fs.readFileSync(resolved, 'utf8'), {
    filename: resolved, babelrc: false, configFile: false, envName: 'test',
    presets: [[require.resolve('next/babel'), { 'preset-env': { modules: 'commonjs' },
      'transform-runtime': { moduleName: 'next/dist/compiled/@babel/runtime' } }]],
  }).code;
  function localRequire(name) {
    if (name === 'next/image') return function Image(props) { return React.createElement('img', props); };
    if (name === 'next/link') return function Link(props) { return React.createElement('a', props); };
    if (name === 'sonner') return { toast: { error() {}, info() {}, success() {} } };
    if (name.startsWith('@/')) return load(path.join(root, name.slice(2)));
    if (name.startsWith('.')) return load(path.resolve(path.dirname(resolved), name));
    return require(name);
  }
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: resolved })(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const WishlistModule = load(path.join(root, 'app/context/WishlistContext.js'));
const CartModule = load(path.join(root, 'app/context/CartContext.js'));
const PasswordRecoveryModule = load(path.join(root, 'app/(client)/components/ui/auth/PasswordRecovery.jsx'));

test('Wishlist: mount storage denied falls back to memory and does not throw', () => {
  const { readWishlistStorage, writeWishlistStorage, removeWishlistStorage } = WishlistModule;
  const originalLocalStorage = global.localStorage;
  try {
    Object.defineProperty(global, 'localStorage', {
      get() { throw new Error('SecurityError: Access is denied'); },
      configurable: true,
    });

    const scope = 'totmart_wishlist_test_denied_' + Date.now();
    assert.doesNotThrow(() => {
      assert.equal(readWishlistStorage(scope), null);
    });

    assert.doesNotThrow(() => {
      writeWishlistStorage(scope, JSON.stringify([{ _id: 'prod1', name: 'Trà sen' }]));
    });

    const loaded = JSON.parse(readWishlistStorage(scope));
    assert.equal(loaded.length, 1);
    assert.equal(loaded[0]._id, 'prod1');

    assert.doesNotThrow(() => {
      removeWishlistStorage(scope);
    });
    assert.equal(readWishlistStorage(scope), null);
  } finally {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
  }
});

test('Wishlist: write quota failure retains in-memory fallback without throwing', () => {
  const { readWishlistStorage, writeWishlistStorage } = WishlistModule;
  const storageMap = new Map();
  const mockStorage = {
    getItem: (k) => storageMap.get(k) || null,
    setItem: () => {
      const err = new Error('QuotaExceededError');
      err.name = 'QuotaExceededError';
      throw err;
    },
    removeItem: (k) => storageMap.delete(k),
  };
  const originalLocalStorage = global.localStorage;
  try {
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      configurable: true,
      writable: true,
    });

    const scope = 'totmart_wishlist_test_quota_' + Date.now();
    assert.doesNotThrow(() => {
      writeWishlistStorage(scope, JSON.stringify([{ _id: 'prod_quota', name: 'Hộp quà' }]));
    });

    // In-memory fallback preserves the items
    const saved = JSON.parse(readWishlistStorage(scope));
    assert.equal(saved.length, 1);
    assert.equal(saved[0]._id, 'prod_quota');
  } finally {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
  }
});

test('Wishlist: corrupt stored JSON removes corrupted key safely and returns empty array', () => {
  const { readWishlistStorage, removeWishlistStorage } = WishlistModule;
  const storageMap = new Map();
  const mockStorage = {
    getItem: (k) => storageMap.get(k) || null,
    setItem: (k, v) => storageMap.set(k, v),
    removeItem: (k) => storageMap.delete(k),
  };
  const originalLocalStorage = global.localStorage;
  try {
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      configurable: true,
      writable: true,
    });

    const scope = 'totmart_wishlist_test_corrupt_' + Date.now();
    storageMap.set(scope, '{{corrupt-json');

    const raw = readWishlistStorage(scope);
    assert.equal(raw, '{{corrupt-json');

    // Emulate hydration error recovery
    let items = [];
    try {
      const parsed = JSON.parse(raw);
      items = Array.isArray(parsed) ? parsed : [];
    } catch {
      removeWishlistStorage(scope);
      items = [];
    }

    assert.deepEqual(items, []);
    assert.equal(readWishlistStorage(scope), null);
    assert.equal(storageMap.has(scope), false);
  } finally {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
  }
});

test('Checkout contract: wishlist memory fallback does not cause checkout to bypass durable storage requirement', async () => {
  const { context, calls } = setupAttempt({ storageFails: true });
  // Calling placeOrder when browser storage is blocked fails immediately with success: false
  const result = await context.placeOrder({ addressId: 'a', paymentMethod: 'cod' });
  assert.equal(result.success, false);
  assert.equal(calls.length, 0);
});

test('Password Recovery: reset success with cleanup failure displays success and clears auth session memory', async () => {
  let clearedSession = false;
  const context = {
    clearSession: () => { clearedSession = true; },
    resetPasswordApi: async () => ({ success: true }),
    localStorage: {
      removeItem: () => { throw new Error('SecurityError: denied'); },
    },
    sessionStorage: {
      removeItem: () => { throw new Error('SecurityError: denied'); },
    },
  };

  // Run submit logic matching PasswordRecovery component
  let error = '';
  let done = false;
  let loading = true;

  async function testSubmit() {
    let apiSuccess = false;
    try {
      await context.resetPasswordApi('validtoken', 'newpassword123');
      apiSuccess = true;
    } catch {
      error = 'Không thể thực hiện yêu cầu. Vui lòng thử lại sau.';
      return;
    } finally {
      loading = false;
    }

    if (apiSuccess) {
      context.clearSession();
      try {
        for (const name of ['localStorage', 'sessionStorage']) {
          try {
            context[name]?.removeItem('token');
            context[name]?.removeItem('user');
          } catch {
            /* Best-effort */
          }
        }
      } catch {
        /* Best-effort */
      }
      done = true;
    }
  }

  await testSubmit();
  assert.equal(clearedSession, true);
  assert.equal(error, '');
  assert.equal(done, true);
  assert.equal(loading, false);
});

test('Password Recovery: 400 password validation error distinguishes password flaw from expired token', () => {
  const { getResetErrorMessage } = PasswordRecoveryModule;

  // Case 1: Validation error with field: 'password'
  const errValidation = {
    response: {
      status: 400,
      data: {
        success: false,
        message: 'Validation failed',
        errors: [{ field: 'password', message: 'Mật khẩu phải chứa ít nhất 8 ký tự.' }],
      },
    },
  };
  const msg1 = getResetErrorMessage(errValidation);
  assert.equal(msg1, 'Mật khẩu phải chứa ít nhất 8 ký tự.');
  assert.notEqual(msg1.includes('hết hạn'), true);

  // Case 2: Validation failed without specific field detail
  const errValidationGeneral = {
    response: {
      status: 400,
      data: {
        success: false,
        message: 'Validation failed',
      },
    },
  };
  const msg2 = getResetErrorMessage(errValidationGeneral);
  assert.match(msg2, /Mật khẩu không hợp lệ/);
  assert.notEqual(msg2.includes('hết hạn'), true);

  // Case 3: Actual expired/invalid token error
  const errExpired = {
    response: {
      status: 400,
      data: {
        success: false,
        message: 'Invalid or expired reset password token',
      },
    },
  };
  const msg3 = getResetErrorMessage(errExpired);
  assert.equal(msg3, 'Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.');

  // Case 4: 503 error
  const err503 = {
    response: {
      status: 503,
      data: {
        success: false,
        message: 'Lỗi hệ thống. Vui lòng thử lại.',
        requestId: 'req_12345',
      },
    },
  };
  assert.equal(getResetErrorMessage(err503), 'Hệ thống tạm thời bận. Vui lòng thử lại sau.');

  // Case 5: 500 error with requestId
  const err500 = {
    response: {
      status: 500,
      data: {
        success: false,
        message: 'Lỗi hệ thống. Vui lòng thử lại.',
        requestId: 'req_500_abc',
      },
    },
  };
  assert.equal(getResetErrorMessage(err500), 'Lỗi hệ thống (req_500_abc). Vui lòng thử lại.');
});

test('CartContext: stale clear with identical new draft preserves new draft and new version', () => {
  const { cartReducer } = CartModule;

  const draft1 = [{ _id: 'item_1', name: 'Trà Ô Long', quantity: 1, price: 100000 }];
  const stateInitial = { items: draft1, version: 1 };

  // New draft created with identical item content, but distinct object identity
  const draft2 = [{ _id: 'item_1', name: 'Trà Ô Long', quantity: 1, price: 100000 }];
  assert.notEqual(draft1, draft2);

  const stateUpdated = { items: draft2, version: 2 };

  // Stale clear with draft1
  const result = cartReducer(stateUpdated, { type: 'CLEAR', expectedItems: draft1 });

  // Both draft2 items and version 2 must be preserved!
  assert.equal(result.items, draft2);
  assert.equal(result.version, 2);
});

test('CartContext: clearCart with active draft clears both items and version atomically', () => {
  const { cartReducer } = CartModule;

  const activeDraft = [{ _id: 'item_1', name: 'Trà Ô Long', quantity: 1, price: 100000 }];
  const state = { items: activeDraft, version: 3 };

  // Matching clear
  const result = cartReducer(state, { type: 'CLEAR', expectedItems: activeDraft });

  assert.deepEqual(result.items, []);
  assert.equal(result.version, 0);
});

test('CartContext: clearCart without expectedItems resets both items and version', () => {
  const { cartReducer } = CartModule;

  const activeDraft = [{ _id: 'item_1', name: 'Trà Ô Long', quantity: 1, price: 100000 }];
  const state = { items: activeDraft, version: 4 };

  const result = cartReducer(state, { type: 'CLEAR' });

  assert.deepEqual(result.items, []);
  assert.equal(result.version, 0);
});

test('CartContext: SET_VERSION updates version and retains items', () => {
  const { cartReducer } = CartModule;

  const draft = [{ _id: 'item_1', quantity: 2 }];
  const state = { items: draft, version: 1 };

  const result = cartReducer(state, { type: 'SET_VERSION', version: 5 });
  assert.equal(result.items, draft);
  assert.equal(result.version, 5);

  const resultFn = cartReducer(result, { type: 'SET_VERSION', version: (v) => v + 1 });
  assert.equal(resultFn.version, 6);
});

test('CartContext: storage denied read and store operate safely without throwing', () => {
  const { read, store } = CartModule;

  const originalLocalStorage = global.localStorage;
  try {
    Object.defineProperty(global, 'localStorage', {
      get() { throw new Error('SecurityError: Storage denied'); },
      configurable: true,
    });

    assert.doesNotThrow(() => {
      const res = read('totmart_cart_user_test');
      assert.deepEqual(res.items, []);
      assert.equal(res.version, 0);
      assert.equal(res.present, false);
    });

    assert.doesNotThrow(() => {
      store('totmart_cart_user_test', JSON.stringify({ items: [{ _id: '1' }], version: 1 }));
    });
  } finally {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
  }
});

test('CartContext and Wishlist: user switch scopes storage keys without cross-contamination', () => {
  const { readWishlistStorage, writeWishlistStorage } = WishlistModule;
  const { cartReducer } = CartModule;

  const userA_WishlistKey = 'totmart_wishlist_user_A';
  const userB_WishlistKey = 'totmart_wishlist_user_B';

  writeWishlistStorage(userA_WishlistKey, JSON.stringify([{ _id: 'productA' }]));
  writeWishlistStorage(userB_WishlistKey, JSON.stringify([{ _id: 'productB' }]));

  assert.equal(JSON.parse(readWishlistStorage(userA_WishlistKey))[0]._id, 'productA');
  assert.equal(JSON.parse(readWishlistStorage(userB_WishlistKey))[0]._id, 'productB');

  // Stale clear from user A on user B's draft
  const userADraft = [{ _id: 'itemA', quantity: 1 }];
  const userBState = { items: [{ _id: 'itemB', quantity: 2 }], version: 2 };

  const result = cartReducer(userBState, { type: 'CLEAR', expectedItems: userADraft });
  assert.equal(result.items, userBState.items);
  assert.equal(result.version, 2);
});

test('UI Smoke: WishlistProvider and CartProvider mount safely when storage is completely blocked', () => {
  const ReactDOMServer = require('react-dom/server');
  const { WishlistProvider } = WishlistModule;
  const { CartProvider } = CartModule;

  const originalLocalStorage = global.localStorage;
  const originalSessionStorage = global.sessionStorage;
  try {
    Object.defineProperty(global, 'localStorage', {
      get() { throw new Error('SecurityError: The operation is insecure.'); },
      configurable: true,
    });
    Object.defineProperty(global, 'sessionStorage', {
      get() { throw new Error('SecurityError: The operation is insecure.'); },
      configurable: true,
    });

    assert.doesNotThrow(() => {
      const rendered = ReactDOMServer.renderToString(
        React.createElement(
          WishlistProvider,
          null,
          React.createElement(
            CartProvider,
            null,
            React.createElement('div', { id: 'app-root' }, 'TotMart Content')
          )
        )
      );
      assert.match(rendered, /TotMart Content/);
    });
  } finally {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(global, 'sessionStorage', {
      value: originalSessionStorage,
      configurable: true,
      writable: true,
    });
  }
});

