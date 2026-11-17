const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const products=[{_id:'p1',name:'Trà',price:100000}],combos=[{_id:'c1',value:200000}];
test('merchant gift and prepaid regression estimates preserve fee and term semantics',async()=>{
  const {giftEstimate,subscriptionAmounts,comboEstimate}=await import('../src/app/manager/lib/packageModel.mjs');
  assert.deepEqual(giftEstimate(200000,[{minQuantity:3,percent:10}],[{name:'Thiệp',fee:5000}],3),{base:600000,discount:60000,fee:15000,total:555000});
  assert.deepEqual(subscriptionAmounts({planType:'3_month',discountPrice:270000}),{months:3,total:270000,monthly:90000});
  assert.equal(subscriptionAmounts({planType:'3_month'}),null);
  assert.deepEqual(comboEstimate({products:[{productId:'p1',quantity:2}],discountPercent:10},products),{base:200000,total:180000});
});
test('package drafts preserve source identity, policies and constituent IDs',async()=>{
  const {packageDraft,validatePackage}=await import('../src/app/manager/lib/packageModel.mjs');
  const draft=packageDraft({sourceType:'retail',boxId:{_id:'internal'},products:[{productId:{_id:'p1'},quantity:2}]});
  assert.equal(draft.sourceType,'retail');assert.equal(draft.boxId,'internal');assert.equal(draft.products[0].productId,'p1');
  const form={...draft,name:'Gói trà',description:'',planType:'3_month',stock:5,validTo:'2099-12-31',discountPercent:10};
  assert.deepEqual(validatePackage('subscriptions',form,false,products,combos),{});
  assert.ok(validatePackage('subscriptions',{...form,products:[{productId:'foreign',quantity:1}]},false,products,combos).products);
  assert.ok(validatePackage('subscriptions',{...form,planType:'2_month'},false,products,combos).planType);
});
test('gift tiers and amenities reject duplicate thresholds and invalid fees',async()=>{
  const {packageDraft,validatePackage}=await import('../src/app/manager/lib/packageModel.mjs');
  const form={...packageDraft(),name:'Gift trà',comboId:'c1',validTo:'2099-12-31',stock:3,bulkTiers:[{minQuantity:3,percent:10},{minQuantity:3,percent:20}],amenities:[{name:'Thiệp',fee:-1}]};
  const errors=validatePackage('gifts',form,false,products,combos);assert.ok(errors.bulkTiers);assert.ok(errors.amenities);
  assert.ok(validatePackage('gifts',{...form,comboId:'foreign'},false,products,combos).comboId);
});
function api(client){const source=fs.readFileSync(require.resolve('../src/app/manager/services/managerApi.js'),'utf8').replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');const sandbox=vm.createContext({axiosConfig:client,FormData,Date,Number,String,encodeURIComponent});vm.runInContext(`${source}\nthis.api={saveManagerForm,listManagerResource,collectManagerResource,deleteManagerResource,adjustManagerPackageStock,quoteManagerGift};`,sandbox);return sandbox.api;}
test('package service uses asymmetric gift routes, retail creation and dedicated stock endpoint',async()=>{
  const calls=[];const client=Object.fromEntries(['get','post','put','patch','delete'].map(method=>[method,async(url,body)=>{calls.push({method,url,body});return {success:true,data:[],pagination:{totalPages:1}};} ]));
  const service=api(client);
  const form={name:'Gift',products:[],validTo:'2099-01-01',stock:5,comboId:'combo',bulkTiers:[{minQuantity:'3',percent:'10'}],amenities:[{name:'Thiệp',fee:'5000'}]};
  await service.saveManagerForm({tab:'gifts',form,images:[]});assert.equal(calls[0].url,'/manager/gifts');assert.equal(calls[0].body.giftPolicy.amenities[0].fee,5000);
  await service.listManagerResource('gifts',{page:2});assert.equal(calls[1].url,'/manager/combos');assert.equal(calls[1].body.params.kind,'gift');
  await service.adjustManagerPackageStock('gifts','gift',-2,'Test');assert.equal(calls[2].url,'/manager/combos/gift/stock');
  await service.saveManagerForm({tab:'subscriptions',form:{...form,sourceType:'retail',planType:'3_month',discountPercent:10,description:'',products:[{productId:'p1',quantity:'1'}]},images:[]});assert.equal(calls[3].url,'/manager/retail-subscriptions');assert.equal(calls[3].body.products[0].quantity,1);
  await service.saveManagerForm({tab:'subscriptions',editing:'s1',form:{...form,sourceType:'retail',boxId:'internal',planType:'3_month',discountPercent:10,description:''},images:[]});assert.equal(calls[4].url,'/manager/subscriptions/s1');assert.equal(calls[4].method,'patch');assert.equal('boxId' in calls[4].body,false);
  await service.quoteManagerGift('gift',3);assert.equal(calls[5].url,'/checkout/quote');assert.equal(calls[5].body.items[0].boxId,'gift');
  assert.throws(()=>service.listManagerResource('admin'),/không hợp lệ/);
  await assert.rejects(service.deleteManagerResource('orders','o1'),/Không được xóa/);
});
test('collection loads all server pages and never substitutes mock rows after failure',async()=>{
  let count=0;const service=api({get:async()=>({success:true,data:[{_id:String(++count)}],pagination:{totalPages:3}})});
  assert.equal((await service.collectManagerResource('products')).length,3);
  await assert.rejects(api({get:async()=>{throw new Error('offline');}}).collectManagerResource('combos'),/offline/);
});
test('combo edits omit stale stock and subscription metadata edits retain source without resending it',async()=>{
  const calls=[];const service=api({put:async(url,body)=>{calls.push({url,body});return {success:true};},patch:async(url,body)=>{calls.push({url,body});return {success:true};}});
  const form={name:'Combo',description:'Parts',products:[{productId:'p1',quantity:2}],validTo:'2099-01-01',discountPercent:0,stock:99};
  await service.saveManagerForm({tab:'combos',editing:'c1',form,images:[]});assert.equal(calls[0].body.has('stock'),false);
  await service.saveManagerForm({tab:'subscriptions',editing:'s1',form:{...form,sourceType:'combo',boxId:'c1',originalBoxId:'c1',planType:'3_month'},images:[]});assert.equal('boxId' in calls[1].body,false);
});
