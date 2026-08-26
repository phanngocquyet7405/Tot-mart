---
name: TotMart
description: Dual-shop commerce — terracotta gift ritual beside a green catalog, quiet shadcn admin.
colors:
  terracotta: "#C85C3C"
  terracotta-deep: "#B14B2D"
  terracotta-wash: "#FFF0EB"
  clay-border: "#F0DDD5"
  cream: "#FFFAF8"
  warm-paper: "#f5f0e8"
  blush-paper: "#FFF5F2"
  espresso: "#2C1810"
  forest-canopy: "#4a7c44"
  market-leaf: "#15803d"
  harvest-gold: "#eab308"
  ink: "oklch(0.205 0 0)"
  canvas: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  muted-ink: "oklch(0.556 0 0)"
  hairline: "oklch(0.922 0 0)"
  muted-fill: "oklch(0.97 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  stone-text: "#57534e"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Playfair Display, Georgia, serif"
    fontSize: "clamp(1.5rem, 3vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "normal"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.2em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  2xl: "16px"
  3xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  button-shop:
    backgroundColor: "{colors.terracotta}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.2xl}"
    padding: "12px 32px"
  button-shop-hover:
    backgroundColor: "{colors.terracotta-deep}"
  button-catalog:
    backgroundColor: "{colors.market-leaf}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "10px 24px"
  button-admin:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
  button-admin-outline:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
  input-admin:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "32px"
    padding: "4px 10px"
  card-product:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.xl}"
    padding: "0px"
  card-plan:
    backgroundColor: "{colors.cream}"
    rounded: "{rounded.3xl}"
    padding: "0px"
  chip-promo:
    backgroundColor: "{colors.forest-canopy}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "6px 16px"
---

# Design System: TotMart

## Overview

**Creative North Star: "The Dual Shop"**

TotMart is one storefront with two counters, not a blended average. Gift, subscription, checkout, and box storytelling sit on warm cream paper with Fired Terracotta as the clay seal and Playfair Display as the voice of the unboxing. Catalog, header merchandising, and product cards sit on white supermarket shelves: Forest Canopy and Market Leaf do the sale work, Plus Jakarta Sans does the price and the SKU. Admin does not pretend to be either shop; it stays compact, near-black shadcn chrome so operators can scan.

The split is the identity. Future screens pick a counter and stay there. A subscription page that suddenly wears grocery green, or a product grid flooded in terracotta, is a collapse of Dual Shop, not a unification.

**Key Characteristics:**
- Two first-class dialects: atelier (cream, clay, espresso, serif) and market (white, leaf green, harvest gold, sans).
- Two control registers: plump uppercase storefront CTAs vs compact sentence-case admin controls.
- Accents used as seals and badges, not as page floods.
- Depth is mostly state: hairlines at rest, lift on hover or on a featured plan.
- Vietnamese-capable Playfair Display + Plus Jakarta Sans pairing, already loaded with Vietnamese subsets.

## Colors

The palette is two shops sharing paper and stone, not a single accent with tints.

### Primary
- **Fired Terracotta** (`terracotta`): the clay seal of the gift counter — CTAs, selected plan borders, stepper marks, recommended badges, loading spinners on box pages.
- **Fired Terracotta Deep** (`terracotta-deep`): hover of that seal; never a different hue.

### Secondary
- **Forest Canopy** (`forest-canopy`): the header promo chip (“Save up to 70%”). Same role as catalog greens; do not add a third green.
- **Market Leaf** (`market-leaf`): discount badges, catalog card hover borders, grocery-style primary buttons in `globals.css`.

### Tertiary
- **Harvest Gold** (`harvest-gold`): scarce highlight chips and badge labels on product cards. Never a background wash.

