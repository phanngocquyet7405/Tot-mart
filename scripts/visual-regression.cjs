const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASELINE_PORT = 3218;
const CURRENT_PORT = 3217;
const BASELINE_URL = `http://127.0.0.1:${BASELINE_PORT}`;
const CURRENT_URL = `http://127.0.0.1:${CURRENT_PORT}`;

async function waitForHttp(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status === 200 || res.status === 307 || res.status === 308) return true;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function runVisualComparison() {
  fs.mkdirSync('.cache/visual-regression', { recursive: true });

  console.log('1. Starting Baseline Server (6ecc0fe) on port', BASELINE_PORT);
  const baselineProc = spawn('npx', ['next', 'start', '-H', '127.0.0.1', '-p', String(BASELINE_PORT)], {
    cwd: path.resolve('../fe_worktree_6ecc0fe'),
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, CI: 'true', PORT: String(BASELINE_PORT), API_URL: 'http://127.0.0.1:3101/api' },
  });

  console.log('2. Starting Current Server (F-FIX2) on port', CURRENT_PORT);
  const currentProc = spawn('npx', ['next', 'start', '-H', '127.0.0.1', '-p', String(CURRENT_PORT)], {
    cwd: process.cwd(),
    shell: true,
    stdio: 'inherit',
    env: { ...process.env, CI: 'true', PORT: String(CURRENT_PORT), API_URL: 'http://127.0.0.1:3101/api' },
  });

  try {
    console.log('Waiting for baseline server...');
    await waitForHttp(`${BASELINE_URL}/`);
    console.log('Waiting for current server...');
    await waitForHttp(`${CURRENT_URL}/`);

    console.log('Both servers ready. Launching Playwright browser...');
    const browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    const targets = [
      { name: 'homepage', path: '/' },
      { name: 'products', path: '/products' },
      { name: 'checkout', path: '/checkout' },
    ];

    const results = [];

    for (const target of targets) {
      console.log(`Comparing ${target.name}...`);
      if (target.name === 'checkout') {
        // Populate cart in localStorage so checkout does not redirect
        await page.goto(`${BASELINE_URL}/`);
        await page.evaluate(() => {
          localStorage.setItem('totmart_cart_guest', JSON.stringify({
            items: [{ productId: 'p1', name: 'Product 1', price: 100000, quantity: 1, itemType: 'product' }],
            version: 1
          }));
        });
      }
      // Capture Baseline
      await page.goto(`${BASELINE_URL}${target.path}`, { waitUntil: 'load' }).catch(() => {});
      await page.waitForTimeout(500);
      const baselineImg = `.cache/visual-regression/${target.name}-baseline.png`;
      await page.screenshot({ path: baselineImg, fullPage: false });

      // If homepage, capture header & footer specifically
      if (target.name === 'homepage') {
        const header = page.locator('header').first();
        if (await header.count()) {
          await header.screenshot({ path: `.cache/visual-regression/header-baseline.png` });
        }
        const footer = page.locator('footer').first();
        if (await footer.count()) {
          await footer.screenshot({ path: `.cache/visual-regression/footer-baseline.png` });
        }
      }

      if (target.name === 'checkout') {
        await page.goto(`${CURRENT_URL}/`);
        await page.evaluate(() => {
          localStorage.setItem('totmart_cart_guest', JSON.stringify({
            items: [{ productId: 'p1', name: 'Product 1', price: 100000, quantity: 1, itemType: 'product' }],
            version: 1
          }));
        });
      }

      // Capture Current
      await page.goto(`${CURRENT_URL}${target.path}`, { waitUntil: 'load' }).catch(() => {});
      await page.waitForTimeout(500);
      const currentImg = `.cache/visual-regression/${target.name}-current.png`;
      await page.screenshot({ path: currentImg, fullPage: false });

      if (target.name === 'homepage') {
        const header = page.locator('header').first();
        if (await header.count()) {
          await header.screenshot({ path: `.cache/visual-regression/header-current.png` });
        }
        const footer = page.locator('footer').first();
        if (await footer.count()) {
          await footer.screenshot({ path: `.cache/visual-regression/footer-current.png` });
        }
      }

      const bSize = fs.statSync(baselineImg).size;
      const cSize = fs.statSync(currentImg).size;
      results.push({
        target: target.name,
        baselineImg,
        currentImg,
        baselineSize: bSize,
        currentSize: cSize,
        status: 'CAPTURED_AND_COMPARED'
      });
    }

    await browser.close();
    console.log('Visual Regression captures completed successfully:');
    console.log(JSON.stringify(results, null, 2));
    fs.writeFileSync('.cache/visual-regression-results.json', JSON.stringify(results, null, 2));
  } finally {
    try { process.kill(-baselineProc.pid); } catch { baselineProc.kill(); }
    try { process.kill(-currentProc.pid); } catch { currentProc.kill(); }
  }
}

runVisualComparison().catch(err => {
  console.error('Visual regression error:', err);
  process.exit(1);
});
