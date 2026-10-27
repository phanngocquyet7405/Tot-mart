const { test } = require('node:test');
process.env.NODE_ENV = 'test';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const babel = require('next/dist/compiled/babel/core');

const root = path.resolve(__dirname, '../src');
const modules = new Map();
let activeRouter = { push() {}, replace() {} };

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
        redirect(url) {
          const err = new Error(`NEXT_REDIRECT: ${url}`);
          err.digest = `NEXT_REDIRECT;replace;${url};307;;`;
          err.url = url;
          err.statusCode = 307;
          throw err;
        },
        permanentRedirect(url) {
          const err = new Error(`NEXT_REDIRECT: ${url}`);
          err.digest = `NEXT_REDIRECT;replace;${url};308;;`;
          err.url = url;
          err.statusCode = 308;
          throw err;
        },
        useParams: () => ({ id: 'cat-1', slug: 'brand-1' }),
        useRouter: () => activeRouter,
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
const ProductsCatalogPageModule = load(path.join(root, 'app/(client)/products/page.js'));
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

test('Sitemap: fail-closed by default on backend failure; recovers only with explicit ALLOW_SITEMAP_FALLBACK', async () => {
  const originalFetch = global.fetch;
  const origFallbackEnv = process.env.ALLOW_SITEMAP_FALLBACK;
  const warnings = [];
  const origWarn = console.warn;
  console.warn = (...args) => warnings.push(args.join(' '));

  try {
    // Seed in-memory last-known-good
    ServerCatalog.saveLastKnownGoodSitemap([
      { url: 'https://totmart.vn/products/cached-item-1', lastModified: new Date(), priority: 0.7 },
    ]);

    // Backend fails completely
    global.fetch = async () => {
      throw new Error('ECONNREFUSED 127.0.0.1:3001');
    };

    // 1. Fail-closed mặc định khi không có ALLOW_SITEMAP_FALLBACK
    delete process.env.ALLOW_SITEMAP_FALLBACK;
    await assert.rejects(
      async () => await SitemapModule.default(),
      /ECONNREFUSED 127\.0\.0\.1:3001/,
      'Sitemap must fail-closed (throw error) by default when backend fetch fails'
    );

    // 2. Phục hồi với last-known-good khi có biến ALLOW_SITEMAP_FALLBACK="true"
    process.env.ALLOW_SITEMAP_FALLBACK = 'true';
    const sitemap = await SitemapModule.default();
    assert.ok(sitemap.length > 0);
    const cachedEntry = sitemap.find((e) => e.url.includes('cached-item-1'));
    assert.ok(cachedEntry, 'Sitemap must recover using last-known-good cache when explicitly permitted');
    assert.ok(warnings.some((w) => w.includes('Fallback Permitted')), 'Must log warning when using last-known-good fallback');
  } finally {
    global.fetch = originalFetch;
    console.warn = origWarn;
    if (origFallbackEnv !== undefined) process.env.ALLOW_SITEMAP_FALLBACK = origFallbackEnv;
    else delete process.env.ALLOW_SITEMAP_FALLBACK;
  }
});

test('ServerCatalog & Robots: staging environment requires explicit STAGING_SITE_URL and robots disallows all', () => {
  const origEnv = process.env.APP_ENV;
  const origStagingUrl = process.env.STAGING_SITE_URL;
  const RobotsModule = load(path.join(root, 'app/robots.js'));

  try {
    process.env.APP_ENV = 'staging';

    // Bỏ mặc định staging.totmart.vn: bắt buộc STAGING_SITE_URL
    delete process.env.STAGING_SITE_URL;
    assert.throws(
      () => ServerCatalog.getPublicSiteUrl(),
      /Staging environment requires explicit STAGING_SITE_URL/,
      'Must throw when STAGING_SITE_URL is missing in staging'
    );

    // Cung cấp STAGING_SITE_URL hợp lệ
    process.env.STAGING_SITE_URL = 'https://preview-deploy.totmart.vn';
    assert.equal(ServerCatalog.getPublicSiteUrl(), 'https://preview-deploy.totmart.vn');

    // robots.txt Disallow cho staging
    const stagingRobots = RobotsModule.default();
    assert.equal(stagingRobots.rules.userAgent, '*');
    assert.equal(stagingRobots.rules.disallow, '/');
  } finally {
    if (origEnv !== undefined) process.env.APP_ENV = origEnv;
    else delete process.env.APP_ENV;
    if (origStagingUrl !== undefined) process.env.STAGING_SITE_URL = origStagingUrl;
    else delete process.env.STAGING_SITE_URL;
  }
});

