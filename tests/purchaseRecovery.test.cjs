const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm');
function setup({storageFails=false}={}) {
  const calls=[], saved=[];
  const context=vm.createContext({crypto:require('node:crypto').webcrypto,
    sessionStorage:{getItem(){if(storageFails)throw Error('denied');return null;},setItem(){if(storageFails)throw Error('quota');},removeItem(){if(storageFails)throw Error('denied');}},
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
 await context.placeOrder({addressId:'a',paymentMethod:'online',cartItems:[{_id:'p',quantity:1}]});
 assert.equal(context.hasPendingCheckout(),true);
 const result=await context.placeOrder({addressId:'b',paymentMethod:'cod',note:'changed',cartItems:[{_id:'q',quantity:4}]});
 assert.equal(result.orderCode,'original');assert.equal(result.paymentMethod,'online');
 assert.equal(calls[0].key,calls[1].key);assert.equal(calls[1].payload.addressId,'a');assert.equal(calls[1].payload.note,undefined);
 assert.equal(context.hasPendingCheckout(),false);
});
test('blocked/full browser storage does not prevent checkout or lose retry key in this tab',async()=>{
 const {context,calls}=setup({storageFails:true});
 assert.equal((await context.placeOrder({addressId:'a',paymentMethod:'cod'})).success,false);
 assert.equal((await context.placeOrder({addressId:'a',paymentMethod:'cod'})).success,true);
 assert.equal(calls[0].key,calls[1].key);
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
 const calls=[];const context=vm.createContext({crypto:require('node:crypto').webcrypto,getTokenUserId:()=> 'customer',API_ENDPOINTS:{SUBSCRIBE_PLANS:{SUBSCRIBE:'/subscribe'}},
 axiosConfig:{post:async(url,payload,options)=>{calls.push({payload,key:options.headers['Idempotency-Key']});if(calls.length===1)throw Error('lost');return {success:true,data:{paymentCode:'old-order'}};}}});
 for(const file of ['util/purchaseAttempt.mjs','services/api/subscribePlanService.js']){
  let src=fs.readFileSync(path.join(__dirname,'../src/app',file),'utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,'');
  src=src.replace(/const userSubscribeApi =/,'var userSubscribeApi =');vm.runInContext(src,context);
 }
 await assert.rejects(context.userSubscribeApi({templateId:'old-template'}));
 await context.userSubscribeApi({templateId:'new-template'});
 assert.equal(calls[0].key,calls[1].key);assert.equal(calls[1].payload.templateId,'old-template');
});
