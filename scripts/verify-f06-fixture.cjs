// Fixture and API runner for Phase F06 verification.
// Uses disposable MongoDB replica set, BE-pinned read-only source.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const { createRequire } = require('node:module');
const { randomUUID, randomBytes } = require('node:crypto');

const root = process.env.TOTMART_BE_ROOT || process.argv[2] || 'C:/Users/84862/Desktop/totmart/be-pinned';
if (!root || !path.isAbsolute(root)) throw new Error('Supply absolute BE source path');
const be = createRequire(path.join(root, 'package.json'));

be('dotenv').config = () => ({ parsed: {} });
const SEPAY_KEY = 'f06-local-fixture-key';
Object.assign(process.env, {
  NODE_ENV: 'test',
  MONGODB_URI: 'mongodb://127.0.0.1:1/unused',
  REDIS_URL: '',
  REDIS_NAMESPACE: 'totmart:f06:' + randomUUID(),
  JWT_SECRET: randomBytes(32).toString('hex'),
  JWT_REFRESH_SECRET: randomBytes(32).toString('hex'),
  FRONTEND_URL: process.env.FE_TEST_ORIGIN || 'http://localhost:3217',
  CORS_ORIGINS: process.env.FE_TEST_ORIGIN || 'http://localhost:3217',
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

let simulateProducts500 = false;

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
    await mongoose.connect(repl.getUri('fe_f06_' + randomUUID().replaceAll('-', '')));
    await Promise.all(Object.values(mongoose.models).map((m) => m.init()));

    const User = be(path.join(root, 'src/models/User'));
    const Category = be(path.join(root, 'src/models/Category'));
    const Brand = be(path.join(root, 'src/models/Brand'));
    const Product = be(path.join(root, 'src/models/Product'));
    const Box = be(path.join(root, 'src/models/Box'));
    const Order = be(path.join(root, 'src/models/Order'));
    const Checkout = be(path.join(root, 'src/models/Checkout'));
    const Coupon = be(path.join(root, 'src/models/Coupon'));

    // 1. Create Users
    const { user: admin } = await fixture.createUser({
      name: 'F06 Admin',
      email: 'admin@f06.example.com',
      password: 'Fixture-Only-123!',
      role: 'admin',
    });
    const { user: merchantA } = await fixture.createUser({
      name: 'Merchant A (TotMart)',
      email: 'merchanta@f06.example.com',
      password: 'Fixture-Only-123!',
      role: 'merchant',
    });
    const { user: merchantB } = await fixture.createUser({
      name: 'Merchant B (Other)',
      email: 'merchantb@f06.example.com',
      password: 'Fixture-Only-123!',
      role: 'merchant',
    });
    const { user: customer } = await fixture.createUser({
      name: 'F06 Customer',
      email: 'customer@f06.example.com',
      password: 'Fixture-Only-123!',
      role: 'user',
    });

    // 2. Categories & Brands
    const catSnacks = await Category.create({ name: 'Snacks & Nuts' });
    const catBeverages = await Category.create({ name: 'Organic Beverages' });

    const brandA = await fixture.createBrand({ name: 'TotMart Organic', ownerId: merchantA._id });
    const brandB = await fixture.createBrand({ name: 'Green Valley', ownerId: merchantB._id });

    // 3. Products for Merchant A (26 products for >= 3 pages at 12/page)
    const productsA = [];
    // Product 1: normal, high rating
    const p1 = await Product.create({
      productId: 'F06-P01',
      name: 'Hạt Điều Rang Muối Vỏ Lụa Hữu Cơ',
      slug: 'hat-dieu-rang-muoi-f06',
      price: 120000,
      brand: brandA._id,
      category: catSnacks._id,
      stock: 50,
      instock: true,
      ownerId: merchantA._id,
      rating: 4.8,
      reviewCount: 35,
      images: [{ url: '/assets/sample-cashew.jpg', public_id: 'sample-p1' }],
      description: '<p>Hạt điều rang muối hữu cơ thơm ngon giàu dinh dưỡng.</p>',
    });
    productsA.push(p1);

    // Product 2: no rating / reviewCount
    const p2 = await Product.create({
      productId: 'F06-P02',
      name: 'Trà Xanh Oolong Cao Cấp Không Đánh Giá',
      slug: 'tra-xanh-oolong-f06',
      price: 85000,
      brand: brandA._id,
      category: catBeverages._id,
      stock: 40,
      instock: true,
      ownerId: merchantA._id,
      rating: null,
      reviewCount: null,
      images: [{ url: '/assets/sample-tea.jpg', public_id: 'sample-p2' }],
      description: '<p>Trà Oolong tinh khiết chọn lọc từ búp trà non.</p>',
    });
    productsA.push(p2);

    // Product 3: stock = 0
    const p3 = await Product.create({
      productId: 'F06-P03',
      name: 'Hạt Hạnh Nhân Tự Nhiên Hết Hàng',
      slug: 'hat-hanh-nhan-het-hang-f06',
      price: 160000,
      brand: brandA._id,
      category: catSnacks._id,
      stock: 0,
      instock: false,
      ownerId: merchantA._id,
      rating: 4.5,
      reviewCount: 12,
      images: [{ url: '/assets/sample-almond.jpg', public_id: 'sample-p3' }],
    });
    productsA.push(p3);

    // Product 4: price = 0 (inserted directly to collection bypassing Mongoose min:1 to test FE legacy zero-price handling)
    const p4Id = new mongoose.Types.ObjectId();
    await Product.collection.insertOne({
      _id: p4Id,
      productId: 'F06-P04',
      name: 'Sản Phẩm Chưa Định Giá Zero Price',
      slug: 'san-pham-chua-dinh-gia-f06',
      price: 0,
      brand: brandA._id,
      category: catSnacks._id,
      stock: 10,
      instock: true,
      ownerId: merchantA._id,
      images: [{ url: '/assets/sample-free.jpg', public_id: 'sample-p4' }],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const p4 = await Product.findById(p4Id);
    productsA.push(p4);

    // Product 5: broken image
    const p5 = await Product.create({
      productId: 'F06-P05',
      name: 'Nho Khô Ninh Thuận Ảnh Lỗi',
      slug: 'nho-kho-anh-loi-f06',
      price: 95000,
      brand: brandA._id,
      category: catSnacks._id,
      stock: 20,
      instock: true,
      ownerId: merchantA._id,
      rating: 4.0,
      reviewCount: 5,
      images: [{ url: 'http://127.0.0.1:59999/non-existent-image-404.jpg', public_id: 'sample-p5' }],
    });
    productsA.push(p5);

    // 21 more products for pagination
    for (let i = 6; i <= 26; i++) {
      const p = await Product.create({
        productId: `F06-P${i < 10 ? '0' + i : i}`,
        name: `Sản Phẩm Hữu Cơ TotMart Số ${i}`,
        slug: `san-pham-totmart-so-${i}-f06`,
        price: 50000 + i * 5000,
        brand: brandA._id,
        category: i % 2 === 0 ? catSnacks._id : catBeverages._id,
        stock: 15 + i,
        instock: true,
        ownerId: merchantA._id,
        rating: 4.2,
        reviewCount: i,
        images: [{ url: '/assets/sample-item.jpg', public_id: `sample-p${i}` }],
      });
      productsA.push(p);
    }

    // 4. Products for Merchant B
    const pB1 = await Product.create({
      productId: 'F06-PB1',
      name: 'Sản Phẩm Độc Quyền Của Merchant B',
      slug: 'san-pham-merchant-b-f06',
      price: 250000,
      brand: brandB._id,
      category: catSnacks._id,
      stock: 30,
      instock: true,
      ownerId: merchantB._id,
    });

    // 5. Combos and Gift Boxes
    // Combo A1 (Merchant A)
    const comboA1 = await Box.create({
      ownerId: merchantA._id,
      name: 'Combo Quà Tặng Năng Lượng Hữu Cơ',
      stock: 20,
      descriptions: 'Combo đầy năng lượng với hạt điều và trà oolong hảo hạng.',
      validFrom: new Date('2026-01-01'),
      validTo: new Date('2030-01-01'),
      products: [
        { productId: p1._id, quantity: 2, price: 120000, name: p1.name },
        { productId: p2._id, quantity: 1, price: 85000, name: p2.name },
      ],
      totalItem: 3,
      value: 325000,
      images: [{ url: '/assets/sample-combo.jpg', public_id: 'combo-a1' }],
      isGift: false,
      discountPercent: 10,
    });

    // Gift A1 (created from Combo A1, with giftPolicy)
    const giftA1 = await Box.create({
      ownerId: merchantA._id,
      name: 'Hộp Quà Sang Trọng TotMart',
      sourceComboId: comboA1._id,
      sourceComboVersion: 1,
      stock: 15,
      descriptions: 'Hộp quà cao cấp với chính sách ưu đãi theo số lượng.',
      validFrom: new Date('2026-01-01'),
      validTo: new Date('2030-01-01'),
      products: comboA1.products,
      totalItem: 3,
      value: 325000,
      images: [{ url: '/assets/sample-gift.jpg', public_id: 'gift-a1' }],
      isGift: true,
      giftPolicy: {
        bulkTiers: [{ minQuantity: 3, percent: 10 }],
        amenities: [{ name: 'Thiệp viết tay thủ công', fee: 5000 }],
      },
    });

    // Combo B1 (Merchant B)
    const comboB1 = await Box.create({
      ownerId: merchantB._id,
      name: 'Combo Riêng Biệt Merchant B',
      stock: 10,
      descriptions: 'Combo thuộc quyền sở hữu độc quyền của Merchant B.',
      validFrom: new Date('2026-01-01'),
      validTo: new Date('2030-01-01'),
      products: [{ productId: pB1._id, quantity: 1, price: 250000, name: pB1.name }],
      totalItem: 1,
      value: 250000,
      images: [{ url: '/assets/sample-b.jpg', public_id: 'combo-b1' }],
      isGift: false,
    });

    // 6. Pre-created orders for status tests
    // Cancelled Order
    const codeCancelled = 'F06-CANCELLED-99';
    await Order.create({
      orderId: 'ORD-CANCELLED-99',
      paymentCode: codeCancelled,
      userId: customer._id,
      merchantId: merchantA._id,
      status: 'cancelled',
      paymentStatus: 'pending',
      totalAmount: 120000,
      paymentMethod: 'online',
      products: [{ productId: p1._id, name: p1.name, unitPrice: 120000, quantity: 1, totalPrice: 120000 }],
    });
    await Checkout.create({
      userId: customer._id,
      paymentCode: codeCancelled,
      requestKey: randomUUID(),
      requestHash: 'a'.repeat(64),
      kind: 'products',
      state: 'cancelled',
      totalAmount: 120000,
      paymentMethod: 'online',
      paymentLedgerVersion: 2,
      expiresAt: new Date(Date.now() + 86400000),
      result: { orderCode: codeCancelled },
    });

    // Expired Order
    const codeExpired = 'F06-EXPIRED-88';
    await Order.create({
      orderId: 'ORD-EXPIRED-88',
      paymentCode: codeExpired,
      userId: customer._id,
      merchantId: merchantA._id,
      status: 'pending',
      paymentStatus: 'pending',
      totalAmount: 85000,
      paymentMethod: 'online',
      products: [{ productId: p2._id, name: p2.name, unitPrice: 85000, quantity: 1, totalPrice: 85000 }],
    });
    await Checkout.create({
      userId: customer._id,
      paymentCode: codeExpired,
      requestKey: randomUUID(),
      requestHash: 'b'.repeat(64),
      kind: 'products',
      state: 'pending',
      totalAmount: 85000,
      paymentMethod: 'online',
      paymentLedgerVersion: 2,
      expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
      result: { orderCode: codeExpired },
    });

    // On-hold Order
    const codeOnHold = 'F06-ONHOLD-77';
    await Order.create({
      orderId: 'ORD-ONHOLD-77',
      paymentCode: codeOnHold,
      userId: customer._id,
      merchantId: merchantA._id,
      status: 'on_hold',
      paymentStatus: 'paid',
      totalAmount: 120000,
      paymentMethod: 'online',
      stockDeducted: false,
      products: [{ productId: p1._id, name: p1.name, unitPrice: 120000, quantity: 1, totalPrice: 120000 }],
    });
    await Checkout.create({
      userId: customer._id,
      paymentCode: codeOnHold,
      requestKey: randomUUID(),
      requestHash: 'c'.repeat(64),
      kind: 'products',
      state: 'pending',
      totalAmount: 120000,
      paymentMethod: 'online',
      paymentLedgerVersion: 2,
      receivedAmount: 120000,
      expiresAt: new Date(Date.now() + 86400000),
      result: { orderCode: codeOnHold },
    });

    // Coupon
    await Coupon.create({
      code: 'F06DISCOUNT',
      discount: 10,
      discountType: 'percentage',
      minOrderValue: 0,
      isActive: true,
      startDate: new Date('2026-01-01'),
      expiresAt: new Date('2030-01-01'),
    });

    // 7. HTTP Server wrapping BE
    server = http.createServer(async (req, res) => {
      // Test endpoints
      if (req.method === 'GET' && req.url === '/__fixture/f06-info') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            adminId: String(admin._id),
            merchantAId: String(merchantA._id),
            merchantBId: String(merchantB._id),
            customerId: String(customer._id),
            adminToken: fixture.signToken(admin),
            merchantAToken: fixture.signToken(merchantA),
            merchantBToken: fixture.signToken(merchantB),
            customerToken: fixture.signToken(customer),
            p1Id: String(p1._id),
            p1Slug: p1.slug,
            p2Id: String(p2._id),
            p3Id: String(p3._id),
            p4Id: String(p4._id),
            p5Id: String(p5._id),
            pB1Id: String(pB1._id),
            comboA1Id: String(comboA1._id),
            comboB1Id: String(comboB1._id),
            giftA1Id: String(giftA1._id),
            codeCancelled,
            codeExpired,
            codeOnHold,
          }),
        );
        return;
      }

      if (req.method === 'GET' && req.url === '/__fixture/db-snapshot') {
        const pB = await Product.findById(pB1._id).lean();
        const cB = await Box.findById(comboB1._id).lean();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ productB: pB, comboB: cB }));
        return;
      }

      if (req.method === 'POST' && req.url === '/__fixture/simulate-500') {
        let body = '';
        req.on('data', (d) => (body += d));
        req.on('end', () => {
          try {
            const data = JSON.parse(body || '{}');
            simulateProducts500 = Boolean(data.enable);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ simulateProducts500 }));
          } catch {
            res.writeHead(400);
            res.end('{}');
          }
        });
        return;
      }

      if (simulateProducts500 && req.url.startsWith('/api/products') && req.method === 'GET') {
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'x-request-id': 'req-f06-catalog-500',
        });
        res.end(
          JSON.stringify({
            success: false,
            status: 500,
            message: 'Lỗi hệ thống. Vui lòng thử lại.',
            requestId: 'req-f06-catalog-500',
          }),
        );
        return;
      }

      // Provide verified rating fixture data for Product 1 to test rating/review presentation
      if (req.method === 'GET' && req.url.includes(`/get-products-by-id/${p1._id}`)) {
        const prod = await Product.findById(p1._id).populate('brand').populate('category').lean();
        if (prod) {
          prod.rating = 4.8;
          prod.reviewCount = 24;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, data: prod }));
          return;
        }
      }

      // Proxy to BE Express app
      app(req, res);
    });

    const port = Number(process.env.FE_TEST_API_PORT || 3102);
    server.listen(port, '127.0.0.1');
    await new Promise((r) => server.once('listening', r));
    const origin = 'http://127.0.0.1:' + server.address().port;

    console.log(`F06 Fixture BE running at ${origin}`);

    const runtimeData = {
      origin,
      adminEmail: 'admin@f06.example.com',
      merchantAEmail: 'merchanta@f06.example.com',
      merchantBEmail: 'merchantb@f06.example.com',
      customerEmail: 'customer@f06.example.com',
      password: 'Fixture-Only-123!',
      adminId: String(admin._id),
      merchantAId: String(merchantA._id),
      merchantBId: String(merchantB._id),
      customerId: String(customer._id),
      p1Id: String(p1._id),
      p1Slug: p1.slug,
      p2Id: String(p2._id),
      p3Id: String(p3._id),
      p4Id: String(p4._id),
      p5Id: String(p5._id),
      pB1Id: String(pB1._id),
      comboA1Id: String(comboA1._id),
      comboB1Id: String(comboB1._id),
      giftA1Id: String(giftA1._id),
      codeCancelled,
      codeExpired,
      codeOnHold,
      sepayApiKey: SEPAY_KEY,
    };

    fs.mkdirSync('.cache', { recursive: true });
    fs.writeFileSync('.cache/f06-runtime.json', JSON.stringify(runtimeData, null, 2));

    if (process.argv.includes('--serve')) {
      console.log('F06 Fixture server is ready for Playwright test.');
      await new Promise((r) => {
        process.once('SIGINT', r);
        process.stdin.once('data', r);
        process.stdin.resume();
      });
      process.stdin.pause();
    }
  } finally {
    if (server) await new Promise((r) => server.close(r));
    await mongoose.disconnect();
    await repl.stop();
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