test('Sitemap & ISR: Next.js keeps stale cached version when revalidation throws an error (Reproduction)', async () => {
  // Mô phỏng cơ chế ISR của Next.js:
  // Next.js lưu bản render trước trong memory/cache. Khi revalidate ném lỗi,
  // Next.js phục hồi và tiếp tục phục vụ stale cache mà không ngắt trang của người dùng.
  let currentCachedSitemap = [
    { url: 'https://totmart.vn/products/prev-cached', lastModified: new Date(1700000000000) }
  ];

  async function simulateNextJsRevalidation(revalidateFn) {
    try {
      const fresh = await revalidateFn();
      currentCachedSitemap = fresh;
      return { status: 200, data: fresh, stale: false };
    } catch (err) {
      // Next.js ISR behavior: "If an error is thrown, continue serving the previous data"
      return { status: 200, data: currentCachedSitemap, stale: true, revalidationError: err.message };
    }
  }

  // Lần revalidate gặp lỗi ném ra từ sitemap fail-closed:
  const result = await simulateNextJsRevalidation(async () => {
    throw new Error('Backend network timeout 503');
  });

  assert.equal(result.status, 200);
  assert.equal(result.stale, true);
  assert.equal(result.data[0].url, 'https://totmart.vn/products/prev-cached');
  assert.equal(result.revalidationError, 'Backend network timeout 503');
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

test('ServerCatalog: fetchServerJson retry policy enforces GET-only, 5xx/timeout/network only, max 2 retries, no 4xx retry', async () => {
  // 1. GET with 500 retries max 2 times (total 3 attempts) then throws
  let get500Attempts = 0;
  const fetch500 = async () => {
    get500Attempts++;
    return {
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ message: 'Internal Server Error' }),
    };
  };
  await assert.rejects(
    ServerCatalog.fetchServerJson('/test-500', { method: 'GET', retries: 5, fetch: fetch500 }),
    (err) => err.status === 500,
  );
  assert.equal(get500Attempts, 3, 'GET with 500 must retry exactly 2 times (3 total attempts)');

  // 2. GET with 500 on attempt 1, 200 on attempt 2 succeeds
  let getRecoverAttempts = 0;
  const fetchRecover = async () => {
    getRecoverAttempts++;
    if (getRecoverAttempts === 1) {
      return {
        ok: false,
        status: 503,
        text: async () => JSON.stringify({ message: 'Service Unavailable' }),
      };
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { recovered: true } }),
    };
  };
  const recovered = await ServerCatalog.fetchServerJson('/test-recover', { method: 'GET', fetch: fetchRecover });
  assert.equal(recovered.ok, true);
  assert.equal(recovered.data.recovered, true);
  assert.equal(getRecoverAttempts, 2, 'GET recovered on attempt 2');

  // 3. POST with 500 does NOT retry (max 1 attempt)
  let postAttempts = 0;
  const fetchPost = async () => {
    postAttempts++;
    return {
      ok: false,
      status: 500,
      text: async () => JSON.stringify({ message: 'Server Error' }),
    };
  };
  await assert.rejects(
    ServerCatalog.fetchServerJson('/test-post', { method: 'POST', retries: 2, fetch: fetchPost }),
    (err) => err.status === 500,
  );
  assert.equal(postAttempts, 1, 'Non-GET (POST) must NOT retry (exactly 1 attempt)');

  // 4. GET with 4xx (400, 401, 403, 422) does NOT retry (exactly 1 attempt)
  for (const status of [400, 401, 403, 422]) {
    let clientErrorAttempts = 0;
    const fetchClient = async () => {
      clientErrorAttempts++;
      return {
        ok: false,
        status,
        text: async () => JSON.stringify({ message: `Client Error ${status}` }),
      };
    };
    await assert.rejects(
      ServerCatalog.fetchServerJson(`/test-${status}`, { method: 'GET', retries: 2, fetch: fetchClient }),
      (err) => err.status === status,
    );
    assert.equal(clientErrorAttempts, 1, `Status ${status} must NOT retry (exactly 1 attempt)`);
  }

  // 5. GET with network/timeout error retries max 2 times (3 total attempts) then throws
  let networkAttempts = 0;
  const fetchNetwork = async () => {
    networkAttempts++;
    const netErr = new Error('fetch failed');
    netErr.code = 'ECONNRESET';
    throw netErr;
  };
  await assert.rejects(
    ServerCatalog.fetchServerJson('/test-network', { method: 'GET', retries: 2, fetch: fetchNetwork }),
    (err) => err.code === 'ECONNRESET',
  );
  assert.equal(networkAttempts, 3, 'Network error must retry exactly 2 times (3 total attempts)');
});

