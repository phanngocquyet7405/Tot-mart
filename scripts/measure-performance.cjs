// Phase F07.5: Rigorous Performance Profiling & Security / Caching Audit Script.
// Profiles:
// 1. Desktop Unthrottled (1280x800)
// 2. Mobile Fast 4G + 4x CPU Throttling (375x667, latency 40ms, 4Mbps down, 3Mbps up)
// Runs 5 iterations per page (1 Cold + 4 Warm), reporting Median and p75.
// Captures JS payload breakdown by individual script chunk (transferSize & decodedBodySize).
// Verifies genuine product rendering on Product Detail, measures LCP, documents INP.
// Audits 4 distinct data leak vectors and flags public Cache-Control no-store for SEO/F03.

const { chromium } = require('playwright');
const { spawn, execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const beRoot = path.resolve(process.env.TOTMART_BE_ROOT || (process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : 'C:/Users/84862/Desktop/totmart/be-pinned'));
const FE_PORT = process.env.FE_PORT || '3217';
const FE_ORIGIN = `http://127.0.0.1:${FE_PORT}`;
const PERF_DIR = path.resolve('.cache/perf');

const spawnedPids = new Set();

function killProcess(proc) {
  if (!proc || !proc.pid) return;
  try {
    if (proc.stdout) {
      try { proc.stdout.destroy(); } catch {}
    }
    if (proc.stderr) {
      try { proc.stderr.destroy(); } catch {}
    }
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
    } else {
      try {
        execSync(`pkill -P ${proc.pid} -9`, { stdio: 'ignore' });
      } catch {}
      try {
        proc.kill('SIGKILL');
      } catch {}
    }
  } catch {}
  spawnedPids.delete(proc.pid);
}

