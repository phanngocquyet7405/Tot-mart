const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const babel = require('next/dist/compiled/babel/core');

// Compile the real JSX with Next's shipped preset; render real Radix primitives.
// No auth fixture, browser, network or admin provider is needed by the shared shell.
const root = path.resolve(__dirname, '..');
const modules = new Map();
function sourceModule(filename) {
  const resolved = ['', '.jsx', '.js', '.mjs'].map(ext => filename + ext).find(file => fs.existsSync(file) && fs.statSync(file).isFile());
  if (!resolved) throw new Error(`Missing source module: ${filename}`);
  if (modules.has(resolved)) return modules.get(resolved).exports;
  const loadedModule = { exports: {} };
  modules.set(resolved, loadedModule);
  const code = babel.transformSync(fs.readFileSync(resolved, 'utf8'), {
    filename: resolved, babelrc: false, configFile: false, envName: 'test',
    presets: [[require.resolve('next/babel'), {
      'preset-env': { modules: 'commonjs' },
      'transform-runtime': { moduleName: 'next/dist/compiled/@babel/runtime' },
    }]],
  }).code;
  const localRequire = name => name.startsWith('@/') ? sourceModule(path.join(root, 'src', name.slice(2)))
    : name.startsWith('.') ? sourceModule(path.resolve(path.dirname(resolved), name)) : require(name);
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: resolved })(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const { activeNavigationHref, performWorkspaceLogout } = sourceModule(path.join(root, 'src/components/workspace/navigation.mjs'));
const { managerNavigation } = sourceModule(path.join(root, 'src/app/manager/lib/navigation.mjs'));
const { adminNavigation } = sourceModule(path.join(root, 'src/app/(admin)/components/adminNavigation.mjs'));

test('admin list/create/update and subscription routes select exactly the intended leaf', () => {
  for (const [pathname, href] of [
    ['/admin-products', '/admin-products'],
    ['/admin-products/create', '/admin-products/create'],
    ['/admin-products/update/123', '/admin-products'],
    ['/admin-subscribe-plan/registered', '/admin-subscribe-plan/registered'],
    ['/admin-subscribe-plan/registered/123', '/admin-subscribe-plan/registered'],
  ]) assert.equal(activeNavigationHref(adminNavigation, pathname), href);
  assert.equal(activeNavigationHref(adminNavigation, '/admin-products-foreign'), undefined);
});

test('merchant navigation is the six approved routes and overview cannot match unknown children', () => {
  assert.deepEqual(managerNavigation.map(item => [item.label, item.href]), [
    ['Tổng quan', '/manager'], ['Sản phẩm', '/manager/products'], ['Combo', '/manager/combos'],
    ['Gift', '/manager/gifts'], ['Đăng ký hàng tháng', '/manager/subscriptions'], ['Đơn hàng', '/manager/orders'],
  ]);
  assert.equal(activeNavigationHref(managerNavigation, '/manager/products'), '/manager/products');
  assert.equal(activeNavigationHref(managerNavigation, '/manager/unknown'), undefined);
});

test('admin notification polling is scoped to the guarded admin layout, not the app root or shared shell', () => {
  const rootLayout = fs.readFileSync(path.join(root, 'src/app/layout.js'), 'utf8');
  assert.ok(!rootLayout.includes('AdminNotificationProvider'));
  const adminLayout = fs.readFileSync(path.join(root, 'src/app/(admin)/layout.js'), 'utf8');
  assert.ok(adminLayout.includes('withAdmin(AdminLayout)'));
  assert.ok(adminLayout.includes('<AdminNotificationProvider>'));
  for (const filename of fs.readdirSync(path.join(root, 'src/components/workspace'))) {
    const source = fs.readFileSync(path.join(root, 'src/components/workspace', filename), 'utf8');
    assert.ok(!/NotificationContext|NotificationBell|adminNavigation|axiosConfig/.test(source), filename);
  }
});

function shell(navigation, pathname, name, error = '') {
  const Shell = sourceModule(path.join(root, 'src/components/workspace/WorkspaceShell.jsx')).default;
  return renderToStaticMarkup(React.createElement(Shell, {
    navigation, pathname, brand: { name, label: name, href: navigation[0].href },
    account: { name: 'Tài khoản thử', email: 'fixture@example.invalid', roleLabel: name },
    onLogout: async () => false, logoutPending: false, logoutError: error,
  }, React.createElement('h1', null, 'Nội dung thử')));
}

test('both shells render a single main, a skip target, a named account and one current leaf', () => {
  for (const [navigation, pathname, name] of [[adminNavigation, '/admin-products/create', 'Admin'], [managerNavigation, '/manager/products', 'Merchant']]) {
    const html = shell(navigation, pathname, name);
    assert.equal((html.match(/<main\b/g) || []).length, 1);
    const id = html.match(/<main[^>]*id="([^"]+)"/)[1];
    assert.ok(html.includes(`href="#${id}"`));
    const current = html.match(/<a\b[^>]*aria-current="page"[^>]*>/g) || [];
    assert.equal(current.length, 1);
    assert.ok(current[0].includes(`href="${pathname}"`));
    assert.ok(html.includes('Tài khoản Tài khoản thử'));
    assert.ok(!html.includes('placeholder-avatar'));
    assert.ok(!html.includes('type="search"'));
    assert.ok(!html.includes('Tìm kiếm sản phẩm, đơn hàng'));
  }
});

