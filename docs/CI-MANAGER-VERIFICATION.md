# CI cleanup and manager verification — 2026-10-16

## Scope and dependency evidence

Initial `git status --short` and `git diff` were empty. Read AGENTS.md, PRODUCT.md, DESIGN.md, package.json and the only workflow, `.github/workflows/check.yml`, plus installed Next.js project-structure and rewrites guides before edits.

Whole-repository lint reproduced exactly four errors in `manager-design/components/dialogs.jsx` (two unescaped quotes, two synchronous effect state updates) and one image warning in `manager-design/products/page.jsx`.

Repository-wide searches, including hidden tracked configuration, checked route paths, module names, imports/re-exports, dynamic imports, links, tests and scripts. The only mock consumer was `manager-design/lib/data.js`; prototype navigation linked only to its own routes. No live manager, test or script consumed LegacyManager or the prototype. Live manager layout uses ManagerLayout → ManagerShell, and live pages use the workspace components. Removed:

- All ten files under `src/app/manager-design/` (six pages, layout, lib/data and two shared components).
- `src/app/manager/lib/mock.js`.
- `src/app/manager/components/LegacyManager.jsx`.

Post-removal search of `src`, `tests`, `scripts` and `.github` found no references to these paths/names. Current product/handoff documentation now points to the live workspace; the original design plan retains historical context with an explicit removal note. No active forms, lint configuration or workflow were changed. The production configuration test now saves, clears and restores inherited CI so Actions cannot bypass its localhost-rejection assertion.

## Workflow environment and limits

Workflow: Ubuntu, Node 22, `npm ci`, `npm audit --omit=dev --audit-level=high`, `npm run lint`, `npm test`, `npm run build -- --webpack` with `API_URL=http://localhost:3001/api` for build only.

GitHub Actions normally supplies `CI=true`. Existing next.config.mjs skips the production HTTPS/remote-host restriction when that value is exactly `true`, allowing the workflow's localhost rewrite target. Required API_URL, absolute HTTP(S), exact `/api`, placeholder and credential/query/hash validation still apply. This is a build configuration exception, not proof that a backend is running or that production connectivity works. The apiConnection test explicitly expects localhost production configuration to be rejected; it now clears inherited CI for this test and restores it in finally, preserving the strict validation assertion on Actions as well as locally.

Local checks must keep CI unset and use the approved HTTPS API_URL for the successful production build. No requests that write data to Render are authorized. Windows currently has Node 24.14.1/npm 11.11.0, within package engines but different from Actions' Node 22/Linux.

## Fresh local results

- `npm ci`: PASS outside sandbox (731 packages installed). Initial sandbox run did not finish and was stopped before rerunning. Install's full dependency audit reported 11 advisories (2 moderate, 9 high), including development dependencies; no dependency versions or lockfile changed.
- `npm audit --omit=dev --audit-level=high`: PASS, 0 production vulnerabilities.
- `npm run lint`: PASS, whole repository, 0 errors and 0 warnings after removal (initial run: 4 errors/1 warning).
- `npm test`: PASS, 60/60, none skipped, after clean install and test isolation fix. Initial sandbox attempt failed to spawn test processes with EPERM; successful runs used permission to execute outside sandbox.
- `npm run build -- --webpack`: PASS outside sandbox, Next 16.4.0 from lockfile, 58 pages generated. API_URL was `https://totmartapi-1.onrender.com/api`, CI unset; no worker/config shortcuts. Initial sandbox attempt compiled but failed spawning page-data workers with EPERM. All six live manager routes remain; no manager-design route is in the build output.
- `git diff --check`: PASS (Git only reports configured LF/CRLF conversion notices).
- Impeccable context/surface brief loaded; `detect --json src/app/manager`: PASS, `[]`. This regex scan does not establish browser accessibility or visual correctness.

No successful GitHub Actions run for this uncommitted working tree has been verified. Windows/Node 24 results are not an exact Node 22/Ubuntu reproduction. The localhost build exception was inspected in configuration, not used to bypass local production validation. No commit, push, deployment or Render data writes were performed.

## Impeccable audit — source evidence only

