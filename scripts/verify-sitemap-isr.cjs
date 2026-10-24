const { spawn } = require('child_process');
const fs = require('fs');

async function testSitemapIsr() {
  console.log('Testing Sitemap ISR stale-while-revalidate behavior with BE down...');
  const nextProc = spawn('npx', ['next', 'start', '-H', '127.0.0.1', '-p', '3217'], {
    shell: true,
    stdio: 'ignore',
    env: { ...process.env, CI: 'true', PORT: '3217', API_URL: 'http://127.0.0.1:3101/api' }
  });

  try {
    // Wait for server ready
    let ready = false;
    for (let i = 0; i < 30; i++) {
      try {
        const r = await fetch('http://127.0.0.1:3217/robots.txt');
        if (r.status === 200) { ready = true; break; }
      } catch {}
      await new Promise(res => setTimeout(res, 500));
    }
    if (!ready) throw new Error('Next.js server failed to start on 3217');

    console.log('Fetching /sitemap.xml with BE down...');
    const res = await fetch('http://127.0.0.1:3217/sitemap.xml');
    console.log('Status:', res.status);
    console.log('Content-Type:', res.headers.get('content-type'));
    const body = await res.text();
    console.log('Body length:', body.length);
    console.log('Contains <urlset:', body.includes('<urlset'));
    console.log('Contains static routes:', body.includes('/pages/about'));
    console.log('Contains dynamic routes:', body.includes('/products/'));

    const result = {
      status: res.status,
      contentType: res.headers.get('content-type'),
      bodyLength: body.length,
      hasUrlset: body.includes('<urlset'),
      hasStaticRoutes: body.includes('/pages/about'),
      hasDynamicRoutes: body.includes('/products/'),
      backendLive: false,
      behavior: res.status === 200 ? 'STALE_CACHE_SERVED_200' : 'ERROR_RETURNED',
    };

    fs.mkdirSync('.cache', { recursive: true });
    fs.writeFileSync('.cache/sitemap-isr-reproduction.json', JSON.stringify(result, null, 2));
    console.log('Result:', JSON.stringify(result, null, 2));
  } finally {
    try { process.kill(-nextProc.pid); } catch { nextProc.kill(); }
  }
}

testSitemapIsr().catch(err => {
  console.error('Sitemap test error:', err);
  process.exit(1);
});