async function waitFor(fn, timeoutMs = 45000, intervalMs = 500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      if (await fn()) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Timed out after ${timeoutMs}ms waiting for condition`);
}

function quantile(arr, q) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return Math.round(sorted[base] + rest * (sorted[base + 1] - sorted[base]));
  }
  return Math.round(sorted[base]);
}

async function runSinglePageIteration(page, pageUrl, isCold, isProductDetail = false) {
  // Clear cache & cookies if cold run
  if (isCold) {
    const client = await page.context().newCDPSession(page);
    await client.send('Network.clearBrowserCache');
    await client.send('Network.clearBrowserCookies');
  }

  // Set up PerformanceObserver for LCP and INP event recording before navigation
  await page.addInitScript(() => {
    window.__inpEntries = [];
    window.__lcpEntries = [];
    if (typeof PerformanceObserver !== 'undefined') {
      try {
        if (PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
          const lcpObs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              window.__lcpEntries.push({
                name: entry.name,
                startTime: entry.startTime,
                size: entry.size,
                url: entry.url || '',
                elementTag: entry.element ? entry.element.tagName : null,
              });
            }
          });
          lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
          window.__lcpObserver = lcpObs;
        }
      } catch {}

      try {
        if (PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes('event')) {
          const obs = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.interactionId) {
                window.__inpEntries.push({
                  name: entry.name,
                  duration: entry.duration,
                  interactionId: entry.interactionId,
                });
              }
            }
          });
          obs.observe({ type: 'event', durationThreshold: 16, buffered: true });
          window.__inpObserver = obs;
        }
      } catch {}
    }
  });

  const response = await page.goto(pageUrl, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1000);

  // Capture script breakdown and performance metrics directly from the browser's Performance API
  const evaluation = await page.evaluate(() => {
    const navEntries = performance.getEntriesByType('navigation');
    const nav = navEntries.length > 0 ? navEntries[0] : null;

    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find((e) => e.name === 'first-contentful-paint');

    let lcp = null;
    let lcpElementTag = null;
    let lcpUrl = null;
    if (window.__lcpEntries && window.__lcpEntries.length > 0) {
      const e = window.__lcpEntries[window.__lcpEntries.length - 1];
      lcp = e.startTime;
      lcpElementTag = e.elementTag;
      lcpUrl = e.url;
    } else {
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        lcp = lcpEntries[lcpEntries.length - 1].startTime;
      }
    }

    const shiftEntries = performance.getEntriesByType('layout-shift');
    let cls = 0;
    for (const entry of shiftEntries) {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    }

    const resources = performance.getEntriesByType('resource');
    const scriptResources = resources.filter(
      (r) =>
        r.initiatorType === 'script' ||
        r.name.includes('/_next/static/chunks/') ||
        r.name.endsWith('.js')
    );

    const scripts = scriptResources.map((s) => ({
      name: s.name.split('/').pop().split('?')[0],
      url: s.name,
      transferBytes: s.transferSize || 0,
      decodedBytes: s.decodedBodySize || 0,
      encodedBytes: s.encodedBodySize || 0,
      durationMs: Math.round(s.duration),
    }));

    const totalJsTransfer = scripts.reduce((acc, s) => acc + s.transferBytes, 0);
    const totalJsDecoded = scripts.reduce((acc, s) => acc + s.decodedBytes, 0);

    const ttfb = nav ? nav.responseStart - nav.requestStart : 0;
    const fcp = fcpEntry ? fcpEntry.startTime : 0;
    const domLoaded = nav ? nav.domContentLoadedEventEnd - nav.startTime : 0;
    const pageLoad = nav ? nav.loadEventEnd - nav.startTime : 0;

    return {
      ttfb: Math.round(ttfb),
      fcp: Math.round(fcp),
      lcp: lcp ? Math.round(lcp) : null,
      lcpElementTag,
      lcpUrl,
      lcpDiagnosis: lcpUrl
        ? 'image-LCP'
        : (lcpElementTag === 'H1' ? 'H1 SSR text paint trùng FCP (chưa có image LCP candidate)' : 'text-LCP'),
      cls: Math.round(cls * 1000) / 1000,
      domLoaded: Math.round(domLoaded),
      pageLoad: Math.round(pageLoad),
      scripts,
      totalJsTransfer,
      totalJsDecoded,
    };
  });

  // Verify product detail content if applicable
  let productVerification = null;
  if (isProductDetail) {
    const heading = await page.locator('h1').allInnerTexts();
    const hasBuyButton = await page.getByRole('button', { name: /Thêm vào giỏ/i }).isVisible().catch(() => false);
    const priceVisible = await page.locator('text=120.000').or(page.locator('text=₫')).first().isVisible().catch(() => false);
    const hasBreadcrumb = await page.locator('nav').or(page.locator('text=Trang chủ')).first().isVisible().catch(() => false);

    productVerification = {
      is200: response.status() === 200,
      h1: heading.join(' | '),
      hasBuyButton,
      priceVisible,
      hasBreadcrumb,
      isGenuine: response.status() === 200 && heading.length > 0 && hasBuyButton,
    };
  }

  // Attempt user interaction to measure INP
  let inpValue = 'chưa đo (yêu cầu tương tác người dùng)';
  try {
    const interactiveTarget = page.locator('button, a, input').first();
    if (await interactiveTarget.isVisible()) {
      await interactiveTarget.click({ timeout: 2000 }).catch(() => {});
      await page.waitForTimeout(100);
      const measuredInp = await page.evaluate(() => {
        if (window.__inpEntries && window.__inpEntries.length > 0) {
          const maxDur = Math.max(...window.__inpEntries.map((e) => e.duration));
          return Math.round(maxDur);
        }
        return null;
      });
      if (measuredInp !== null) {
        inpValue = `${measuredInp}ms`;
      }
    }
  } catch {}

  const headers = response.headers();
  const cacheControl = headers['cache-control'] || 'none';
  const htmlContent = await page.content();

  // Audit 4 Security Vectors
  const leakAudit = {
    // 1. Header check
    cacheControlHeader: cacheControl,
    // 2. Body scan: JWT / passwords
    hasTokenInHtml: /bearer\s+eyJ[a-zA-Z0-9_-]{10,}/i.test(htmlContent),
    hasPasswordInHtml: /password123|fixture-only-123/i.test(htmlContent),
    // 3. Storage scan
    storageTokens: await page.evaluate(() => {
      const t = localStorage.getItem('token') || sessionStorage.getItem('token');
      return !!t;
    }),
    // 4. Stale/private address data leak
    hasPrivateAddressInHtml: /123 Đường Fixture|0900000000/i.test(htmlContent),
  };

  return {
    isCold,
    httpStatus: response.status(),
    cacheControl,
    metrics: evaluation,
    inp: inpValue,
    productVerification,
    leakAudit,
  };
}

async function measurePageSuite(browser, pageUrl, pageName, profileName, profileOptions) {
  console.log(`\n======================================================`);
  console.log(`Profiling [${pageName}] under [${profileName}]`);
  console.log(`URL: ${pageUrl}`);
  console.log(`======================================================`);

  const runs = [];
  const isProductDetail = pageName.includes('Product Detail');

  // Create isolated context for this profile
  const context = await browser.newContext({
    viewport: profileOptions.viewport,
    userAgent: profileOptions.userAgent,
    isMobile: profileOptions.isMobile || false,
    hasTouch: profileOptions.hasTouch || false,
  });

  const page = await context.newPage();

  // Apply CDP throttling if configured
  if (profileOptions.cpuThrottleRate || profileOptions.networkConditions) {
    const cdp = await context.newCDPSession(page);
    if (profileOptions.cpuThrottleRate) {
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: profileOptions.cpuThrottleRate });
    }
    if (profileOptions.networkConditions) {
      await cdp.send('Network.emulateNetworkConditions', profileOptions.networkConditions);
    }
  }

  // 5 Runs: Run 1 = Cold, Runs 2..5 = Warm
  for (let i = 1; i <= 5; i++) {
    const isCold = i === 1;
    const runResult = await runSinglePageIteration(page, pageUrl, isCold, isProductDetail);
    runs.push(runResult);
    console.log(`  Run ${i} [${isCold ? 'COLD' : 'WARM'}]: TTFB=${runResult.metrics.ttfb}ms, FCP=${runResult.metrics.fcp}ms, LCP=${runResult.metrics.lcp}ms, CLS=${runResult.metrics.cls}, JS=${Math.round(runResult.metrics.totalJsTransfer / 1024)}KB`);
  }

  await context.close();

  // Aggregate stats: Median and p75
  const ttfbArr = runs.map((r) => r.metrics.ttfb);
  const fcpArr = runs.map((r) => r.metrics.fcp);
  const lcpArr = runs.map((r) => r.metrics.lcp).filter((x) => x !== null);
  const clsArr = runs.map((r) => r.metrics.cls);
  const jsTransferArr = runs.map((r) => r.metrics.totalJsTransfer);
  const jsDecodedArr = runs.map((r) => r.metrics.totalJsDecoded);

  const coldRun = runs[0];
  const warmRuns = runs.slice(1);

  const medianStats = {
    ttfb: quantile(ttfbArr, 0.5),
    ttfb_p75: quantile(ttfbArr, 0.75),
    fcp: quantile(fcpArr, 0.5),
    fcp_p75: quantile(fcpArr, 0.75),
    lcp: lcpArr.length > 0 ? quantile(lcpArr, 0.5) : null,
    lcp_p75: lcpArr.length > 0 ? quantile(lcpArr, 0.75) : null,
    cls: quantile(clsArr, 0.5),
    cls_p75: quantile(clsArr, 0.75),
    jsTransferKb_median: Math.round(quantile(jsTransferArr, 0.5) / 1024),
    jsDecodedKb_median: Math.round(quantile(jsDecodedArr, 0.5) / 1024),
    jsTransferKb_cold: Math.round(coldRun.metrics.totalJsTransfer / 1024),
    jsTransferKb_warm: Math.round(quantile(warmRuns.map((r) => r.metrics.totalJsTransfer), 0.5) / 1024),
  };

  // Unique scripts captured on Cold run
  const uniqueScripts = coldRun.metrics.scripts;

  return {
    pageName,
    pageUrl,
    profileName,
    httpStatus: coldRun.httpStatus,
    cacheControl: coldRun.cacheControl,
    isPublicNoStoreFinding: coldRun.cacheControl.includes('no-store') && !pageUrl.includes('/checkout'),
    medianStats,
    coldRunMetrics: coldRun.metrics,
    scriptBreakdown: uniqueScripts.map((s) => ({
      chunk: s.name,
      transferKb: Math.round((s.transferBytes / 1024) * 10) / 10,
      decodedKb: Math.round((s.decodedBytes / 1024) * 10) / 10,
    })),
    productVerification: coldRun.productVerification,
    inp: coldRun.inp,
    leakAudit: coldRun.leakAudit,
  };
}

async function main() {
  console.log('=== TotMart F07.5 Performance & Security Profiler ===');
  fs.mkdirSync(PERF_DIR, { recursive: true });

  const FIXTURE_PORT = process.env.FE_TEST_API_PORT || '3102';
  const runtimePath = path.resolve('.cache/f07-runtime.json');

  let serversStartedByMe = false;
  let redisContainerId = null;
  let fixtureProc = null;
  let nextProc = null;

  // Check if FE server is already alive
  let isFeRunning = false;
  try {
    const res = await fetch(`${FE_ORIGIN}/`);
    if (res.status === 200 || res.status === 307 || res.status === 308) {
      isFeRunning = true;
    }
  } catch {}

  // Check if BE fixture server is already alive
  let isFixtureRunning = false;
  let fixtureInfo = null;
  try {
    const chk = await fetch(`http://127.0.0.1:${FIXTURE_PORT}/__fixture/f07-info`);
    if (chk.status === 200) {
      isFixtureRunning = true;
      fixtureInfo = await chk.json();
    }
  } catch {}

  const forceStandalone = process.argv.includes('--standalone');

  if (!isFixtureRunning || forceStandalone) {
    console.log('Stand-alone mode: Initializing dedicated fixture...');
    serversStartedByMe = true;

    // Start disposable Redis
    const runId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    const REDIS_PORT = '6389';
    try {
      const isDockerAvailable = await new Promise((res) => {
        execSync('docker version', { stdio: 'ignore' });
        res(true);
      }).catch(() => false);

      if (isDockerAvailable) {
        console.log(`Starting disposable Redis container (totmart-f07-perf-redis-${runId}) on port ${REDIS_PORT}...`);
        const cid = execSync(
          `docker run -d --name totmart-f07-perf-redis-${runId} --label owner=totmart-f07-runner -p ${REDIS_PORT}:6379 redis:7.4-alpine`,
          { stdio: ['ignore', 'pipe', 'pipe'] }
        ).toString().trim();
        if (cid) {
          redisContainerId = cid;
          console.log(`[Disposable Redis] Started container: ${redisContainerId.slice(0, 12)}`);
        }
      }
    } catch (dErr) {
      console.warn('[Warning] Docker Redis not available:', dErr.message);
    }

    if (fs.existsSync(runtimePath)) {
      try { fs.unlinkSync(runtimePath); } catch {}
    }

    console.log(`Starting BE fixture on port ${FIXTURE_PORT}...`);
    fixtureProc = spawn('node', ['scripts/verify-f07-fixture.cjs', beRoot, '--serve'], {
      stdio: ['pipe', 'pipe', 'inherit'],
      env: {
        ...process.env,
        FE_TEST_ORIGIN: FE_ORIGIN,
        FE_TEST_API_PORT: FIXTURE_PORT,
        REDIS_URL: redisContainerId ? `redis://127.0.0.1:${REDIS_PORT}` : (process.env.REDIS_URL || ''),
        NODE_ENV: 'test',
      },
    });
    if (fixtureProc.pid) spawnedPids.add(fixtureProc.pid);
    fixtureProc.stdout.on('data', (d) => process.stdout.write(`[Fixture] ${d}`));
  } else {
    console.log(`Reusing existing F07 BE fixture server on port ${FIXTURE_PORT}...`);
    if (!fs.existsSync(runtimePath) && fixtureInfo) {
      const reconstructed = {
        origin: `http://127.0.0.1:${FIXTURE_PORT}`,
        ...fixtureInfo,
      };
      fs.writeFileSync(runtimePath, JSON.stringify(reconstructed, null, 2));
      console.log(`[Fixture Info] Reconstructed ${runtimePath} from live endpoint.`);
    }
  }

  await waitFor(() => fs.existsSync(runtimePath), 90000);
  const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8'));

  if (!isFeRunning || forceStandalone) {
    serversStartedByMe = true;
    console.log(`Starting Next.js production server on port ${FE_PORT}...`);
    nextProc = spawn('npx', ['next', 'start', '-H', '127.0.0.1', '-p', String(FE_PORT)], {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
      env: {
        ...process.env,
        CI: 'true',
        PORT: String(FE_PORT),
        API_URL: `${runtime.origin}/api`,
        NEXT_PUBLIC_API_URL: '/api',
      },
    });
    if (nextProc.pid) spawnedPids.add(nextProc.pid);

    console.log('Waiting for Next.js production server to be ready...');
    await waitFor(
      async () => {
        try {
          const res = await fetch(`${FE_ORIGIN}/`);
          return res.status === 200 || res.status === 307 || res.status === 308;
        } catch {
          return false;
        }
      },
      30000,
      500
    );
    console.log('Next.js server is ready.');
  } else {
    console.log(`Reusing existing Next.js server on port ${FE_PORT}...`);
  }

  try {
    const runtime = JSON.parse(fs.readFileSync(runtimePath, 'utf8'));
    const browser = await chromium.launch({ headless: true });

    const canonicalProductUrl = runtime.productCanonicalSlug
      ? `${FE_ORIGIN}/products/${runtime.productCanonicalSlug}`
      : `${FE_ORIGIN}/products/${runtime.productId}`;

    const pages = [
      { name: 'Home (Trang chủ)', url: `${FE_ORIGIN}/` },
      { name: 'Catalog (Danh mục sản phẩm)', url: `${FE_ORIGIN}/products` },
      { name: 'Product Detail (Chi tiết sản phẩm)', url: canonicalProductUrl },
      { name: 'Checkout (Thanh toán)', url: `${FE_ORIGIN}/checkout` },
    ];

    const profiles = [
      {
        name: 'Desktop Unthrottled',
        options: {
          viewport: { width: 1280, height: 800 },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
        },
      },
      {
        name: 'Mobile Fast 4G + 4x CPU Throttling',
        options: {
          viewport: { width: 375, height: 667 },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
          isMobile: true,
          hasTouch: true,
          cpuThrottleRate: 4,
          networkConditions: {
            offline: false,
            latency: 40,
            downloadThroughput: (4 * 1024 * 1024) / 8, // 4 Mbps
            uploadThroughput: (3 * 1024 * 1024) / 8,   // 3 Mbps
          },
        },
      },
    ];

    const allResults = [];

    for (const page of pages) {
      for (const profile of profiles) {
        const res = await measurePageSuite(browser, page.url, page.name, profile.name, profile.options);
        allResults.push(res);
      }
    }

    await browser.close();

    const reportFile = path.join(PERF_DIR, 'performance-detailed-report.json');
    fs.writeFileSync(reportFile, JSON.stringify({ timestamp: new Date().toISOString(), results: allResults }, null, 2));
    console.log(`\nDetailed performance audit report saved to: ${reportFile}`);
  } finally {
    if (serversStartedByMe) {
      console.log('Cleaning up processes and containers started for profiling...');
      if (nextProc) killProcess(nextProc);
      if (fixtureProc) killProcess(fixtureProc);
      if (redisContainerId) {
        try {
          console.log(`[Disposable Redis] Stopping and removing container ${redisContainerId.slice(0, 12)}...`);
          execSync(`docker stop ${redisContainerId} && docker rm -v ${redisContainerId}`, { stdio: 'ignore' });
        } catch (cErr) {
          console.warn('[Warning] Could not clean up Redis container:', cErr.message);
        }
      }
    }
  }
}

main()
  .then(() => {
    console.log('Performance audit completed cleanly.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n[Performance Profiling Failed]:', err);
    process.exit(1);
  });
