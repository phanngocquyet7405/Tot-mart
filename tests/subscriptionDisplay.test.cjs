const test = require('node:test'), assert = require('node:assert/strict');
test('prepaid three-month total is divided by deliveries for monthly display', async () => {
  const { normalizeSubscriptionPlans } = await import('../src/app/util/subscriptionDisplay.mjs');
  const result = normalizeSubscriptionPlans([{ boxId: { _id: 'box', value: 100000 }, planType: '3_month', basePrice: 300000, discountPrice: 270000, sourceType: 'retail' }]);
  assert.equal(result[0].value, 100000); assert.equal(result[0].minimumMonthlyPrice, 90000);
});
test('multiple periods select the lowest monthly average without changing prepaid totals', async () => {
  const { normalizeSubscriptionPlans } = await import('../src/app/util/subscriptionDisplay.mjs');
  const plans = [3,6].map(n => ({ boxId: { _id: 'box' }, planType: n + '_month', basePrice: n * 100000, discountPrice: n === 3 ? 270000 : 510000 }));
  const result = normalizeSubscriptionPlans(plans);
  assert.equal(result.length, 1); assert.equal(result[0].minimumMonthlyPrice, 85000); assert.equal(result[0].apiPlans[1].discountPrice, 510000);
});
