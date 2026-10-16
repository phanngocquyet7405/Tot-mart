# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are storefront shoppers in three jobs:

- People buying organic / artisan products for themselves
- People buying curated gifts or TotMartBox for someone else (personal or corporate)
- Recurring subscribers of monthly or themed boxes

Merchant users manage their own catalog and packages in `/manager`. The current delivery priority is completing this Vietnamese workspace for desktop and mobile. For this scope, merchant task success drives design decisions. Internal admin operators remain a separate audience with broader permissions; storefront shoppers remain the primary audience of the commerce experience.

## Product Purpose

TotMart is a bilingual (vi + en) commerce frontend for a hybrid catalog: a market of brands and products, plus curated boxes and subscription plans. Success is that a shopper can find, trust, and complete a purchase or subscription, and that operators can keep that catalog and those plans running.

## Positioning

TotMart is not only a generic product grid and not only a gift-box brand. Brands, individual products, curated boxes, and subscriptions are all real lines of the same product. Neighboring grocery or gift sites that only do one of those cannot truthfully claim this mix.

## Operating Context

Shoppers browse products, brands, and categories; use search, cart, wishlist, checkout, and profile (including my-subscriptions); and may subscribe to box plans. Locale is stored in a cookie (`TOTMART_LOCALE`), not in the URL. Merchants work under `/manager`; admin operators have a separate area in the same Next.js app. Catalog and commerce data come from the TotMart API, not from this repository.

## Current Delivery Priority — Merchant

Confirmed by the user on 2026-10-15: complete six Vietnamese merchant screens, usable on desktop and mobile: Tổng quan, Sản phẩm, Combo, Gift, Đăng ký hàng tháng, Đơn hàng. This scoped priority does not remove the storefront's existing Vietnamese and English locales.

### Merchant Business Rules

- Merchants manage only their own products and packages. Backend authorization remains authoritative; client-side filtering is not permission enforcement.
- Call a Box a **combo** in merchant-facing copy. Preserve backend identifiers such as `boxId` and `itemType: 'box'` where required by the API.
- Gift is created from a merchant-owned combo, with quantity discount tiers and paid amenities. Existing forms and handover documentation describe amenities as included in each gift, rather than independent checkout options.
- Monthly subscription packages originate from a combo or retail products. Payment is collected upfront for a term; display **Tổng thu trước** separately from **Bình quân mỗi tháng**. Monthly delivery does not imply automatic monthly charging. Existing terms are 1, 3, 6, and 12 months, subject to the backend contract.
- Merchants only view orders permitted by the current backend. Do not introduce merchant order mutations or admin operations.
- Admin assigns brands. Merchants cannot transfer ownership; any brand selector must use only backend-authorized choices.
- Payment amounts come from backend quotes. Any local calculation is an explicitly labeled estimate, never an authoritative checkout amount.

### Implementation Commitments

- Read the current source and API contract before changes. Resolve contract gaps against the backend before wiring unsupported behavior.
- Reuse the live components and API-backed flows in `src/app/manager`. The former `src/app/manager-design` prototype informed the original implementation and was removed on 2026-10-16 after dependency checks confirmed it was unused by the live workspace.
- Preserve accepted fixes for authorization, gift cart quotes, and subscription pricing, as documented in [ACCEPTANCE.md](docs/ACCEPTANCE.md) and [MERCHANT-CHANGES.md](docs/MERCHANT-CHANGES.md).
- Replace mock data with real API data. A simulated delay or local state update is not persistence; report save success only after backend confirmation. Distinguish save failure from a refresh failure after a successful save.
- Preserve the user's existing changes; make scoped edits without overwriting unrelated work.
- The user approved the implementation order in [MERCHANT-DESIGN-PLAN.md](docs/MERCHANT-DESIGN-PLAN.md) and subsequently authorized completing all six merchant screens, configuration documentation, tests and a clean FE ZIP. Live routes are `/manager` (overview) and `/manager/products`, `/manager/combos`, `/manager/gifts`, `/manager/subscriptions`, `/manager/orders`. Do not commit, push, deploy, change cloud variables or modify BE. Render remains public-read-only for agent verification; staging is not proof of a test database.

