// Isolated local fixture only: no requests to Render and no real credentials.
const assert = require('node:assert/strict');
const http = require('node:http');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { setTimeout: delay } = require('node:timers/promises');
async function main() {
  const requests = [];
  const backend = http.createServer((req,res)=>{
    req.resume();
    requests.push({path:req.url,origin:req.headers.origin,cookie:req.headers.cookie,verification:req.headers['x-totmart-request'],authorization:req.headers.authorization});
    res.setHeader('Content-Type','application/json');
    if (req.url === '/api/home/login' || req.url === '/api/home/refresh') {
      res.setHeader('Set-Cookie',[
        'token=local-fixture-token; Path=/; HttpOnly; Secure; SameSite=Lax',
        'refreshToken=local-fixture-refresh; Path=/; HttpOnly; Secure; SameSite=Lax',
      ]);
    }
    res.end(JSON.stringify({success:true,status:'fixture',token:'local-fixture-token',data:{role:'merchant'}}));
  });
  backend.listen(0,'127.0.0.1'); await once(backend,'listening');
  const backendPort = backend.address().port;
  const port = Number(process.argv[2] || 3100);
  const next = spawn(process.execPath,[require.resolve('next/dist/bin/next'),'dev','--webpack','--hostname','127.0.0.1','--port',String(port)],{
    cwd:process.cwd(),env:{...process.env,API_URL:`http://127.0.0.1:${backendPort}/api`,NEXT_PUBLIC_API_URL:'/api',NEXT_TELEMETRY_DISABLED:'1'},stdio:'ignore',windowsHide:true,
  });
  let stopped = false; next.on('exit',()=>{stopped=true;});
  let spawnFailure; next.on('error',error=>{spawnFailure=error;});
  try {
    let ready = false;
    for (let n=0;n<60;n++) {
      if (spawnFailure) throw spawnFailure;
      if (stopped) throw new Error('Next fixture server exited before ready');
      try {const r=await fetch(`http://127.0.0.1:${port}/api/home/live`,{signal:AbortSignal.timeout(1500)}); if(r.ok&&(await r.json()).status==='fixture'){ready=true;break;}} catch {}
      await delay(500);
    }
    assert.ok(ready,'Next rewrite fixture did not start');
    const origin = `http://localhost:${port}`;
    const headers = {'Content-Type':'application/json','Origin':origin,'X-TotMart-Request':'1'};
    const login = await fetch(`http://127.0.0.1:${port}/api/home/login`,{method:'POST',headers,body:JSON.stringify({email:'fixture@example.invalid',password:'fixture-only'})});
    assert.equal(login.status,200);
    const cookies = login.headers.getSetCookie();
    assert.equal(cookies.length,2);
    for (const cookie of cookies) { assert.match(cookie,/HttpOnly/i); assert.match(cookie,/Secure/i); assert.match(cookie,/SameSite=Lax/i); assert.match(cookie,/Path=\//i); assert.doesNotMatch(cookie,/Domain=/i); }
    const cookieHeader = cookies.map(value=>value.split(';')[0]).join('; ');
    await fetch(`http://127.0.0.1:${port}/api/users/me`,{headers:{Origin:origin,Cookie:cookieHeader,'X-TotMart-Request':'1'}});
    await fetch(`http://127.0.0.1:${port}/api/home/refresh`,{method:'POST',headers:{...headers,Cookie:cookieHeader},body:'{}'});
    const forwarded = requests.find(req=>req.path==='/api/home/login');
    assert.equal(forwarded.origin,origin); assert.equal(forwarded.verification,'1');
    assert.equal(requests.find(req=>req.path==='/api/users/me').cookie,cookieHeader);
    assert.equal(requests.find(req=>req.path==='/api/home/refresh').cookie,cookieHeader);
    console.log(JSON.stringify({passed:true,target:'isolated local fixture',renderRequests:0,checks:['Next rewrite preserves API path','Origin forwarded unchanged','X-TotMart-Request forwarded','two Set-Cookie headers preserved','HttpOnly/Secure/SameSite/Path preserved','Cookie forwarded to profile and refresh'],browserCookieStorage:'not verified; HTTP client explicitly replayed fixture cookies'},null,2));
  } finally {
    if (process.platform === 'win32' && next.pid && !stopped) {
      const cleanup = spawn('taskkill',['/PID',String(next.pid),'/T','/F'],{stdio:'ignore',windowsHide:true});
      await once(cleanup,'exit');
    } else next.kill();
    if (!stopped) await Promise.race([once(next,'exit'),delay(5000)]);
    backend.closeAllConnections();
    await new Promise(resolve=>backend.close(resolve));
  }
}
main().catch(error=>{console.error(error.name+': '+error.message);process.exitCode=1;});