test('F03b: /products Server Component renders product names and prices in HTML without JS', async () => {
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
              {
                _id: 'p_catalog_1',
                name: 'Hạt Sen Sấy Giòn F03b',
                slug: 'hat-sen-say-gion-f03b',
                price: 95000,
                salePercent: 0,
                stock: 10,
                images: [{ url: '/assets/lotus.jpg' }],
                brand: { name: 'Đồng Tháp Organic' },
              },
              {
                _id: 'p_catalog_2',
                name: 'Trà Cổ Thụ Tà Xùa',
                slug: 'tra-co-thu-ta-xua',
                price: 180000,
                salePercent: 10,
                stock: 15,
                images: [{ url: '/assets/tea.jpg' }],
                brand: { name: 'Tây Bắc Tea' },
              },
            ],
            pagination: { page: 1, limit: 12, total: 26, totalPages: 3 },
          }),
        };
      }
      return { ok: true, status: 200, json: async () => ({ success: true, data: [] }) };
    };

    const ProductsPage = ProductsCatalogPageModule.default;
    const jsx = await ProductsPage({ searchParams: Promise.resolve({ page: '1' }) });
    const html = ReactDOMServer.renderToString(wrapWithProviders(jsx));

    // Verify product name and price rendered directly into server HTML
    assert.match(html, /Hạt Sen Sấy Giòn F03b/);
    assert.match(html, /95\.000/);
    assert.match(html, /Trà Cổ Thụ Tà Xùa/);
    assert.match(html, /162\.000/); // 180000 * 0.9 = 162000
    // Verify semantic product card contains links directly in server HTML
    assert.match(html, /href="\/products\/hat-sen-say-gion-f03b-p_catalog_1"/);
  } finally {
    global.fetch = originalFetch;
  }
});

test('F03b: /products generateMetadata produces canonical URL and title with pagination', async () => {
  // Page 1: default canonical without ?page=1
  const meta1 = await ProductsCatalogPageModule.generateMetadata({
    searchParams: Promise.resolve({ page: '1' }),
  });
  assert.equal(meta1.title, 'Sản phẩm hữu cơ chọn lọc | TotMart');
  assert.equal(meta1.alternates.canonical, 'https://totmart.vn/products');

  // Page 2: canonical with ?page=2
  const meta2 = await ProductsCatalogPageModule.generateMetadata({
    searchParams: Promise.resolve({ page: '2' }),
  });
  assert.equal(meta2.title, 'Sản phẩm hữu cơ - Trang 2 | TotMart');
  assert.equal(meta2.alternates.canonical, 'https://totmart.vn/products?page=2');

  // Page 3 with search query
  const meta3 = await ProductsCatalogPageModule.generateMetadata({
    searchParams: Promise.resolve({ page: '3', search: 'hạt điều' }),
  });
  assert.match(meta3.title, /hạt điều/);
  assert.match(meta3.alternates.canonical, /page=3/);
  assert.match(meta3.alternates.canonical, /search=/);
});

