const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto');
test('admin reconciliation retries ambiguous outcomes with the original idempotency key', async () => {
  const source = fs.readFileSync(path.join(__dirname,'../src/app/services/api/reconciliationService.js'),'utf8').replace(/^import.*\r?\n/gm,'').replace(/^export /gm,'');
  const storage = new Map(), keys = [];
  const context = vm.createContext({crypto:crypto.webcrypto,getTokenUserId:()=> 'admin-a',sessionStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},axiosConfig:{post:async (_path,_payload,config)=>{keys.push(config.headers['Idempotency-Key']);if(keys.length===1)throw new Error('Response lost');return {success:true};}}});
  vm.runInContext(source, context);
  await assert.rejects(context.reconciliationCommand('refund:1','/refunds/1/complete',{amount:10000,reference:'BANK01',evidence:'Verified statement'}));
  assert.equal(storage.size,1);
  await context.reconciliationCommand('refund:1','/refunds/1/complete',{amount:10000,reference:'BANK01',evidence:'Verified statement'});
  assert.equal(keys[0],keys[1]);assert.equal(storage.size,0);
});
