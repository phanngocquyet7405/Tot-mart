// Top-level comprehensive runner for Phase F07 suite:
// - Verifies F06 regression suite
// - Runs Playwright bootstrap check
// - Runs 10-flow browser smoke suite
// - Runs performance & leak audit
// Exits with distinct exit codes and clean process cleanup.
const { spawn, execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

async function runStep(name, cmd, args, env = {}) {
  console.log(`\n=============================================`);
  console.log(`>>> F07 STEP: ${name} <<<`);
  console.log(`=============================================\n`);
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, ...env },
    });
    p.on('close', (code) => {
      const dur = Date.now() - start;
      if (code === 0) {
        console.log(`[PASS] ${name} (exit ${code}, ${dur}ms)`);
        resolve({ name, code, dur, pass: true });
      } else {
        console.error(`[FAIL] ${name} (exit ${code}, ${dur}ms)`);
        resolve({ name, code, dur, pass: false });
      }
    });
    p.on('error', (err) => {
      console.error(`[ERROR] ${name}:`, err.message);
      resolve({ name, code: 1, dur: Date.now() - start, pass: false, error: err.message });
    });
  });
}

async function main() {
  console.log('=== TotMart Phase F07 Verification Suite ===');
  const results = [];

  // Step 1: E2E Bootstrap check
  results.push(await runStep('1. E2E Environment & Port Bootstrap', 'node', ['scripts/bootstrap-e2e.cjs']));

  // Step 2: F06 Regression Suite
  results.push(await runStep('2. F06 Cross-Cutting Verification Suite', 'node', ['scripts/run-f06-suite.cjs']));

  // Step 3: F07 10-Flow Browser Smoke Suite
  results.push(await runStep('3. F07 Mandatory 10-Flow Browser Smoke Suite', 'node', ['scripts/run-f07-smoke.cjs']));

  // Step 4: F07 Performance & Security Audit
  results.push(await runStep('4. F07 Performance & Data Leak Audit', 'node', ['scripts/measure-performance.cjs', '--standalone']));

  console.log('\n=============================================');
  console.log('=== F07 SUITE SUMMARY ===');
  console.log('=============================================');
  for (const r of results) {
    console.log(`- ${r.name}: ${r.pass ? 'PASS' : 'FAIL'} (exit: ${r.code}, ${r.dur}ms)`);
  }

  const allPassed = results.every((r) => r.pass);
  console.log(`\nOverall Result: ${allPassed ? 'ALL STEPS PASSED' : 'SOME STEPS FAILED'}`);
  process.exitCode = allPassed ? 0 : 1;
}

main().catch((err) => {
  console.error('\n[Fatal Suite Error]:', err);
  process.exitCode = 1;
});
