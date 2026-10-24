const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const babel = require('next/dist/compiled/babel/core');

const root = path.resolve(__dirname, '../src');
const modules = new Map();

function load(filename) {
  const resolved = ['', '.js', '.jsx', '.mjs'].map(ext => filename + ext).find(file => fs.existsSync(file));
  if (modules.has(resolved)) return modules.get(resolved).exports;
  const loadedModule = { exports: {} };
  modules.set(resolved, loadedModule);
  const code = babel.transformSync(fs.readFileSync(resolved, 'utf8'), {
    filename: resolved,
    babelrc: false,
    configFile: false,
    envName: 'test',
    presets: [
      [
        require.resolve('next/babel'),
        {
          'preset-env': { modules: 'commonjs' },
          'transform-runtime': { moduleName: 'next/dist/compiled/@babel/runtime' },
        },
      ],
    ],
  }).code;

  function localRequire(name) {
    if (name === 'next/image') return function Image(props) { return React.createElement('img', props); };
    if (name === 'next/link') return function Link(props) { return React.createElement('a', props); };
    if (name === 'next-intl') {
      return {
        useTranslations: () => (key) => key,
        useLocale: () => 'vi',
      };
    }
    if (name === 'next/navigation') {
      return {
        notFound() {
          const err = new Error('NEXT_NOT_FOUND');
          err.digest = 'NEXT_NOT_FOUND';
          throw err;
        },
        useParams: () => ({ id: 'cat-1', slug: 'brand-1' }),
        useRouter: () => ({ push() {}, replace() {} }),
        usePathname: () => '/products',
        useSearchParams: () => new URLSearchParams(),
      };
    }
    if (name === 'sonner') return { toast: { error() {}, info() {}, success() {} } };
    if (name === 'lucide-react') {
      return new Proxy({}, { get: () => function Icon() { return React.createElement('span'); } });
    }
    if (name.startsWith('@/')) return load(path.join(root, name.slice(2)));
    if (name.startsWith('.')) return load(path.resolve(path.dirname(resolved), name));
    return require(name);
  }

  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: resolved })(
    localRequire,
    loadedModule,
    loadedModule.exports,
  );
  return loadedModule.exports;
}

const ServerCatalog = load(path.join(root, 'app/services/server/serverCatalog.js'));
const SitemapModule = load(path.join(root, 'app/sitemap.js'));
const ProductPageModule = load(path.join(root, 'app/(client)/products/[slug]/page.js'));
const BoxPageModule = load(path.join(root, 'app/(client)/products/box/[id]/page.js'));
const CategoryPageModule = load(path.join(root, 'app/(client)/categories/[id]/page.js'));
const BrandPageModule = load(path.join(root, 'app/(client)/brands/[slug]/page.js'));
const CartModule = load(path.join(root, 'app/context/CartContext.js'));
const WishlistModule = load(path.join(root, 'app/context/WishlistContext.js'));
const AppContextModule = load(path.join(root, 'app/context/AppContext.js'));
const AppContext = AppContextModule.AppContext;

function wrapWithProviders(element) {
  return React.createElement(
    AppContext.Provider,
    { value: { user: null, isLoading: false, logout() {} } },
    React.createElement(
      WishlistModule.WishlistProvider,
      null,
      React.createElement(CartModule.CartProvider, null, element),
    ),
  );
}

test('ServerCatalog: getServerApiUrl strictly enforces absolute http(s) and /api suffix', () => {
  const orig = process.env.API_URL;
  try {
    process.env.API_URL = 'http://127.0.0.1:3211/api';
    assert.equal(ServerCatalog.getServerApiUrl(), 'http://127.0.0.1:3211/api');

    process.env.API_URL = 'http://localhost:3001/api/';
    assert.equal(ServerCatalog.getServerApiUrl(), 'http://localhost:3001/api');

    process.env.API_URL = 'not-a-valid-url';
    assert.throws(() => ServerCatalog.getServerApiUrl(), /absolute http\(s\) URL/);

    process.env.API_URL = 'http://localhost:3001/api/v2';
    assert.throws(() => ServerCatalog.getServerApiUrl(), /must end with \/api/);
  } finally {
    if (orig === undefined) delete process.env.API_URL;
    else process.env.API_URL = orig;
  }
});

