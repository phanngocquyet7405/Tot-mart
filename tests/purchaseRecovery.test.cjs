const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
function setup({storageFails=false, storage=new Map()}={}) {
  const calls=[], saved=[];
  const context=vm.createContext({crypto:require('node:crypto').webcrypto,
    sessionStorage:{getItem(){if(storageFails)throw Error('denied');return storage.get(arguments[0]) || null;},setItem(k,v){if(storageFails)throw Error('quota');storage.set(k,v);},removeItem(k){if(storageFails)throw Error('denied');storage.delete(k);}},
    getTokenUserId:()=> 'recovery-user', syncCartApi:async()=>({version:3}),
    checkoutService:{createOrder:async(payload,key)=>{calls.push({payload,key});if(calls.length===1)throw Error('lost response');return {success:true,data:{orderCode:'original'}};}},
    userService:{addAddress:async(id,payload)=>{saved.push(payload);return {data:{addresses:[{...payload,_id:'new-id'}]}};}}
  });
  for(const name of ['util/purchaseAttempt.mjs','services/api/Checkoutpageservice.js']) {
    const src=fs.readFileSync(path.join(__dirname,'../src/app',name),'utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,'');
    vm.runInContext(src,context);
  }
  return {context,calls,saved};
}
test('ambiguous purchase freezes original payload when address/payment/cart draft changes',async()=>{
 const {context,calls}=setup();
 await context.placeOrder({addressId:'a',paymentMethod:'online',quoteFingerprint:'quote-a',cartItems:[{_id:'p',quantity:1}]});
 assert.equal(context.hasPendingCheckout(),true);
 const result=await context.placeOrder({addressId:'b',paymentMethod:'cod',note:'changed',cartItems:[{_id:'q',quantity:4}]});
 assert.equal(result.orderCode,'original');assert.equal(result.paymentMethod,'online');
 assert.equal(calls[0].key,calls[1].key);assert.equal(calls[1].payload.addressId,'a');assert.equal(calls[1].payload.note,undefined);
 assert.equal(context.hasPendingCheckout(),false);
});
test('blocked browser storage prevents sending an unrecoverable purchase',async()=>{
 const {context,calls}=setup({storageFails:true});
 assert.equal((await context.placeOrder({addressId:'a',paymentMethod:'cod'})).success,false);
 assert.equal((await context.placeOrder({addressId:'a',paymentMethod:'cod'})).success,false);
 assert.equal(calls.length,0);
});
test('sync conflict returns current server version without creating a checkout',async()=>{
 const {context,calls}=setup();context.syncCartApi=async()=>{throw {response:{status:409,data:{version:19,message:'Changed'}}};};
 const result=await context.placeOrder({addressId:'a',paymentMethod:'cod',cartVersion:2});
 assert.equal(result.cartVersion,19);assert.equal(result.status,409);assert.equal(calls.length,0);
});
test('checkout address saves the API schema and requires a server-issued address ID',async()=>{
 const {context,saved}=setup();
 const user={_id:'user',addresses:[]};
 const result=await context.saveCheckoutAddress(user,{fullName:'Người Nhận',phone:'0901234567',street:'12 Đường A',ward:'Phường B',district:'Quận C',province:'TP HCM'});
 assert.equal(result.selected._id,'new-id');assert.equal(saved[0].fullName,'Người Nhận');assert.equal(saved[0].city,'TP HCM');assert.equal(saved[0].address,'12 Đường A, Phường B');assert.equal(saved[0].street,undefined);
 await assert.rejects(context.saveCheckoutAddress(user,{fullName:'A',phone:'bad'}));
});
test('subscription validation accepts 99 percent and rejects 100 percent',async()=>{
 const {validatePackage,packageDraft}=await import('../src/app/manager/lib/packageModel.mjs');
 const form={...packageDraft(),name:'Plan',sourceType:'combo',boxId:'box',discountPercent:100};
 assert.ok(validatePackage('subscriptions',form,false,[],[{_id:'box'}]).discountPercent);
 form.discountPercent=99;assert.equal(validatePackage('subscriptions',form,false,[],[{_id:'box'}]).discountPercent,undefined);
});
test('an unresolved checkout from the previous FE storage format retains its key and payload',()=>{
 const raw=JSON.stringify({key:'legacy-key',signature:JSON.stringify({payload:{addressId:'original-address',paymentMethod:'online'},items:[]})});
 const context=vm.createContext({sessionStorage:{getItem:()=>raw}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../src/app/util/purchaseAttempt.mjs'),'utf8').replace(/^export /gm,''),context);
 const attempt=context.readAttempt('scope');assert.equal(attempt.key,'legacy-key');assert.equal(attempt.payload.addressId,'original-address');
});
test('subscription retry preserves the original template even if another template is selected',async()=>{
 const calls=[], store=new Map();const context=vm.createContext({sessionStorage:{getItem:k=>store.get(k),setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)},crypto:require('node:crypto').webcrypto,getTokenUserId:()=> 'customer',API_ENDPOINTS:{SUBSCRIBE_PLANS:{SUBSCRIBE:'/subscribe'}},
 axiosConfig:{post:async(url,payload,options)=>{calls.push({payload,key:options.headers['Idempotency-Key']});if(calls.length===1)throw Error('lost');return {success:true,data:{_id:'sub',paymentCode:'old-order'}};}}});
 for(const file of ['util/purchaseAttempt.mjs','services/api/subscribePlanService.js']){
  let src=fs.readFileSync(path.join(__dirname,'../src/app',file),'utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,'');
  src=src.replace(/const userSubscribeApi =/,'var userSubscribeApi =');vm.runInContext(src,context);
 }
 await assert.rejects(context.userSubscribeApi({templateId:'old-template'}));
 await assert.rejects(context.userSubscribeApi({templateId:'new-template'}));
 await context.userSubscribeApi({}, {resume:true});
 assert.equal(calls[0].key,calls[1].key);assert.equal(calls[1].payload.templateId,'old-template');
});

test('reload restores the original request and masked summary without syncing the changed cart',async()=>{
 const storage=new Map(); const first=setup({storage});
 await first.context.placeOrder({addressId:'a',paymentMethod:'online',quoteFingerprint:'q',totalAmount:500,address:{district:'D',city:'C',phone:'0901234567',address:'SECRET'},cartItems:[{_id:'p',name:'Product',quantity:2}]});
 const previous=first.context.getPendingCheckout();
 const reloaded=setup({storage});
 await reloaded.context.placeOrder({addressId:'b',paymentMethod:'cod',cartItems:[]});
 assert.equal(reloaded.calls[0].key,previous.key);
 assert.equal(reloaded.calls[0].payload.addressId,'a');
 assert.equal(reloaded.context.getPendingCheckout().summary.totalAmount,500);
 assert.equal(JSON.stringify(previous.summary).includes('SECRET'),false);
 assert.equal(JSON.stringify(previous.summary).includes('0901234567'),false);
});
test('TTL and legacy missing timestamps require reconciliation without deleting or sending',async()=>{
 const {context,calls}=setup();
 context.storeAttempt('totmart_checkout_attempt_recovery-user',{key:'expired-key',sentAt:Date.now()-25*3600000,payload:{addressId:'a',quoteFingerprint:'q'}});
 assert.equal((await context.placeOrder({addressId:'new'})).success,false);
 assert.equal(calls.length,0); assert.equal(context.getPendingCheckout().key,'expired-key');
 assert.equal(context.needsReconciliation({key:'legacy'}),true);
});
test('authorization or conflict responses cannot erase an ambiguous attempt',async()=>{
 const {context}=setup();
 await context.placeOrder({addressId:'a',paymentMethod:'cod',quoteFingerprint:'q'});
 context.checkoutService.createOrder=async()=>{throw {response:{status:409,data:{message:'Conflict'}}};};
 await context.placeOrder({addressId:'b'});
 assert.equal(context.hasPendingCheckout(),true);
 assert.equal(context.getPendingCheckout().payload.addressId,'a');
});