## Capabilities and Constraints

- Frontend-only Next.js app (`fe_totmart`); product data, auth, orders, and plans live on the existing TotMart API. Browser requests always use `/api`; `next.config.mjs` rewrites using server-only `API_URL`. `NEXT_PUBLIC_API_URL` is compatibility-only and must be `/api` or unset. The user approved `https://totmartapi-1.onrender.com/api` as the server target. Production requires a configured API origin; do not assume a public fallback. See [RENDER-CONNECTION.md](docs/RENDER-CONNECTION.md) for the current CORS and browser-session verification limits; keep Render checks read-only unless separately authorized.
- Confirmed storefront capabilities: catalog (products, brands, categories), TotMartBox / boxes, subscription plans, cart, wishlist, checkout, profile, FAQ / about / contact-style pages.
- Confirmed admin capabilities in this app: dashboard, products, brands, categories, boxes, subscription plans, orders, users.
- Locales `vi` and `en` via next-intl must remain.
- Undecided: whether about-page figures (founded 2018, 120+ makers, 50K+ customers, named founders) and footer product-line names (Snack Box, Boutique, Market) are real; do not treat them as confirmed proof.

## Brand Commitments

- Name: TotMart / TotMartBox.
- Voice: Vietnamese-first, with English as a required second locale.
- Identity assets already in the app (favicons under `/icon*.png`, `/icon.svg`, `/apple-icon.png`) stay unless the user replaces them.

## Evidence on Hand

Real evidence is the running storefront and admin, i18n message files (`src/messages/vi.json`, `src/messages/en.json`), and live API-backed catalog/plan data. About-page stats, team names, and unused footer claims must not be fabricated or treated as verified until confirmed. Do not invent testimonials, customer counts, or press.

Merchant implementation evidence: the six routes under `src/app/manager`, their workspace/form components and `services/managerApi.js`. The mock-based `src/app/manager-design` prototype, `manager/lib/mock.js` and unused `LegacyManager.jsx` were removed on 2026-10-16; use the live workspace as the current interface reference. The prototype was never evidence of persisted data or supported backend behavior. Handover and acceptance records are [MERCHANT-CHANGES.md](docs/MERCHANT-CHANGES.md), [ACCEPTANCE.md](docs/ACCEPTANCE.md), and [FIXES.md](docs/FIXES.md); their historical test results are not a fresh verification of the current checkout.

The user supplied backend source at `C:/Users/84862/Desktop/totmart/TotMartAPI`. Merchant routes, package/product schemas/controllers, ownership and version services, quote engine, upload middleware and sample configuration were reviewed there. `scripts/verify-manager-backend.cjs` verifies the actual Express app with a new disposable MongoDB replica set, without reading developer `.env` or connecting to an existing database. These tests do not certify a deployed BE, Cloudinary uploads, or browser behavior. See [MERCHANT-HANDOFF.md](docs/MERCHANT-HANDOFF.md), [MERCHANT-VERIFICATION.md](docs/MERCHANT-VERIFICATION.md) and [STAGING-DEPLOYMENT.md](docs/STAGING-DEPLOYMENT.md). OpenAPI has not been supplied.

The user confirmed the staging FE origin `https://tot-mart-git-staging-furiousfast189-3255s-projects.vercel.app`. A public GET to BE health with that exact Origin returned an exact CORS match and credentials permission; FE staging itself redirects unauthenticated visitors to Vercel authentication. Preview branch variables and Production variables have not been read independently from cloud settings.

## Product Principles

1. Serve the shopper job first (buy for self, gift, or subscribe) without dropping the hybrid catalog.
2. Keep Vietnamese-first copy and a working English locale; do not design as an English-only store.
3. Treat this repo as the client of an existing API; UI must not invent catalog truth the backend does not provide.
4. Keep merchant and admin responsibilities distinct. Prioritize merchant task completion within the current `/manager` scope without weakening ownership or backend permissions.
5. Do not promote unverified heritage, scale, or team claims.

## Accessibility & Inclusion

WCAG 2.2 Level AA is the required bar. Locales `vi` and `en` are in-scope; fonts already include Vietnamese subsets.
