// Phase F07 Fixture Server with MongoDB Replica Set and In-Memory Observability.
// Provides isolated, clean test data and exact DB state observation for F07 smoke & performance tests.
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const { createRequire } = require('node:module');
const { randomUUID, randomBytes } = require('node:crypto');

const root = process.env.TOTMART_BE_ROOT || process.argv[2] || 'C:/Users/84862/Desktop/totmart/be-pinned';
if (!root || !path.isAbsolute(root)) throw new Error('Supply absolute BE source path');
const be = createRequire(path.join(root, 'package.json'));

const SEPAY_KEY = 'local-fixture-sepay-key';
Object.assign(process.env, {
  NODE_ENV: 'test',
  MONGODB_URI: 'mongodb://127.0.0.1:1/unused',
  REDIS_URL: '',
  REDIS_NAMESPACE: 'totmart:f07:' + randomUUID(),
  JWT_SECRET: randomBytes(32).toString('hex'),
  JWT_REFRESH_SECRET: randomBytes(32).toString('hex'),
  FRONTEND_URL: 'http://127.0.0.1:3217',
  CORS_ORIGINS: 'http://127.0.0.1:3217,http://localhost:3217',
  TRUST_PROXY: '0',
  BREVO_API_KEY: 'test-brevo-key',
  FROM_EMAIL: 'noreply@example.com',
  CLOUDINARY_CLOUD_NAME: 'test-cloud',
  CLOUDINARY_API_KEY: 'test-key',
  CLOUDINARY_API_SECRET: 'test-secret',
  SEPAY_API_KEY: SEPAY_KEY,
  SEPAY_BANK_ACCOUNT: '0000000000',
  SEPAY_BANK_NAME: 'FixtureBank',
  LOG_LEVEL: 'silent',
});

const mongoose = be('mongoose');
const { MongoMemoryReplSet } = be('mongodb-memory-server');
const app = be(path.join(root, 'src/app'));
const fixture = be(path.join(root, 'tests/helpers/factories'));

let simulate503 = false;

