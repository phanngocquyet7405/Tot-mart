const {test}=require('node:test');
const assert=require('node:assert/strict');
const setup=require('./helpers/attemptHarness.cjs');
const input={addressId:'address',paymentMethod:'online',cartItems:[{_id:'p',quantity:1}]};
test('prepare never creates; explicit confirmation sends identical serialized bytes and key',async()=>{
 const h=setup({loseFirstCreate:false});
 assert.equal((await h.context.placeOrder(input)).prepared,true);assert.equal(h.calls.length,0);
 const frozen=h.context.getPendingCheckout();
 const response=await h.context.placeOrder({...input,addressId:'different',confirm:true});
 assert.equal(response.orderCode,'original');assert.equal(h.calls[0].payload.addressId,'address');
 assert.equal(h.calls[0].key,frozen.key);assert.equal(h.context.getPendingCheckout().state,'created');
 assert.equal(h.http.find(x=>x.url.endsWith('/prepare')).body,frozen.serializedBody);
});
test('unknown and 404 never unlock; only confirmed invalidation removes reference',async()=>{
 const h=setup();await h.context.placeOrder(input);
 h.context.axiosConfig.get=async()=>({success:true,data:{state:'unknown',canRestart:false}});
 await h.context.placeOrder(input);assert.ok(h.context.getPendingCheckout());
 h.context.axiosConfig.post=async()=>{throw {response:{status:404,data:{message:'missing'}}};};
 await h.context.placeOrder({terminate:true});assert.ok(h.context.getPendingCheckout());
 h.context.axiosConfig.post=async()=>({success:true,data:{state:'invalidated',canRestart:false}});
 await h.context.placeOrder({terminate:true});assert.ok(h.context.getPendingCheckout());
 h.context.axiosConfig.post=async()=>({success:true,data:{state:'invalidated',canRestart:true}});
 await h.context.placeOrder({terminate:true});assert.equal(h.context.getPendingCheckout(),null);
});
test('25 hour old attempt with body remains recoverable without a new key',async()=>{
 const h=setup();await h.context.placeOrder(input);const old=h.context.getPendingCheckout();
 h.context.storeAttempt('totmart_checkout_attempt_recovery-user',{...old,sentAt:Date.now()-25*3600000});
 await h.context.placeOrder(input);assert.equal(h.context.getPendingCheckout().key,old.key);
 assert.equal(h.context.needsReconciliation(old),false);
});
test('account switch while prepare is in flight cannot send create or persist into another account',async()=>{
 const h=setup();const post=h.context.axiosConfig.post;
 h.context.axiosConfig.post=async(...args)=>{const result=await post(...args);if(args[0].endsWith('/prepare'))h.context.getTokenUserId=()=> 'other';return result;};
 const result=await h.context.placeOrder(input);assert.equal(result.success,false);assert.equal(h.calls.length,0);
 h.context.getTokenUserId=()=> 'recovery-user';assert.ok(h.context.getPendingCheckout());
});
test('created lookup recovers payment code without another create',async()=>{
 const h=setup();await h.context.placeOrder(input);
 h.context.axiosConfig.get=async()=>({success:true,data:{state:'created',canRestart:false,result:{orderCode:'existing'}}});
 const recovered=await h.context.placeOrder({...input,cartItems:[{_id:'new-product',quantity:1}]});
 assert.equal(recovered.orderCode,'existing');assert.equal(recovered.consumeCart,false);assert.equal(h.calls.length,0);
});
test('reload reads updates from shared storage rather than stale memory',async()=>{
 const storage=new Map(),a=setup({storage}),b=setup({storage});
 await a.context.placeOrder(input);const first=a.context.getPendingCheckout();
 b.context.storeAttempt('totmart_checkout_attempt_recovery-user',{...first,state:'created',result:{orderCode:'tab-b'}});
 assert.equal(a.context.getPendingCheckout().result.orderCode,'tab-b');
});
test('corrupt stored attempt blocks allocation and is preserved byte for byte',async()=>{
 const storage=new Map([['totmart_checkout_attempt_recovery-user','{broken']]);const h=setup({storage});
 assert.equal((await h.context.placeOrder(input)).success,false);assert.equal(h.calls.length,0);assert.equal(h.sync.length,0);
 assert.equal(storage.get('totmart_checkout_attempt_recovery-user'),'{broken');
});
test('hash without body still recovers a committed transaction by lookup',async()=>{
 const h=setup();h.context.storeAttempt('totmart_checkout_attempt_recovery-user',{userId:'recovery-user',key:'legacy-reference-123456',hash:'a'.repeat(64)});
 h.context.axiosConfig.get=async()=>({success:true,data:{state:'created',result:{orderCode:'recovered'}}});
 const response=await h.context.placeOrder({});assert.equal(response.orderCode,'recovered');assert.equal(h.calls.length,0);
});
test('lost prepare response retries the original serialized body and key',async()=>{
 const h=setup();const post=h.context.axiosConfig.post;let lost=true;
 h.context.axiosConfig.post=async(...args)=>{const response=await post(...args);if(args[0].endsWith('/prepare')&&lost){lost=false;throw Error('lost prepare');}return response;};
 await h.context.placeOrder(input);const original=h.context.getPendingCheckout();assert.equal(original.hash,undefined);
 await h.context.placeOrder({...input,addressId:'changed'});
 const prepares=h.http.filter(x=>x.url.endsWith('/prepare'));assert.equal(prepares.length,2);assert.equal(prepares[0].body,prepares[1].body);assert.equal(prepares[1].options.headers['Idempotency-Key'],original.key);assert.equal(h.calls.length,0);
});
test('lost terminate response keeps reference until lookup confirms tombstone',async()=>{
 const h=setup();await h.context.placeOrder(input);let terminated=false;const post=h.context.axiosConfig.post;
 h.context.axiosConfig.post=async(...args)=>{if(args[0].endsWith('/terminate')){terminated=true;throw Error('lost terminate');}return post(...args);};
 await h.context.placeOrder({terminate:true});assert.ok(h.context.getPendingCheckout());
 h.context.axiosConfig.get=async()=>({success:true,data:{state:terminated?'invalidated':'processing',canRestart:terminated}});
 assert.equal((await h.context.placeOrder({})).invalidated,true);assert.equal(h.context.getPendingCheckout(),null);
});
