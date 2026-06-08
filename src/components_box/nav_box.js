"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronDown,
  User,
  ShoppingBag,
  Package,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/app/context/CartContext";
import CartDrawer from "@/app/(client)/components/Cart_component/cart_drawer";
import { BAR_H } from "@/components_box/announcement-bar"; // import hằng số

// ─── Nav data ─────────────────────────────────────────────────────────────────

const shopLinks = [
  { name: "TotMartBox", desc: "Hộp quà tinh tuyển", href: "/totmartbox" },
  { name: "ShopTotMart", desc: "Cửa hàng chính", href: "/homepage" },
  { name: "Gift", desc: "Quà tặng đặc biệt", href: "/gift" },
  { name: "Subscribe", desc: "Gói hàng tháng", href: "/products/Subscriber" },
  { name: "TotMart", desc: "Thương hiệu TotMart", href: "/totmart" },
  { name: "Past Themes", desc: "Chủ đề đã qua", href: "/past-themes" },
];

const aboutMega = {
  ABOUT: [
    {
      label: "Our Story",
      desc: "Câu chuyện của chúng tôi",
      href: "/pages/about",
    },
    {
      label: "Our Makers",
      desc: "Gặp gỡ nghệ nhân",
      href: "/pages/our-makers",
    },
    {
      label: "Maker's Documentary",
      desc: "Phim tài liệu",
      href: "/pages/our-makers",
    },
  ],
  SUPPORT: [
    { label: "FAQ", desc: "Câu hỏi thường gặp", href: "/pages/faq" },
    { label: "Contact Us", desc: "Liên hệ hỗ trợ", href: "/pages/contact-us" },
  ],
  INFORMATION: [
    {
      label: "Our Blog",
      desc: "Câu chuyện & chia sẻ",
      href: "/pages/our-blog",
    },
    {
      label: "Today's Offers",
      desc: "Ưu đãi hôm nay",
      href: "/pages/offers-discounts-coupons",
    },
    { label: "Community", desc: "Cộng đồng TotMart", href: "#" },
    { label: "Careers", desc: "Tuyển dụng", href: "#" },
    { label: "Rewards", desc: "Điểm thưởng", href: "#" },
    { label: "Refer a Friend", desc: "Giới thiệu bạn bè", href: "#" },
  ],
};

// ─── Chiều cao cố định ────────────────────────────────────────────────────────

export const NAV_H = 60; // px

// Tổng chiều cao header = ann bar + nav — dùng cho layout padding
export const HEADER_H = BAR_H + NAV_H; // 100px

// ─── Dropdowns ────────────────────────────────────────────────────────────────

