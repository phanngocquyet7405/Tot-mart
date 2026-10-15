const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function service(client) {
  const source = fs.readFileSync(require.resolve('../src/app/manager/services/managerApi.js'), 'utf8')
    .replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
  const context = vm.createContext({ axiosConfig: client, FormData, Number, String, Date, encodeURIComponent });
  vm.runInContext(`${source}\nthis.api = {saveManagerForm,listManagerProducts,getManagerCatalogOptions,adjustManagerProductStock,deleteManagerProduct};`, context);
  return context.api;
}
const draft = { name: 'Sản phẩm', description: 'Mô tả', brand: 'brand-id', category: 'category-id', price: '120000', stock: '5', products: [] };

test('manager edit normalizes populated and raw catalog IDs; rejects names or foreign IDs', async () => {
  const { productDraft, validateProduct } = await import('../src/app/manager/lib/productModel.mjs');
  const options = { brands: [{ _id: 'brand-id', name: 'Thương hiệu' }], categories: [{ _id: 'category-id' }] };
  const form = productDraft({ ...draft, brand: { _id: 'brand-id', name: 'Thương hiệu' } });
  assert.equal(form.brand, 'brand-id'); assert.equal(form.category, 'category-id');
  assert.deepEqual(validateProduct(form, options, true), {});
  assert.ok(validateProduct({ ...form, brand: 'Thương hiệu' }, options, true).brand);
  assert.ok(validateProduct({ ...form, category: 'another-merchant-id' }, options, true).category);
  assert.ok(validateProduct({ ...form, stock: 1.5 }, options, false).stock);
  assert.ok(validateProduct({ ...form, price: '' }, options, true).price);
  assert.ok(validateProduct({ ...form, price: 0 }, options, true).price);
  assert.ok(validateProduct({ ...form, name: 'ab' }, options, true).name);
  assert.ok(validateProduct({ ...form, description: 'x'.repeat(501) }, options, true).description);
});

test('manager validates the backend upload and stock limits', async () => {
  const { validateProductImages, validStockAdjustment } = await import('../src/app/manager/lib/productModel.mjs');
  const image = { name:'product.jpg', type:'image/jpeg', size:2*1024*1024 };
  assert.equal(validateProductImages([image]), '');
  assert.ok(validateProductImages(Array(11).fill(image)));
  assert.ok(validateProductImages([{...image,size:image.size+1}]));
  assert.ok(validateProductImages([{...image,name:'product.gif'}]));
  assert.equal(validStockAdjustment(-5, 5, ''), true);
  for (const delta of [0, 1.5, -6, 1000001]) assert.equal(validStockAdjustment(delta, 5, ''), false);
  assert.equal(validStockAdjustment(1, 5, 'x'.repeat(201)), false);
});

test('manager create sends real IDs, numeric values and image multipart; edit never overwrites stock', async () => {
  const calls = [];
  const client = Object.fromEntries(['post','put'].map(method => [method, async (url, body, config) => { calls.push({method,url,body,config}); return {success:true}; }]));
  const api = service(client);
  const image = new File(['image-bytes'], 'product.png', {type:'image/png'});
  await api.saveManagerForm({tab:'products',form:draft,editing:null,images:[image]});
  assert.equal(calls[0].url, '/manager/products'); assert.equal(calls[0].method, 'post');
  assert.equal(calls[0].body.get('brand'), 'brand-id'); assert.equal(calls[0].body.get('category'), 'category-id');
  assert.equal(calls[0].body.get('stock'), '5'); assert.equal(calls[0].body.get('price'), '120000');
  assert.equal(calls[0].body.get('images').name, 'product.png');
  assert.equal(calls[0].config.headers['Content-Type'], undefined);
  await api.saveManagerForm({tab:'products',form:draft,editing:'product-id',images:[]});
  assert.equal(calls[1].url, '/manager/products/product-id'); assert.equal(calls[1].method, 'put');
  assert.equal(calls[1].body.has('stock'), false);
});

test('manager list, catalog, delta and delete stay within merchant endpoints', async () => {
  const calls = [];
  const client = Object.fromEntries(['get','patch','delete'].map(method => [method, async (url, data) => { calls.push({method,url,data}); return {success:true}; }]));
  const api = service(client);
  const controller = new AbortController();
  await api.listManagerProducts({page:2,keyword:'trà & quà',brand:'brand-id',category:'category-id',minPrice:'10000',maxPrice:'200000',signal:controller.signal});
  assert.equal(calls[0].url, '/manager/products');
  assert.equal(calls[0].data.params.page, 2); assert.equal(calls[0].data.params.keyword, 'trà & quà'); assert.equal(calls[0].data.signal, controller.signal);
  assert.equal(calls[0].data.params.brand,'brand-id');assert.equal(calls[0].data.params.category,'category-id');assert.equal(calls[0].data.params.minPrice,'10000');assert.equal(calls[0].data.params.maxPrice,'200000');
  await api.getManagerCatalogOptions(); assert.equal(calls[1].url, '/manager/catalog-options');
  await api.adjustManagerProductStock('product-id', -2, 'Hỏng');
  assert.equal(calls[2].url, '/manager/products/product-id/stock');
  assert.equal(calls[2].data.delta, -2); assert.equal(calls[2].data.reason, 'Hỏng');
  await api.deleteManagerProduct('product-id'); assert.equal(calls[3].url, '/manager/products/product-id');
});

test('manager mutations propagate backend failures and do not resolve before confirmation', async () => {
  let complete;
  const pending = new Promise(resolve => { complete = resolve; });
  const api = service({post: () => pending, patch: async () => ({success:false,message:'Không đủ quyền'}), delete: async () => { throw new Error('Network error'); }});
  let finished = false;
  const saving = api.saveManagerForm({tab:'products',form:draft,editing:null,images:[]}).then(() => { finished = true; });
  await Promise.resolve(); assert.equal(finished, false);
  complete({success:true}); await saving; assert.equal(finished, true);
  await assert.rejects(api.adjustManagerProductStock('p', 1, ''), /Không đủ quyền/);
  await assert.rejects(api.deleteManagerProduct('p'), /Network error/);
});
