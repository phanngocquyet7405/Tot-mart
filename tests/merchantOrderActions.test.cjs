const test = require('node:test'), assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const { pathToFileURL } = require('node:url');
test('merchant UI uses server capabilities, falls back to read-only, never offers finance actions', async () => {
  const { managerOrderActions } = await import(pathToFileURL(require.resolve('../src/app/manager/lib/orderActions.mjs')).href);
  assert.deepEqual(managerOrderActions({ status:'processing' }), []);
  assert.deepEqual(managerOrderActions({ allowedTransitions:'shipped' }), []);
  assert.deepEqual(managerOrderActions({ allowedTransitions:['shipped','cancelled','paid','refund','shipped'] }), [{ status:'shipped', label:'Bắt đầu giao' }]);
});
test('COD delivery UI explicitly says payment remains pending admin reconciliation', async () => {
  const { orderActionMessage } = await import(pathToFileURL(require.resolve('../src/app/manager/lib/orderActions.mjs')).href);
  assert.match(orderActionMessage({ paymentMethod:'cod' },'delivered'), /không đánh dấu đã thanh toán/);
});
test('admin delivered COD with pending payment offers the dedicated financial action', () => {
  const source = fs.readFileSync(require.resolve('../src/app/(admin)/admin-orders/services/ordersAdminService.js'),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
  const context = vm.createContext({ orderService:{}, parseApiResponse:()=>[], parseApiItem:x=>x });
  vm.runInContext(source,context);
  const options = context.getNextStatusOptions({ status:'delivered', paymentMethod:'cod', paymentStatus:'pending' });
  assert.equal(options.length,1); assert.equal(options[0].action,'mark-cod-delivered');
  assert.equal(context.getNextStatusOptions({ status:'delivered', paymentMethod:'cod', paymentStatus:'paid' }).length,0);
  assert.equal(context.getNextStatusOptions({ status:'delivered', paymentMethod:'online', paymentStatus:'paid' }).length,0);
});