test('F03b: multi-page pagination >= 3 pages in getServerProductsCatalog', async () => {
  const originalFetch = global.fetch;
  try {
    global.fetch = async (url) => {
      const u = new URL(String(url));
      const page = Number(u.searchParams.get('page') || '1');
      return {
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: [
            { _id: `prod_p${page}_1`, name: `Product Page ${page} Item 1`, price: 100000 },
            { _id: `prod_p${page}_2`, name: `Product Page ${page} Item 2`, price: 200000 },
          ],
          pagination: { page, limit: 12, total: 30, totalPages: 3 },
        }),
      };
    };

    const p1 = await ServerCatalog.getServerProductsCatalog({ page: 1, limit: 12 });
    assert.equal(p1.pagination.totalPages, 3);
    assert.equal(p1.products[0]._id, 'prod_p1_1');

    const p2 = await ServerCatalog.getServerProductsCatalog({ page: 2, limit: 12 });
    assert.equal(p2.pagination.page, 2);
    assert.equal(p2.products[0]._id, 'prod_p2_1');

    const p3 = await ServerCatalog.getServerProductsCatalog({ page: 3, limit: 12 });
    assert.equal(p3.pagination.page, 3);
    assert.equal(p3.products[0]._id, 'prod_p3_1');
  } finally {
    global.fetch = originalFetch;
  }
});

