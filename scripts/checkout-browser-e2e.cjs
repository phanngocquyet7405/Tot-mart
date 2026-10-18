// Run only against the explicitly started local disposable fixture server.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const playwrightPath=process.argv[2];
if(!playwrightPath)throw Error('Pass the installed Playwright module path');
const {chromium}=require(playwrightPath);
const origin='http://localhost:3100';
const runtime=JSON.parse(fs.readFileSync('.cache/checkout-runtime.json','utf8'));
if(!/^http:\/\/127\.0\.0\.1:\d+$/.test(runtime.origin))throw Error('Disposable local backend required');
const checks=[];
async function main(){
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1365,height:960}});
 const restrict=route=>{
  const url=new URL(route.request().url());
  if(url.pathname==='/_next/image' && /^https?:/.test(url.searchParams.get('url') || ''))return route.abort();
  if(['localhost','127.0.0.1'].includes(url.hostname))return route.continue();
  // Never request a real QR provider, analytics, image or other remote service.
  return route.abort();
 };
 await context.route('**/*',restrict);
 const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const health=await page.request.get(origin+'/api/home/health');assert.equal(health.status(),200);checks.push('FE rewrite reaches local BE health');
  await page.goto(origin+'/login');
  await page.locator('#email').fill('customer@checkout.example.com');await page.locator('#password').fill('Fixture-Only-123!');
  await page.locator('form button[type=submit]').click();
  try { await page.waitForURL('**/homepage'); } catch(error) { console.log((await page.locator('body').innerText()).slice(0,7000)); throw error; }
  checks.push('Customer login through UI and real local API');
  await page.goto(origin+'/products/'+runtime.productId);
  await page.getByRole('heading',{name:'Local checkout product',exact:true}).waitFor();
  if(process.argv.includes('--probe')){console.log((await page.locator('body').innerText()).slice(0,14000));return;}
  await page.getByRole('button',{name:/Thêm vào giỏ/i}).first().click();checks.push('Product detail add to cart through UI');
  await page.goto(origin+'/checkout');
  await page.getByRole('heading',{name:'Thanh toán',exact:true}).waitFor();
  await page.getByRole('button',{name:/Tiếp theo.*Kiểm tra đơn/i}).click();
  await page.getByRole('button',{name:'Tiếp tục thanh toán',exact:true}).click();
  await page.getByRole('textbox',{name:'Mã giảm giá',exact:true}).fill('INVALIDLOCAL');
  const invalid=page.waitForResponse(r=>r.url().includes('/checkout/quote')&&r.status()===400);
  await page.getByRole('button',{name:'Áp dụng',exact:true}).click();await invalid;checks.push('Invalid coupon rejected by real local quote API via UI');
  await page.getByRole('textbox',{name:'Mã giảm giá',exact:true}).fill('LOCAL10');
  await page.getByRole('button',{name:'Áp dụng',exact:true}).click();await page.getByRole('button',{name:'Đã áp dụng',exact:true}).waitFor();checks.push('Valid coupon accepted via UI');
  await page.getByRole('button',{name:/Chuẩn bị xác nhận/}).click();
  await page.getByText('Địa chỉ BE xác nhận:',{exact:false}).waitFor();
  const frozen=await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('totmart_checkout_attempt_')).map(k=>JSON.parse(localStorage.getItem(k)))[0]);
  assert.ok(frozen.hash);assert.equal(frozen.state,'processing');checks.push('UI prepares and displays BE snapshot before create');
  await page.reload();await page.getByText('Địa chỉ BE xác nhận:',{exact:false}).waitFor();checks.push('Reload restores prepared snapshot and reference');
  const second=await context.newPage();await second.goto(origin+'/checkout');await second.getByText('Địa chỉ BE xác nhận:',{exact:false}).waitFor();checks.push('Second browser tab recovers the same attempt');
  let committedCode;
  let responseDropped;
  const dropped=new Promise(resolve=>{responseDropped=resolve;});
  await page.route('**/api/checkout/check-out',async route=>{
    const response=await route.fetch();const data=await response.json();
    assert.equal(response.status(),201);committedCode=data.data.orderCode;
    await route.abort();
    responseDropped();
  });
  await page.getByRole('button',{name:'Xác nhận đúng địa chỉ và tổng tiền trên',exact:true}).click();
  await dropped;
  await page.unroute('**/api/checkout/check-out');
  await page.getByRole('button',{name:'Tiếp tục đúng yêu cầu cũ',exact:true}).click();
  await page.waitForURL('**/checkout?code=*');assert.ok(committedCode);assert.ok(page.url().includes(committedCode));
  await page.getByText('Đang chờ thanh toán, hệ thống tự kiểm tra mỗi vài giây.',{exact:true}).waitFor();checks.push('Lost create response after real commit; UI lookup recovers original code and waiting-payment screen');
  await page.reload();await page.getByText('Đang chờ thanh toán, hệ thống tự kiểm tra mỗi vài giây.',{exact:true}).waitFor();checks.push('Reload payment URL restores waiting-payment screen');
  assert.ok((await page.locator('aside').innerText()).includes(frozen.summary.totalAmount.toLocaleString('vi-VN')));checks.push('Payment summary keeps BE remaining amount after cart consumption');
  await page.screenshot({path:'.cache/checkout-browser.png',fullPage:true});
  await second.getByRole('button',{name:'Kết thúc lần thử',exact:true}).click();await second.waitForURL('**/checkout?code=*');assert.ok(second.url().includes(committedCode));checks.push('Terminate from second tab preserves committed transaction');
  await page.goto(origin+'/profile/orders');await page.getByRole('heading').first().waitFor();checks.push('Customer order history opens through UI');
  await page.goto(origin+'/subscription');
  await page.getByRole('button',{name:'Chọn gói & địa chỉ',exact:false}).first().click();
  await page.getByRole('button',{name:'Chọn địa chỉ nhận hàng',exact:false}).click();
  await page.getByRole('button',{name:'Xác nhận đăng ký',exact:true}).click();
  await page.getByRole('button',{name:'Xác nhận gói, địa chỉ và tổng trả trước trên',exact:true}).waitFor();checks.push('Subscription UI prepares upfront amount and shipping address');
  await page.getByRole('button',{name:'Xác nhận gói, địa chỉ và tổng trả trước trên',exact:true}).click();
  await page.waitForURL('**/checkout?code=*');
  await page.getByText('Đang chờ thanh toán, hệ thống tự kiểm tra mỗi vài giây.',{exact:true}).waitFor();checks.push('Subscription UI create reaches waiting-payment screen');
  await page.reload();await page.getByText('Đang chờ thanh toán, hệ thống tự kiểm tra mỗi vài giây.',{exact:true}).waitFor();checks.push('Subscription payment reload recovery');
  await page.goto(origin+'/products');await page.getByRole('button',{name:/Local Customer/}).click();
  await page.getByRole('menuitem',{name:/Đăng xuất|Log out/i}).click();await page.waitForURL('**/login');checks.push('Customer logout through UI');
  await page.locator('#email').fill('merchant@checkout.example.com');await page.locator('#password').fill('Password123!');await page.locator('form button[type=submit]').click();await page.waitForURL('**/manager');checks.push('Merchant login routes to workspace');
  await page.goto(origin+'/manager/orders');await page.getByRole('heading',{name:'Đơn hàng',exact:true}).waitFor();checks.push('Merchant order list renders local orders');
  await page.goto(origin+'/dashboard');await page.waitForURL('**/manager');checks.push('Merchant denied admin dashboard route');
  await page.getByRole('button',{name:/Tài khoản/}).click();await page.getByRole('menuitem',{name:'Đăng xuất',exact:true}).click();await page.waitForURL('**/login');
  await page.locator('#email').fill('admin@checkout.example.com');await page.locator('#password').fill('Password123!');await page.locator('form button[type=submit]').click();await page.waitForURL('**/dashboard');checks.push('Admin login and dashboard');
  await page.goto(origin+'/admin-box/create');await page.locator('#combo-merchant').waitFor();assert.equal(await page.locator('#combo-merchant').inputValue(),'');checks.push('Admin combo form requires explicit merchant selection');
  const codContext=await browser.newContext({viewport:{width:390,height:844}});await codContext.route('**/*',restrict);
  const cod=await codContext.newPage();await cod.goto(origin+'/login');await cod.locator('#email').fill('customer@checkout.example.com');await cod.locator('#password').fill('Fixture-Only-123!');await cod.locator('form button[type=submit]').click();await cod.waitForURL('**/homepage');
  await cod.goto(origin+'/products/'+runtime.productId);await cod.getByRole('button',{name:/Thêm vào giỏ/i}).first().click();
  await cod.goto(origin+'/cart');
  await cod.getByRole('button',{name:'Tăng số lượng Local checkout product',exact:true}).click();await cod.getByRole('button',{name:'Giảm số lượng Local checkout product',exact:true}).click();
  await cod.getByRole('button',{name:'Xóa Local checkout product khỏi giỏ',exact:true}).click();checks.push('Mobile cart increase, decrease and remove through UI');
  await cod.goto(origin+'/products/'+runtime.productId);await cod.getByRole('button',{name:/Thêm vào giỏ/i}).first().click();await cod.goto(origin+'/checkout');
  await cod.getByRole('button',{name:'Thêm địa chỉ mới',exact:true}).click();
  for(const [label,value] of Object.entries({'Họ tên người nhận':'Local Recipient','Số điện thoại':'0900000000','Số nhà, tên đường':'12 Fixture','Phường / Xã':'Fixture Ward','Quận / Huyện':'Fixture District','Tỉnh / Thành phố':'Fixture City'}))await cod.getByPlaceholder(label,{exact:true}).fill(value);
  await cod.getByRole('button',{name:/Tiếp theo.*Kiểm tra đơn/i}).click();await cod.getByRole('button',{name:'Tiếp tục thanh toán',exact:true}).click();checks.push('Mobile adds and selects delivery address through real local API');
  await cod.locator('input[name=payment][value=cod]').check({force:true});
  await cod.getByRole('button',{name:/Chuẩn bị xác nhận/}).click();await cod.getByText('Địa chỉ BE xác nhận:',{exact:false}).waitFor();
  await cod.getByRole('button',{name:'Xác nhận đúng địa chỉ và tổng tiền trên',exact:true}).click();await cod.getByRole('heading',{name:'Đặt hàng thành công!',exact:true}).waitFor();checks.push('Mobile COD prepare, explicit confirmation and successful order');
  await cod.screenshot({path:'.cache/checkout-cod-mobile.png',fullPage:true});await codContext.close();
  const faults=await browser.newContext();await faults.route('**/*',restrict);const fault=await faults.newPage();
  await fault.goto(origin+'/login');await fault.locator('#email').fill('customer@checkout.example.com');await fault.locator('#password').fill('Fixture-Only-123!');await fault.locator('form button[type=submit]').click();await fault.waitForURL('**/homepage');
  await fault.goto(origin+'/products/'+runtime.productId);await fault.getByRole('button',{name:/Thêm vào giỏ/i}).first().click();await fault.goto(origin+'/checkout');await fault.getByRole('button',{name:/Tiếp theo.*Kiểm tra đơn/i}).click();await fault.getByRole('button',{name:'Tiếp tục thanh toán',exact:true}).click();await fault.getByRole('button',{name:/Chuẩn bị xác nhận/}).click();await fault.getByText('Địa chỉ BE xác nhận:',{exact:false}).waitFor();
  let beforeDrop;const beforeDropped=new Promise(resolve=>{beforeDrop=resolve;});
  await fault.route('**/api/checkout/check-out',async route=>{await route.abort();beforeDrop();});
  await fault.getByRole('button',{name:'Xác nhận đúng địa chỉ và tổng tiền trên',exact:true}).click();await beforeDropped;
  await fault.reload();await fault.getByText('Địa chỉ BE xác nhận:',{exact:false}).waitFor();
  await fault.getByRole('button',{name:'Tiếp tục đúng yêu cầu cũ',exact:true}).click();await fault.getByRole('button',{name:'Tiếp tục đúng yêu cầu cũ',exact:true}).isEnabled();checks.push('Browser abort before create reaches BE; reload and lookup retain unresolved attempt');
  let terminateDrop;const terminateDropped=new Promise(resolve=>{terminateDrop=resolve;});
  await fault.route('**/api/checkout/attempts/products/*/terminate',async route=>{const response=await route.fetch();assert.equal((await response.json()).data.canRestart,true);await route.abort();terminateDrop();});
  await fault.getByRole('button',{name:'Kết thúc lần thử',exact:true}).click();await terminateDropped;
  assert.equal(await fault.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('totmart_checkout_attempt_')).length),1);
  await fault.getByRole('button',{name:'Tiếp tục đúng yêu cầu cũ',exact:true}).click();
  await fault.getByRole('button',{name:'Kết thúc lần thử',exact:true}).waitFor({state:'detached'});
  assert.equal(await fault.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('totmart_checkout_attempt_')).length),0);checks.push('Lost terminate response preserves reference; subsequent real lookup confirms invalidated and unlocks');
  await faults.close();
 }catch(error){
  console.log((await page.locator('body').innerText()).slice(0,9000));
  await page.screenshot({path:'.cache/checkout-browser-failure.png',fullPage:true});
  throw error;
 }finally{
  fs.writeFileSync('.cache/checkout-browser-results.json',JSON.stringify({checks,errors,externalRequests:'blocked',payment:'no transfer, no external QR provider'},null,2));
  await browser.close();console.log(JSON.stringify({checks,errors}));
 }
}
main().catch(e=>{console.error(e.message);process.exitCode=1;});