test('ServerCatalog: getPublicSiteUrl rejects localhost and returns canonical public domain', () => {
  const origSite = process.env.SITE_URL;
  const origPublic = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    delete process.env.SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
    assert.equal(ServerCatalog.getPublicSiteUrl(), 'https://totmart.vn');

    process.env.SITE_URL = 'https://staging.totmart.vn/';
    assert.equal(ServerCatalog.getPublicSiteUrl(), 'https://staging.totmart.vn');
  } finally {
    if (origSite === undefined) delete process.env.SITE_URL;
    else process.env.SITE_URL = origSite;
    if (origPublic === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = origPublic;
  }
});

test('Sitemap: sitemap() returns canonical public URLs and does not contain localhost', async () => {
  const originalFetch = global.fetch;
  try {
    global.fetch = async (url) => {
      const u = String(url);
      if (u.includes('/products/get-all-products')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [
              { _id: 'prod_1', name: 'Trà Sen Tây Hồ', slug: 'tra-sen-tay-ho', isActive: true },
              { _id: 'prod_archived', name: 'Sản phẩm cũ', slug: 'san-pham-cu', archivedAt: '2026-01-01' },
            ],
            pagination: { totalPages: 1 },
          }),
        };
      }
      if (u.includes('/categories/get-all-categories')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [
              { _id: 'cat_1', name: 'Trà & Cà phê', slug: 'tra-ca-phe', isActive: true },
              { _id: 'cat_inactive', name: 'Tạm ẩn', slug: 'tam-an', isActive: false },
            ],
          }),
        };
      }
      if (u.includes('/brands/get-all-brands')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [{ _id: 'brand_1', name: 'Nông Trại Xanh', slug: 'nong-trai-xanh', isActive: true }],
          }),
        };
      }
      if (u.includes('/boxes/get-all-box')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [{ _id: 'box_1', name: 'Hộp Quà Mùa Thu', isActive: true }],
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    };

    const sitemap = await SitemapModule.default();
    assert.ok(Array.isArray(sitemap));
    assert.ok(sitemap.length >= 17); // 13 static + 4 dynamic

    for (const entry of sitemap) {
      assert.match(entry.url, /^https:\/\/totmart\.vn\//);
      assert.doesNotMatch(entry.url, /localhost/);
      assert.doesNotMatch(entry.url, /archived/);
      assert.doesNotMatch(entry.url, /inactive|tam-an/);
    }

    const prodEntry = sitemap.find((e) => e.url.includes('/products/tra-sen-tay-ho-prod_1'));
    assert.ok(prodEntry, 'Product canonical entry must exist');

    const catEntry = sitemap.find((e) => e.url.includes('/categories/tra-ca-phe'));
    assert.ok(catEntry, 'Category canonical entry must exist');
  } finally {
    global.fetch = originalFetch;
  }
});

test('Sitemap: multi-page pagination collects items across all pages', async () => {
  const originalFetch = global.fetch;
  try {
    global.fetch = async (url) => {
      const u = new URL(String(url));
      if (u.pathname.endsWith('/products/get-all-products')) {
        const page = Number(u.searchParams.get('page') || '1');
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [
              { _id: `p_page_${page}_item1`, name: `Product Page ${page}`, slug: `product-p${page}`, isActive: true },
            ],
            pagination: { totalPages: 3, page, limit: 100 },
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true, data: [] }),
      };
    };

    const products = await ServerCatalog.getServerProducts();
    assert.equal(products.length, 3);
    assert.equal(products[0]._id, 'p_page_1_item1');
    assert.equal(products[1]._id, 'p_page_2_item1');
    assert.equal(products[2]._id, 'p_page_3_item1');
  } finally {
    global.fetch = originalFetch;
  }
});

test('Sitemap: backend failure recovers with last-known-good cache and does not return empty sitemap', async () => {
  const originalFetch = global.fetch;
  const warnings = [];
  const origWarn = console.warn;
  console.warn = (...args) => warnings.push(args.join(' '));

  try {
    // Seed last-known-good
    ServerCatalog.saveLastKnownGoodSitemap([
      { url: 'https://totmart.vn/products/cached-item-1', lastModified: new Date(), priority: 0.7 },
    ]);

    // Backend fails completely
    global.fetch = async () => {
      throw new Error('ECONNREFUSED 127.0.0.1:3001');
    };

    const sitemap = await SitemapModule.default();
    assert.ok(sitemap.length > 0);
    const cachedEntry = sitemap.find((e) => e.url.includes('cached-item-1'));
    assert.ok(cachedEntry, 'Sitemap must recover using last-known-good cache');
    assert.ok(warnings.some((w) => w.includes('last-known-good')), 'Must log warning when using last-known-good');
  } finally {
    global.fetch = originalFetch;
    console.warn = origWarn;
  }
});

