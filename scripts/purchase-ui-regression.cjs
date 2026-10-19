// UI actions use the real FE + BE fixture. Only fault injection and fixture
// address deletion use Playwright routing/API; payment providers stay blocked.
const {chromium}=require('@playwright/test');
const fs=require('node:fs'),assert=require('node:assert/strict');
const runtime=JSON.parse(fs.readFileSync('.cache/checkout-runtime.json','utf8'));
const origin=process.env.FE_TEST_ORIGIN;
if(!/^http:\/\/localhost:\d+$/.test(origin||'') || !/^http:\/\/127\.0\.0\.1:\d+$/.test(runtime.origin))throw Error('Explicit local fixture origins required');
const checks=[],errors=[];
async function main(){
 const browser=await chromium.launch();
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.route('**/*',r=>['localhost','127.0.0.1'].includes(new URL(r.request().url()).hostname)&&!r.request().url().includes('/_next/image?url=http')?r.continue():r.abort());
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 const evidence=async()=>{const r=await page.request.get(runtime.origin+'/__fixture/evidence');assert.equal(r.status(),200);return r.json();};
 const pending=()=>page.evaluate(()=>Object.keys(localStorage).filter(k=>/^totmart_checkout_attempt_[^:]+$/.test(k)).map(k=>JSON.parse(localStorage.getItem(k)))[0]);
 const login=async()=>{await page.goto(origin+'/login');await page.locator('#email').fill('customer@checkout.example.com');await page.locator('#password').fill('Fixture-Only-123!');await page.locator('form button[type=submit]').click();await page.waitForURL('**/homepage');};
 const add=async()=>{await page.goto(origin+'/products/'+runtime.productId);await page.getByRole('button',{name:/Thêm vào giỏ/i}).first().click();};
 const review=async()=>{await page.getByRole('button',{name:/Tiếp theo.*Kiểm tra đơn/i}).click();await page.getByRole('button',{name:'Tiếp tục thanh toán',exact:true}).click();};
 const prepare=async(method='cod')=>{await review();await page.locator(`input[name=payment][value=${method}]`).locator('..').click();await page.getByRole('button',{name:/Chuẩn bị xác nhận/}).click();await page.getByText('Địa chỉ BE xác nhận:',{exact:false}).waitFor();return pending();};
 const confirm=async()=>{await page.getByRole('button',{name:'Xác nhận đúng địa chỉ và tổng tiền trên',exact:true}).click();await page.getByRole('heading',{name:'Đặt hàng thành công!',exact:true}).waitFor();};
 try{
  await login();await page.goto(origin+'/cart');
  const remove=page.getByRole('button',{name:'Xóa Local checkout product khỏi giỏ',exact:true});
  await remove.or(page.getByText('Giỏ hàng trống',{exact:true})).waitFor();
  if(await remove.count())await remove.click();
  const before=await evidence();await add();await page.goto(origin+'/checkout');const first=await prepare();await confirm();
  const afterFirst=await evidence();assert.equal(afterFirst.transactions.length,before.transactions.length+1);assert.equal(afterFirst.stock,before.stock-1);assert.equal(afterFirst.cart.length,0);
  await add();await page.goto(origin+'/checkout');
  // Replay with an identical new cart must not clear it.
  await page.getByRole('button',{name:'Tiếp tục đúng yêu cầu cũ',exact:true}).click();await page.getByRole('heading',{name:'Đặt hàng thành công!',exact:true}).waitFor();
  assert.equal((await evidence()).transactions.length,afterFirst.transactions.length);
  assert.equal(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('totmart_cart_user_')).map(k=>JSON.parse(localStorage.getItem(k)).items.length)[0]),1);
  await page.getByRole('button',{name:'Đặt đơn mới',exact:true}).click();await page.getByRole('button',{name:/Tiếp theo.*Kiểm tra đơn/i}).waitFor();const second=await prepare();assert.notEqual(second.key,first.key);await confirm();
  const afterSecond=await evidence();assert.equal(afterSecond.transactions.length,before.transactions.length+2);assert.equal(afterSecond.stock,before.stock-2);assert.equal(afterSecond.cart.length,0);assert.ok(afterSecond.transactions.some(t=>t.key===first.key));assert.ok(afterSecond.transactions.some(t=>t.key===second.key));checks.push('Mobile UI: COD twice with identical carts; explicit new action, distinct keys, DB orders/stock/cart verified; replay preserves new local cart');
  await add();await page.goto(origin+'/checkout');await page.getByRole('button',{name:'Đặt đơn mới',exact:true}).click();await prepare('online');await page.getByRole('button',{name:'Xác nhận đúng địa chỉ và tổng tiền trên',exact:true}).click();await page.waitForURL('**/checkout?code=*');const oldUrl=page.url();
  await page.getByRole('button',{name:'Đặt đơn mới',exact:true}).click();await page.getByRole('button',{name:/Tiếp theo.*Kiểm tra đơn/i}).waitFor();await page.goto(oldUrl);await page.getByText('Đang chờ thanh toán, hệ thống tự kiểm tra mỗi vài giây.',{exact:true}).waitFor();checks.push('Online created -> explicit new -> old payment URL remains recoverable');
  // Fresh page retains the new draft; remove selected fixture address after load,
  // before UI prepare. The original serialized body must survive body termination.
  await add();await page.goto(origin+'/checkout');await review();
  const me=await page.request.get(origin+'/api/users/me');assert.equal(me.status(),200);const envelope=await me.json();const user=envelope.data?.data||envelope.data;const address=user.addresses[0];
  const removed=await page.request.delete(`${origin}/api/users/delete-address/${user._id}/${address._id}`,{headers:{'X-TotMart-Request':'1'}});assert.ok(removed.status()<300);
  await page.getByRole('button',{name:/Chuẩn bị xác nhận/}).click();await page.getByRole('button',{name:'Kết thúc lần thử',exact:true}).waitFor();const failed=await pending();assert.equal(failed.hash,undefined);
  let dropped=false;await page.route('**/api/checkout/attempts/products/*/terminate-with-body',async route=>{assert.equal(route.request().postData(),failed.serializedBody);const r=await route.fetch();assert.equal((await r.json()).data.state,'invalidated');dropped=true;await route.abort();});
  await page.getByRole('button',{name:'Kết thúc lần thử',exact:true}).click();await page.waitForTimeout(400);assert.ok(dropped);assert.equal((await pending()).key,failed.key);await page.unroute('**/api/checkout/attempts/products/*/terminate-with-body');await page.reload();
  await page.getByRole('button',{name:'Kết thúc lần thử',exact:true}).click();await page.getByRole('button',{name:'Kết thúc lần thử',exact:true}).waitFor({state:'detached'});assert.equal(await pending(),undefined);
  assert.ok(!(await evidence()).transactions.some(t=>t.key===failed.key));checks.push('UI ADDRESS_NOT_FOUND -> body terminate committed but response dropped -> reload -> exact retry invalidates; no DB checkout');
  // Restore a fixture address via API, then choose it in the rendered checkout.
  await page.reload();await page.getByRole('button',{name:'Thêm địa chỉ mới',exact:true}).click();
  for(const [label,value] of Object.entries({'Họ tên người nhận':'Local Recipient','Số điện thoại':'0900000000','Số nhà, tên đường':'12 Fixture','Phường / Xã':'Fixture Ward','Quận / Huyện':'Fixture District','Tỉnh / Thành phố':'Fixture City'}))await page.getByPlaceholder(label,{exact:true}).fill(value);
  await prepare();await confirm();checks.push('UI saves a new address and successfully purchases after pre-hash termination');
  await page.waitForFunction(()=>{
    let el=document.querySelector('h1');if(!el)return false;
    for(;el;el=el.parentElement)if(Number(getComputedStyle(el).opacity)<0.99)return false;
    return true;
  });
  await page.screenshot({path:'.cache/purchase-v2-mobile.png',fullPage:true});
  // Keyboard interaction remains native and the new purchase control is focusable.
  await page.getByRole('button',{name:'Đặt đơn mới',exact:true}).focus();assert.equal(await page.getByRole('button',{name:'Đặt đơn mới',exact:true}).evaluate(el=>el===document.activeElement),true);checks.push('Keyboard focus reaches explicit new-purchase control');
  const subBefore=(await evidence()).subscriptions;
  for(let i=0;i<2;i++){
    await page.goto(origin+'/subscription');await page.getByRole('button',{name:'Chọn gói & địa chỉ',exact:false}).first().click();
    if(i===1)await page.getByRole('button',{name:'Đăng ký mới',exact:true}).click();
    await page.getByRole('button',{name:'Chọn địa chỉ nhận hàng',exact:false}).click();await page.getByRole('button',{name:'Xác nhận đăng ký',exact:true}).click();
    await page.getByRole('button',{name:'Xác nhận gói, địa chỉ và tổng trả trước trên',exact:true}).click();await page.waitForURL('**/checkout?code=*');
  }
  assert.equal((await evidence()).subscriptions,subBefore+2);checks.push('UI subscription twice with explicit new action; DB subscription count increases by two');
  assert.deepEqual(errors,[]);
 }finally{fs.writeFileSync('.cache/purchase-ui-v2-results.json',JSON.stringify({checks,errors,simulation:'response abort after real terminate commit; fixture address API mutation; no payment transfer'},null,2));await browser.close();console.log(JSON.stringify({checks,errors}));}
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
