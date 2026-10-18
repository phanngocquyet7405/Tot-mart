const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs');
function setup(){
 let current='customer',refreshUser='customer',release,denied=false,expiredEvents=0;
 const gate=new Promise(r=>{release=r;});const replay=[];let saved=0,cleared=0;
 const context=vm.createContext({window:{dispatchEvent:()=>{expiredEvents++;}},Event:class{},getAccessToken:()=> 'old',getTokenUserId:()=>current,jwtDecode:token=>({userId:token}),saveToken:()=>{saved++;},clearSession:()=>{cleared++;current=null;},axios:{post:async()=>{await gate;if(denied)throw {response:{status:401}};return {data:{token:refreshUser}};}}});
 vm.runInContext(fs.readFileSync('src/app/middleware/axiosMiddleware.js','utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,''),context);
 let request,responseError;
 const instance=config=>{request(config);replay.push(config);return Promise.resolve({success:true});};
 instance.defaults={baseURL:'/api'};instance.interceptors={request:{use:fn=>{request=fn;}},response:{use:(_ok,fail)=>{responseError=fail;}}};context.setupAxiosMiddleware(instance);
 const config=request({url:'/checkout/check-out',headers:{},data:'original bytes'});
 return {start:()=>responseError({response:{status:401},config}),release,deny:()=>{denied=true;},change:id=>{current=id;},refreshAs:id=>{refreshUser=id;},stats:()=>({saved,cleared,replay,expiredEvents}),config};
}
test('refresh retries identical request only for the original customer',async()=>{const h=setup();const pending=h.start();h.release();await pending;assert.equal(h.stats().replay.length,1);assert.equal(h.stats().replay[0].data,'original bytes');});
test('different account refresh cookie cannot replay a checkout',async()=>{const h=setup();h.refreshAs('admin');const pending=h.start();h.release();await assert.rejects(pending);assert.equal(h.stats().replay.length,0);assert.equal(h.stats().saved,0);});
test('account switch during refresh preserves new session and prevents replay',async()=>{const h=setup();const pending=h.start();h.change('other');h.release();await assert.rejects(pending);assert.equal(h.stats().replay.length,0);assert.equal(h.stats().saved,0);assert.equal(h.stats().cleared,0);});
test('denied old refresh cannot expire the newly selected account',async()=>{const h=setup();h.deny();const pending=h.start();h.change('other');h.release();await assert.rejects(pending);assert.equal(h.stats().cleared,0);assert.equal(h.stats().expiredEvents,0);});
test('blocked browser storage does not prevent in-memory authentication',()=>{
 const context=vm.createContext({window:{},jwtDecode:()=>({userId:'customer'})});
 Object.defineProperty(context,'localStorage',{get(){throw Error('SecurityError');}});Object.defineProperty(context,'sessionStorage',{get(){throw Error('SecurityError');}});
 vm.runInContext(fs.readFileSync('src/app/middleware/tokenMiddleware.js','utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,''),context);
 context.saveToken('token');assert.equal(context.getAccessToken(),'token');
});
