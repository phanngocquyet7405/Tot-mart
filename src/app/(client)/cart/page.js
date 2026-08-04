/**
 * page.js — Trang Giỏ hàng đầy đủ
 * Route: /cart
 *
 * Trước đây route này chưa tồn tại dù nút "Xem chi tiết giỏ hàng" trong
 * CartDrawer đã trỏ tới đây (router.push("/cart")) — bấm vào sẽ ra 404.
 * Trang này tái dùng CartItem + CartContext sẵn có, cùng phong cách với
 * trang chi tiết sản phẩm (nền kem #faf8f4, accent amber-800).
 */

"use client";

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
    <div className="flex flex-col items-center justify-center text-center py-24 px-4 bg-white rounded-2xl border border-stone-100 shadow-sm">
      <div className="w-20 h-20 bg-[#faf8f4] border border-stone-200 rounded-full flex items-center justify-center mb-5">
        <ShoppingBag className="h-8 w-8 text-stone-300" />
      </div>
      <p className="text-[16px] font-black text-stone-800 mb-2 uppercase tracking-wide">
        Giỏ hàng trống
      </p>
      <p className="text-[13px] text-stone-500 leading-relaxed max-w-72 mb-6">
        Chưa có sản phẩm nào trong giỏ. Hãy khám phá các hộp quà thiên nhiên
        của TotMart nhé!
      </p>
      <Link
        href="/products"
        className="inline-flex items-center gap-2 bg-amber-800 hover:bg-amber-900 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[12px] transition-colors"
      >
        Tiếp tục mua sắm
        <ArrowRight size={16} />
      </Link>
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
                Giỏ hàng của bạn
              </h1>
              {isMounted && (
                <p className="text-xs text-stone-500 mt-0.5">
                  {cartItems.length > 0
                    ? `${cartItems.length} sản phẩm trong giỏ`
                    : "Chưa có sản phẩm nào"}
                </p>
              )}
            </div>
          </div>

          {!isMounted ? (
            <div className="py-24 text-center text-stone-400 text-sm">
              Đang tải giỏ hàng...
            </div>
          ) : !hasItems ? (
            <EmptyCartState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
              {/* Danh sách sản phẩm */}
              <div className="space-y-4">
                {cartItems.map((p, i) => (
                  <CartItem key={p._id || p.id || i} product={p} />
                ))}
              </div>

              {/* Tóm tắt đơn hàng */}
              <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 sticky top-24">
                <h2 className="text-[13px] font-black uppercase tracking-widest text-stone-800 mb-5">
                  Tóm tắt đơn hàng
                </h2>

                <div className="space-y-1 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-[12px] text-stone-500 uppercase tracking-widest font-bold">
                      Tạm tính
                    </span>
                    <span className="text-xl font-black text-amber-800">
                      {cartTotal.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 text-right">
                    Phí vận chuyển được tính ở bước thanh toán.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => router.push("/checkout")}
                    className="w-full bg-amber-800 hover:bg-amber-900 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[12px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20 active:scale-[0.98]"
                  >
                    Tiến hành thanh toán
                    <ArrowRight size={16} />
                  </button>
                  <Link
                    href="/products"
                    className="w-full bg-[#faf8f4] border border-stone-200 text-stone-700 hover:bg-white py-3.5 rounded-xl font-bold uppercase tracking-widest text-[11px] hover:border-amber-400 hover:text-amber-800 transition-all active:scale-[0.98] flex items-center justify-center"
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