### Neutral
- **Warm Cream** (`cream`): box/subscribe page canvas.
- **Warm Paper** (`warm-paper`): about/story section grounds.
- **Blush Paper** (`blush-paper`): plan-card image wells.
- **Clay Border** (`clay-border`): atelier hairlines and unselected dots.
- **Terracotta Wash** (`terracotta-wash`): selected plan fills.
- **Espresso** (`espresso`): ink on atelier headlines and hover sweeps.
- **Canvas / Foreground / Ink** (`canvas`, `foreground`, `ink`): shadcn light-theme primitives for admin and UI kit.
- **Muted Ink / Hairline / Muted Fill**: secondary copy, dividers, quiet fills.
- **Stone Text** (`stone-text`): storefront supporting copy (`stone-500`/`stone-600` family).
- **Destructive**: form and stock errors only.

### Named Rules
**The Dual Shop Rule.** Gift/subscribe/checkout speak clay. Catalog/header speak leaf. Do not average them into one accent per page.

**The Seal Not Flood Rule.** Terracotta or leaf occupies a small share of any screen — buttons, chips, rules, selected states. Large fields stay cream, paper, or white.

**The No Third Accent Rule.** No neon, glassmorphism, purple, or cyan families. Stay clay, leaf, cream, stone, espresso.

## Typography

**Display Font:** Playfair Display (Georgia, serif)
**Body Font:** Plus Jakarta Sans (system-ui, sans-serif)
**Label/Mono Font:** Plus Jakarta Sans at label scale (no separate mono required)

**Character:** Serif is the atelier voice — editorial, Vietnamese-capable, used for heroes and plan titles. Sans is the market and admin voice — prices, nav, tables, compact controls. Uppercase tracked labels are the shop’s stamp, not a second display face.

### Hierarchy
- **Display** (400, clamp 2.25–3.75rem, 1.1): story and box heroes only.
- **Headline** (600, clamp 1.5–2.25rem, 1.2): section titles on atelier pages.
- **Title** (700, 1.125rem, 1.35): product names, admin row titles, card headings.
- **Body** (400, 1rem, 1.625): running copy and form helper text.
- **Label** (800, 10px, 0.2em tracking, uppercase): promo chips, plan kicker lines, table headers, shop CTAs.

### Named Rules
**The Two Voices Rule.** Playfair does not set UI chrome. Plus Jakarta does not set the unboxing hero.

## Layout

Storefront shells cap around `max-w-7xl` (header, footer, product detail) with `px-4`–`px-8`. Editorial/story pages often sit at `max-w-5xl` / `max-w-6xl` with larger vertical rhythm (`py-24`). Catalog product grids are 1 / 2 / 3 / 4 columns with `gap-6` (24px). Admin uses padded containers (`p-4`–`p-6`) and denser tables, not the atelier vertical luxury.

Sticky white header with a bottom hairline is the market shop’s masthead. Box routes may swap in the TotMartBox nav, but width and padding stay in the same 7xl family.

## Elevation & Depth

Hybrid and stateful. Catalog and admin surfaces rest flat: white cards, `border-gray-100` / shadcn `ring-1 ring-foreground/10`. Product cards pick up `shadow-lg` on hover (`shadow-totmart`). Plan cards sit on a clay-tinted drop (`0 8px 24px rgba(44,24,16,0.04)`), featured plans on `0 20px 40px rgba(200,92,60,0.12)`, and lift further with `translateY` on hover. Shadows answer state; they are not default page chrome.

### Shadow Vocabulary
- **Rest hairline** (`box-shadow: none` plus 1px border or `ring-foreground/10`): admin cards, default product cards.
- **Hover merchandise** (`shadow-lg`, ~300ms): product cards, `.shadow-totmart`.
- **Plan ambient** (`0 8px 24px rgba(44,24,16,0.04)`): default subscription cards.
- **Plan featured** (`0 20px 40px rgba(200,92,60,0.12)`): recommended box.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear as hover, featured, or drawer response.

## Shapes

