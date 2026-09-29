/**
 * checkoutStyles.js
 * Class dùng chung cho checkout — "atelier" của TotMart (xem DESIGN.md):
 * cream #FFFAF8, clay #F0DDD5, terracotta #C85C3C / #B14B2D, espresso #2C1810.
 * CTA storefront: bo 2xl, chữ hoa, tracking rộng. Tiêu đề: Playfair (font-serif).
 */

const FOCUS =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C85C3C]";

export const BTN_PRIMARY = [
  "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5",
  "bg-[#C85C3C] text-white text-[11px] font-extrabold uppercase tracking-[0.16em]",
  "transition-colors duration-200 hover:bg-[#B14B2D] active:scale-[0.99]",
  "disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed",
  FOCUS,
].join(" ");

export const BTN_SECONDARY = [
  "inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5",
  "border border-[#F0DDD5] bg-white text-[#2C1810] text-[11px] font-extrabold uppercase tracking-[0.16em]",
  "transition-colors duration-200 hover:border-[#C85C3C]/60 hover:text-[#B14B2D]",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  FOCUS,
].join(" ");

export const INPUT = [
  "w-full rounded-xl border border-[#F0DDD5] bg-white px-3.5 py-2.5 text-sm text-[#2C1810]",
  "placeholder:text-stone-400 transition-colors duration-200",
  "focus:outline-none focus:border-[#C85C3C] focus:ring-2 focus:ring-[#C85C3C]/15",
  "disabled:opacity-60",
].join(" ");

export const FOCUS_RING = FOCUS;
