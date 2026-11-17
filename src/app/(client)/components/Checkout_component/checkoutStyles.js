/**
 * checkoutStyles.js
 * Class dùng chung cho checkout — chuẩn semantic tokens TotMart:
 * bg-background, border-border, bg-primary (terracotta), text-foreground.
 * CTA storefront: bo 2xl, chữ hoa, tracking rộng. Tiêu đề: Playfair (font-serif).
 */

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export const BTN_PRIMARY = [
  "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 min-h-11",
  "bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.14em]",
  "transition-colors duration-200 hover:bg-primary/90 active:scale-[0.99]",
  "disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed shadow-xs",
  FOCUS,
].join(" ");

export const BTN_SECONDARY = [
  "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 min-h-11",
  "border border-border bg-card text-foreground text-xs font-bold uppercase tracking-[0.14em]",
  "transition-colors duration-200 hover:bg-muted hover:border-primary/60",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  FOCUS,
].join(" ");

export const INPUT = [
  "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 min-h-11 text-sm text-foreground",
  "placeholder:text-muted-foreground transition-colors duration-200",
  "focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring",
  "disabled:opacity-60",
].join(" ");

export const FOCUS_RING = FOCUS;
