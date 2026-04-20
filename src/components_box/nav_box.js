"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, User, ShoppingBag, Package, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const shopLinks = [
  { name: "TotMartBox", href: "/totmartbox" },
  { name: "ShopTotMart", href: "/homepage" },
  { name: "Gift", href: "/gift" },
  { name: "Subscribe", href: "/subscribe" },
  { name: "TotMart", href: "/totmart" },
  { name: "Past Themes", href: "/past-themes" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Đổi trạng thái khi cuộn quá 40px (độ cao của Announcement Bar)
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "w-full transition-all duration-500 ease-in-out border-b",
        isScrolled
          ? "bg-white shadow-md py-2 border-gray-200"
          : "bg-transparent py-5 border-transparent",
      )}
    >
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Desktop Menu */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <Package
                className={cn(
                  "h-7 w-7 transition-colors",
                  isScrolled ? "text-slate-900" : "text-white",
                )}
              />
              <span
                className={cn(
                  "text-xl font-black uppercase tracking-tighter",
                  isScrolled ? "text-slate-900" : "text-white",
                )}
              >
                TOTBOX
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              <div
                className="relative py-2"
                onMouseEnter={() => setOpenDropdown("shop")}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <button
                  className={cn(
                    "flex items-center gap-1 text-[13px] font-bold uppercase tracking-widest",
                    isScrolled
                      ? "text-slate-700 hover:text-slate-900"
                      : "text-white hover:text-white/80",
                  )}
                >
                  SHOP{" "}
                  <ChevronDown
                    className={cn(
                      "h-3 w-3 transition-transform",
                      openDropdown === "shop" && "rotate-180",
                    )}
                  />
                </button>

                {openDropdown === "shop" && (
                  <div className="absolute top-full left-0 pt-2 w-52 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-white shadow-2xl border border-gray-100 rounded-sm py-2">
                      {shopLinks.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          className="block px-4 py-2 text-[11px] font-bold text-slate-600 hover:text-orange-600 hover:bg-slate-50 uppercase"
                        >
                          {link.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link
                href="/brands"
                className={cn(
                  "text-[13px] font-bold uppercase tracking-widest",
                  isScrolled
                    ? "text-slate-700 hover:text-slate-900"
                    : "text-white hover:text-white/80",
                )}
              >
                BRANDS
              </Link>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-6">
            <Button
              variant="outline"
              className={cn(
                "hidden md:inline-flex border-2 px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] transition-all rounded-none",
                isScrolled
                  ? "border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white"
                  : "border-white text-white hover:bg-white hover:text-slate-900 bg-transparent",
              )}
            >
              SUBSCRIBE NOW
            </Button>

            <div className="flex items-center gap-2">
              <button className={isScrolled ? "text-slate-900" : "text-white"}>
                <User className="h-5 w-5" />
              </button>
              <button
                className={cn(
                  "relative",
                  isScrolled ? "text-slate-900" : "text-white",
                )}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  0
                </span>
              </button>
              <button
                className={cn(
                  "lg:hidden p-2 ml-2",
                  isScrolled ? "text-slate-900" : "text-white",
                )}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-2xl p-6 space-y-4">
          {shopLinks.slice(0, 4).map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block text-lg font-bold text-slate-900 uppercase"
            >
              {link.name}
            </Link>
          ))}
          <Button className="w-full bg-slate-900 text-white py-6 rounded-none font-bold uppercase tracking-widest">
            SUBSCRIBE NOW
          </Button>
        </div>
      )}
    </nav>
  );
}
