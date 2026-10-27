// Orchestrator for Phase F07 Smoke & Flakiness Verification Suite.
// Spawns F07 BE fixture (--serve), spins up Next.js on port 3217, runs browser smoke, and cleans up.
// Supports --repeat N (F07.4) to estimate flakiness frequency.
const { spawn, execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const beRoot = path.resolve(process.env.TOTMART_BE_ROOT || (process.argv[2] && !process.argv[2].startsWith('-') ? process.argv[2] : 'C:/Users/84862/Desktop/totmart/be-pinned'));
const FE_PORT = process.env.FE_PORT || '3217';
const FE_ORIGIN = `http://127.0.0.1:${FE_PORT}`;

// Process tracking for exact ID cleanup
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
  } catch {
    // Process already exited
  }
  spawnedPids.delete(proc.pid);
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
  const repeatArgIdx = process.argv.indexOf('--repeat');
  const repeatCount = repeatArgIdx !== -1 && process.argv[repeatArgIdx + 1] ? parseInt(process.argv[repeatArgIdx + 1], 10) : 1;

  console.log(`=== TotMart F07 Smoke Orchestrator (Runs: ${repeatCount}) ===`);

  fs.mkdirSync('.cache', { recursive: true });
  const runtimeFile = path.resolve('.cache/f07-runtime.json');
  const FIXTURE_PORT = process.env.FE_TEST_API_PORT || '3102';

  // Check if fixture is already running
  let isFixtureRunning = false;
  let fixtureInfo = null;
  try {
    const chk = await fetch(`http://127.0.0.1:${FIXTURE_PORT}/__fixture/f07-info`);
    if (chk.status === 200) {
      isFixtureRunning = true;
      fixtureInfo = await chk.json();
    }
  } catch {}

  let redisContainerId = null;
  let fixtureProc = null;

  if (!isFixtureRunning) {
    if (fs.existsSync(runtimeFile)) {
      try { fs.unlinkSync(runtimeFile); } catch {}
    }

    // Spin up disposable Redis container if Docker is available
    const runId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
    const REDIS_PORT = '6389';
    try {
      const isDockerAvailable = await new Promise((res) => {
        execSync('docker version', { stdio: 'ignore' });
        res(true);
      }).catch(() => false);

      if (isDockerAvailable) {
        console.log(`Starting disposable Redis container (totmart-f07-redis-${runId}) on port ${REDIS_PORT}...`);
        const cid = execSync(
          `docker run -d --name totmart-f07-redis-${runId} --label owner=totmart-f07-runner -p ${REDIS_PORT}:6379 redis:7.4-alpine`,
          { stdio: ['ignore', 'pipe', 'pipe'] }
        ).toString().trim();
        if (cid) {
          redisContainerId = cid;
          console.log(`[Disposable Redis] Started container: ${redisContainerId.slice(0, 12)}`);
        }
      }
    } catch (dErr) {
      console.warn('[Warning] Could not start disposable Redis container:', dErr.message);
    }

    console.log(`1. Starting F07 BE fixture server (--serve) on port ${FIXTURE_PORT}...`);
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
    fixtureProc.stdout.on('data', (d) => process.stdout.write(`[Fixture stdout] ${d}`));
    fixtureProc.on('exit', (code, sig) => console.log(`[Fixture exited] code=${code} signal=${sig}`));
    fixtureProc.on('error', (err) => console.error(`[Fixture error]`, err));
  } else {
    console.log(`1. Reusing existing F07 BE fixture server on port ${FIXTURE_PORT}...`);
    if (!fs.existsSync(runtimeFile) && fixtureInfo) {
      const reconstructed = {
        origin: `http://127.0.0.1:${FIXTURE_PORT}`,
        ...fixtureInfo,
      };
      fs.writeFileSync(runtimeFile, JSON.stringify(reconstructed, null, 2));
      console.log(`[Fixture Info] Reconstructed ${runtimeFile} from live endpoint.`);
    }
  }

  let nextProc = null;

  try {
    // Wait for fixture runtime metadata
    await waitFor(() => fs.existsSync(runtimeFile), 90000);
    const runtime = JSON.parse(fs.readFileSync(runtimeFile, 'utf8'));
    console.log(`F07 Fixture ready at ${runtime.origin}`);

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
    if (nextProc.pid) spawnedPids.add(nextProc.pid);
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
      500
    );
    console.log('Next.js production server is ready.');

    // 3. Run Smoke Suite (with repetitions if requested)
    const runResults = [];
    for (let i = 1; i <= repeatCount; i++) {
      console.log(`\n>>> EXECUTING SMOKE SUITE ITERATION ${i} / ${repeatCount} <<<`);
      // Reset DB state before each iteration for idempotency
      try {
        await fetch(`${runtime.origin}/__fixture/reset-db-state`, { method: 'POST' });
      } catch (err) {
        console.warn(`[Warning] Could not reset DB state before iteration ${i}:`, err.message);
      }

      let iterationPass = false;
      const startIter = Date.now();
      try {
        await runCommand('node', ['scripts/f07-browser-smoke.cjs'], {
          FE_TEST_ORIGIN: FE_ORIGIN,
          FE_TEST_API_PORT: FIXTURE_PORT,
          F07_ITERATION: String(i),
        });
        iterationPass = true;
      } catch (err) {
        console.error(`[Smoke Iteration ${i} FAILED]:`, err.message);
        iterationPass = false;
      }
      const dur = Date.now() - startIter;
      runResults.push({ iteration: i, passed: iterationPass, durationMs: dur });
      console.log(`[Iteration ${i} Result]: ${iterationPass ? 'PASS' : 'FAIL'} (${dur}ms)`);
    }

    // Write multi-run summary
    fs.writeFileSync(
      '.cache/f07-multi-run-results.json',
      JSON.stringify(
        {
          repeatCount,
          passedRuns: runResults.filter((r) => r.passed).length,
          failedRuns: runResults.filter((r) => !r.passed).length,
          runResults,
        },
        null,
        2
      )
    );

    console.log('\n=============================================');
    console.log(`MULTI-RUN SUMMARY: ${runResults.filter((r) => r.passed).length}/${repeatCount} RUNS PASSED`);
    console.log('=============================================\n');

    const anyFailed = runResults.some((r) => !r.passed);
    if (anyFailed) {
      throw new Error(`Smoke suite had failing iterations: ${runResults.filter((r) => !r.passed).map((r) => r.iteration).join(', ')}`);
    }
    console.log('F07 Smoke verification completed successfully!');
  } finally {
    console.log('Cleaning up exact spawned processes and containers...');
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

main()
  .then(() => {
    console.log('Smoke orchestrator completed cleanly.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n[F07 Suite Orchestrator Error]:', err.message);
    process.exit(1);
  });