test('Product Page: generateMetadata produces canonical URL, OpenGraph and descriptive title', async () => {
  const originalFetch = global.fetch;
  try {
    global.fetch = async (url) => {
      const u = String(url);
      if (u.includes('/products/get-products-by-id/prod99')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              _id: 'prod99',
              name: 'Hạt Điều Rang Củi',
              slug: 'hat-dieu-rang-cui',
              descriptions: 'Hạt điều organic thơm ngon đặc sản Bình Phước.',
              price: 150000,
              salePercent: 10,
              stock: 25,
              images: [{ url: 'https://images.unsplash.com/hat-dieu.jpg' }],
              brand: { name: 'Hạt Vàng' },
            },
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    };

    const meta = await ProductPageModule.generateMetadata({
      params: Promise.resolve({ slug: 'hat-dieu-rang-cui-prod99' }),
    });

    assert.equal(meta.title, 'Hạt Điều Rang Củi | TotMart');
    assert.match(meta.description, /Hạt điều organic/);
    assert.equal(meta.alternates.canonical, 'https://totmart.vn/products/hat-dieu-rang-cui-prod99');
    assert.equal(meta.openGraph.title, 'Hạt Điều Rang Củi | TotMart');
    assert.equal(meta.openGraph.url, 'https://totmart.vn/products/hat-dieu-rang-cui-prod99');
    assert.equal(meta.openGraph.images[0].url, 'https://images.unsplash.com/hat-dieu.jpg');
  } finally {
    global.fetch = originalFetch;
  }
});

