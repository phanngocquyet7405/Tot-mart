"use client";
/**
 * page.js — Trang Giỏ hàng đầy đủ
 * Route: /cart
 * Chuẩn hóa giao diện storefront: tông kem ấm tự nhiên, nút terracotta, token ngữ nghĩa.
 */

import { cartLineKey } from "@/app/util/cartLine.mjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";

import AnnouncementBar from "@/app/(client)/components/ui/AnnouncementBar";
import MainHeader from "@/app/(client)/components/ui/main_header";
import NavMenu from "@/app/(client)/components/ui/nav_menu";
import Footer from "@/app/(client)/components/ui/footer";
import CartItem from "@/app/(client)/components/Cart_component/cart_item";
import { useCart } from "@/app/context/CartContext";

function EmptyCartState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-card rounded-2xl border border-border shadow-xs">
      <div className="w-20 h-20 bg-background border border-border rounded-full flex items-center justify-center mb-5">
        <ShoppingBag className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <h2 className="text-base font-bold text-foreground mb-2 uppercase tracking-wide">
        Giỏ hàng trống
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
        Chưa có sản phẩm nào trong giỏ. Hãy khám phá các hộp quà và combo thiên nhiên của TotMart nhé!
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 min-h-11 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors shadow-xs active:scale-[0.98]"
      >
        Tiếp tục mua sắm
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl p-4 border border-border animate-pulse flex gap-4 items-center">
            <div className="w-16 h-16 bg-muted rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
            <div className="w-16 h-4 bg-muted rounded" />
          </div>
        ))}
      </div>
      <div className="bg-card rounded-2xl border border-border p-6 space-y-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-8 bg-muted rounded" />
        <div className="h-12 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { cartItems, cartTotal, isMounted } = useCart();

  const hasItems = isMounted && cartItems.length > 0;

  return (
    <>
      <AnnouncementBar />
      <MainHeader />
      <NavMenu />

      <main className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors bg-card shrink-0 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
              aria-label="Quay lại trang trước"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                Giỏ hàng của bạn
              </h1>
              {isMounted && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {cartItems.length > 0
                    ? `${cartItems.length} sản phẩm trong giỏ`
                    : "Chưa có sản phẩm nào"}
                </p>
              )}
            </div>
          </div>

          {!isMounted ? (
            <CartSkeleton />
          ) : !hasItems ? (
            <EmptyCartState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
              {/* Danh sách sản phẩm */}
              <div className="space-y-4">
                {cartItems.map((p) => (
                  <CartItem key={cartLineKey(p)} product={p} />
                ))}
              </div>

              {/* Tóm tắt đơn hàng */}
              <div className="bg-card rounded-2xl border border-border shadow-xs p-6 lg:sticky lg:top-24">
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground mb-5">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Tạm tính
                    </span>
                    <span className="text-xl font-bold text-foreground tabular-nums text-right">
                      {cartTotal.toLocaleString("vi-VN")} ₫
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground text-right leading-relaxed">
                    Phí vận chuyển do khách trả trực tiếp cho bên giao hàng, không cộng vào tiền đơn TotMart.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 min-h-11 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-[0.98]"
                  >
                    Tiến hành thanh toán
                    <ArrowRight size={16} />
                  </button>
                  <Link
                    href="/products"
                    className="w-full bg-card/60 border border-border text-foreground hover:bg-muted py-3 min-h-11 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-colors active:scale-[0.98] flex items-center justify-center"
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
