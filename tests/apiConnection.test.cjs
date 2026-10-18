const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { pathToFileURL } = require('node:url');
const axios = require('axios');

test('Next rewrite uses server API_URL; browser base cannot point at a second backend', async () => {
  const original = Object.fromEntries(['API_URL','NEXT_PUBLIC_API_URL','NODE_ENV','CI'].map(key => [key, process.env[key]]));
  let seq = 0;
  const load = () => import(`${pathToFileURL(require.resolve('../next.config.mjs')).href}?connection-test=${seq++}`);
  try {
    // Exercise deployment validation even when the runner (GitHub Actions) sets CI.
    // Restore the runner's environment in finally, like the other config inputs.
    delete process.env.CI;
    process.env.NODE_ENV = 'production';
    process.env.API_URL = 'https://totmartapi-1.onrender.com/api/';
    process.env.NEXT_PUBLIC_API_URL = '/api';
    const config = (await load()).default;
    assert.deepEqual(await config.rewrites(), [{source:'/api/:path*',destination:'https://totmartapi-1.onrender.com/api/:path*'}]);
    process.env.NEXT_PUBLIC_API_URL = 'https://another-backend.example/api';
    await assert.rejects(load(), /NEXT_PUBLIC_API_URL must be \/api/);
    process.env.NEXT_PUBLIC_API_URL = '/api';
    delete process.env.API_URL;
    await assert.rejects(load(), /API_URL is required/);
    process.env.API_URL = 'http://localhost:3001/api';
    await assert.rejects(load(), /HTTPS remote host/);
    process.env.API_URL = 'https://totmartapi-1.onrender.com/api/api';
    await assert.rejects(load(), /exactly \/api/);
    process.env.API_URL = 'https://example.com/api';
    await assert.rejects(load(), /placeholder/);
    const endpoints = fs.readFileSync(require.resolve('../src/app/services/api/apiEndpoints.js'), 'utf8').replace(/^export /gm, '');
    const sandbox = vm.createContext({process:{env:{NEXT_PUBLIC_API_URL:'https://ignored.example'}}});
    vm.runInContext(`${endpoints}\nthis.base = BASE_URL;`, sandbox);
    assert.equal(sandbox.base, '/api');
  } finally {
    for (const [key,value] of Object.entries(original)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
});

function middleware(refresh, platform = {}) {
  let token = null;
  let cleared = false;
  const sandbox = vm.createContext({
    ...platform,
    axios:{post:refresh}, getAccessToken:()=>token, getTokenUserId:()=> 'test-user', jwtDecode:()=>({userId:'test-user'}), saveToken:value=>{token=value;}, clearSession:()=>{token=null;cleared=true;},
  });
  const source = fs.readFileSync(require.resolve('../src/app/middleware/axiosMiddleware.js'), 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
  vm.runInContext(`${source}\nthis.setup = setupAxiosMiddleware;`, sandbox);
  return { setup:sandbox.setup, token:()=>token, cleared:()=>cleared };
}

test('401 refresh stays on /api, includes cookies and request header, and shares concurrent refresh', async () => {
  const refreshCalls = [];
  let release;
  const session = middleware((...args) => { refreshCalls.push(args); return new Promise(resolve => {release=resolve;}); });
  const requests = [];
  const client = axios.create({baseURL:'/api',adapter:async config=>{
    requests.push({withCredentials:config.withCredentials,headers:{...config.headers},retried:config._retried});
    if (!config._retried) throw new axios.AxiosError('unauthorized','ERR_BAD_REQUEST',config,null,{status:401});
    return {data:{success:true,data:{role:'merchant'}},status:200,headers:{},config};
  }});
  session.setup(client);
  const first = client.get('/users/me'); const second = client.get('/manager/products');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(refreshCalls.length, 1);
  assert.equal(refreshCalls[0][0], '/api/home/refresh');
  assert.equal(refreshCalls[0][2].withCredentials, true);
  assert.equal(refreshCalls[0][2].headers['X-TotMart-Request'], '1');
  release({data:{token:'temporary-test-token'}});
  assert.equal((await first).data.role,'merchant'); await second;
  assert.equal(session.token(),'temporary-test-token');
  for (const config of requests) { assert.equal(config.withCredentials,true); assert.equal(config.headers['X-TotMart-Request'],'1'); }
  assert.equal(requests.filter(config=>config.retried && config.headers.Authorization==='Bearer temporary-test-token').length,2);
});

test('terminal refresh denial notifies session owner; ordinary 403 never triggers refresh',async()=>{
  const events=[];
  const session=middleware(async()=>{throw {response:{status:401}};},{window:{dispatchEvent:event=>events.push(event.type)},Event:class{constructor(type){this.type=type;}}});
  const client=axios.create({baseURL:'/api',adapter:async config=>{throw new axios.AxiosError('expired','ERR_BAD_REQUEST',config,null,{status:401});}});
  session.setup(client);await assert.rejects(client.get('/manager/products'));
  assert.deepEqual(events,['totmart:session-expired']);assert.equal(session.cleared(),true);
  let refreshes=0;const forbidden=middleware(async()=>{refreshes++;});
  const other=axios.create({baseURL:'/api',adapter:async config=>{throw new axios.AxiosError('forbidden','ERR_BAD_REQUEST',config,null,{status:403});}});
  forbidden.setup(other);await assert.rejects(other.get('/manager/products'));
  assert.equal(refreshes,0);assert.equal(forbidden.cleared(),false);
});

test('failed refresh clears memory; failed login never triggers another auth POST', async () => {
  let calls = 0;
  const session = middleware(async()=>{calls++;throw new Error('refresh failed');});
  const client = axios.create({baseURL:'/api',adapter:async config=>{throw new axios.AxiosError('unauthorized','ERR_BAD_REQUEST',config,null,{status:401});}});
  session.setup(client);
  await assert.rejects(client.post('/home/login',{email:'test@example.invalid',password:'test-only'}));
  assert.equal(calls,0);
  await assert.rejects(client.get('/users/me'));
  assert.equal(calls,1); assert.equal(session.cleared(),true);
});