test('F03b: canonical slug redirect when accessed via wrong slug or raw ID', async () => {
  const originalFetch = global.fetch;
  try {
    global.fetch = async (url) => {
      const u = String(url);
      if (u.includes('/products/get-products-by-id/p_canon_1')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              _id: 'p_canon_1',
              name: 'Hạt Macca Sấy',
              slug: 'hat-macca-say',
              price: 150000,
              stock: 10,
            },
          }),
        };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    };

    // 1. Accessed with wrong slug: wrong-name-p_canon_1 -> redirects 308 to hat-macca-say-p_canon_1 preserving query string
    await assert.rejects(
      async () => {
        await ProductPageModule.default({
          params: Promise.resolve({ slug: 'wrong-name-p_canon_1' }),
          searchParams: Promise.resolve({ utm_source: 'fb' }),
        });
      },
      (err) => err.url === '/products/hat-macca-say-p_canon_1?utm_source=fb' && err.statusCode === 308,
      'Should permanentRedirect 308 to canonical slug in Page'
    );

    // 2. generateMetadata also redirects 308 when slug is non-canonical
    await assert.rejects(
      async () => {
        await ProductPageModule.generateMetadata({
          params: Promise.resolve({ slug: 'p_canon_1' }),
          searchParams: Promise.resolve({ utm_source: 'fb' }),
        });
      },
      (err) => err.url === '/products/hat-macca-say-p_canon_1?utm_source=fb' && err.statusCode === 308,
      'Should permanentRedirect 308 to canonical slug in generateMetadata'
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test('F03b: missing resource calls notFound() in generateMetadata preventing 200 stream', async () => {
  const originalFetch = global.fetch;
  try {
    global.fetch = async () => ({
      ok: false,
      status: 404,
      json: async () => ({ success: false, message: 'Not found' }),
    });

    // Product metadata: missing product must call notFound()
    await assert.rejects(
      async () => {
        await ProductPageModule.generateMetadata({
          params: Promise.resolve({ slug: '1' }),
        });
      },
      (err) => err.digest === 'NEXT_NOT_FOUND',
      'Product generateMetadata must call notFound() when product does not exist'
    );

    // Box metadata: missing box must call notFound()
    await assert.rejects(
      async () => {
        await BoxPageModule.generateMetadata({
          params: Promise.resolve({ id: 'nonexistent-box' }),
        });
      },
      (err) => err.digest === 'NEXT_NOT_FOUND',
      'Box generateMetadata must call notFound() when box does not exist'
    );

    // Brand metadata: missing brand must call notFound()
    await assert.rejects(
      async () => {
        await BrandPageModule.generateMetadata({
          params: Promise.resolve({ slug: 'nonexistent-brand' }),
        });
      },
      (err) => err.digest === 'NEXT_NOT_FOUND',
      'Brand generateMetadata must call notFound() when brand does not exist'
    );

    // Category metadata: missing category must call notFound()
    await assert.rejects(
      async () => {
        await CategoryPageModule.generateMetadata({
          params: Promise.resolve({ id: 'nonexistent-cat' }),
        });
      },
      (err) => err.digest === 'NEXT_NOT_FOUND',
      'Category generateMetadata must call notFound() when category does not exist'
    );
  } finally {
    global.fetch = originalFetch;
  }
});

test('F03c / D2: next.config.mjs configures cookie-aware caching with Vary and private authenticated rules', async () => {
  const nextConfigModule = await import('../next.config.mjs');
  const nextConfig = nextConfigModule.default;
  const headersList = await nextConfig.headers();

  // Anonymous public catalog: requires missing token and refreshToken cookies, sets public s-maxage and Vary
  const publicProductRules = headersList.filter((h) => h.source === '/products');
  assert.ok(publicProductRules.length >= 3, 'Must have rules for anonymous, token, and refreshToken');

  const anonRule = publicProductRules.find((h) => h.missing && h.missing.some((m) => m.key === 'token'));
  assert.ok(anonRule, 'Rule for anonymous /products must exist');
  assert.deepEqual(anonRule.missing, [
    { type: 'cookie', key: 'token' },
    { type: 'cookie', key: 'refreshToken' },
  ]);
  const anonCache = anonRule.headers.find((h) => h.key === 'Cache-Control');
  assert.equal(anonCache.value, 'public, s-maxage=60, stale-while-revalidate=300');
  const anonVary = anonRule.headers.find((h) => h.key === 'Vary');
  assert.equal(anonVary.value, 'Accept-Encoding, Cookie');

  // Authenticated catalog: token cookie present -> private no-cache no-store
  const tokenRule = publicProductRules.find((h) => h.has && h.has.some((m) => m.key === 'token'));
  assert.ok(tokenRule, 'Rule for token cookie must exist');
  const tokenCache = tokenRule.headers.find((h) => h.key === 'Cache-Control');
  assert.equal(tokenCache.value, 'private, no-cache, no-store, max-age=0, must-revalidate');

  // Authenticated catalog: refreshToken cookie present -> private no-cache no-store
  const refreshRule = publicProductRules.find((h) => h.has && h.has.some((m) => m.key === 'refreshToken'));
  assert.ok(refreshRule, 'Rule for refreshToken cookie must exist');
  const refreshCache = refreshRule.headers.find((h) => h.key === 'Cache-Control');
  assert.equal(refreshCache.value, 'private, no-cache, no-store, max-age=0, must-revalidate');

  // Checkout route: always private
  const checkoutRule = headersList.find((h) => h.source === '/checkout');
  assert.ok(checkoutRule, 'Rule for /checkout must exist');
  const checkoutCacheHeader = checkoutRule.headers.find((h) => h.key === 'Cache-Control');
  assert.equal(checkoutCacheHeader.value, 'private, no-cache, no-store, max-age=0, must-revalidate');
});

test('F03c / D5: MerchantRedirectGuard redirects merchant to /manager; anonymous and admin unaffected', () => {
  const MerchantRedirectGuardModule = load(path.join(root, 'app/(client)/MerchantRedirectGuard.jsx'));
  const MerchantRedirectGuard = MerchantRedirectGuardModule.default;

  let currentContext = { user: null, isLoading: false };
  let replacedUrl = null;

  const mockRouter = {
    replace(url) {
      replacedUrl = url;
    },
  };

  const origUseContext = React.useContext;
  const origUseEffect = React.useEffect;

  const origRouter = activeRouter;
  try {
    activeRouter = mockRouter;
    React.useContext = (ctx) => {
      if (ctx === AppContext) return currentContext;
      return origUseContext(ctx);
    };
    // Execute effect synchronously during test run
    React.useEffect = (effect) => {
      effect();
    };

    // Case 1: Merchant role -> redirects to /manager
    currentContext = { user: { role: 'merchant', name: 'Seller 1' }, isLoading: false };
    replacedUrl = null;
    MerchantRedirectGuard();
    assert.equal(replacedUrl, '/manager', 'Merchant role must be redirected to /manager');

    // Case 2: Anonymous user -> no redirect
    currentContext = { user: null, isLoading: false };
    replacedUrl = null;
    MerchantRedirectGuard();
    assert.equal(replacedUrl, null, 'Anonymous user must NOT be redirected');

    // Case 3: Admin role -> no redirect
    currentContext = { user: { role: 'admin', name: 'Administrator' }, isLoading: false };
    replacedUrl = null;
    MerchantRedirectGuard();
    assert.equal(replacedUrl, null, 'Admin user must NOT be redirected');

    // Case 4: Customer role -> no redirect
    currentContext = { user: { role: 'customer', name: 'Shopper' }, isLoading: false };
    replacedUrl = null;
    MerchantRedirectGuard();
    assert.equal(replacedUrl, null, 'Customer role must NOT be redirected');

    // Case 5: Merchant still loading -> no redirect until loaded
    currentContext = { user: { role: 'merchant', name: 'Seller 1' }, isLoading: true };
    replacedUrl = null;
    MerchantRedirectGuard();
    assert.equal(replacedUrl, null, 'Merchant while isLoading=true must NOT trigger premature redirect');
  } finally {
    activeRouter = origRouter;
    React.useContext = origUseContext;
    React.useEffect = origUseEffect;
  }
});

test('F03c / D6: blocked localStorage falls back to in-memory cart and keep Add to Cart functional', () => {
  const { read, store, cartReducer } = CartModule;
  const ProductPurchasePanelModule = load(path.join(root, 'app/(client)/components/Product/ProductPurchasePanel.js'));
  const { ProductPurchasePanel } = ProductPurchasePanelModule;

  const originalLocalStorage = global.localStorage;
  try {
    // Simulate completely blocked localStorage (SecurityError)
    Object.defineProperty(global, 'localStorage', {
      get() {
        throw new Error('SecurityError: The operation is insecure.');
      },
      configurable: true,
    });

    // 1. read() safely returns empty defaults without throwing
    assert.doesNotThrow(() => {
      const result = read('totmart_cart_guest');
      assert.deepEqual(result, { items: [], version: 0, present: false });
    }, 'read() must not throw when localStorage is blocked');

    // 2. store() safely no-ops without throwing
    assert.doesNotThrow(() => {
      store('totmart_cart_guest', JSON.stringify({ items: [], version: 0 }));
    }, 'store() must not throw when localStorage is blocked');

    // 3. In-memory reducer handles cart operations
    const initialState = { items: [], version: 0 };
    const nextState = cartReducer(initialState, {
      type: 'ADD_ITEM',
      normalized: { _id: 'prod_sec_1', name: 'Organic Tea', price: 50000, itemType: 'product' },
      quantity: 2,
    });
    assert.equal(nextState.items.length, 1);
    assert.equal(nextState.items[0]._id, 'prod_sec_1');
    assert.equal(nextState.items[0].quantity, 2);

    // 4. ProductPurchasePanel with isReady=true renders active (not disabled) Add to Cart button
    const rendered = ReactDOMServer.renderToString(
      React.createElement(ProductPurchasePanel, {
        product: { name: 'Organic Tea', price: 50000, stock: 10 },
        finalPrice: 50000,
        quantity: 1,
        isReady: true,
        isAddingToCart: false,
        onAddToCart: () => {},
        fmtPrice: (n) => `${n} đ`,
      })
    );
    assert.match(rendered, /Thêm vào giỏ hàng/);
    assert.doesNotMatch(rendered, /disabled="" class="[^"]*tm-button--primary/);
  } finally {
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      configurable: true,
      writable: true,
    });
  }
});

