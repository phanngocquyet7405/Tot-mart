const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
module.exports = function setup({storageFails=false, storage=new Map(), loseFirstCreate=true, userId='recovery-user'}={}) {
  const calls=[], saved=[], sync=[], http=[];
  const storageApi={getItem:k=>{if(storageFails)throw Error('denied');return storage.get(k)||null;},setItem:(k,v)=>{if(storageFails)throw Error('denied');storage.set(k,v);},removeItem:k=>storage.delete(k)};
  const context=vm.createContext({crypto:require('node:crypto').webcrypto,localStorage:storageApi,sessionStorage:storageApi,
    setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout,
    navigator:{locks:{request:async(_scope,fn)=>fn()}},getTokenUserId:()=>userId,
    syncCartApi:async(items,version)=>{sync.push({items,version});return {version:3};},
    checkoutService:{createOrder:async(payload,key)=>{calls.push({payload,key});if(loseFirstCreate && calls.length===1)throw Error('lost response');return {success:true,data:{orderCode:'original',orderId:'id',totalAmount:12345}};}},
    userService:{addAddress:async(_id,payload)=>{saved.push(payload);return {data:{addresses:[{...payload,_id:'new-id'}]}};}}
  });
  context.axiosConfig={get:async()=>({success:true,data:{state:'processing',canRestart:false}}),post:async(url,body,options)=>{
    http.push({url,body,options});
    if(url==='/checkout/quote')return {success:true,data:{fingerprint:'a'.repeat(64),totalAmount:12345,discountAmount:5}};
    if(url.endsWith('/prepare'))return {success:true,data:{hash:'b'.repeat(64),key:options.headers['Idempotency-Key'],state:'processing',address:{fullName:'Fixture',address:'Test street',district:'D',city:'C',phone:'0900000000'}}};
    if(url.endsWith('/terminate'))return {success:true,data:{state:'invalidated',canRestart:true}};
    return context.checkoutService.createOrder(JSON.parse(body),options.headers['Idempotency-Key']);
  }};
  for(const name of ['util/purchaseAttempt.mjs','util/attemptLifecycle.mjs','services/api/Checkoutpageservice.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../../src/app',name),'utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,''),context);
  return {context,calls,saved,sync,http,storage};
};
