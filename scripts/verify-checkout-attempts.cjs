// Read-only BE source; all writes target a freshly allocated disposable replica set.
const assert = require('node:assert/strict');
const path = require('node:path');
const {createRequire} = require('node:module');
const {randomUUID,randomBytes} = require('node:crypto');
const root = process.env.TOTMART_BE_ROOT || process.argv[2];
if (!root || !path.isAbsolute(root)) throw Error('Supply absolute BE source path');
const be = createRequire(path.join(root,'package.json'));
const gapRedis = process.env.TEST_REDIS_URL || '';
if (gapRedis && !/^redis:\/\/(127\.0\.0\.1|localhost):\d+$/.test(gapRedis)) throw Error('TEST_REDIS_URL must be a dedicated local Redis without credentials');
if (process.argv.includes('--gaps') && !/^redis:\/\/(127\.0\.0\.1|localhost):\d+$/.test(gapRedis || '')) throw Error('--gaps requires dedicated local TEST_REDIS_URL');
if(gapRedis && (!/^http:\/\/localhost:\d+$/.test(process.env.FE_TEST_ORIGIN || '') || !/^\d+$/.test(process.env.FE_TEST_API_PORT || ''))) throw Error('--gaps requires explicit local FE_TEST_ORIGIN and FE_TEST_API_PORT');
be('dotenv').config=()=>({parsed:{}});
Object.assign(process.env,{NODE_ENV:'test',MONGODB_URI:'mongodb://127.0.0.1:1/unused',REDIS_URL:'',REDIS_NAMESPACE:'totmart:isolated:'+randomUUID(),JWT_SECRET:randomBytes(32).toString('hex'),JWT_REFRESH_SECRET:randomBytes(32).toString('hex'),FRONTEND_URL:'http://localhost:3100',CORS_ORIGINS:'http://localhost:3100',TRUST_PROXY:'0',BREVO_API_KEY:'test-brevo-key',FROM_EMAIL:'noreply@example.com',CLOUDINARY_CLOUD_NAME:'test-cloud',CLOUDINARY_API_KEY:'test-key',CLOUDINARY_API_SECRET:'test-secret',SEPAY_API_KEY:'local-fixture-only',SEPAY_BANK_ACCOUNT:'0000000000',SEPAY_BANK_NAME:'TestBank',LOG_LEVEL:'silent'});
if(process.env.FE_TEST_ORIGIN) { if(!/^http:\/\/localhost:\d+$/.test(process.env.FE_TEST_ORIGIN))throw Error('Explicit local FE origin required'); Object.assign(process.env,{FRONTEND_URL:process.env.FE_TEST_ORIGIN,CORS_ORIGINS:process.env.FE_TEST_ORIGIN}); }
if(gapRedis) process.env.REDIS_URL=gapRedis;
const mongoose=be('mongoose'), {MongoMemoryReplSet}=be('mongodb-memory-server');
const app=be(path.join(root,'src/app'));
const fixture=be(path.join(root,'tests/helpers/factories'));
const checks=[];
async function main(){
  const {resolveAttempt}=await import('../src/app/util/attemptLifecycle.mjs');
  const repl=await MongoMemoryReplSet.create({binary:{version:'7.0.14',downloadDir:path.resolve('.cache/manager-backend-verification')},replSet:{count:1,storageEngine:'wiredTiger'}});
  let server;
  try{
    if(gapRedis) await be(path.join(root,'src/config/redis')).startRedis();
    await mongoose.connect(repl.getUri('fe_checkout_'+randomUUID().replaceAll('-','')));
    await Promise.all(Object.values(mongoose.models).map(m=>m.init()));
    const {user}=await fixture.createUser({name:'Local Customer',email:'customer@checkout.example.com',password:'Fixture-Only-123!'});
    const {user:merchant}=await fixture.createUser({role:'merchant',email:'merchant@checkout.example.com'});
    const {user:admin}=await fixture.createUser({role:'admin',email:'admin@checkout.example.com'});
    const brand=await fixture.createBrand({ownerId:merchant._id});
    const product=await fixture.createProduct(brand,{name:'Local checkout product',stock:100});
    const coupon=await fixture.createCoupon({code:'LOCAL10'});
    // Test-only observation endpoint in this FE runner, never in BE application source.
    server=require('node:http').createServer(async(req,res)=>{
      if(req.method==='GET' && req.url==='/__fixture/evidence') {
        try {
          const Checkout=be(path.join(root,'src/models/Checkout')),Cart=be(path.join(root,'src/models/Cart')),Sub=be(path.join(root,'src/models/UserSubscription'));
          const transactions=await Checkout.find({userId:user._id}).select('requestKey kind result.orderCode').lean();
          const cart=await Cart.findOne({userId:user._id,isSubscribeCart:false}).lean();
          const data={transactions:transactions.map(x=>({key:x.requestKey,kind:x.kind,code:x.result?.orderCode})),stock:(await product.constructor.findById(product._id)).stock,cart:cart?.items.map(x=>({quantity:x.quantity}))||[],subscriptions:await Sub.countDocuments({userId:user._id}),couponUsage:(await coupon.constructor.findById(coupon._id)).usedCount};
          res.writeHead(200,{'Content-Type':'application/json'});res.end(JSON.stringify(data));
        }catch{res.writeHead(500);res.end('{}');}return;
      }
      app(req,res);
    }).listen(Number(process.env.FE_TEST_API_PORT || 0),'127.0.0.1');await new Promise(r=>server.once('listening',r));
    const origin='http://127.0.0.1:'+server.address().port;
    if(process.argv.includes('--gaps')){
      const probe=await fetch(process.env.FE_TEST_ORIGIN+'/api/users/me',{headers:{Authorization:'Bearer '+fixture.signToken(user)}});
      assert.equal(probe.status,200,'FE /api rewrite must target this fixture BE port, not another local BE');
      const identity=await probe.json();assert.equal(String(identity.data?._id),String(user._id),'FE rewrite fixture identity mismatch');
      await require('./checkout-gap-verification.cjs')({be,root,origin,user,merchant,admin,product,fixture});return;
    }
    let token=fixture.signToken(user);
    const api={};
    async function http(method,url,body,options={}){
      const response=await fetch(origin+'/api'+url,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+token,...options.headers},body:body===undefined?undefined:typeof body==='string'?body:JSON.stringify(body)});
      const data=await response.json();
      if(!response.ok)throw Object.assign(Error(data.message||data.code),{response:{status:response.status,data}});
      return data;
    }
    api.post=(...a)=>http('POST',...a);api.get=(url,options)=>http('GET',url,undefined,options);
    await http('PUT','/carts/sync',{items:[{productId:String(product._id),quantity:2}]});
    const quote=await api.post('/checkout/quote',{items:[{productId:String(product._id),quantity:2}],couponCode:coupon.code});
    let attempt={userId:String(user._id),key:randomUUID(),serializedBody:JSON.stringify({addressId:String(user.addresses[0]._id),paymentMethod:'online',quoteFingerprint:quote.data.fingerprint,couponCode:coupon.code})};
    const run=options=>resolveAttempt({attempt,kind:'products',api,save:value=>{attempt=value;return true;},currentUser:()=>String(user._id),...options});
    assert.equal((await run()).prepared,true);assert.ok(attempt.snapshot);checks.push('HTTP prepare + BE delivery snapshot');
    const originalBody=attempt.serializedBody;
    user.addresses[0].address='Edited after prepare';await user.save();
    let dropped=false;const realPost=api.post;
    api.post=async(...args)=>{const result=await realPost(...args);if(args[0]==='/checkout/check-out'&&!dropped){dropped=true;throw Error('Simulated lost response after HTTP commit');}return result;};
    await assert.rejects(run({confirm:true}),/Simulated lost response/);
    const recovered=await run();assert.ok(recovered.data.orderCode);assert.equal(attempt.serializedBody,originalBody);checks.push('HTTP create commits; response loss simulated; lookup recovers original code');
    const status=await api.get('/checkout/order-status/'+recovered.data.orderCode);assert.equal(status.data.payable,true);assert.ok(status.data.qrUrl);checks.push('Online order-status payable + QR URL (fixture bank; no payment request)');
    const terminatedCreated=await run({terminate:true});assert.equal(terminatedCreated.data.orderCode,recovered.data.orderCode);checks.push('Terminate created cannot restart');
    assert.equal((await coupon.constructor.findById(coupon._id)).usedCount,1,'Coupon consumed exactly once despite lost response and replay');
    const Order=be(path.join(root,'src/models/Order'));const order=await Order.findOne({paymentCode:recovered.data.orderCode});assert.notEqual(order.shippingAddress.address,'Edited after prepare');checks.push('Address edit preserves frozen snapshot');
    const hash='a'.repeat(64),key=randomUUID();
    assert.equal((await api.get(`/checkout/attempts/products/${key}`,{headers:{'Attempt-Payload-Hash':hash}})).data.canRestart,false);
    assert.equal((await api.post(`/checkout/attempts/products/${key}/terminate`,undefined,{headers:{'Attempt-Payload-Hash':hash}})).data.canRestart,true);checks.push('Unknown blocks restart; terminate writes tombstone');
    token=fixture.signToken(merchant);
    await assert.rejects(api.post('/checkout/attempts/products/prepare',JSON.parse(originalBody),{headers:{'Idempotency-Key':randomUUID()}}),e=>e.response.status===403);checks.push('Merchant prepare forbidden');
    token=fixture.signToken(admin);
    await assert.rejects(api.post('/boxes/create-box',{name:'Invalid owner combo',descriptions:'Fixture',products:[{productId:String(product._id),quantity:1}],stock:1,validTo:'2099-01-01'}),e=>e.response.status===400);checks.push('Admin combo requires explicit owner');
    const combo=await api.post('/boxes/create-box',{ownerId:String(merchant._id),name:'Local subscription combo',descriptions:'Fixture',products:[{productId:String(product._id),quantity:1}],stock:10,validTo:'2099-01-01'});
    const template=await api.post('/subcribe-plans/create-subscription-template',{name:'Local prepaid',boxId:combo.data._id,planType:'1_month',discountPercent:0});
    token=fixture.signToken(user);
    let sub={userId:String(user._id),key:randomUUID(),serializedBody:JSON.stringify({templateId:template.data._id,expectedTotalAmount:100000,shippingAddress:{address:'Test street',district:'Test',city:'Test',country:'VN',phone:'0900000000'}})};
    const subRun=options=>resolveAttempt({attempt:sub,kind:'subscription',api,save:value=>{sub=value;return true;},currentUser:()=>String(user._id),...options});
    assert.equal((await subRun()).prepared,true);const subscribed=await subRun({confirm:true});assert.ok(subscribed.data.orderCode);assert.equal((await subRun()).data.orderCode,subscribed.data.orderCode);checks.push('Subscription prepare, confirm, create and lookup');
    await http('PUT','/carts/sync',{items:[{productId:String(product._id),quantity:1}]});
    const raceKey=randomUUID(),raceBody={addressId:String(user.addresses[0]._id),paymentMethod:'cod'};
    const prepared=await api.post('/checkout/attempts/products/prepare',raceBody,{headers:{'Idempotency-Key':raceKey}});
    const raceHeaders={'Attempt-Payload-Hash':prepared.data.hash};
    await Promise.allSettled([
      api.post('/checkout/check-out',raceBody,{headers:{'Idempotency-Key':raceKey}}),
      api.post(`/checkout/attempts/products/${raceKey}/terminate`,undefined,{headers:raceHeaders}),
    ]);
    const resolved=await api.get(`/checkout/attempts/products/${raceKey}`,{headers:raceHeaders});
    assert.ok(['created','invalidated'].includes(resolved.data.state));
    const Checkout=be(path.join(root,'src/models/Checkout'));
    assert.equal(await Checkout.countDocuments({userId:user._id,requestKey:raceKey}),resolved.data.state==='created'?1:0);
    assert.equal(resolved.data.canRestart,resolved.data.state==='invalidated');checks.push('Concurrent real HTTP create/terminate leaves one committed checkout or durable tombstone');
    if(resolved.data.state==='invalidated')await assert.rejects(api.post('/checkout/check-out',raceBody,{headers:{'Idempotency-Key':raceKey}}),e=>e.response.data.code==='ATTEMPT_INVALIDATED');
    await assert.rejects(api.get(`/checkout/attempts/products/${raceKey}`,{headers:{'Attempt-Payload-Hash':'f'.repeat(64)}}),e=>e.response.status===409&&e.response.data.code==='ATTEMPT_PAYLOAD_MISMATCH');checks.push('Lookup hash mismatch rejected with verified machine code');
    await http('PUT','/carts/sync',{items:[{productId:String(product._id),quantity:1}]});
    const codKey=randomUUID();const codPrepared=await api.post('/checkout/attempts/products/prepare',raceBody,{headers:{'Idempotency-Key':codKey}});
    const codCreated=await api.post('/checkout/check-out',raceBody,{headers:{'Idempotency-Key':codKey}});
    assert.ok(codCreated.data.orderCode);assert.equal((await api.get('/checkout/order-status/'+codCreated.data.orderCode)).data.payable,false);checks.push('COD prepare/create has no payable bank transfer');
    const terminal=await api.get(`/checkout/attempts/products/${codKey}`,{headers:{'Attempt-Payload-Hash':codPrepared.data.hash}});assert.equal(terminal.data.state,'created');
    // Regression: no hash/address lookup is required to fence a business failure.
    let missing={userId:String(user._id),kind:'products',key:randomUUID(),serializedBody:JSON.stringify({addressId:new mongoose.Types.ObjectId().toString(),paymentMethod:'cod'})};
    const missingRun=options=>resolveAttempt({attempt:missing,kind:'products',api,save:value=>{missing=value;return true;},currentUser:()=>String(user._id),...options});
    await assert.rejects(missingRun(),e=>e.response.status===400&&e.response.data.code==='ADDRESS_NOT_FOUND');
    assert.equal(missing.hash,undefined);
    const postBefore=api.post;let lostTermination=true;
    api.post=async(...args)=>{const result=await postBefore(...args);if(args[0].endsWith('/terminate-with-body')&&lostTermination){lostTermination=false;throw Error('simulated lost termination');}return result;};
    await assert.rejects(missingRun({terminate:true}),/simulated lost termination/);assert.equal(missing.hash,undefined);
    assert.equal((await missingRun({terminate:true})).invalidated,true);api.post=postBefore;
    await assert.rejects(api.post('/checkout/check-out',missing.serializedBody,{headers:{'Idempotency-Key':missing.key}}),e=>e.response.data.code==='ATTEMPT_INVALIDATED');
    assert.equal(await Checkout.countDocuments({userId:user._id,requestKey:missing.key}),0);
    checks.push('ADDRESS_NOT_FOUND before hash; lost body-terminate response retried; late create fenced; DB has no checkout');
    for(const kind of ['products','subscription']) {
      const key=randomUUID();await assert.rejects(api.post(`/checkout/attempts/${kind}/${key}/terminate-with-body`,{}),e=>e.response.status===400);
      const Attempt=be(path.join(root,'src/models/CheckoutAttempt'));assert.equal(await Attempt.countDocuments({userId:user._id,key}),0);
    }
    checks.push('Both body-terminate schemas reject invalid payload without creating tombstones');
    const Cart=be(path.join(root,'src/models/Cart'));
    const stockBefore=(await product.constructor.findById(product._id)).stock;
    const previousCount=await Checkout.countDocuments({userId:user._id});
    const repeatKeys=[];
    for(let i=0;i<2;i++) {
      await http('PUT','/carts/sync',{items:[{productId:String(product._id),quantity:1}]});
      const key=randomUUID();repeatKeys.push(key);
      await api.post('/checkout/attempts/products/prepare',raceBody,{headers:{'Idempotency-Key':key}});
      await api.post('/checkout/check-out',raceBody,{headers:{'Idempotency-Key':key}});
    }
    assert.notEqual(repeatKeys[0],repeatKeys[1]);assert.equal(await Checkout.countDocuments({userId:user._id}),previousCount+2);
    assert.equal((await product.constructor.findById(product._id)).stock,stockBefore-2);
    await http('PUT','/carts/sync',{items:[{productId:String(product._id),quantity:1}]});
    const cartBefore=JSON.stringify(await Cart.findOne({userId:user._id,isSubscribeCart:false}).lean());
    await api.post('/checkout/check-out',raceBody,{headers:{'Idempotency-Key':repeatKeys[0]}});
    assert.equal(JSON.stringify(await Cart.findOne({userId:user._id,isSubscribeCart:false}).lean()),cartBefore);
    assert.equal((await product.constructor.findById(product._id)).stock,stockBefore-2);
    checks.push('Two identical COD carts create two keys/checkouts; old replay preserves new DB cart and stock');
    assert.equal((await coupon.constructor.findById(coupon._id)).usedCount,1,'Unrelated new COD orders and replay do not reuse coupon');
    const evidence={checks,passed:checks.length,origin,redis:gapRedis?'real dedicated local Redis; unique namespace':'disabled isolated single process',database:'fresh MongoMemoryReplSet',payment:'fixture bank URL only; no outbound payment'};
    require('node:fs').mkdirSync('.cache',{recursive:true});
    require('node:fs').writeFileSync('.cache/checkout-api-results.json',JSON.stringify(evidence,null,2));
    console.log(JSON.stringify(evidence,null,2));
    if(process.argv.includes('--serve')){
      require('node:fs').mkdirSync('.cache',{recursive:true});
      require('node:fs').writeFileSync('.cache/checkout-runtime.json',JSON.stringify({origin,productId:String(product._id),productSlug:product.slug,comboId:combo.data._id,templateId:template.data._id}));
      console.log('Local fixture server ready; press Enter to dispose');await new Promise(r=>{process.once('SIGINT',r);process.stdin.once('data',r);process.stdin.resume();});process.stdin.pause();
    }
  }finally{if(server)await new Promise(r=>server.close(r));if(gapRedis)await be(path.join(root,'src/config/redis')).stopRedis();await mongoose.disconnect();await repl.stop();}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
