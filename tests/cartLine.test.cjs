const test = require('node:test');
const assert = require('node:assert/strict');
test('cart identities distinguish product, box and gift options', async () => {
  const {cartLineKey, toCartPayload} = await import('../src/app/util/cartLine.mjs');
  const id='507f1f77bcf86cd799439011';
  const product={_id:id,itemType:'product',quantity:2};
  const box={_id:id,itemType:'box',quantity:2,gift:{wrap:'classic',message:'Happy birthday'}};
  assert.notEqual(cartLineKey(product),cartLineKey(box));
  assert.notEqual(cartLineKey(box),cartLineKey({...box,gift:{wrap:'classic',message:'Another message'}}));
  assert.deepEqual(toCartPayload([box])[0],{boxId:id,quantity:2,gift:{wrap:'classic',message:'Happy birthday'}});
});

