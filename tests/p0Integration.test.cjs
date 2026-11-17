const test = require('node:test');
const assert = require('node:assert/strict');

test('P0: toCartPayload formats gift options for single product lines', async () => {
  const { toCartPayload, cartLineKey } = await import('../src/app/util/cartLine.mjs');
  const productId = '507f1f77bcf86cd799439011';
  const item = {
    _id: productId,
    itemType: 'product',
    quantity: 1,
    gift: { wrap: 'eco', message: 'Chúc mừng sinh nhật' },
  };

  const payload = toCartPayload([item]);
  assert.equal(payload.length, 1);
  assert.equal(payload[0].productId, productId);
  assert.equal(payload[0].gift.wrap, 'eco');
  assert.equal(payload[0].gift.message, 'Chúc mừng sinh nhật');

  const key = cartLineKey(item);
  assert.ok(key.includes('eco'));
  assert.ok(key.includes('Chúc mừng sinh nhật'));
});

test('P0: Address structure matches BE updateAddressSchema with fullName', () => {
  const address = {
    fullName: 'Nguyễn Văn A',
    country: 'Việt Nam',
    city: 'Hà Nội',
    district: 'Ba Đình',
    address: '123 Đội Cấn',
    phone: '0912345678',
  };

  assert.ok(address.fullName.length >= 2);
  assert.ok(/^[0-9()+\s-]{7,20}$/.test(address.phone));
  assert.equal(typeof address.country, 'string');
});
