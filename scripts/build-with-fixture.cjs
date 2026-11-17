// Helper script to run `next build` with the isolated BE fixture running
// This satisfies the constraint: NEVER set ALLOW_SITEMAP_FALLBACK, BE fixture must run during build.
const { spawn, execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const beRoot = process.env.TOTMART_BE_ROOT || 'C:/Users/84862/Desktop/totmart/be-pinned';
const FIXTURE_PORT = '3102';

function killProcess(proc) {
  if (!proc || !proc.pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${proc.pid} /T /F`, { stdio: 'ignore' });
    } else {
      proc.kill('SIGKILL');
    }
  } catch {
    // Process already exited
  }
}

async function waitFor(fn, timeoutMs = 60000, intervalMs = 500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const ok = await fn();
      if (ok) return true;
    } catch {}
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Timed out after ${timeoutMs}ms waiting for condition`);
}

async function main() {
  console.log('=== Building TotMart FE with BE Fixture ===');
  fs.mkdirSync('.cache', { recursive: true });
  const runtimeFile = path.resolve('.cache/f07-runtime.json');
  if (fs.existsSync(runtimeFile)) {
    fs.unlinkSync(runtimeFile);
  }

  console.log(`Starting F07 BE fixture server on port ${FIXTURE_PORT}...`);
  const fixtureProc = spawn('node', ['scripts/verify-f07-fixture.cjs', beRoot, '--serve'], {
    stdio: ['ignore', 'pipe', 'inherit'],
    env: {
      ...process.env,
      FE_TEST_API_PORT: FIXTURE_PORT,
      NODE_ENV: 'test',
    },
  });

  fixtureProc.stdout.on('data', (d) => process.stdout.write(`[Fixture] ${d}`));

  try {
    await waitFor(async () => {
      if (!fs.existsSync(runtimeFile)) return false;
      const res = await fetch(`http://127.0.0.1:${FIXTURE_PORT}/__fixture/f07-info`).catch(() => null);
      return res && res.ok;
    }, 60000);
    console.log(`[Fixture] BE fixture is healthy and ready.`);

    console.log('Running `next build` with API_URL pointing to fixture...');
    const buildExitCode = await new Promise((resolve) => {
      const buildProc = spawn('npx', ['next', 'build'], {
        stdio: 'inherit',
        shell: true,
        env: {
          ...process.env,
          CI: 'true',
          API_URL: `http://127.0.0.1:${FIXTURE_PORT}/api`,
        },
      });
      buildProc.on('close', (code) => resolve(code));
      buildProc.on('error', (err) => {
        console.error('Build error:', err);
        resolve(1);
      });
    });

    console.log(`\n` + `next build exited with code ${buildExitCode}`);
    if (buildExitCode !== 0) {
      process.exit(buildExitCode);
    }
  } finally {
    console.log('Cleaning up BE fixture server...');
    killProcess(fixtureProc);
  }
}

main().catch((err) => {
  console.error('[Build Failed]:', err);
  process.exit(1);
});
