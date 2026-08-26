# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are storefront shoppers in three jobs:

- People buying organic / artisan products for themselves
- People buying curated gifts or TotMartBox for someone else (personal or corporate)
- Recurring subscribers of monthly or themed boxes

Internal operators using admin (catalog, orders, boxes, plans, users) are a secondary audience. Admin remains in this app; it is not the primary user for design decisions.

## Product Purpose

TotMart is a bilingual (vi + en) commerce frontend for a hybrid catalog: a market of brands and products, plus curated boxes and subscription plans. Success is that a shopper can find, trust, and complete a purchase or subscription, and that operators can keep that catalog and those plans running.

## Positioning

TotMart is not only a generic product grid and not only a gift-box brand. Brands, individual products, curated boxes, and subscriptions are all real lines of the same product. Neighboring grocery or gift sites that only do one of those cannot truthfully claim this mix.

## Operating Context

Shoppers browse products, brands, and categories; use search, cart, wishlist, checkout, and profile (including my-subscriptions); and may subscribe to box plans. Locale is stored in a cookie (`TOTMART_LOCALE`), not in the URL. Operators work in the same Next.js app under admin routes. Catalog and commerce data come from the TotMart API, not from this repository.

## Capabilities and Constraints

- Frontend-only Next.js app (`fe_totmart`); product data, auth, orders, and plans live on the existing TotMart API (default public origin `https://totmartapi.onrender.com/api`, overridable via `NEXT_PUBLIC_API_URL`, rewritten through `/api/*`).
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

## Product Principles

1. Serve the shopper job first (buy for self, gift, or subscribe) without dropping the hybrid catalog.
2. Keep Vietnamese-first copy and a working English locale; do not design as an English-only store.
3. Treat this repo as the client of an existing API; UI must not invent catalog truth the backend does not provide.
4. Admin stays operable in-app, but storefront shopper success outranks operator chrome.
5. Do not promote unverified heritage, scale, or team claims.

## Accessibility & Inclusion

WCAG 2.2 Level AA is the required bar. Locales `vi` and `en` are in-scope; fonts already include Vietnamese subsets.
