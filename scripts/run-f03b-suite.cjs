// Orchestrator for Phase F03b Live Verification Suite.
// Spawns fixture BE (--serve), spins up Next.js on port 3217, runs verify-f03b-live.cjs, and cleans up.
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
    } catch {}
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
  const runtimeFile = path.resolve('.cache/f07-runtime.json');
  if (fs.existsSync(runtimeFile)) {
    fs.unlinkSync(runtimeFile);
  }

  const FIXTURE_PORT = process.env.FE_TEST_API_PORT || '3102';
  console.log(`1. Starting BE fixture server (--serve) on port ${FIXTURE_PORT}...`);
  const fixtureProc = spawn('node', ['scripts/verify-f07-fixture.cjs', beRoot, '--serve'], {
    stdio: ['ignore', 'pipe', 'inherit'],
    env: {
      ...process.env,
      FE_TEST_ORIGIN: FE_ORIGIN,
      FE_TEST_API_PORT: FIXTURE_PORT,
      NODE_ENV: 'test',
    },
  });
  fixtureProc.stdout.on('data', (d) => process.stdout.write(`[Fixture] ${d}`));

  let nextProc = null;

  try {
    await waitFor(() => fs.existsSync(runtimeFile), 60000);
    const runtime = JSON.parse(fs.readFileSync(runtimeFile, 'utf8'));
    console.log(`Fixture ready at ${runtime.origin}`);

    console.log(`2. Starting Next.js production server on port ${FE_PORT}...`);
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

    console.log('Waiting for Next.js production server health check...');
    await waitFor(async () => {
      try {
        const res = await fetch(`${FE_ORIGIN}/robots.txt`);
        return res.status === 200;
      } catch {
        return false;
      }
    }, 45000);
    console.log(`Next.js server ready at ${FE_ORIGIN}`);

    console.log('3. Running F03b Live Verification Suite...');
    await runCommand('node', ['scripts/verify-f03b-live.cjs']);
    console.log('\n[F03b Suite] Successfully completed all checks!');
  } finally {
    console.log('4. Cleaning up processes...');
    killProcess(nextProc);
    killProcess(fixtureProc);
  }
}

main().catch((err) => {
  console.error('[F03b Suite Error]:', err.message);
  process.exit(1);
});