function ShopDropdown({ onClose }) {
  return (
    <div className="absolute top-full left-0 pt-1 w-60 z-50">
      <div className="bg-[#faf8f4] border border-stone-200 shadow-xl rounded-xl overflow-hidden">
        <div className="h-0.5 bg-linear-to-r from-amber-300 to-amber-500" />
        <div className="py-1.5">
          {shopLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={onClose}
              className="group flex items-start gap-2.5 px-4 py-2.5 hover:bg-amber-50 transition-colors"
            >
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 group-hover:scale-125 transition-transform" />
              <div>
                <span className="text-[13px] font-bold text-stone-800 group-hover:text-amber-800 uppercase tracking-wide block leading-snug">
                  {link.name}
                </span>
                <span className="text-[11px] text-stone-400 group-hover:text-amber-600 transition-colors">
                  {link.desc}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutMegaMenu({ onClose }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 w-150 z-50">
      <div className="bg-[#faf8f4] border border-stone-200 shadow-xl rounded-xl overflow-hidden">
        <div className="h-0.5 bg-linear-to-r from-amber-300 via-amber-500 to-amber-300" />
        <div className="grid grid-cols-3 gap-0 py-6 px-5">
          {Object.entries(aboutMega).map(([heading, links], colIdx, arr) => (
            <div
              key={heading}
              className={cn(
                "pr-5",
                colIdx < arr.length - 1 && "border-r border-stone-200 mr-5",
              )}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 mb-3 flex items-center gap-1.5">
                <span className="inline-block w-3 h-px bg-amber-400" />
                {heading}
              </p>
              <ul className="space-y-0.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      onClick={onClose}
                      className="group block px-2 py-1.5 rounded-lg hover:bg-amber-50 transition-colors"
                    >
                      <span className="text-[13px] font-semibold text-stone-800 group-hover:text-amber-800 transition-colors block">
                        {l.label}
                      </span>
                      <span className="text-[11px] text-stone-400 group-hover:text-amber-600 transition-colors">
                        {l.desc}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="bg-stone-900 px-5 py-2.5 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            Hơn 120 nghệ nhân Việt Nam
          </span>
          <Link
            href="/pages/our-makers"
            onClick={onClose}
            className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
          >
            Xem tất cả <ChevronRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Navigation ──────────────────────────────────────────────────────────

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { cartCount, isMounted } = useCart();

  // Trang có hero fullscreen → nav trong suốt + chữ sáng lúc chưa cuộn
  const isLightPage = pathname === "/";

  const isSolidPage =
    pathname === "/products/Subscriber" || pathname === "/Subscriber";

  const [open, setOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // annH được đọc từ --ann-h (do AnnouncementBarBox set) — phản ánh 0 khi đã dismiss
  const [annH, setAnnH] = useState(BAR_H); // khởi tạo = BAR_H (trước khi dismiss)

  // Cuộn vượt quá ann bar + 10px → coi như đã "scrolled"
  const [scrolled, setScrolled] = useState(false);

  // isPastThreshold: với light page, chỉ đổi style khi đã cuộn qua hẳn ann bar
  // với trang thường thì luôn dùng style solid
  const isPastThreshold = isSolidPage || !isLightPage || scrolled;

  const navRef = useRef(null);

  // Theo dõi --ann-h khi AnnouncementBar bị dismiss
  useEffect(() => {
    const read = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--ann-h")
        .trim();
      const h = parseInt(v) || 0;
      setAnnH(h);
    };
    // Đọc ngay khi mount
    read();
    // Lắng nghe thay đổi style trên <html>
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => observer.disconnect();
  }, []);

  // Đồng bộ trạng thái scroll khi đổi trang hoặc annH thay đổi
  useEffect(() => {
    const sync = () => {
      const y = window.scrollY;
      // scrolled = true khi cuộn qua khỏi vùng ann bar (+ 10px buffer)
      setScrolled(y > annH + 10);
    };
    const id = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(id);
  }, [pathname, annH]);

  // Lắng nghe scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > annH + 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [annH]);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const close = () => setOpen(null);

  // ── Màu sắc ────────────────────────────────────────────────────────────────
  const textCls = isPastThreshold
    ? "text-stone-800 hover:text-amber-600"
    : isLightPage
      ? "text-stone-100 hover:text-white drop-shadow-sm"
      : "text-stone-500 hover:text-stone-800";

  const iconCls = isPastThreshold
    ? "text-stone-800"
    : isLightPage
      ? "text-stone-100 hover:text-white"
      : "text-stone-500";

  // ── Vị trí top của nav ─────────────────────────────────────────────────────
  // - Luôn nằm ngay bên dưới ann bar (top = annH)
  // - Khi scroll qua ann bar → ann bar biến mất khỏi viewport → nav "dính" top=0
  //   nhưng thực ra annH lúc này vẫn = BAR_H (chưa dismiss), scroll làm ann bar
  //   ra ngoài viewport tự nhiên → nav theo sau
  // → Dùng position: fixed + top = annH là đủ. Khi cuộn, cả ann bar và nav
  //   đều fixed nên cùng hiển thị → không bao giờ đè nhau.
  const navTop = annH; // luôn = BAR_H (40) hoặc 0 nếu đã dismiss

  return (
    <>
      <nav
        ref={navRef}
        className={cn(
          "fixed left-0 right-0 z-40 transition-all duration-500 border-b",
          // z-40 thấp hơn ann bar (z-50) để ann bar luôn nằm trên
          scrolled
            ? "bg-[#faf8f4]/95 backdrop-blur-md border-stone-200 shadow-sm"
            : "bg-transparent border-transparent",
        )}
        style={{ top: navTop, height: NAV_H }}
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                  isPastThreshold
                    ? "bg-amber-800 text-white"
                    : isLightPage
                      ? "bg-white/20 text-white backdrop-blur-xs"
                      : "bg-stone-200 text-stone-500 group-hover:bg-amber-100",
                )}
              >
                <Package size={16} />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className={cn(
                    "text-[16px] font-black tracking-tight transition-colors duration-300",
                    isPastThreshold
                      ? "text-stone-900"
                      : isLightPage
                        ? "text-white"
                        : "text-stone-500",
                  )}
                >
                  TotMart
                </span>
                <span
                  className={cn(
                    "text-[9px] font-semibold uppercase tracking-[0.18em] transition-colors",
                    isPastThreshold
                      ? "text-amber-700"
                      : isLightPage
                        ? "text-amber-200/90"
                        : "text-amber-600/60",
                  )}
                >
                  Craft & Gift
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              <div
                className="relative"
                onMouseEnter={() => setOpen("shop")}
                onMouseLeave={() => setOpen(null)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all duration-300",
                    textCls,
                  )}
                >
                  Shop
                  <ChevronDown
                    size={13}
                    className={cn(
                      "transition-transform",
                      open === "shop" && "rotate-180",
                    )}
                  />
                </button>
                {open === "shop" && <ShopDropdown onClose={close} />}
              </div>

              <div
                className="relative"
                onMouseEnter={() => setOpen("about")}
                onMouseLeave={() => setOpen(null)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all duration-300",
                    textCls,
                  )}
                >
                  Về chúng tôi
                  <ChevronDown
                    size={13}
                    className={cn(
                      "transition-transform",
                      open === "about" && "rotate-180",
                    )}
                  />
                </button>
                {open === "about" && <AboutMegaMenu onClose={close} />}
              </div>

              <Link
                href="/pages/our-blog"
                className={cn(
                  "px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all duration-300",
                  textCls,
                )}
              >
                Blog
              </Link>

              <Link
                href="/brands"
                className={cn(
                  "px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all duration-300",
                  textCls,
                )}
              >
                Thương hiệu
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              onClick={() => router.push("/products/Subscriber")}
              className={cn(
                "hidden md:inline-flex h-9 px-4 text-[11px] font-black uppercase tracking-[0.15em] rounded-full transition-all duration-300 border",
                isPastThreshold
                  ? "bg-amber-800 text-white border-transparent hover:bg-amber-900"
                  : isLightPage
                    ? "bg-white text-stone-900 border-transparent hover:bg-stone-100"
                    : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-amber-50",
              )}
            >
              Subscribe
            </Button>

            <button
              onClick={() => router.push("/login")}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-black/5",
                iconCls,
              )}
            >
              <User size={18} />
            </button>

            <button
              onClick={() => setCartOpen((v) => !v)}
              className={cn(
                "relative w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-black/5",
                iconCls,
              )}
            >
              <ShoppingBag size={18} />
              {isMounted && (
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center text-[10px] font-black text-white",
                    cartCount > 0 ? "bg-amber-600" : "bg-stone-400 opacity-60",
                  )}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                "lg:hidden w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-black/5",
                iconCls,
              )}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#faf8f4] border-t border-stone-200 shadow-2xl overflow-y-auto max-h-[75vh]">
            <div className="h-0.5 bg-linear-to-r from-amber-300 via-amber-500 to-amber-300" />
            <div className="p-4 space-y-2">
              <div className="rounded-xl border border-stone-200 overflow-hidden">
                <button
                  onClick={() => setMobileShopOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-black text-stone-800 uppercase tracking-wider bg-white hover:bg-amber-50 transition-colors"
                >
                  Shop
                  <ChevronRight
                    size={16}
                    className={cn(
                      "text-stone-400 transition-transform",
                      mobileShopOpen && "rotate-90",
                    )}
                  />
                </button>
                {mobileShopOpen && (
                  <div className="bg-stone-50 border-t border-stone-100 divide-y divide-stone-100">
                    {shopLinks.map((l) => (
                      <Link
                        key={l.name}
                        href={l.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-amber-50 transition-colors group"
                      >
                        <div>
                          <span className="text-sm font-bold text-stone-800 uppercase tracking-wide block group-hover:text-amber-800 transition-colors">
                            {l.name}
                          </span>
                          <span className="text-xs text-stone-400">
                            {l.desc}
                          </span>
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-stone-300 group-hover:text-amber-500 transition-colors"
                        />
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-stone-200 overflow-hidden">
                <button
                  onClick={() => setMobileAboutOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-black text-stone-800 uppercase tracking-wider bg-white hover:bg-amber-50 transition-colors"
                >
                  Về chúng tôi
                  <ChevronRight
                    size={16}
                    className={cn(
                      "text-stone-400 transition-transform",
                      mobileAboutOpen && "rotate-90",
                    )}
                  />
                </button>
                {mobileAboutOpen && (
                  <div className="bg-stone-50 border-t border-stone-100 p-4 space-y-4">
                    {Object.entries(aboutMega).map(([heading, links]) => (
                      <div key={heading}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 mb-2">
                          {heading}
                        </p>
                        {links.map((l) => (
                          <Link
                            key={l.label}
                            href={l.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between px-2 py-2 rounded-lg hover:bg-amber-50 group transition-colors"
                          >
                            <div>
                              <span className="text-sm font-semibold text-stone-800 group-hover:text-amber-800 block transition-colors">
                                {l.label}
                              </span>
                              <span className="text-xs text-stone-400">
                                {l.desc}
                              </span>
                            </div>
                            <ChevronRight
                              size={13}
                              className="text-stone-300 group-hover:text-amber-500 transition-colors"
                            />
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {[
                { label: "Blog", href: "/pages/our-blog" },
                { label: "Thương hiệu", href: "/brands" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm font-black text-stone-800 uppercase tracking-wider hover:bg-amber-50 hover:text-amber-800 transition-colors"
                >
                  {item.label}
                  <ChevronRight size={16} className="text-stone-300" />
                </Link>
              ))}

              <div className="space-y-2 pt-1 border-t border-stone-200">
                <Button
                  onClick={() => {
                    router.push("/products/Subscriber");
                    setMobileOpen(false);
                  }}
                  className="w-full bg-amber-800 text-white py-6 rounded-xl font-black uppercase tracking-widest hover:bg-amber-900 transition-colors"
                >
                  Subscribe Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    router.push("/login");
                    setMobileOpen(false);
                  }}
                  className="w-full border-2 border-stone-800 text-stone-900 py-6 rounded-xl font-black uppercase tracking-widest"
                >
                  Đăng nhập / Tài khoản
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <CartDrawer open={cartOpen} setOpen={setCartOpen} />
    </>
  );
}
