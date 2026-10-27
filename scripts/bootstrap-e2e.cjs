// Clean bootstrap script for TotMart FE E2E testing on clean/fresh machines.
// Verifies runtime, browser installation, port availability, and directory hygiene.
const fs = require('node:fs');
const path = require('node:path');
const net = require('node:net');
const { execSync } = require('node:child_process');

function checkPortAvailable(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

async function main() {
  console.log('=== TotMart E2E Bootstrap ===');

  // 1. Check Node runtime
  const nodeVersion = process.version;
  console.log(`[Bootstrap] Node version: ${nodeVersion}`);
  const major = parseInt(nodeVersion.slice(1).split('.')[0], 10);
  if (major < 22 || major >= 25) {
    console.warn(`[Bootstrap Warning] Recommended Node engine is >=22 <25. Current: ${nodeVersion}`);
  }

  // 2. Prepare isolated cache directories
  const dirs = ['.cache', '.cache/traces', '.cache/videos', '.cache/perf'];
  for (const dir of dirs) {
    fs.mkdirSync(dir, { recursive: true });
  }
  console.log('[Bootstrap] Cache directories initialized.');

  // 3. Check port availability
  const bePort = parseInt(process.env.FE_TEST_API_PORT || '3102', 10);
  const fePort = parseInt(process.env.FE_PORT || '3217', 10);

  const beAvail = await checkPortAvailable(bePort);
  const feAvail = await checkPortAvailable(fePort);

  console.log(`[Bootstrap] Checking port ${bePort} (BE Fixture): ${beAvail ? 'AVAILABLE' : 'IN USE'}`);
  console.log(`[Bootstrap] Checking port ${fePort} (FE Next.js): ${feAvail ? 'AVAILABLE' : 'IN USE'}`);

  if (!beAvail) {
    console.warn(`[Bootstrap Warning] Port ${bePort} is currently in use. Set FE_TEST_API_PORT to an open port.`);
  }
  if (!feAvail) {
    console.warn(`[Bootstrap Warning] Port ${fePort} is currently in use. Set FE_PORT to an open port.`);
  }

  // 4. Verify Playwright Chromium availability
  console.log('[Bootstrap] Verifying Playwright browser...');
  try {
    const { chromium } = require('@playwright/test');
    const browser = await chromium.launch({ headless: true });
    await browser.close();
    console.log('[Bootstrap] Playwright Chromium is ready.');
  } catch (err) {
    console.log('[Bootstrap] Playwright Chromium not found or launch failed. Installing...');
    execSync('npx playwright install chromium', { stdio: 'inherit' });
    console.log('[Bootstrap] Playwright Chromium installed successfully.');
  }

  console.log('=== Bootstrap Completed Successfully ===');
}

main().catch((err) => {
  console.error('[Bootstrap Failed]:', err);
  process.exit(1);
});
