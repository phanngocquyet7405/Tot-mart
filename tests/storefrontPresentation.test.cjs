const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const babel = require('next/dist/compiled/babel/core');

// Render the shipped components, not copies of their markup. Browser interaction
// and focus trapping still require browser QA; these assertions cover UI behavior.
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
    if (name === 'next/image') return function Image({ fill, preload, unoptimized, onError, ...props }) {
      void fill; void preload; void unoptimized; void onError;
      return React.createElement('img', props);
    };
    if (name === 'next/link') return function Link(props) { return React.createElement('a', props); };
    if (name === '@/app/context/CartContext') return { useCart: () => ({ addToCart() {} }) };
    if (name === '@/app/services/api/productServices') return {};
    if (name.startsWith('@/')) return load(path.join(root, name.slice(2)));
    if (name.startsWith('.')) return load(path.resolve(path.dirname(resolved), name));
    return require(name);
  }
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: resolved })(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const components = 'app/(client)/components/';
const { default: PlanComparison } = load(path.join(root, components, 'Subsciber_components/PlanComparison'));
const { ProductPurchasePanel } = load(path.join(root, components, 'Product/ProductPurchasePanel'));
const { ProductGallery } = load(path.join(root, components, 'Product/ProductGallery'));
const { FrequentlyBought } = load(path.join(root, components, 'Product/FrequentlyBought'));
const { ProductInfoTabs } = load(path.join(root, components, 'Product/ProductInfoTabs'));
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));

test('term selection renders API upfront totals, monthly averages and native checked state; incomplete data stays unavailable', () => {
  const html = render(PlanComparison, { selectedId: 'three', onSelect() {}, plans: [
    { _id: 'one', planType: '1_month', basePrice: 100000 },
    { _id: 'three', planType: '3_month', basePrice: 300000, discountPrice: 270000 },
    { _id: 'missing-price', planType: '6_month' },
    { planType: '12_month', basePrice: 1200000 },
    { _id: 'inactive', planType: '12_month', basePrice: 1200000, isActive: false },
  ] });
  assert.equal((html.match(/type="radio"/g) || []).length, 2);
  assert.match(html, /checked=""[^>]*value="three"|value="three"[^>]*checked=""/);
  assert.match(html, /270[.,]000/);
  assert.match(html, /90[.,]000/);
  assert.doesNotMatch(html, /value="missing-price"|value="inactive"|NaN/);
});

test('stock and submission states prevent purchasing and expose named quantity controls', () => {
  for (const state of [{ stock: 0 }, { stock: 4, isAddingToCart: true }, { stock: 4, isBuyingNow: true }]) {
    const html = render(ProductPurchasePanel, { product: { name: 'Trà', price: 100000, stock: state.stock },
      finalPrice: 100000, quantity: 1, fmtPrice: String, ...state });
    const buttons = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g);
    const buy = buttons.find(button => /Mua ngay|Đang chuyển/.test(button));
    const add = buttons.find(button => /Thêm vào giỏ|Đang thêm|Tạm hết hàng/.test(button));
    assert.match(buy, /disabled=""/);
    assert.match(add, /disabled=""/);
    assert.match(html, /aria-label="Tăng số lượng"/);
    assert.match(html, /aria-label="Giảm số lượng"/);
  }
});

test('gallery exposes the selected image and named thumbnail controls to assistive technology', () => {
  const html = render(ProductGallery, { productName: 'Trà Việt', selectedImage: '/b.png', images: [{ url: '/a.png' }, { url: '/b.png' }] });
  const buttons = html.match(/<button\b[^>]*>/g);
  assert.equal(buttons.length, 2);
  assert.match(buttons[0], /aria-pressed="false"/);
  assert.match(buttons[1], /aria-pressed="true"/);
  assert.match(buttons[1], /Xem ảnh 2 của Trà Việt/);
});

test('suggested purchases require opt-in and unavailable stock cannot be selected', () => {
  const html = render(FrequentlyBought, { products: [
    { _id: 'p', name: 'Trà', stock: 3, price: 100000 },
    { _id: 'q', name: 'Bánh', stock: 0, price: 50000 },
  ] });
  assert.match(html, /Gợi ý mua thêm/);
  assert.doesNotMatch(html, /checked=""|Thường được mua cùng/);
  const inputs = html.match(/<input\b[^>]*>/g);
  assert.doesNotMatch(inputs[0], /disabled=""/);
  assert.match(inputs[1], /disabled=""/);
  assert.match(html, /disabled=""[^>]*>[\s\S]*?Thêm sản phẩm đã chọn/);
});

test('review summary shows a rating only with actual review count and a valid score', () => {
  const absent = render(ProductInfoTabs, { product: {}, activeTab: 'reviews' });
  assert.doesNotMatch(absent, /lucide-star|NaN|0\.0/);
  assert.doesNotMatch(absent, />0 đánh giá</);
  assert.match(absent, /Chưa có dữ liệu đánh giá được xác nhận/);
  const present = render(ProductInfoTabs, { product: { rating: 4.5, reviewCount: 2 }, activeTab: 'reviews' });
  assert.match(present, /4\.5/);
  assert.match(present, /lucide-star/);
});

test('missing product price cannot be shown as a free purchase or enable buy actions', () => {
  const html = render(ProductPurchasePanel, { product: { name: 'Trà', stock: 3 }, quantity: 1, fmtPrice: String });
  assert.match(html, /Chưa có giá/);
  const buttons = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g);
  for (const button of buttons.filter(value => /Thêm vào giỏ|Mua ngay/.test(value))) assert.match(button, /disabled=""/);
});
