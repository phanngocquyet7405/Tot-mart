const test = require('node:test');
const assert = require('node:assert/strict');
const load = () => import('../src/app/util/cartQuote.mjs');
const id = '507f1f77bcf86cd799439011';
test('cart quote matches gift variants without borrowing another message price', async () => {
  const { matchQuoteLine } = await load();
  const quote = { lines: [{ itemId: id, itemType: 'box', quantity: 3, gift: { wrap: 'none', message: 'A' }, totalPrice: 540000 }, { itemId: id, itemType: 'box', quantity: 3, gift: { wrap: 'none', message: 'B' }, totalPrice: 550000 }] };
  assert.equal(matchQuoteLine({ _id: id, itemType: 'box', quantity: 3, gift: { message: 'B' } }, quote).totalPrice, 550000);
});
test('cart quote distinguishes product and combo with the same ID', async () => {
  const { matchQuoteLine } = await load();
  const quote = { lines: [{ itemId: id, itemType: 'box', quantity: 1, totalPrice: 200000 }] };
  assert.equal(matchQuoteLine({ _id: id, itemType: 'product', quantity: 1 }, quote), undefined);
});
test('cart quote does not apply a stale quantity and preserves zero-price quote', async () => {
  const { matchQuoteLine } = await load();
  const quote = { lines: [{ itemId: id, itemType: 'product', quantity: 1, totalPrice: 0 }] };
  assert.equal(matchQuoteLine({ _id: id, quantity: 2 }, quote), undefined);
  assert.equal(matchQuoteLine({ _id: id, quantity: 1 }, quote).totalPrice, 0);
});