Mode: Operate; no interface changes in this pass. The implementation remains coherent with merchant ownership, saved backend state, read-only orders and separate prepaid/monthly values. Detector has no findings; manual findings below are outside that detector's coverage. Provisional source-only score: accessibility 2/4, performance 3/4, theming 3/4, responsive 2/4, integrity 3/4 (13/20). This is not a WCAG conformance score or browser acceptance. Counts: P0 0, P1 1, P2 3, P3 0.

1. **P1 — Unsaved-change coverage misses SPA Back and logout.** `ManagerLayout.jsx:15-16` guards sidebar navigation and beforeunload, while `ManagerShell.jsx:30-35` calls logout without consulting draft state. Browser history navigation within the app does not trigger beforeunload, and there is no history guard. Drafts can be discarded through these paths even though sidebar navigation confirms first. Recommend `$impeccable harden`: share draft/busy guard with logout and history navigation, and exercise cancel/confirm on browser Back and logout. In-flight mutations also need explicit coverage. Source-confirmed missing guard; data-loss reproduction in browser remains pending.

2. **P2 — Package error focus/associations incomplete.** `PackageEditor.jsx:24-25,38,56` attempts focus using `package-${firstErrorKey}`; products, bulkTiers, amenities and images have no corresponding focus target, and select error messages have no ID/aria-describedby link. Required package fields show an asterisk without required/aria-required. Users navigating by keyboard or screen reader can have difficulty locating invalid groups. Relevant WCAG: 1.3.1, 3.3.1, 3.3.2. Recommend `$impeccable harden`: focusable group/summary targets and associated error descriptions; verify actual announcements before claiming conformance.

3. **P2 — Narrow-screen long values need layout verification.** `PackagesWorkspace.jsx (subscription price list)` uses a two-column intrinsic price definition list; `OrdersWorkspace.jsx:11-14` leaves order IDs/recipient values without wrapping; `ManagerShell.jsx:46-62` places account and logout controls in one row. Unlike product names, these paths do not consistently constrain long values. Potential overflow at 320 CSS px/200% text scaling is unconfirmed. Recommend `$impeccable adapt`: test long Vietnamese account names, order IDs and large amounts, then add min-width/wrapping rules only where measured overflow occurs. WCAG 1.4.10 needs browser verification.

4. **P2 — Catalog thumbnail optimization bypassed.** `ProductsWorkspace.jsx:26` uses `Image unoptimized` for remote catalog thumbnails, so small rendered images may transfer full originals. Local blob previews also use unoptimized appropriately and are not counted as a defect. Recommend `$impeccable optimize`: measure remote thumbnail transfer sizes, then use the configured image optimizer or backend thumbnails where supported. Do not alter upload previews.

Positive evidence: labeled mobile Sheet navigation, skip link/current page state, focus styles, mostly 44px controls, responsive product rows, abortable reads, explicit loading/empty/error/retry states, preserved drafts on save failure, disabled duplicate submissions, success only after awaited backend save, and post-save refresh errors distinguished from failed saves. Token-based colors dominate manager components; dark contrast, reduced-motion behavior and runtime performance have not been measured.

Next priority: `$impeccable harden` for draft/error paths, `$impeccable adapt` for measured responsive issues, `$impeccable optimize` for thumbnail transfer evidence; `$impeccable polish` only after functional fixes. No large redesign or business expansion is proposed.

## Unverified

No authenticated manager browser session or fresh desktop/mobile captures were obtained in this pass. Keyboard focus order/traps, screen-reader announcements, contrast, dark theme, touch gestures, 320px reflow, text scaling, virtual keyboard/footer behavior and real browser save/error/409/session-expiry flows remain unverified. Audit findings are source evidence or explicitly labeled layout risks, not visual acceptance. Production build proves compilation, not deployed API connectivity, uploads or persistence. No cloud settings or current Actions run were verified.

## Addendum — 2026-10-17

Superseded since this report was written: `npm test` now runs more than the 60 tests listed above, and
logout is guarded by the same draft/busy check as sidebar navigation (`ManagerLayout` `beforeLogout`), so
the logout half of P1 is addressed. Still open from P1: SPA Back/Forward (`popstate`) is not guarded;
`beforeunload` does not fire for client-side history navigation. Changing that needs a design that is
exercised in a real browser against the Next.js router, so it is deliberately not part of a source-only change.
In-flight order status updates register as busy so navigation, logout and tab close wait for them.
