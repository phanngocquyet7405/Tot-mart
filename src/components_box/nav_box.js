"use client";

import React, { useState, useEffect, useRef, useContext } from "react";
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
  Heart,
  LogOut,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/app/context/CartContext";
import { useWishlist } from "@/app/context/WishlistContext";
import { AppContext } from "@/app/context/AppContext";
import CartDrawer from "@/app/(client)/components/Cart_component/cart_drawer";
import { BAR_H } from "@/components_box/announcement-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Nav data ─────────────────────────────────────────────────────────────────

const shopLinks = [
  { name: "Sản phẩm", desc: "Tất cả sản phẩm thủ công & hữu cơ", href: "/products" },
  { name: "Combo", desc: "Combo sản phẩm tiết kiệm", href: "/box" },
  { name: "Hộp quà", desc: "Hộp quà tặng kèm tiện ích", href: "/gift" },
  { name: "Gói đăng ký", desc: "Hộp quà định kỳ hàng tháng", href: "/subscription" },
  { name: "Gian hàng đối tác", desc: "Thương hiệu & làng nghề Việt", href: "/brands" },
];

const blogLinks = [
  { name: "Câu chuyện TotMart", desc: "Hành trình sản vật & văn hóa", href: "/pages/our-blog" },
  { name: "Gặp gỡ nghệ nhân", desc: "Người giữ lửa nghề truyền thống", href: "/pages/our-makers" },
  { name: "Tin tức & Sự kiện", desc: "Cập nhật hoạt động mới nhất", href: "/pages/news" },
];

const aboutMega = {
  "VỀ TOTMART": [
    {
      label: "Câu chuyện thương hiệu",
      desc: "Tầm nhìn, sứ mệnh và giá trị cốt lõi",
      href: "/pages/about",
    },
    {
      label: "Nghệ nhân & Làng nghề",
      desc: "Hợp tác xã và nghệ nhân bản địa",
      href: "/pages/our-makers",
    },
    {
      label: "Thông tin chứng nhận",
      desc: "Tiêu chuẩn hữu cơ & thương mại công bằng",
      href: "/pages/information",
    },
  ],
  "HỖ TRỢ KHÁCH HÀNG": [
    { label: "Câu hỏi thường gặp (FAQ)", desc: "Hướng dẫn mua hàng và chính sách", href: "/pages/faq" },
    { label: "Liên hệ chúng tôi", desc: "Hỗ trợ đơn hàng và dịch vụ", href: "/pages/contact-us" },
  ],
  "ƯU ĐÃI & THÀNH VIÊN": [
    {
      label: "Ưu đãi hôm nay",
      desc: "Mã giảm giá và chương trình khuyến mãi",
      href: "/pages/offers-discounts-coupons",
    },
    {
      label: "Gói đăng ký tháng",
      desc: "Trải nghiệm hộp quà bất ngờ mỗi tháng",
      href: "/subscription",
    },
  ],
};

// ─── Chiều cao cố định ────────────────────────────────────────────────────────

export const NAV_H = 60; // px
export const HEADER_H = BAR_H + NAV_H; // 100px

// ─── Dropdowns ────────────────────────────────────────────────────────────────

