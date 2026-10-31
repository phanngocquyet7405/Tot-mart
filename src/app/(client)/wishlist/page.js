"use client";
/**
 * page.js — Trang Danh sách yêu thích
 * Route: /wishlist
 * Chuẩn hóa màu sắc token: warm cream, terracotta, đầy đủ 5 trạng thái.
 */

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Heart, ShoppingCart, Trash2, ArrowRight, ArrowLeft } from "lucide-react";

import AnnouncementBar from "@/app/(client)/components/ui/AnnouncementBar";
import MainHeader from "@/app/(client)/components/ui/main_header";
import NavMenu from "@/app/(client)/components/ui/nav_menu";
import Footer from "@/app/(client)/components/ui/footer";
import { useWishlist } from "@/app/context/WishlistContext";
import { useAddToCart } from "@/app/hook/useAddToCart";

const fmtPrice = (price) => {
  if (!price) return "Liên hệ";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  })
    .format(price)
    .replace("₫", "₫");
};

function EmptyWishlistState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4 bg-card rounded-2xl border border-border shadow-xs">
      <div className="w-20 h-20 bg-background border border-border rounded-full flex items-center justify-center mb-5">
        <Heart className="h-8 w-8 text-muted-foreground/60" />
      </div>
      <h2 className="text-base font-bold text-foreground mb-2 uppercase tracking-wide">
        Chưa có sản phẩm yêu thích
      </h2>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
        Bấm biểu tượng trái tim trên sản phẩm bạn thích để lưu lại đây, tiện mua sau nhé.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 min-h-11 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors shadow-xs active:scale-[0.98]"
      >
        Khám phá sản phẩm
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden p-4 space-y-3 animate-pulse">
          <div className="aspect-square bg-muted rounded-xl w-full" />
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-10 bg-muted rounded-lg w-full" />
        </div>
      ))}
    </div>
  );
}

function WishlistItemCard({ item, onRemove, onAddToCart }) {
  const productSlug = item.slug || "san-pham";
  const productHref = `/products/${productSlug}-${item._id || item.id}`;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-xs overflow-hidden group flex flex-col hover:border-primary/40 transition-colors">
      <Link href={productHref} className="block relative aspect-square bg-muted overflow-hidden">
        <Image
          src={item.image || "/assets/placeholder.png"}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
        />
      </Link>
      <div className="p-4 flex flex-col grow gap-3">
        <Link href={productHref}>
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 min-h-10 hover:text-primary transition-colors">
            {item.name}
          </h3>
        </Link>
        <p className="text-base font-bold text-foreground tabular-nums">
          {fmtPrice(item.price)}
        </p>
        <div className="mt-auto flex gap-2">
          <button
            type="button"
            onClick={() => onAddToCart(item)}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-2.5 px-3 min-h-11 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-[0.98]"
          >
            <ShoppingCart size={15} />
            Thêm giỏ
          </button>
          <button
            type="button"
            onClick={() => onRemove(item._id || item.id)}
            aria-label="Xoá khỏi yêu thích"
            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const router = useRouter();
  const { wishlistItems, isMounted, removeFromWishlist } = useWishlist();
  const { addToCart } = useAddToCart();

  const hasItems = isMounted && wishlistItems.length > 0;

  const handleRemove = (id) => {
    removeFromWishlist(id);
    toast.success("Đã xóa khỏi danh sách yêu thích");
  };

  return (
    <>
      <AnnouncementBar />
      <MainHeader />
      <NavMenu />

      <main className="min-h-screen bg-background pt-[100px]">
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
                Danh sách yêu thích
              </h1>
              {isMounted && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {wishlistItems.length > 0
                    ? `${wishlistItems.length} sản phẩm đã lưu`
                    : "Chưa có sản phẩm nào"}
                </p>
              )}
            </div>
          </div>

          {!isMounted ? (
            <WishlistSkeleton />
          ) : !hasItems ? (
            <EmptyWishlistState />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {wishlistItems.map((item, i) => (
                <WishlistItemCard
                  key={item._id || item.id || i}
                  item={item}
                  onRemove={handleRemove}
                  onAddToCart={(p) => addToCart(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