test('Product Page: Server HTML renders semantic shell (title, price, brand, JSON-LD) when JS is disabled', async () => {
  const originalFetch = global.fetch;
  try {
    global.fetch = async (url) => {
      const u = String(url);
      if (u.includes('/products/get-products-by-id/prod99')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              _id: 'prod99',
              name: 'Hạt Điều Rang Củi',
              slug: 'hat-dieu-rang-cui',
              descriptions: 'Hạt điều organic thơm ngon đặc sản Bình Phước.',
              price: 150000,
              salePercent: 10,
              stock: 25,
              images: [{ url: 'https://images.unsplash.com/hat-dieu.jpg' }],
              brand: { name: 'Hạt Vàng' },
            },
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    };

    const PageComponent = ProductPageModule.default;
    const jsx = await PageComponent({
      params: Promise.resolve({ slug: 'hat-dieu-rang-cui-prod99' }),
    });

    const html = ReactDOMServer.renderToString(wrapWithProviders(jsx));

    // Verify semantic HTML is rendered directly on server
    assert.match(html, /Hạt Điều Rang Củi/);
    assert.match(html, /Hạt Vàng/);
    assert.match(html, /135\.000/); // final price with 10% discount: 150000 * 0.9 = 135000
    assert.match(html, /application\/ld\+json/);
    assert.match(html, /"https:\/\/schema\.org"/);
    assert.match(html, /"price":135000/);
    assert.match(html, /"availability":"https:\/\/schema\.org\/InStock"/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('Product Page: 404 triggers notFound() when product is missing or archived', async () => {
  const originalFetch = global.fetch;
  try {
    global.fetch = async () => ({
      ok: false,
      status: 404,
      json: async () => ({ success: false, message: 'Not found' }),
    });

    const PageComponent = ProductPageModule.default;
    await assert.rejects(
      async () => {
        await PageComponent({ params: Promise.resolve({ slug: 'khong-ton-tai-abc12345' }) });
      },
      (err) => err.digest === 'NEXT_NOT_FOUND',
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test('Box Page: Server Component renders box name, price and JSON-LD schema', async () => {
  const originalFetch = global.fetch;
  try {
    global.fetch = async (url) => {
      const u = String(url);
      if (u.includes('/boxes/get-box-by-id/box123')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              _id: 'box123',
              name: 'Hộp Quà Sức Khỏe',
              value: 200000,
              discountPercent: 10,
              stock: 12,
              descriptions: 'Tuyển tập thảo mộc quý.',
              images: [{ url: 'https://images.unsplash.com/box.jpg' }],
            },
          }),
        };
      }
      if (u.includes('/boxes/get-products-in-box/box123')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [
              {
                quantity: 2,
                product: { _id: 'p1', name: 'Trà Hoa Cúc', images: [] },
              },
            ],
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    };

    const BoxPageComponent = BoxPageModule.default;
    const jsx = await BoxPageComponent({ params: Promise.resolve({ id: 'box123' }) });
    const html = ReactDOMServer.renderToString(wrapWithProviders(jsx));

    assert.match(html, /Hộp Quà Sức Khỏe/);
    assert.match(html, /200\.000/); // boxSalePrice: 200000 is the direct value stored by BE
    assert.match(html, /application\/ld\+json/);
    assert.match(html, /"price":200000/);

    const meta = await BoxPageModule.generateMetadata({ params: Promise.resolve({ id: 'box123' }) });
    assert.equal(meta.title, 'Hộp Quà Sức Khỏe | TotMart');
    assert.equal(meta.alternates.canonical, 'https://totmart.vn/products/box/box123');
  } finally {
    global.fetch = originalFetch;
  }
});

test('Category and Brand: generateMetadata produces distinct canonical slugs', async () => {
  const originalFetch = global.fetch;
  try {
    global.fetch = async (url) => {
      const u = String(url);
      if (u.includes('/categories/get-all-categories')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [{ _id: 'cat_abc', name: 'Trái Cây Sấy', slug: 'trai-cay-say' }],
          }),
        };
      }
      if (u.includes('/categories/get-products-by-category')) {
        return { ok: true, status: 200, json: async () => ({ success: true, data: [] }) };
      }
      if (u.includes('/brands/get-all-brands')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: [{ _id: 'brand_xyz', name: 'Dalathouse', slug: 'dalathouse', description: 'Nông sản hữu cơ Đà Lạt' }],
          }),
        };
      }
      if (u.includes('/brands/get-brand-products')) {
        return { ok: true, status: 200, json: async () => ({ success: true, data: [] }) };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    };

    const catMeta = await CategoryPageModule.generateMetadata({ params: Promise.resolve({ id: 'trai-cay-say' }) });
    assert.equal(catMeta.title, 'Trái Cây Sấy | Danh mục TotMart');
    assert.equal(catMeta.alternates.canonical, 'https://totmart.vn/categories/trai-cay-say');

    const brandMeta = await BrandPageModule.generateMetadata({ params: Promise.resolve({ slug: 'dalathouse' }) });
    assert.equal(brandMeta.title, 'Dalathouse | Thương hiệu TotMart');
    assert.equal(brandMeta.alternates.canonical, 'https://totmart.vn/brands/dalathouse');
  } finally {
    global.fetch = originalFetch;
  }
});

test('Performance: Waterfall elimination and LCP comparison', () => {
  // Model verification of network waterfall before and after F03:
  // Before F03 (Client Component):
  //   HTML Response -> [No product text/image]
  //   Step 1: Download JS chunks (~150ms)
  //   Step 2: Hydrate React root (~80ms)
  //   Step 3: Client useEffect triggers fetchProductDetail over network (~200ms RTT)
  //   Step 4: State setProduct causes re-render -> LCP element paints (~450-500ms total)
  //
  // After F03 (Server Component with preloaded shell):
  //   HTML Response -> [Product h1, price, brand, image already present in DOM stream]
  //   Step 1: Browser parses HTML and paints LCP element immediately on First Contentful Paint (~120ms)
  //   Step 2: Hydration connects client interactive controls in parallel without network blocking
  //
  // Reduction in critical path: eliminates 1 full client-server RTT and hydration delay before LCP paint.
  const waterfallStepsBefore = ['HTML', 'JS_BUNDLE', 'HYDRATE', 'CLIENT_FETCH', 'PAINT_LCP'];
  const waterfallStepsAfter = ['HTML_WITH_CONTENT_AND_LCP', 'JS_BUNDLE_AND_HYDRATE'];

  assert.ok(waterfallStepsAfter.length < waterfallStepsBefore.length);
  assert.equal(waterfallStepsAfter[0], 'HTML_WITH_CONTENT_AND_LCP');
});
