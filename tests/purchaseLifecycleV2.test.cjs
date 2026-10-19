const {test} = require('node:test');
const assert = require('node:assert/strict');
const setup = require('./helpers/attemptHarness.cjs');
const fs = require('node:fs'), vm = require('node:vm');
const input = {addressId:'address',paymentMethod:'cod',cartItems:[{_id:'p',quantity:1}]};
const scope = 'totmart_checkout_attempt_recovery-user';
for (const kind of ['products','subscription']) {
  test(`${kind}: terminate before hash sends exact bytes, no prepare or hash header`, async () => {
    const {resolveAttempt} = await import('../src/app/util/attemptLifecycle.mjs');
    const original = {userId:'u',kind,key:'original-reference-123',serializedBody:'{"addressId":"deleted","note":"  unchanged  "}'};
    let saved, calls = [];
    const api = {post:async(...args) => {calls.push(args);return {success:true,data:{key:original.key,hash:'a'.repeat(64),state:'invalidated',canRestart:true}};}};
    assert.equal((await resolveAttempt({attempt:original,kind,api,save:v=>{saved=v;return true;},currentUser:()=> 'u',terminate:true})).invalidated,true);
    assert.deepEqual(calls, [[`/checkout/attempts/${kind}/${original.key}/terminate-with-body`,original.serializedBody,{_requestUserId:'u'}]]);
    assert.equal(saved.serializedBody,original.serializedBody);
  });
  test(`${kind}: lost body termination response retries exact reference after reload`,async()=>{
    const {resolveAttempt}=await import('../src/app/util/attemptLifecycle.mjs');
    const original={userId:'u',key:'original-reference-123',serializedBody:'{"templateId":"unchanged"}'};
    let first=true; const calls=[];
    const run=()=>resolveAttempt({attempt:{...original},kind,currentUser:()=> 'u',save:()=>true,terminate:true,api:{post:async(...args)=>{calls.push(args);if(first){first=false;throw Error('lost');}return {success:true,data:{key:original.key,hash:'a'.repeat(64),state:'invalidated',canRestart:true}};}}});
    await assert.rejects(run(),/lost/);assert.equal((await run()).invalidated,true);assert.deepEqual(calls[0],calls[1]);
  });
}
for (const status of [400,401,403,404,409,429,500]) test(`termination HTTP ${status} never releases original reference`,async()=>{
  const h=setup();const post=h.context.axiosConfig.post;
  h.context.axiosConfig.post=async(...args)=>{if(args[0].endsWith('/prepare'))throw Error('ADDRESS_NOT_FOUND');return post(...args);};
  await h.context.placeOrder(input);const original=h.context.getPendingCheckout();
  h.context.axiosConfig.post=async()=>{throw {response:{status,data:{message:'denied'}}};};
  assert.equal((await h.context.placeOrder({terminate:true})).success,false);
  assert.equal(h.context.getPendingCheckout().key,original.key);
  assert.equal(h.calls.length,0);
});
test('created needs explicit action; second identical cart gets new key and old replay cannot consume it',async()=>{
  const h=setup({loseFirstCreate:false});await h.context.placeOrder(input);await h.context.placeOrder({...input,confirm:true});
  const old=h.context.getPendingCheckout();
  h.context.axiosConfig.get=async()=>({success:true,data:{state:'created',result:{orderCode:'original'}}});
  assert.equal((await h.context.placeOrder(input)).consumeCart,false);
  await h.context.startNewCheckout(old.key);assert.equal(h.context.getPendingCheckout(),null);
  const archive=JSON.parse(h.storage.get(`${scope}:created:${old.key}`));
  assert.equal(archive.hash,old.hash);assert.equal(archive.serializedBody,undefined);assert.equal(archive.payload,undefined);assert.equal(archive.snapshot,undefined);
  await h.context.placeOrder(input);const next=h.context.getPendingCheckout();assert.notEqual(next.key,old.key);
  const replay=await h.context.placeOrder({...input,expectedKey:old.key,confirm:true});
  assert.equal(replay.orderCode,'original');assert.equal(replay.consumeCart,false);assert.equal(h.context.getPendingCheckout().key,next.key);
  assert.equal(h.calls.length,1);
});
test('unknown, processing, rejected and invalidated cannot authorize a new business purchase',async()=>{
  for(const state of ['unknown','processing','rejected','invalidated']){
    const h=setup();await h.context.placeOrder(input);const a=h.context.getPendingCheckout();h.context.storeAttempt(scope,{...a,state});
    await assert.rejects(h.context.startNewCheckout(a.key));assert.equal(h.context.getPendingCheckout().key,a.key);
  }
});
test('archive quota failure keeps active created and all recovery data',async()=>{
  const h=setup({loseFirstCreate:false});await h.context.placeOrder(input);await h.context.placeOrder({...input,confirm:true});const a=h.context.getPendingCheckout();
  h.context.localStorage.setItem=()=>{throw Error('quota');};await assert.rejects(h.context.startNewCheckout(a.key));assert.equal(h.context.getPendingCheckout().key,a.key);
});
test('two confirmations of start-new can release a created reference only once',async()=>{
  const h=setup({loseFirstCreate:false});await h.context.placeOrder(input);await h.context.placeOrder({...input,confirm:true});const a=h.context.getPendingCheckout();
  // A real queue rather than the older harness no-op lock.
  let queue=Promise.resolve();h.context.navigator.locks.request=(_s,fn)=>{const result=queue.then(fn);queue=result.catch(()=>{});return result;};
  const results=await Promise.allSettled([h.context.startNewCheckout(a.key),h.context.startNewCheckout(a.key)]);
  assert.equal(results.filter(x=>x.status==='fulfilled').length,1);
});
test('subscription created can be archived explicitly and a second template gets a new key',async()=>{
  const h=setup({loseFirstCreate:false});h.context.API_ENDPOINTS={SUBSCRIBE_PLANS:{}};
  vm.runInContext(fs.readFileSync('src/app/services/api/subscribePlanService.js','utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,'').replace('const userSubscribeApi =','var userSubscribeApi =').replace('const startNewSubscription =','var startNewSubscription ='),h.context);
  await h.context.userSubscribeApi({templateId:'first'});await h.context.userSubscribeApi({}, {resume:true,confirm:true});
  const old=h.context.readSubscriptionAttempt('totmart_subscription_attempt_recovery-user');await h.context.startNewSubscription(old.key);
  await h.context.userSubscribeApi({templateId:'second'});const next=h.context.readSubscriptionAttempt('totmart_subscription_attempt_recovery-user');
  assert.notEqual(next.key,old.key);assert.equal(next.payload.templateId,'second');
});
test('account change while waiting for Web Lock sends no cart sync or attempt request',async()=>{
  const h=setup();h.context.navigator.locks.request=async(_s,fn)=>{h.context.getTokenUserId=()=> 'new-account';return fn();};
  assert.equal((await h.context.placeOrder(input)).success,false);assert.equal(h.sync.length,0);assert.equal(h.http.length,0);
});
test('invalid new input is rejected before persisting an immutable attempt',async()=>{
  const h=setup();assert.equal((await h.context.placeOrder({...input,note:'x'.repeat(501)})).success,false);
  assert.equal(h.context.getPendingCheckout(),null);assert.equal(h.sync.length,0);assert.equal(h.http.length,0);
});
test('lost body termination persists intent so ordinary recovery retries termination rather than prepare',async()=>{
  const {resolveAttempt}=await import('../src/app/util/attemptLifecycle.mjs');let attempt={userId:'u',key:'original-reference-123',serializedBody:'{"addressId":"deleted"}'};
  const urls=[];let first=true;const api={post:async url=>{urls.push(url);if(first){first=false;throw Error('lost');}return {success:true,data:{key:attempt.key,hash:'a'.repeat(64),state:'invalidated',canRestart:true}};}};
  const run=terminate=>resolveAttempt({attempt,kind:'products',api,save:v=>{attempt=v;return true;},currentUser:()=> 'u',terminate});
  await assert.rejects(run(true),/lost/);assert.equal(attempt.terminationRequested,true);assert.equal((await run(false)).invalidated,true);assert.equal(urls[0],urls[1]);assert.match(urls[1],/terminate-with-body$/);
});
