// Orchestrator for Phase F06 E2E Browser Testing.
// Spawns fixture BE (--serve), spins up Next.js on port 3217, runs browser E2E, and cleans up.
const { spawn, execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const beRoot = process.env.TOTMART_BE_ROOT || process.argv[2] || 'C:/Users/84862/Desktop/totmart/be-pinned';
const FE_PORT = 3217;
const FE_ORIGIN = `http://127.0.0.1:${FE_PORT}`;

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

async function waitFor(fn, timeoutMs = 45000, intervalMs = 500) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const ok = await fn();
      if (ok) return true;
    } catch {
      // Retry
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Timed out after ${timeoutMs}ms waiting for condition`);
}

async function runCommand(command, args, env = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, ...env },
    });
    p.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} failed with code ${code}`));
    });
    p.on('error', reject);
  });
}

async function main() {
  fs.mkdirSync('.cache', { recursive: true });
  const runtimeFile = path.resolve('.cache/f06-runtime.json');
  if (fs.existsSync(runtimeFile)) {
    fs.unlinkSync(runtimeFile);
  }

  const FIXTURE_PORT = process.env.FE_TEST_API_PORT || '3102';
  console.log(`1. Starting F06 BE fixture server (--serve) on port ${FIXTURE_PORT}...`);
  const fixtureProc = spawn('node', ['scripts/verify-f06-fixture.cjs', beRoot, '--serve'], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: {
      ...process.env,
      FE_TEST_ORIGIN: FE_ORIGIN,
      FE_TEST_API_PORT: FIXTURE_PORT,
      NODE_ENV: 'test',
    },
  });
  fixtureProc.stdout.on('data', (d) => process.stdout.write(`[Fixture stdout] ${d}`));
  fixtureProc.on('exit', (code, sig) => console.log(`[Fixture exited] code=${code} signal=${sig}`));
  fixtureProc.on('error', (err) => console.error(`[Fixture error]`, err));

  let nextProc = null;

  try {
    await waitFor(() => fs.existsSync(runtimeFile), 90000);
    const runtime = JSON.parse(fs.readFileSync(runtimeFile, 'utf8'));
    console.log(`F06 Fixture ready at ${runtime.origin}`);

    console.log(`2. Starting Next.js production server (next start -H 127.0.0.1) on port ${FE_PORT}...`);
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
    nextProc.stdout.on('data', (d) => process.stdout.write(`[Next.js stdout] ${d}`));
    nextProc.stderr.on('data', (d) => process.stderr.write(`[Next.js stderr] ${d}`));

    console.log('Waiting for Next.js production server health check...');
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
      500,
    );
    console.log('Next.js server ready.');

    console.log('3. Running Phase F06 E2E Browser Suite (Playwright)...');
    await runCommand('node', ['scripts/f06-browser-e2e.cjs'], {
      FE_TEST_ORIGIN: FE_ORIGIN,
    });
    console.log('F06 Browser E2E suite completed successfully!');
  } finally {
    console.log('Cleaning up processes...');
    killProcess(nextProc);
    killProcess(fixtureProc);
  }
}

main().catch((err) => {
  console.error('F06 Suite failed:', err);
  process.exitCode = 1;
});