function ShopDropdown({ onClose }) {
  return (
    <div className="absolute top-full left-0 pt-1 w-64 z-50">
      <div className="bg-background border border-border shadow-xl rounded-xl overflow-hidden">
        <div className="h-0.5 bg-linear-to-r from-primary/60 to-primary" />
        <div className="py-1.5">
          {shopLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={onClose}
              className="group flex items-start gap-2.5 px-4 py-2.5 hover:bg-muted transition-colors"
            >
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 group-hover:scale-125 transition-transform" />
              <div>
                <span className="text-[13px] font-bold text-foreground group-hover:text-primary tracking-wide block leading-snug">
                  {link.name}
                </span>
                <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
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
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 w-160 z-50">
      <div className="bg-background border border-border shadow-xl rounded-xl overflow-hidden">
        <div className="h-0.5 bg-linear-to-r from-primary/40 via-primary to-primary/40" />
        <div className="grid grid-cols-3 gap-0 py-6 px-5">
          {Object.entries(aboutMega).map(([heading, links], colIdx, arr) => (
            <div
              key={heading}
              className={cn(
                "pr-5",
                colIdx < arr.length - 1 && "border-r border-border mr-5",
              )}
            >
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary mb-3 flex items-center gap-1.5">
                <span className="inline-block w-3 h-px bg-primary" />
                {heading}
              </p>
              <ul className="space-y-0.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      onClick={onClose}
                      className="group block px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors block">
                        {l.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                        {l.desc}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="bg-muted/60 border-t border-border px-5 py-2.5 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Kết nối với hơn 50+ làng nghề thủ công trên khắp Việt Nam
          </span>
          <Link
            href="/pages/our-makers"
            onClick={onClose}
            className="text-[11px] font-bold text-primary hover:text-primary/90 flex items-center gap-1 transition-colors"
          >
            Tìm hiểu thêm <ChevronRight size={12} />
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
  const { cartCount, isMounted, isCartOpen, setIsCartOpen, openCart } = useCart();
  const { wishlistCount = 0 } = useWishlist();
  const { user: userData, isLoading: userLoading, logout } = useContext(AppContext);

  // Trang có hero fullscreen: '/'
  const isLightPage = pathname === "/";
  const isSolidPage = pathname !== "/";

  const [open, setOpen] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [mobileBlogOpen, setMobileBlogOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);

  // annH được đọc từ --ann-h
  const [annH, setAnnH] = useState(BAR_H);
  const [scrolled, setScrolled] = useState(false);
  const isPastThreshold = isSolidPage || !isLightPage || scrolled;
  const navRef = useRef(null);

  useEffect(() => {
    const read = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--ann-h")
        .trim();
      const h = parseInt(v) || 0;
      setAnnH(h);
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sync = () => {
      const y = window.scrollY;
      setScrolled(y > annH + 10);
    };
    const id = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(id);
  }, [pathname, annH]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > annH + 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [annH]);

  useEffect(() => {
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const close = () => setOpen(null);

  // ── Màu sắc theo trạng thái cuộn ──
  const textCls = isPastThreshold
    ? "text-foreground hover:text-primary"
    : isLightPage
      ? "text-background hover:text-background drop-shadow-sm"
      : "text-muted-foreground hover:text-foreground";

  const iconCls = isPastThreshold
    ? "text-foreground"
    : isLightPage
      ? "text-background hover:text-background"
      : "text-muted-foreground";

  const navTop = annH;

  return (
    <>
      <nav
        ref={navRef}
        className={cn(
          "fixed left-0 right-0 z-40 transition-all duration-300 border-b",
          scrolled || isSolidPage
            ? "bg-background/95 backdrop-blur-md border-border shadow-xs"
            : "bg-transparent border-transparent",
        )}
        style={{ top: navTop, height: NAV_H }}
      >
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                  isPastThreshold
                    ? "bg-primary text-primary-foreground"
                    : isLightPage
                      ? "bg-background/20 text-background backdrop-blur-xs"
                      : "bg-muted text-muted-foreground group-hover:bg-muted",
                )}
              >
                <Package size={16} />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className={cn(
                    "text-[16px] font-black tracking-tight transition-colors duration-300",
                    isPastThreshold
                      ? "text-foreground"
                      : isLightPage
                        ? "text-background"
                        : "text-muted-foreground",
                  )}
                >
                  TotMart
                </span>
                <span
                  className={cn(
                    "text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors",
                    isPastThreshold
                      ? "text-primary"
                      : isLightPage
                        ? "text-primary"
                        : "text-primary/70",
                  )}
                >
                  Craft & Gift
                </span>
              </div>
            </Link>

            {/* Menu Desktop */}
            <div className="hidden lg:flex items-center gap-1">
              <div
                className="relative"
                onMouseEnter={() => setOpen("shop")}
                onMouseLeave={() => setOpen(null)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all duration-300 pointer-coarse:min-h-11",
                    textCls,
                  )}
                >
                  Cửa hàng
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
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all duration-300 pointer-coarse:min-h-11",
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

              <div
                className="relative"
                onMouseEnter={() => setOpen("blog")}
                onMouseLeave={() => setOpen(null)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all duration-300 pointer-coarse:min-h-11",
                    textCls,
                  )}
                >
                  Bài viết
                  <ChevronDown
                    size={13}
                    className={cn(
                      "transition-transform",
                      open === "blog" && "rotate-180",
                    )}
                  />
                </button>
                {open === "blog" && (
                  <div className="absolute top-full left-0 pt-1 w-64 z-50">
                    <div className="bg-background border border-border shadow-xl rounded-xl overflow-hidden">
                      <div className="h-0.5 bg-linear-to-r from-primary/60 to-primary" />
                      <div className="py-1.5">
                        {blogLinks.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={close}
                            className="group flex items-start gap-2.5 px-4 py-2.5 hover:bg-muted transition-colors"
                          >
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0 group-hover:scale-125 transition-transform" />
                            <div>
                              <span className="text-[13px] font-bold text-foreground group-hover:text-primary tracking-wide block leading-snug">
                                {link.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors">
                                {link.desc}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/brands"
                className={cn(
                  "px-3 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all duration-300 pointer-coarse:min-h-11 flex items-center",
                  textCls,
                )}
              >
                Thương hiệu
              </Link>
            </div>
          </div>

          {/* Action icons bên phải */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <Button
              onClick={() => router.push("/subscription")}
              className={cn(
                "hidden md:inline-flex h-9 px-4 text-[11px] font-black uppercase tracking-[0.15em] rounded-full transition-all duration-300 border pointer-coarse:min-h-11",
                isPastThreshold
                  ? "bg-primary text-primary-foreground border-transparent hover:bg-primary/90"
                  : isLightPage
                    ? "bg-card text-foreground border-border hover:bg-muted"
                    : "bg-muted text-muted-foreground border-border hover:bg-muted",
              )}
            >
              Gói đăng ký
            </Button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className={cn(
                "relative w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-muted pointer-coarse:min-h-11 pointer-coarse:min-w-11",
                iconCls,
              )}
              aria-label="Danh sách yêu thích"
            >
              <Heart size={18} />
              {isMounted && wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full flex items-center justify-center text-[10px] font-black bg-primary text-primary-foreground tabular-nums shadow-xs">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </Link>

            {/* Giỏ hàng */}
            <button
              onClick={() => (openCart ? openCart() : setIsCartOpen ? setIsCartOpen((v) => !v) : null)}
              className={cn(
                "relative w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-muted pointer-coarse:min-h-11 pointer-coarse:min-w-11",
                iconCls,
              )}
              aria-label="Giỏ hàng"
            >
              <ShoppingBag size={18} />
              {isMounted && (
                <span
                  className={cn(
                    "absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full flex items-center justify-center text-[10px] font-black tabular-nums shadow-xs",
                    cartCount > 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted-foreground text-background opacity-60",
                  )}
                >
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {/* User Dropdown / Login */}
            {userLoading ? (
              <div className="w-8 h-8 rounded-full bg-muted animate-pulse shrink-0" />
            ) : !userData ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors hover:text-primary pointer-coarse:min-h-11 flex items-center",
                    textCls,
                  )}
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex bg-primary text-primary-foreground text-xs font-bold px-3.5 py-1.5 rounded-lg hover:bg-primary/90 transition-colors uppercase tracking-wider pointer-coarse:min-h-11 items-center"
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/70 transition-colors pointer-coarse:min-h-11 outline-none",
                      iconCls,
                    )}
                    aria-label="Menu tài khoản"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                      <User size={16} />
                    </div>
                    <div className="hidden xl:flex flex-col items-start text-left leading-tight">
                      <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                        {userData.role === "admin" ? "Quản trị viên" : "Tài khoản"}
                      </span>
                      <span className="text-xs font-semibold text-foreground flex items-center gap-0.5 max-w-28 truncate">
                        {userData.name || "Khách hàng"}
                        <ChevronDown size={11} className="shrink-0 text-muted-foreground" />
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-56 p-1.5 shadow-xl border-border bg-card rounded-xl z-1000"
                >
                  <div className="px-3 py-2 border-b border-border/60">
                    <p className="text-xs font-bold text-foreground truncate">{userData.name || "Khách hàng"}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{userData.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                      {userData.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                    </span>
                  </div>

                  {userData.role === "admin" && (
                    <DropdownMenuItem asChild className="cursor-pointer py-2 text-xs font-semibold rounded-lg">
                      <Link href="/dashboard" className="flex items-center gap-2.5">
                        <LayoutDashboard size={15} className="text-primary" />
                        <span>Trang quản trị</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild className="cursor-pointer py-2 text-xs font-semibold rounded-lg">
                    <Link href="/profile" className="flex items-center gap-2.5">
                      <UserCircle size={15} className="text-primary" />
                      <span>Thông tin tài khoản</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="cursor-pointer py-2 text-xs font-semibold rounded-lg">
                    <Link href="/profile/orders" className="flex items-center gap-2.5">
                      <Package size={15} className="text-primary" />
                      <span>Đơn hàng của tôi</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1" />

                  <DropdownMenuItem
                    onClick={() => logout?.()}
                    className="cursor-pointer py-2 text-xs font-semibold text-destructive rounded-lg focus:bg-destructive/10 focus:text-destructive flex items-center gap-2.5"
                  >
                    <LogOut size={15} />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={cn(
                "lg:hidden w-9 h-9 flex items-center justify-center rounded-full transition-all hover:bg-muted pointer-coarse:min-h-11 pointer-coarse:min-w-11",
                iconCls,
              )}
              aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* ── Mobile Drawer ── */}
        {mobileOpen && (
          <div className="lg:hidden bg-background border-t border-border shadow-2xl overflow-y-auto max-h-[80vh] p-4 space-y-3">
            {/* User status card on mobile */}
            {userData ? (
              <div className="p-3 rounded-xl bg-card border border-border flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{userData.name || "Khách hàng"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{userData.email}</p>
                  <span className="text-[10px] font-semibold uppercase text-primary">
                    {userData.role === "admin" ? "Quản trị viên" : "Khách hàng"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout?.();
                  }}
                  className="text-xs font-semibold text-destructive hover:underline shrink-0 p-1"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    router.push("/login");
                  }}
                  variant="outline"
                  className="w-full text-xs font-bold"
                >
                  Đăng nhập
                </Button>
                <Button
                  onClick={() => {
                    setMobileOpen(false);
                    router.push("/register");
                  }}
                  className="w-full bg-primary text-primary-foreground text-xs font-bold"
                >
                  Đăng ký
                </Button>
              </div>
            )}

            <div className="rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setMobileShopOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-foreground uppercase tracking-wider bg-card hover:bg-muted transition-colors"
              >
                Cửa hàng
                <ChevronRight
                  size={16}
                  className={cn(
                    "text-muted-foreground transition-transform",
                    mobileShopOpen && "rotate-90",
                  )}
                />
              </button>
              {mobileShopOpen && (
                <div className="bg-muted border-t border-border divide-y divide-border">
                  {shopLinks.map((l) => (
                    <Link
                      key={l.name}
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors group"
                    >
                      <div>
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors block">
                          {l.name}
                        </span>
                        <span className="text-xs text-muted-foreground">{l.desc}</span>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground/60 group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setMobileAboutOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-foreground uppercase tracking-wider bg-card hover:bg-muted transition-colors"
              >
                Về chúng tôi
                <ChevronRight
                  size={16}
                  className={cn(
                    "text-muted-foreground transition-transform",
                    mobileAboutOpen && "rotate-90",
                  )}
                />
              </button>
              {mobileAboutOpen && (
                <div className="bg-muted border-t border-border p-3 space-y-3">
                  {Object.entries(aboutMega).map(([heading, links]) => (
                    <div key={heading}>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1.5">
                        {heading}
                      </p>
                      {links.map((l) => (
                        <Link
                          key={l.label}
                          href={l.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-muted group transition-colors"
                        >
                          <span className="text-xs font-semibold text-foreground group-hover:text-primary block">
                            {l.label}
                          </span>
                          <ChevronRight size={12} className="text-muted-foreground/60" />
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/brands"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl text-sm font-bold text-foreground uppercase tracking-wider hover:bg-muted transition-colors"
            >
              Thương hiệu
              <ChevronRight size={16} className="text-muted-foreground/60" />
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl text-sm font-bold text-foreground uppercase tracking-wider hover:bg-muted transition-colors"
            >
              Yêu thích
              <span className="text-xs font-bold text-primary tabular-nums">{wishlistCount}</span>
            </Link>

            {userData && (
              <div className="space-y-1 pt-2 border-t border-border">
                {userData.role === "admin" && (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-foreground hover:text-primary"
                  >
                    <LayoutDashboard size={15} className="text-primary" />
                    Trang quản trị Admin
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-foreground hover:text-primary"
                >
                  <UserCircle size={15} className="text-primary" />
                  Hồ sơ tài khoản
                </Link>
                <Link
                  href="/profile/orders"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-foreground hover:text-primary"
                >
                  <Package size={15} className="text-primary" />
                  Đơn hàng của tôi
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      <CartDrawer open={Boolean(isCartOpen)} setOpen={setIsCartOpen} />
    </>
  );
}

export default Navigation;
