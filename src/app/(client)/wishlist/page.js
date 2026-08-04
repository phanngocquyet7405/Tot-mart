/**
 * page.js — Trang Danh sách yêu thích
 * Route: /wishlist
 *
 * Icon trái tim ở MainHeader đã trỏ sẵn tới route này (href="/wishlist")
 * từ trước, nhưng route chưa từng được tạo — bấm vào sẽ ra 404. Trang này
 * đọc từ WishlistContext (localStorage), cùng phong cách với /cart.
 */

"use client";

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
    .replace("₫", "đ");
};

function EmptyWishlistState() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-24 px-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
      <div className="w-20 h-20 bg-[#faf8f4] border border-stone-200 rounded-full flex items-center justify-center mb-5">
        <Heart className="h-8 w-8 text-stone-300" />
      </div>
      <p className="text-[16px] font-black text-stone-800 mb-2 uppercase tracking-wide">
        Chưa có sản phẩm yêu thích
      </p>
      <p className="text-[13px] text-stone-500 leading-relaxed max-w-72 mb-6">
        Bấm biểu tượng trái tim trên sản phẩm bạn thích để lưu lại đây, tiện
        mua sau nhé.
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-amber-800 hover:bg-amber-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[12px] transition-colors"
      >
        Khám phá sản phẩm
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function WishlistItemCard({ item, onRemove, onAddToCart }) {
  const productSlug = item.slug || "san-pham";
  const productHref = `/products/${productSlug}-${item._id || item.id}`;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden group flex flex-col">
      <Link href={productHref} className="block relative aspect-square bg-stone-50 overflow-hidden">
        <Image
          src={item.image || "/placeholder.svg"}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </Link>
      <div className="p-4 flex flex-col grow gap-3">
        <Link href={productHref}>
          <h3 className="text-sm font-bold text-stone-900 line-clamp-2 min-h-10 hover:text-amber-800 transition-colors">
            {item.name}
          </h3>
        </Link>
        <p className="text-base font-black text-amber-800">
          {fmtPrice(item.price)}
        </p>
        <div className="mt-auto flex gap-2">
          <button
            onClick={() => onAddToCart(item)}
            className="flex-1 bg-amber-800 hover:bg-amber-900 text-white py-2.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingCart size={14} />
            Thêm vào giỏ
          </button>
          <button
            onClick={() => onRemove(item._id || item.id)}
            aria-label="Xoá khỏi yêu thích"
            className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg border border-stone-200 text-stone-500 hover:text-red-500 hover:border-red-200 transition-colors"
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

      <div className="min-h-screen bg-[#faf8f4]">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <button
              onClick={() => router.back()}
              className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:border-amber-600/50 hover:text-amber-800 transition-all bg-white shrink-0"
              aria-label="Quay lại"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
                Danh sách yêu thích
              </h1>
              {isMounted && (
                <p className="text-xs text-stone-500 mt-0.5">
                  {wishlistItems.length > 0
                    ? `${wishlistItems.length} sản phẩm đã lưu`
                    : "Chưa có sản phẩm nào"}
                </p>
              )}
            </div>
          </div>

          {!isMounted ? (
            <div className="py-24 text-center text-stone-400 text-sm">
              Đang tải danh sách yêu thích...
            </div>
          ) : !hasItems ? (
            <EmptyWishlistState />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
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
      </div>

      <Footer />
    </>
  );
}
