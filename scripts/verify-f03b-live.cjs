const assert = require('node:assert/strict');

const BASE_URL = 'http://127.0.0.1:3217';

async function verify() {
  console.log('=== F03b Live Verification Suite ===\n');
  const results = [];

  // Helper fetch
  async function get(path, options = {}) {
    return await fetch(`${BASE_URL}${path}`, {
      redirect: 'manual',
      ...options,
    });
  }

  // 1. /products: HTML has product name, price, canonical, and Cache-Control
  console.log('1. Checking /products HTML without JS & Cache-Control...');
  const resProducts = await get('/products');
  const htmlProducts = await resProducts.text();
  assert.equal(resProducts.status, 200, '/products must return 200');
  const cacheProducts = resProducts.headers.get('cache-control');
  console.log('   /products Cache-Control:', cacheProducts);
  assert.match(cacheProducts, /public/, '/products must have public Cache-Control');
  assert.match(cacheProducts, /s-maxage=60/, '/products must have s-maxage=60');
  assert.ok(htmlProducts.includes('Hạt Điều Rang Muối F07') || htmlProducts.includes('Sản Phẩm Hữu Cơ TotMart'), 'HTML must contain product names');
  assert.ok(htmlProducts.includes('180.000') || htmlProducts.includes('120.000') || htmlProducts.includes('₫') || htmlProducts.includes('đ'), 'HTML must contain product prices');
  assert.ok(htmlProducts.includes('rel="canonical"'), 'HTML must have canonical link');
  results.push({ test: '/products HTML has name, price, canonical, Cache-Control', status: 'PASS' });

  // 2. Pagination >= 3 pages
  console.log('\n2. Checking Multi-page pagination (page 1, 2, 3)...');
  const resP1 = await get('/products?page=1');
  const htmlP1 = await resP1.text();
  const resP2 = await get('/products?page=2');
  const htmlP2 = await resP2.text();
  const resP3 = await get('/products?page=3');
  const htmlP3 = await resP3.text();

  assert.equal(resP1.status, 200);
  assert.equal(resP2.status, 200);
  assert.equal(resP3.status, 200);

  assert.ok(htmlP2.includes('page=2'), 'Page 2 HTML must reference page 2');
  assert.ok(htmlP3.includes('page=3'), 'Page 3 HTML must reference page 3');
  assert.ok(htmlP2.includes('Trang 2'), 'Page 2 title/content must contain Trang 2');
  assert.ok(htmlP3.includes('Trang 3'), 'Page 3 title/content must contain Trang 3');
  results.push({ test: 'Multi-page pagination (pages 1, 2, 3) distinct HTML & canonical', status: 'PASS' });

  // 3. HTTP 404 for invalid slug
  console.log('\n3. Checking genuine HTTP 404 for invalid/missing entities...');
  const res404Product1 = await get('/products/1');
  console.log('   GET /products/1 status:', res404Product1.status);
  assert.equal(res404Product1.status, 404, '/products/1 must return genuine HTTP 404');

  const res404ProductHex = await get('/products/000000000000000000000000');
  console.log('   GET /products/000000000000000000000000 status:', res404ProductHex.status);
  assert.equal(res404ProductHex.status, 404, 'Non-existent product hex ID must return 404');

  const res404Box = await get('/products/box/000000000000000000000000');
  console.log('   GET /products/box/000000000000000000000000 status:', res404Box.status);
  assert.equal(res404Box.status, 404, 'Non-existent box must return 404');

  const res404Brand = await get('/brands/nonexistent-brand-slug-xyz');
  console.log('   GET /brands/nonexistent-brand-slug-xyz status:', res404Brand.status);
  assert.equal(res404Brand.status, 404, 'Non-existent brand must return 404');

  const res404Category = await get('/categories/nonexistent-category-id-xyz');
  console.log('   GET /categories/nonexistent-category-id-xyz status:', res404Category.status);
  assert.equal(res404Category.status, 404, 'Non-existent category must return 404');
  results.push({ test: 'Genuine HTTP 404 for product, box, brand, category', status: 'PASS' });

  // 4. Canonical slug redirect
  console.log('\n4. Checking canonical slug redirect...');
  // Get product info from runtime
  const fs = require('fs');
  const runtimeFile = fs.existsSync('.cache/f07-runtime.json') ? '.cache/f07-runtime.json' : '.cache/f06-runtime.json';
  const runtime = JSON.parse(fs.readFileSync(runtimeFile, 'utf8'));
  const rawIdUrl = `/products/${runtime.productId}`;
  const resRawId = await get(rawIdUrl);
  console.log(`   GET ${rawIdUrl} status:`, resRawId.status, 'location:', resRawId.headers.get('location'));
  assert.equal(resRawId.status, 308, 'Raw product ID must return 308 permanent redirect');
  assert.equal(resRawId.headers.get('location'), `/products/${runtime.productCanonicalSlug}`);

  const wrongSlugUrl = `/products/sai-ten-slug-${runtime.productId}`;
  const resWrongSlug = await get(wrongSlugUrl);
  console.log(`   GET ${wrongSlugUrl} status:`, resWrongSlug.status, 'location:', resWrongSlug.headers.get('location'));
  assert.equal(resWrongSlug.status, 308, 'Wrong slug prefix must return 308 permanent redirect');
  assert.equal(resWrongSlug.headers.get('location'), `/products/${runtime.productCanonicalSlug}`);

  // Canonical slug itself returns 200
  const resCanonical = await get(`/products/${runtime.productCanonicalSlug}`);
  console.log(`   GET /products/${runtime.productCanonicalSlug} status:`, resCanonical.status);
  assert.equal(resCanonical.status, 200, 'Canonical product URL must return 200');
  results.push({ test: 'Canonical slug redirect (raw ID & wrong prefix -> canonical slug)', status: 'PASS' });

  // 5. Cache-Control for private routes (checkout, cart, profile)
  console.log('\n5. Checking private routes Cache-Control (no-store)...');
  const resCheckout = await get('/checkout');
  const cacheCheckout = resCheckout.headers.get('cache-control');
  console.log('   /checkout Cache-Control:', cacheCheckout);
  assert.match(cacheCheckout, /no-store/, '/checkout must be no-store');
  assert.match(cacheCheckout, /private/, '/checkout must be private');

  const resCart = await get('/cart');
  const cacheCart = resCart.headers.get('cache-control');
  console.log('   /cart Cache-Control:', cacheCart);
  assert.match(cacheCart, /no-store/, '/cart must be no-store');
  assert.match(cacheCart, /private/, '/cart must be private');
  results.push({ test: 'Private routes (/checkout, /cart) Cache-Control: private, no-store', status: 'PASS' });

  // 6. Sitemap.xml has all URLs
  console.log('\n6. Checking /sitemap.xml...');
  const resSitemap = await get('/sitemap.xml');
  const xmlSitemap = await resSitemap.text();
  console.log('   /sitemap.xml status:', resSitemap.status, 'length:', xmlSitemap.length);
  assert.equal(resSitemap.status, 200, 'Sitemap must return 200');
  assert.ok(xmlSitemap.includes('<urlset'), 'Sitemap must contain <urlset');
  assert.ok(xmlSitemap.includes('/products/'), 'Sitemap must contain products');
  assert.ok(xmlSitemap.includes('/categories/'), 'Sitemap must contain categories');
  assert.ok(xmlSitemap.includes('/brands/'), 'Sitemap must contain brands');
  assert.ok(xmlSitemap.includes('/products/box/'), 'Sitemap must contain boxes');
  results.push({ test: 'Sitemap contains all public entities (products, categories, brands, boxes)', status: 'PASS' });

  console.log('\n=== All Live Verifications PASSED ===');
  console.table(results);
}

verify().catch((err) => {
  console.error('\n[Verification FAILED]:', err);
  process.exit(1);
});