test('merchant shell renders no admin destinations; admin active group expands and logout errors are visible', () => {
  const merchant = shell(managerNavigation, '/manager', 'Merchant');
  assert.ok(!/href="\/(admin-|dashboard|profile)/.test(merchant));
  const admin = shell(adminNavigation, '/admin-subscribe-plan/registered', 'Admin', 'Lỗi đăng xuất thử');
  assert.ok(admin.includes('aria-expanded="true"'));
  assert.ok(admin.includes('role="alert"'));
  assert.ok(admin.includes('Lỗi đăng xuất thử'));
});

function logoutFixture(logout, beforeLogout) {
  const changes = [];
  const lock = { current: false };
  const run = () => performWorkspaceLogout({ logout, beforeLogout, lock,
    setPending: value => changes.push(['pending', value]), setError: value => changes.push(['error', value]) });
  return { run, changes, lock };
}

test('cancelled draft confirmation does not log out, show failure or enter pending state', async () => {
  let calls = 0;
  const fixture = logoutFixture(async () => { calls++; }, () => false);
  assert.equal(await fixture.run(), false);
  assert.equal(calls, 0);
  assert.deepEqual(fixture.changes, []);
});

test('pending logout is single-flight across both triggers and resets after completion', async () => {
  let release, calls = 0;
  const fixture = logoutFixture(() => { calls++; return new Promise(resolve => { release = resolve; }); });
  const first = fixture.run();
  assert.equal(await fixture.run(), false);
  assert.equal(calls, 1);
  assert.equal(fixture.lock.current, true);
  release(true);
  assert.equal(await first, true);
  assert.equal(fixture.lock.current, false);
  assert.deepEqual(fixture.changes, [['pending', true], ['error', ''], ['pending', false]]);
});

test('false or rejected logout keeps a recoverable error and allows retry', async () => {
  for (const fail of [async () => false, async () => { throw new Error('offline'); }]) {
    let shouldFail = true;
    const fixture = logoutFixture(() => shouldFail ? fail() : true);
    assert.equal(await fixture.run(), false);
    assert.ok(fixture.changes.some(([key, value]) => key === 'error' && value.includes('thử lại')));
    assert.equal(fixture.lock.current, false);
    shouldFail = false;
    assert.equal(await fixture.run(), true);
    assert.deepEqual(fixture.changes.at(-2), ['error', '']);
  }
});