async function main() {
  const repl = await MongoMemoryReplSet.create({
    binary: {
      version: '7.0.14',
      downloadDir: path.resolve('.cache/manager-backend-verification'),
    },
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });

  let server;
  try {
    await mongoose.connect(repl.getUri('fe_f07_' + randomUUID().replaceAll('-', '')));
    await Promise.all(Object.values(mongoose.models).map((m) => m.init()));

    const User = be(path.join(root, 'src/models/User'));
    const Category = be(path.join(root, 'src/models/Category'));
    const Brand = be(path.join(root, 'src/models/Brand'));
    const Product = be(path.join(root, 'src/models/Product'));
    const Box = be(path.join(root, 'src/models/Box'));
    const Checkout = be(path.join(root, 'src/models/Checkout'));
    const Cart = be(path.join(root, 'src/models/Cart'));
    const Subscription = be(path.join(root, 'src/models/UserSubscription'));
    const SubscriptionTemplate = be(path.join(root, 'src/models/SubscriptionTemplate'));
    const Coupon = be(path.join(root, 'src/models/Coupon'));
    const AuthSession = be(path.join(root, 'src/models/AuthSession'));
    const { hash, accessToken } = be(path.join(root, 'src/services/sessionService'));

    // 1. Create Users
    const { user: admin } = await fixture.createUser({
      name: 'F07 Admin',
      email: 'admin@f07.example.com',
      password: 'Fixture-Only-123!',
      role: 'admin',
    });
    const { user: merchant } = await fixture.createUser({
      name: 'F07 Merchant',
      email: 'merchant@f07.example.com',
      password: 'Fixture-Only-123!',
      role: 'merchant',
    });
    const { user: customer } = await fixture.createUser({
      name: 'F07 Customer',
      email: 'customer@f07.example.com',
      password: 'Fixture-Only-123!',
      role: 'user',
      addresses: [
        {
          country: 'VN',
          city: 'Hồ Chí Minh',
          district: 'Quận 1',
          address: '123 Đường Fixture F07',
          phone: '0900000000',
        },
      ],
    });
    const { user: customer2 } = await fixture.createUser({
      name: 'F07 Customer 2',
      email: 'customer2@f07.example.com',
      password: 'Fixture-Only-123!',
      role: 'user',
      addresses: [
        {
          country: 'VN',
          city: 'Hà Nội',
          district: 'Ba Đình',
          address: '456 Đường Fixture F07 Hai',
          phone: '0911111111',
        },
      ],
    });

    // Helper to issue genuine session tokens with MongoDB AuthSession persistence
    async function issueSessionToken(u) {
      const sessionId = randomUUID();
      const rawRefresh = randomUUID().replaceAll('-', '') + randomUUID().replaceAll('-', '');
      await AuthSession.create({
        sessionId,
        userId: u._id,
        tokenVersion: u.tokenVersion || 0,
        refreshHash: hash(rawRefresh),
        expiresAt: new Date(Date.now() + 30 * 86400000),
        persistent: true,
      });
      return accessToken(u, sessionId);
    }

    const adminToken = await issueSessionToken(admin);
    const merchantToken = await issueSessionToken(merchant);
    const customerToken = await issueSessionToken(customer);

    // 2. Categories & Brands
    const category = await Category.create({ name: 'Hạt & Nông Sản F07' });
    const brand = await fixture.createBrand({ name: 'TotMart Organic F07', ownerId: merchant._id });

    // 3. Products (Seed 26 products so catalog has >= 3 pages with meaningful data)
    const product = await Product.create({
      productId: 'F07-P01',
      name: 'Hạt Điều Rang Muối F07',
      slug: 'hat-dieu-rang-muoi-f07',
      price: 120000,
      brand: brand._id,
      category: category._id,
      stock: 50,
      instock: true,
      ownerId: merchant._id,
      rating: 4.8,
      reviewCount: 20,
      images: [{ url: '/assets/sample-cashew.jpg', public_id: 'sample-f07-p1' }],
      description: '<p>Hạt điều rang muối hữu cơ thơm ngon giàu dinh dưỡng của TotMart Organic.</p>',
    });

    const product2 = await Product.create({
      productId: 'F07-P02',
      name: 'Trà Xanh Oolong F07',
      slug: 'tra-xanh-oolong-f07',
      price: 85000,
      brand: brand._id,
      category: category._id,
      stock: 30,
      instock: true,
      ownerId: merchant._id,
      rating: null,
      reviewCount: null,
      images: [{ url: '/assets/sample-tea.jpg', public_id: 'sample-f07-p2' }],
      description: '<p>Trà Oolong thượng hạng F07.</p>',
    });

    // 24 more products to provide multi-page catalog (total 26 items)
    for (let i = 3; i <= 26; i++) {
      await Product.create({
        productId: `F07-P${i < 10 ? '0' + i : i}`,
        name: `Sản Phẩm Hữu Cơ TotMart Số ${i}`,
        slug: `san-pham-totmart-so-${i}-f07`,
        price: 50000 + i * 5000,
        brand: brand._id,
        category: category._id,
        stock: 15 + i,
        instock: true,
        ownerId: merchant._id,
        rating: 4.0 + (i % 10) * 0.1,
        reviewCount: i,
        images: [{ url: '/assets/sample-cashew.jpg', public_id: `sample-f07-p${i}` }],
        description: `<p>Mô tả chi tiết sản phẩm số ${i} TotMart hữu cơ chất lượng cao.</p>`,
      });
    }

    // 4. Box / Combo
    const box = await Box.create({
      name: 'Hộp Quà Sung Túc F07',
      slug: 'hop-qua-sung-tuc-f07',
      ownerId: merchant._id,
      descriptions: 'Hộp quà cao cấp hạt điều và trà F07',
      products: [{ productId: product._id, quantity: 1, price: 120000, name: product.name }],
      totalItem: 1,
      price: 120000,
      value: 120000,
      stock: 20,
      validFrom: new Date('2026-01-01'),
      validTo: new Date('2030-01-01'),
      images: [{ url: '/assets/sample-gift.jpg', public_id: 'sample-f07-box' }],
    });

    // 5. Subscription Template
    const subTemplate = await SubscriptionTemplate.create({
      name: 'Gói Định Kỳ Hàng Tháng F07',
      boxId: box._id,
      ownerId: merchant._id,
      planType: '1_month',
      basePrice: 120000,
      discountPercent: 0,
      discountPrice: 120000,
      isActive: true,
    });

    // 6. Coupon
    const coupon = await fixture.createCoupon({
      code: 'F07DISCOUNT',
      discountPercent: 10,
      minOrderValue: 50000,
    });

    const initialStock = product.stock;

    // Connect to Redis if configured
    const redisModule = be(path.join(root, 'src/config/redis'));
    if (redisModule.enabled()) {
      try {
        await redisModule.startRedis();
        console.log('[F07 Fixture] Connected to Redis at', process.env.REDIS_URL);
      } catch (rErr) {
        console.warn('[F07 Fixture] Redis start notice:', rErr.message);
      }
    }

    // Test Server wrapping Express app + Fixture Observation Endpoints
    server = http.createServer(async (req, res) => {
      // 503 simulation for testing safe error handling
      if (simulate503 && req.url.startsWith('/api/') && !req.url.includes('/__fixture')) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: false,
            status: 503,
            message: 'Hệ thống tạm thời bận. Vui lòng thử lại sau.',
            requestId: 'req-f07-503-test',
          })
        );
        return;
      }

      // 1. Fixture Evidence Endpoint
      if (req.method === 'GET' && req.url === '/__fixture/evidence') {
        try {
          const transactions = await Checkout.find({ userId: customer._id })
            .select('requestKey kind result.orderCode status')
            .lean();
          const cart = await Cart.findOne({ userId: customer._id, isSubscribeCart: false }).lean();
          const currentProd = await Product.findById(product._id).lean();
          const currentCoupon = await Coupon.findById(coupon._id).lean();
          const subCount = await Subscription.countDocuments({ userId: customer._id });
          const boxesCount = await Box.countDocuments();
          const usersCount = await User.countDocuments();

          const data = {
            transactions: transactions.map((x) => ({
              key: x.requestKey,
              kind: x.kind,
              code: x.result?.orderCode,
              status: x.status,
            })),
            stock: currentProd?.stock ?? 0,
            cart: cart?.items?.map((x) => ({ quantity: x.quantity })) || [],
            subscriptions: subCount,
            couponUsage: currentCoupon?.usedCount ?? 0,
            boxesCount,
            usersCount,
          };

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      // 2. Toggle 503 Simulation
      if (req.method === 'POST' && req.url === '/__fixture/simulate-503') {
        let body = '';
        req.on('data', (c) => (body += c));
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body || '{}');
            simulate503 = !!parsed.enable;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ simulate503 }));
          } catch {
            res.writeHead(400);
            res.end('{}');
          }
        });
        return;
      }

      // 3. Reset DB State (for repeat runs)
      if (req.method === 'POST' && req.url === '/__fixture/reset-db-state') {
        try {
          await Product.findByIdAndUpdate(product._id, { stock: initialStock });
          await Coupon.findByIdAndUpdate(coupon._id, { usedCount: 0 });
          await Cart.deleteMany({ userId: customer._id });
          await Checkout.deleteMany({ userId: customer._id });
          await Subscription.deleteMany({ userId: customer._id });
          await User.findByIdAndUpdate(customer._id, {
            addresses: [
              {
                fullName: 'Customer TotMart',
                country: 'VN',
                city: 'Hồ Chí Minh',
                district: 'Quận 1',
                address: '123 Đường Fixture F07',
                phone: '0900000000',
                isDefault: true,
              },
            ],
          });

          // Reset rate limit counters for loopback test client between iterations (per identityB03 pattern)
          try {
            const { ipKeyGenerator } = be('express-rate-limit');
            const { authLimiter, refreshLimiter, checkoutLimiter } = be(path.join(root, 'src/middleware/rateLimiter'));
            for (const ip of ['127.0.0.1', '::1', '::ffff:127.0.0.1']) {
              if (authLimiter?.resetKey) {
                await authLimiter.resetKey(ip);
                if (ipKeyGenerator) await authLimiter.resetKey(ipKeyGenerator(ip));
              }
              if (refreshLimiter?.resetKey) {
                await refreshLimiter.resetKey(ip);
                if (ipKeyGenerator) await refreshLimiter.resetKey(ipKeyGenerator(ip));
              }
              if (checkoutLimiter?.resetKey) {
                await checkoutLimiter.resetKey(ip);
                if (ipKeyGenerator) await checkoutLimiter.resetKey(ipKeyGenerator(ip));
              }
            }
          } catch (rlErr) {
            // Non-fatal if store is redis or unsupported
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ reset: true, stock: initialStock }));
        } catch (err) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: err.message }));
        }
        return;
      }

      // 4. Fixture Info
      if (req.method === 'GET' && req.url === '/__fixture/f07-info') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            adminEmail: 'admin@f07.example.com',
            merchantEmail: 'merchant@f07.example.com',
            customerEmail: 'customer@f07.example.com',
            customer2Email: 'customer2@f07.example.com',
            customerId: String(customer._id),
            merchantId: String(merchant._id),
            adminId: String(admin._id),
            productId: String(product._id),
            productSlug: product.slug,
            productCanonicalSlug: `${product.slug}-${product._id}`,
            boxId: String(box._id),
            templateId: String(subTemplate._id),
            couponCode: coupon.code,
            adminToken,
            merchantToken,
            customerToken,
          })
        );
        return;
      }

      // 5. Issue Controlled Expired Access Token (for P2-06 two-tab concurrent refresh verification)
      if (req.method === 'GET' && req.url === '/__fixture/issue-expired-access-token') {
        const jwt = be('jsonwebtoken');
        const config = be(path.join(root, 'src/config/environment'));
        const activeSession = await AuthSession.findOne({ userId: customer._id, revokedAt: null }).sort({ _id: -1 });
        const expiredToken = jwt.sign(
          {
            userId: customer._id,
            role: customer.role,
            name: customer.name,
            email: customer.email,
            tokenVersion: customer.tokenVersion || 0,
            sid: activeSession ? activeSession.sessionId : randomUUID(),
          },
          config.jwt.secret,
          { expiresIn: '-10s' }
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ expiredToken, sessionId: activeSession?.sessionId }));
        return;
      }

      // Pass-through to Express BE application
      app(req, res);
    });

    const port = Number(process.env.FE_TEST_API_PORT || 3102);
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
    server.listen(port, '127.0.0.1');
    await new Promise((r) => server.once('listening', r));
    const origin = 'http://127.0.0.1:' + server.address().port;

    console.log(`[F07 Fixture] BE server listening at ${origin}`);

    const runtimeData = {
      origin,
      adminEmail: 'admin@f07.example.com',
      merchantEmail: 'merchant@f07.example.com',
      customerEmail: 'customer@f07.example.com',
      customer2Email: 'customer2@f07.example.com',
      password: 'Fixture-Only-123!',
      adminId: String(admin._id),
      merchantId: String(merchant._id),
      customerId: String(customer._id),
      customer2Id: String(customer2._id),
      productId: String(product._id),
      productSlug: product.slug,
      productCanonicalSlug: `${product.slug}-${product._id}`,
      product2Id: String(product2._id),
      boxId: String(box._id),
      boxSlug: box.slug,
      templateId: String(subTemplate._id),
      couponCode: coupon.code,
      adminToken,
      merchantToken,
      customerToken,
    };

    fs.mkdirSync('.cache', { recursive: true });
    fs.writeFileSync('.cache/f07-runtime.json', JSON.stringify(runtimeData, null, 2));

    if (process.argv.includes('--serve')) {
      console.log('F07 Fixture server is ready for Playwright test.');
      await new Promise((r) => {
        process.once('SIGINT', r);
        process.stdin.once('data', r);
        process.stdin.resume();
      });
      process.stdin.pause();
    }
  } finally {
    if (redisModule?.enabled()) {
      await redisModule.stopRedis().catch(() => {});
    }
    if (server) await new Promise((r) => server.close(r));
    await mongoose.disconnect();
    await repl.stop();
  }
}

main().catch((err) => {
  console.error('[F07 Fixture Error]:', err);
  process.exitCode = 1;
});