Comfortably round, never sharp-retail and never pill-everything. shadcn’s root radius is 10px (`--radius: 0.625rem`); admin buttons and inputs follow that. Catalog product cards use ~12px. Shop CTAs use 16px (`rounded-2xl`). Plan cards and empty-state buttons use 24px (`rounded-3xl`). Promo chips in the header are the exception: nearly square (`rounded-sm`) so the leaf stamp feels stamped, not bubbly. Category thumbnails go fully circular. Atelier borders are clay (`clay-border`); market borders are gray-100/200; admin uses the hairline token.

## Components

Two registers. Storefront CTAs are plump, uppercase, clay or leaf. Admin/shadcn controls stay compact, sentence-case, near-black.

### Buttons
- **Shape:** shop 16px radius; admin 10px; header promo ~6px.
- **Primary (shop):** terracotta field, white label, tracked uppercase, `shadow-md`, hover terracotta-deep and a 0.5px rise.
- **Primary (catalog):** market-leaf or Forest Canopy, white type, medium weight — grocery, not atelier.
- **Primary (admin):** ink field, 32px tall, `text-sm font-medium`, focus ring `ring-3 ring-ring/50`.
- **Hover / Focus:** shop darkens the clay; admin uses primary/80 and a visible ring. Do not restyle admin buttons into uppercase clay.
- **Ghost / Outline:** muted fill or hairline border; no terracotta wash unless the control is on an atelier page.

### Chips
- **Promo (header):** Forest Canopy, white, tracked 10px type, tight radius.
- **Discount (catalog):** Market Leaf, white, pill.
- **Product badge:** Harvest Gold on near-black type, pill, uppercase.
- **Recommended plan:** terracotta pill with tracked label.

### Cards / Containers
- **Product card:** white, ~12px corners, gray-100 border, image square, hover leaf-tinted border and larger shadow, image scale 1.1.
- **Plan card:** cream, 24px corners, clay border, terracotta hairline across the top, image well in blush paper.
- **Admin card:** canvas, 12px (`rounded-xl`), 1px foreground/10 ring, 16px padding rhythm.

### Inputs / Fields
- **Style:** 32px tall, 10px radius, transparent fill, hairline border (admin primitive).
- **Focus:** border to ring token, `ring-3` at 50% opacity.
- **Error / Disabled:** destructive border/ring; disabled at 50% opacity with muted fill.
- **Atelier forms** (checkout/plan): same geometry is acceptable, but selected states use terracotta border and terracotta-wash fill, not ink.

### Navigation
- **Market header:** sticky white bar, gray-200 hairline, logo ~48px, search in the middle, icon actions on the right. Promo chip is Forest Canopy.
- **Box nav:** same 7xl width; atelier pages may drop the green promo chip.
- **Admin sidebar:** quiet shadcn sidebar tokens; current item uses sidebar-accent fill, not terracotta, unless the screen is already a box-plan tool that already uses clay.

### Product card (signature)
The catalog’s unit of merchandise: white tile, square photo, green discount, gold badge, heart/cart on hover. It must not inherit plan-card cream or 24px corners.

### Plan card (signature)
The gift counter’s unit: cream tile, 24px corners, clay seal, serif name, tracked kicker. It must not inherit grocery green badges.

## Do's and Don'ts

### Do:
- **Do** pick a counter per surface: clay/cream/serif for gift and subscribe; leaf/white/sans for catalog and header; ink/compact for admin.
- **Do** use Fired Terracotta as a seal (CTA, selected border, 2–4px rule), not as a page fill.
- **Do** keep Playfair on display/headline roles and Plus Jakarta on body, UI, and labels.
- **Do** keep hover lift and terracotta-tinted shadows on plan cards; keep product cards flatter until hover.
- **Do** preserve Vietnamese subsets on both families.

### Don't:
- **Don't** merge Dual Shop into one accent used on every page.
- **Don't** restyle shadcn admin buttons into plump uppercase clay (or the reverse).
- **Don't** introduce neon, glass, purple, or cyan.
- **Don't** set long body copy in Playfair.
- **Don't** treat about-page stats, founder names, or unused footer line names as visual proof — they are unverified product copy, not tokens.
