const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const load = () => import(pathToFileURL(path.join(__dirname, '../src/components/workspace/navigation.mjs')).href);
const target = selector => ({ closest: query => (query.includes(selector) ? {} : null) });

test('Ctrl/Cmd+B toggles the sidebar and tolerates events without a key', async () => {
  const { isSidebarShortcut } = await load();
  assert.equal(isSidebarShortcut({ ctrlKey: true, key: 'b' }), true);
  assert.equal(isSidebarShortcut({ metaKey: true, key: 'B' }), true);
  assert.equal(isSidebarShortcut({ ctrlKey: true }), false, 'autofill-style event with no key must not throw');
  assert.equal(isSidebarShortcut({ ctrlKey: true, key: null }), false);
  assert.equal(isSidebarShortcut({ key: 'b' }), false, 'needs a modifier');
  assert.equal(isSidebarShortcut({ ctrlKey: true, key: 'b', altKey: true }), false);
  assert.equal(isSidebarShortcut({ ctrlKey: true, key: 'b', shiftKey: true }), false);
  assert.equal(isSidebarShortcut({ ctrlKey: true, key: 'b', defaultPrevented: true }), false);
  assert.equal(isSidebarShortcut(undefined), false);
});

test('the shortcut never fires inside editable fields or rich-text editors', async () => {
  const { isSidebarShortcut } = await load();
  for (const selector of ['input', 'textarea', 'select', 'contenteditable']) {
    assert.equal(isSidebarShortcut({ ctrlKey: true, key: 'b', target: target(selector) }), false, selector);
  }
  assert.equal(isSidebarShortcut({ ctrlKey: true, key: 'b', target: { closest: () => null } }), true);
});

test('account initials are two whole characters with a safe fallback', async () => {
  const { accountInitials } = await load();
  assert.equal(accountInitials('Phan Ngọc Quyết'), 'PH');
  assert.equal(accountInitials('đỗ'), 'ĐỖ');
  assert.equal(accountInitials('  a '), 'A');
  assert.equal(accountInitials('😀😀x'), '😀😀', 'a surrogate pair must not be cut in half');
  assert.equal(accountInitials(''), '?');
  assert.equal(accountInitials(undefined), '?');
});

test('admin navigation lists the overview first and gives each entry its own icon', async () => {
  const { adminNavigation } = await import(pathToFileURL(path.join(__dirname, '../src/app/(admin)/components/adminNavigation.mjs')).href);
  assert.equal(adminNavigation[0].href, '/dashboard');
  const icons = adminNavigation.map(item => item.icon);
  assert.equal(new Set(icons).size, icons.length, 'top-level icons must be distinct');
});

test('order status dialog reports its in-flight request to the draft guard', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/app/manager/components/OrdersWorkspace.jsx'), 'utf8');
  assert.match(source, /onDirtyChange\(false, true\)/);
  assert.match(source, /finally \{[^}]*onDirtyChange\(false, false\)/);
});
