// Browser executes the checked-in FE modules; transport, Mongo and Redis are real.
// Module delivery is test-only Playwright routing, never a production app route.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
module.exports=async function({be,root,origin,user,merchant,admin,product,fixture}){
 const {chromium}=require('@playwright/test');
 const front=process.env.FE_TEST_ORIGIN;
 assert.match(front,/^http:\/\/localhost:\d+$/);
 const results=[],errors=[];
 const check=async(name,fn)=>{try{await fn();results.push({name,status:'pass'});}catch(e){results.push({name,status:'fail',error:e.message});}console.log(name+': '+results.at(-1).status);};
 const read=p=>fs.readFileSync(p,'utf8');
 const sources={
  '/__verify/axios.js':read('node_modules/axios/dist/esm/axios.js'),
  '/__verify/jwt.js':read('node_modules/jwt-decode/build/esm/index.js'),
  '/__verify/token.js':read('src/app/middleware/tokenMiddleware.js').replace("'jwt-decode'","'/__verify/jwt.js'"),
  '/__verify/middleware.js':read('src/app/middleware/axiosMiddleware.js').replace("'axios'","'/__verify/axios.js'").replace("'jwt-decode'","'/__verify/jwt.js'").replace("'./tokenMiddleware'","'/__verify/token.js'"),
  '/__verify/storage.js':read('src/app/util/purchaseAttempt.mjs'),
  '/__verify/lifecycle.js':read('src/app/util/attemptLifecycle.mjs'),
  '/__verify/endpoints.js':read('src/app/services/api/apiEndpoints.js'),
 };
 sources['/__verify/client.js']="import axios from '/__verify/axios.js';import {setupAxiosMiddleware} from '/__verify/middleware.js';export const axiosConfig=axios.create({baseURL:'/api',timeout:10000,headers:{'Content-Type':'application/json',Accept:'application/json'}});setupAxiosMiddleware(axiosConfig);";
 sources['/__verify/products.js']="import {axiosConfig} from '/__verify/client.js';import {API_ENDPOINTS} from '/__verify/endpoints.js';\n"+read('src/app/services/api/productServices.js').replace(/^import[^\n]*\n/gm,'');
 sources['/__verify/service.js']=read('src/app/services/api/Checkoutpageservice.js').replace(/^import[^\n]*\n/gm,'')+'';
 sources['/__verify/service.js']="import {readAttempt,storeAttempt,clearAttempt,withAttemptLock,maskedAddress,referenceScope,startNewPurchase,createdReferenceByCode} from '/__verify/storage.js';import {resolveAttempt} from '/__verify/lifecycle.js';import {getTokenUserId} from '/__verify/token.js';import {axiosConfig} from '/__verify/client.js';import {syncCartApi} from '/__verify/products.js';const userService={};const paymentGatewayService={};\n"+sources['/__verify/service.js'];
 sources['/__verify/subscription.js']="import {readAttempt,readSubscriptionAttempt,storeAttempt,clearAttempt,withAttemptLock,referenceScope,startNewPurchase,createdReferenceByCode} from '/__verify/storage.js';import {resolveAttempt} from '/__verify/lifecycle.js';import {getTokenUserId} from '/__verify/token.js';import {axiosConfig} from '/__verify/client.js';import {API_ENDPOINTS} from '/__verify/endpoints.js';\n"+read('src/app/services/api/subscribePlanService.js').replace(/^import[^\n]*\n/gm,'');
 let browser=await chromium.launch({headless:true});
 const Session=be(path.join(root,'src/models/AuthSession')),Checkout=be(path.join(root,'src/models/Checkout')),Attempt=be(path.join(root,'src/models/CheckoutAttempt')),Box=be(path.join(root,'src/models/Box'));
 const jwt=be('jsonwebtoken');
 const catalogSnapshot=async()=>JSON.stringify(await Promise.all(['Box','Product','Brand','SubscriptionTemplate'].map(async name=>{
  const model=be('mongoose').models[name];return [name,model?await model.find().sort({_id:1}).lean():[]];
 })));
 let context,page,initialAddress=user.addresses[0].toObject();
 async function open(account=user){
  if(context)await context.close();
  context=await browser.newContext();
  await context.route('**/*',route=>{const url=new URL(route.request().url());if(sources[url.pathname])return route.fulfill({contentType:'text/javascript',body:sources[url.pathname]});if(url.pathname==='/__verify')return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Checkout verification</title>'});if(!['localhost','127.0.0.1'].includes(url.hostname)||url.pathname==='/_next/image')return route.abort();return route.continue();});
  const cookies=[];let token;
  await be(path.join(root,'src/services/sessionService')).createSession(account,{cookie:(name,value)=>{cookies.push({name,value,url:front,httpOnly:true,sameSite:'Lax'});if(name==='token')token=value;}});
  await context.addCookies(cookies);
  page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(front+'/__verify');
  await page.evaluate(async({token,id})=>{globalThis.t=await import('/__verify/token.js');t.saveToken(token);t.saveSessionUser({_id:id});globalThis.s=await import('/__verify/service.js');globalThis.c=(await import('/__verify/client.js')).axiosConfig;},{token,id:String(account._id)});
  return token;
 }
 const input=()=>({addressId:String(initialAddress._id),paymentMethod:'cod',cartItems:[{_id:String(product._id),name:product.name,quantity:1}]});
 const order=async options=>{const r=await page.evaluate(x=>s.placeOrder(x),{...input(),...options});if(!r.success&&!r.prepared&&!r.invalidated)console.log('operation: '+r.error);return r;};
 const pending=()=>page.evaluate(async id=>(await import('/__verify/storage.js')).readAttempt('totmart_checkout_attempt_'+id),String(user._id));
 async function resetAddress(){user.addresses=[initialAddress];user.markModified('addresses');await user.save();}
 async function expire(){const expired=jwt.sign({userId:String(user._id),role:user.role,exp:Math.floor(Date.now()/1000)-60},process.env.JWT_SECRET);await page.evaluate(x=>t.saveToken(x),expired);}
 async function revoke(){await Session.deleteMany({userId:user._id});}
 async function api(method,url,body,account=admin){const r=await fetch(origin+'/api'+url,{method,headers:{Authorization:'Bearer '+fixture.signToken(account),'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});return {status:r.status,data:await r.json()};}
 try{
  assert.equal(be(path.join(root,'src/config/redis')).ready(),true);
  // Refresh paths use a genuinely expired, correctly signed JWT and real session cookies.
  for(const op of ['prepare','create','lookup','terminate'])for(const mode of ['refresh-success','refresh-failure','revoked'])await check(`${op}: ${mode}`,async()=>{
   await resetAddress();await open();if(op!=='prepare')assert.equal((await order()).prepared,true);
   const before=await pending();
   const target=op==='prepare'?'**/api/checkout/attempts/products/prepare':op==='create'?'**/api/checkout/check-out':op==='terminate'?'**/api/checkout/attempts/products/*/terminate':'**/api/checkout/attempts/products/*';
   const expired=jwt.sign({userId:String(user._id),role:user.role,exp:Math.floor(Date.now()/1000)-60},process.env.JWT_SECRET);
   if(mode==='refresh-failure')await context.clearCookies({name:'refreshToken'});
   let injected=false;
   await page.route(target,async route=>{if(injected)return route.continue();injected=true;if(mode==='revoked'){await revoke();return route.continue();}return route.continue({headers:{...route.request().headers(),authorization:'Bearer '+expired}});});
   const result=await order(op==='create'?{confirm:true}:op==='terminate'?{terminate:true}:{});
   const after=await pending();
   if(mode==='refresh-success'){
    if(op==='create')assert.equal(result.success,true);else if(op==='terminate')assert.equal(result.invalidated,true);else assert.equal(result.prepared,true);
   }else{assert.equal(result.success,false);assert.ok(after?.key);assert.equal(await Checkout.countDocuments({userId:user._id,requestKey:after.key}),0);}
   if(before&&after)assert.equal(after.key,before.key);
   if(after)assert.ok(await Checkout.countDocuments({requestKey:after.key})<=1);
  });
  await check('refresh cookie belongs to different account: no replay under that account',async()=>{
   await open();await order();const before=await pending();await expire();const cookies=[];
   await be(path.join(root,'src/services/sessionService')).createSession(admin,{cookie:(name,value)=>cookies.push({name,value,url:front,httpOnly:true,sameSite:'Lax'})});await context.addCookies(cookies);
   const result=await order({confirm:true});assert.equal(result.success,false);assert.equal((await pending()).key,before.key);assert.equal(await Checkout.countDocuments({requestKey:before.key}),0);
  });
  for(const stage of ['before-prepare','after-prepare','lost-create-response'])for(const change of ['edit','delete'])await check(`address ${change}: ${stage}`,async()=>{
   await resetAddress();await open();
   if(stage!=='before-prepare')assert.equal((await order()).prepared,true);
   const frozen=await pending();
   if(stage==='lost-create-response'){
    await page.route('**/api/checkout/check-out',async route=>{const r=await route.fetch();assert.equal(r.status(),201);await route.abort();});await order({confirm:true});await page.unroute('**/api/checkout/check-out');
   }
   const route='/users/'+(change==='edit'?'edit-address/':'delete-address/')+user._id+'/'+initialAddress._id;
   const mutation=await api(change==='edit'?'PUT':'DELETE',route,change==='edit'?{...initialAddress,_id:undefined,address:'Changed fixture street'}:undefined,user);
   assert.ok(mutation.status<300,JSON.stringify(mutation));
   const result=await order();const after=await pending();
   if(stage==='before-prepare'&&change==='delete'){assert.equal(result.success,false);assert.equal(await Checkout.countDocuments({requestKey:after.key}),0);}
   else if(stage==='before-prepare'){assert.equal(after.snapshot.address,'Changed fixture street');assert.match(after.addressHash,/^[a-f0-9]{64}$/);}
   else {
    assert.deepEqual(after.snapshot,frozen.snapshot);assert.equal(after.addressHash,frozen.addressHash);assert.ok(after.addressHash);
    if(stage==='lost-create-response')assert.equal(result.success,true);
    if(stage==='after-prepare'){
     await page.goto(front+'/checkout');const rendered=page.getByText('Địa chỉ BE xác nhận:',{exact:false});await rendered.waitFor({timeout:20000});assert.ok((await rendered.innerText()).includes(frozen.snapshot.address));assert.ok(!(await rendered.innerText()).includes('Changed fixture street'));
     await page.getByRole('button',{name:'Xác nhận đúng địa chỉ và tổng tiền trên',exact:true}).click();await page.getByRole('heading',{name:'Đặt hàng thành công!',exact:true}).waitFor({timeout:20000});
    }
    const checkout=await Checkout.findOne({requestKey:after.key});assert.ok(checkout);const Order=be(path.join(root,'src/models/Order'));const committed=await Order.findOne({paymentCode:checkout.result.orderCode});assert.equal(committed.shippingAddress.address,frozen.snapshot.address);
   }
  });
  await resetAddress();
  await check('native browser quota exhausted: prepare is blocked',async()=>{
   await open();await page.evaluate(()=>{const chunk='x'.repeat(512*1024);try{for(let i=0;i<100;i++)localStorage.setItem('quota-'+i,chunk);}catch{};try{for(let i=0;i<2048;i++)localStorage.setItem('tail-'+i,'x'.repeat(1024));}catch{}});
   const before=await Attempt.countDocuments({userId:user._id});const r=await order();assert.equal(r.success,false);assert.equal(await Attempt.countDocuments({userId:user._id}),before);assert.match(r.error,/lưu trữ/);
  });
  await check('native quota exhausted after prepare: durable reference recovers any committed order',async()=>{
   await open();assert.equal((await order()).prepared,true);const before=await pending();
   await page.evaluate(()=>{try{for(let i=0;i<100;i++)localStorage.setItem('fill-'+i,'x'.repeat(512*1024));}catch{}try{for(let i=0;i<2048;i++)localStorage.setItem('small-'+i,'x'.repeat(1024));}catch{}try{for(let i=0;i<2048;i++)localStorage.setItem('tiny-'+i,'x');}catch{}});
   const result=await order({confirm:true});assert.equal(result.success,false);assert.match(result.error,/lưu/);assert.equal((await pending()).key,before.key);assert.ok(await Checkout.countDocuments({requestKey:before.key})<=1);
   await page.evaluate(()=>{for(const k of Object.keys(localStorage))if(!k.startsWith('totmart_'))localStorage.removeItem(k);});await page.reload();await page.evaluate(async id=>{globalThis.t=await import('/__verify/token.js');t.saveSessionUser({_id:id});globalThis.s=await import('/__verify/service.js');},String(user._id));const recovered=await order();assert.equal(recovered.success,true);assert.equal(await Checkout.countDocuments({requestKey:before.key}),1);
  });
  await check('browser storage denied by sandbox opaque origin',async()=>{
   await open();const denied=await page.evaluate(()=>{const frame=document.createElement('iframe');frame.sandbox='allow-scripts';frame.srcdoc='<script>try{localStorage.setItem("probe","1");parent.postMessage("unexpected","*")}catch(e){parent.postMessage(e.name,"*")}<\/script>';return new Promise(resolve=>{window.addEventListener('message',e=>resolve(e.data),{once:true});document.body.append(frame);});});assert.equal(denied,'SecurityError');
  });
  await check('Chromium disables localStorage: authentication works and real FE blocks prepare',async()=>{
   await browser.close();browser=await chromium.launch({headless:true,args:['--disable-local-storage']});await open();assert.equal(await page.evaluate(()=>localStorage),null);
   const before=await Attempt.countDocuments();const r=await order();assert.equal(r.success,false);assert.match(r.error,/lưu trữ/);assert.equal(await Attempt.countDocuments(),before);
   await browser.close();browser=await chromium.launch({headless:true});context=null;
  });
  await check('corrupt native localStorage preserves bytes and blocks prepare',async()=>{
   await open();await page.evaluate(id=>localStorage.setItem('totmart_checkout_attempt_'+id,'{broken'),String(user._id));const before=await Attempt.countDocuments();assert.equal((await order()).success,false);assert.equal(await Attempt.countDocuments(),before);assert.equal(await page.evaluate(id=>localStorage.getItem('totmart_checkout_attempt_'+id),String(user._id)),'{broken');
  });
  await check('two native tabs contend for one key and one checkout',async()=>{
   const token=await open();const second=await context.newPage();await second.goto(front+'/__verify');await second.evaluate(async({token,id})=>{const t=await import('/__verify/token.js');t.saveToken(token);t.saveSessionUser({_id:id});globalThis.s=await import('/__verify/service.js');},{token,id:String(user._id)});
   const inputValue=input();const prepared=await Promise.all([order(),second.evaluate(x=>s.placeOrder(x),inputValue)]);assert.ok(prepared.every(r=>r.prepared));const a=await pending(),b=await second.evaluate(()=>s.getPendingCheckout());assert.equal(a.key,b.key);
   const created=await Promise.all([order({confirm:true}),second.evaluate(x=>s.placeOrder({...x,confirm:true}),inputValue)]);assert.ok(created.every(r=>r.success));assert.equal(created[0].orderCode,created[1].orderCode);assert.equal(await Checkout.countDocuments({requestKey:a.key}),1);
  });
  await check('two tabs explicitly start anew once; delayed old lookup cannot replace new active or consume cart',async()=>{
   const token=await open();await order();await order({confirm:true});const old=await pending();
   const second=await context.newPage();await second.goto(front+'/__verify');await second.evaluate(async({token,id})=>{const t=await import('/__verify/token.js');t.saveToken(token);t.saveSessionUser({_id:id});globalThis.s=await import('/__verify/service.js');},{token,id:String(user._id)});
   const starts=await Promise.all([page.evaluate(key=>s.startNewCheckout(key).then(()=>true,()=>false),old.key),second.evaluate(key=>s.startNewCheckout(key).then(()=>true,()=>false),old.key)]);assert.equal(starts.filter(Boolean).length,1);
   assert.equal((await order()).prepared,true);const next=await pending();assert.notEqual(next.key,old.key);
   let release,entered;const ready=new Promise(r=>entered=r),gate=new Promise(r=>release=r);
   await second.route('**/api/checkout/attempts/products/'+old.key,async route=>{entered();await gate;await route.continue();});
   const late=second.evaluate(({input,key})=>s.placeOrder({...input,expectedKey:key}),{input:input(),key:old.key});await ready;
   const creating=order({confirm:true});release();const [replay,created]=await Promise.all([late,creating]);
   assert.equal(replay.orderCode,old.result.orderCode);assert.equal(replay.consumeCart,false);assert.equal(created.success,true);assert.equal((await pending()).key,next.key);
   assert.equal(await Checkout.countDocuments({requestKey:{$in:[old.key,next.key]}}),2);
  });
  const {user:other}=await fixture.createUser({role:'merchant'});const otherBrand=await fixture.createBrand({ownerId:other._id});const foreign=await fixture.createProduct(otherBrand);const archived=await fixture.createProduct(await fixture.createBrand({ownerId:merchant._id}));archived.archivedAt=new Date();await archived.save();
  const comboBody={name:'Gap fixture combo',descriptions:'Local fixture',products:[{productId:String(product._id),quantity:1}],stock:30,validTo:'2099-01-01'};
  let comboId;
  await check('admin create valid merchant-owned combo',async()=>{const r=await api('POST','/boxes/create-box',{...comboBody,ownerId:String(merchant._id)});assert.equal(r.status,201,JSON.stringify(r));comboId=r.data.data._id;assert.equal(String((await Box.findById(comboId)).ownerId),String(merchant._id));});
  await check('merchant edits own combo',async()=>{const r=await api('PUT','/manager/combos/'+comboId,{name:'Edited fixture combo'},merchant);assert.equal(r.status,200,JSON.stringify(r));assert.equal((await Box.findById(comboId)).name,'Edited fixture combo');});
  for(const [name,patch,account,url] of [
   ['missing owner',{...comboBody},admin,'/boxes/create-box'],
   ['nonmerchant owner',{...comboBody,ownerId:String(user._id)},admin,'/boxes/create-box'],
   ['foreign product',{...comboBody,ownerId:String(merchant._id),products:[{productId:String(foreign._id),quantity:1}]},admin,'/boxes/create-box'],
   ['missing product',{...comboBody,ownerId:String(merchant._id),products:[{productId:String(new (be('mongoose').Types.ObjectId)()),quantity:1}]},admin,'/boxes/create-box'],
   ['archived product',{...comboBody,ownerId:String(merchant._id),products:[{productId:String(archived._id),quantity:1}]},admin,'/boxes/create-box'],
   ['cross merchant edit',{name:'Forbidden edit'},other,'/manager/combos/'+comboId],
   ['merchant admin endpoint',{...comboBody,ownerId:String(merchant._id)},merchant,'/boxes/create-box'],
  ])await check('denied '+name+' leaves catalog unchanged',async()=>{const before=await catalogSnapshot();const r=await api(url.includes('/combos/')?'PUT':'POST',url,patch,account);assert.ok(r.status>=400&&r.status<500,JSON.stringify(r));assert.equal(await catalogSnapshot(),before);});
  await check('merchant creates own combo',async()=>{const r=await api('POST','/manager/combos',comboBody,merchant);assert.equal(r.status,201,JSON.stringify(r));assert.equal(String((await Box.findById(r.data.data._id)).ownerId),String(merchant._id));});
  await check('admin edits existing combo without changing owner',async()=>{const before=await Box.findById(comboId);const r=await api('PUT','/boxes/update-box/'+comboId,{name:'Admin edited fixture'});assert.equal(r.status,200,JSON.stringify(r));assert.equal(String((await Box.findById(comboId)).ownerId),String(before.ownerId));});
  for(const bad of [foreign._id,archived._id,new (be('mongoose').Types.ObjectId)()])await check('merchant invalid component edit '+(String(bad)===String(foreign._id)?'foreign':String(bad)===String(archived._id)?'archived':'missing')+' is atomic',async()=>{const before=await catalogSnapshot();const r=await api('PUT','/manager/combos/'+comboId,{name:'Must not persist',products:[{productId:String(bad),quantity:1}]},merchant);assert.ok(r.status>=400&&r.status<500);assert.equal(await catalogSnapshot(),before);});
  await check('rendered merchant combo form creates and edits; DB owner and value verified',async()=>{
   await open(merchant);await page.goto(front+'/manager/combos');await page.getByRole('button',{name:'Tạo combo',exact:true}).click();
   await page.locator('#package-name').fill('UI fixture combo');await page.locator('#package-description').fill('Local fixture only');await page.locator('#package-stock').fill('2');await page.locator('#package-validTo').fill('2099-01-01');
   await page.getByLabel(product.name,{exact:false}).check();await page.getByRole('button',{name:'Lưu',exact:true}).click();await page.getByRole('heading',{name:'UI fixture combo',exact:true}).waitFor();
   const stored=await Box.findOne({name:'UI fixture combo'});assert.ok(stored);assert.equal(String(stored.ownerId),String(merchant._id));assert.equal(stored.value,100000);
   const row=page.getByRole('article').filter({has:page.getByRole('heading',{name:'UI fixture combo',exact:true})});await row.getByRole('button',{name:'Sửa UI fixture combo',exact:true}).click();await page.locator('#package-name').fill('UI fixture combo edited');await page.getByRole('button',{name:'Lưu',exact:true}).click();await page.getByRole('heading',{name:'UI fixture combo edited',exact:true}).waitFor();assert.equal((await Box.findById(stored._id)).name,'UI fixture combo edited');
  });
  const template=await api('POST','/subcribe-plans/create-subscription-template',{name:'Gap subscription',boxId:comboId,planType:'1_month',discountPercent:0});assert.equal(template.status,201,JSON.stringify(template));
  const subData={templateId:template.data.data._id,expectedTotalAmount:100000,shippingAddress:{address:initialAddress.address,district:initialAddress.district,city:initialAddress.city,country:initialAddress.country,phone:initialAddress.phone}};
  const subOrder=options=>page.evaluate(async({data,options})=>{try{const sub=await import('/__verify/subscription.js');return await sub.userSubscribeApi(data,options);}catch(e){return {success:false,error:e.response?.data?.message||e.message};}},{data:subData,options});
  const subPending=()=>page.evaluate(async id=>(await import('/__verify/storage.js')).readAttempt('totmart_subscription_attempt_'+id),String(user._id));
  for(const op of ['prepare','create','lookup','terminate'])for(const mode of ['refresh-success','refresh-failure','revoked'])await check(`subscription ${op}: ${mode}`,async()=>{
   await open();if(op!=='prepare')assert.equal((await subOrder()).prepared,true);const before=await subPending();
   const target=op==='prepare'?'**/api/checkout/attempts/subscription/prepare':op==='create'?'**/api/subcribe-plans/user-subscribe':op==='terminate'?'**/api/checkout/attempts/subscription/*/terminate':'**/api/checkout/attempts/subscription/*';
   const expired=jwt.sign({userId:String(user._id),role:user.role,exp:Math.floor(Date.now()/1000)-60},process.env.JWT_SECRET);if(mode==='refresh-failure')await context.clearCookies({name:'refreshToken'});let injected=false;
   await page.route(target,async route=>{if(injected)return route.continue();injected=true;if(mode==='revoked'){await revoke();return route.continue();}return route.continue({headers:{...route.request().headers(),authorization:'Bearer '+expired}});});
   const result=await subOrder({resume:op!=='prepare',confirm:op==='create',terminate:op==='terminate'});const after=await subPending();
   if(mode==='refresh-success'){if(op==='create')assert.equal(result.success,true,JSON.stringify(result));else if(op==='terminate')assert.equal(result.invalidated,true);else assert.equal(result.prepared,true,JSON.stringify(result));}
   else{assert.equal(result.success,false);assert.ok(after?.key);assert.equal(await Checkout.countDocuments({requestKey:after.key}),0);}
   if(before&&after){assert.equal(after.key,before.key);assert.equal(after.serializedBody,before.serializedBody);}if(after)assert.ok(await Checkout.countDocuments({requestKey:after.key})<=1);
  });
  for(const stage of ['before-prepare','after-prepare','lost-create-response'])for(const change of ['edit','delete'])await check(`subscription inline address; profile ${change}: ${stage}`,async()=>{
   await resetAddress();await open();if(stage!=='before-prepare')assert.equal((await subOrder()).prepared,true);const frozen=await subPending();
   if(stage==='lost-create-response'){await page.route('**/api/subcribe-plans/user-subscribe',async route=>{const r=await route.fetch();assert.equal(r.status(),201);await route.abort();});const lost=await subOrder({resume:true,confirm:true});assert.equal(lost.success,false);await page.unroute('**/api/subcribe-plans/user-subscribe');}
   const route='/users/'+(change==='edit'?'edit-address/':'delete-address/')+user._id+'/'+initialAddress._id;const mutation=await api(change==='edit'?'PUT':'DELETE',route,change==='edit'?{...initialAddress,_id:undefined,address:'Changed fixture street'}:undefined,user);assert.ok(mutation.status<300);
   const result=await subOrder({resume:stage!=='before-prepare'});const after=await subPending();assert.deepEqual(JSON.parse(after.serializedBody).shippingAddress,subData.shippingAddress);if(frozen){assert.equal(after.key,frozen.key);assert.equal(after.serializedBody,frozen.serializedBody);assert.equal(after.hash,frozen.hash);}if(stage==='lost-create-response')assert.equal(result.success,true);else assert.equal(result.prepared,true);
   assert.ok(await Checkout.countDocuments({requestKey:after.key})<=1);
  });
  await resetAddress();
  await check('rendered subscription UI prepares, creates and reloads payment with real Redis enabled',async()=>{
   await open();await page.goto(front+'/subscription');await page.getByRole('button',{name:'Chọn gói & địa chỉ',exact:false}).first().click();await page.getByRole('button',{name:'Chọn địa chỉ nhận hàng',exact:false}).click();await page.getByRole('button',{name:'Xác nhận đăng ký',exact:true}).click();await page.getByRole('button',{name:'Xác nhận gói, địa chỉ và tổng trả trước trên',exact:true}).waitFor();
   const prepared=await subPending();assert.ok(prepared.hash);await page.getByRole('button',{name:'Xác nhận gói, địa chỉ và tổng trả trước trên',exact:true}).click();await page.waitForURL('**/checkout?code=*');const payment=page.url();await page.getByText('Đang chờ thanh toán, hệ thống tự kiểm tra mỗi vài giây.',{exact:true}).waitFor();await page.reload();await page.getByText('Đang chờ thanh toán, hệ thống tự kiểm tra mỗi vài giây.',{exact:true}).waitFor();assert.equal(page.url(),payment);assert.equal(await Checkout.countDocuments({requestKey:prepared.key}),1);await page.screenshot({path:'.cache/checkout-gap-redis-ui.png',fullPage:true});
  });
 }catch(error){results.push({name:'suite setup outside individual cases',status:'fail',error:error.message});}finally{
  await browser.close();const redis=be(path.join(root,'src/config/redis'));const cleanup=be('redis').createClient({url:process.env.TEST_REDIS_URL});await cleanup.connect();const keys=await cleanup.keys(redis.namespace()+':*');
  const evidence={date:new Date().toISOString(),frontend:front,backend:origin,redis:{url:process.env.TEST_REDIS_URL,ready:redis.ready(),namespace:redis.namespace(),keyCount:keys.length},database:'disposable MongoMemoryReplSet',results,passed:results.filter(r=>r.status==='pass').length,failed:results.filter(r=>r.status==='fail').length,errors,scope:'Chromium native FE module/service integration; rendered products snapshot/COD and subscription payment smoke; merchant/admin HTTP mutations',injection:'signed expired JWT at operation dispatch; session deletion at dispatch; post-201 response abort; module routing only; real HTTP/DB/Redis/storage/locks',notVerified:['profile form UI mutations (address API is real)','merchant/admin full form and image upload UI','browser engine other than Chromium','network partition during Mongo commit; multi-node failover']};
  if(keys.length)await cleanup.del(keys);await cleanup.quit();
  const serialized=JSON.stringify(evidence,null,2);fs.writeFileSync('.cache/checkout-gap-results.json',serialized);fs.writeFileSync('.cache/checkout-gap-results-'+evidence.date.replace(/[:.]/g,'-')+'.json',serialized);console.log(JSON.stringify({passed:evidence.passed,failed:evidence.failed}));if(evidence.failed)process.exitCode=1;
 }
};
