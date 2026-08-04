"use client";

import {
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RefreshCw,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductPurchasePanel({
  product,
  finalPrice,
  quantity,
  onIncrease,
  onDecrease,
  isAddingToCart,
  onAddToCart,
  isBuyingNow,
  onBuyNow,
  isWishlisted,
  onWishlist,
  onShare,
  fmtPrice,
}) {
  const discount = product.discount || 0;
  const stock = product.stock ?? 0;

  return (
    <div className="lg:col-span-5 bg-white rounded-2xl p-6 md:p-8 border border-stone-100 shadow-sm space-y-6">
      <div className="space-y-2">
        {product.category?.name && (
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
            🌿 {product.category.name}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-black text-stone-900 leading-tight">
          {product.name}
        </h1>
      </div>

      {/* Giá tiền */}
      <div className="flex items-baseline gap-3 p-4 bg-[#faf8f4] rounded-xl border border-stone-100">
        <span className="text-2xl md:text-3xl text-red-600 font-black">
          {fmtPrice(finalPrice)}
        </span>
        {discount > 0 && (
          <span className="text-stone-400 line-through text-sm">
            {fmtPrice(product.price)}
          </span>
        )}
      </div>

      {/* Thông số nhanh */}
      <div className="grid grid-cols-2 gap-4 text-xs md:text-sm text-stone-600 border-y border-stone-100 py-4">
        <div className="space-y-1">
          <p className="text-stone-400">Mã sản phẩm:</p>
          <p className="font-bold text-stone-800 flex items-center gap-1.5">
            <Package size={16} className="text-amber-700" />
            {product.sku || "—"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-stone-400">Tình trạng kho hàng:</p>
          <p className="font-bold">
            {stock > 0 ? (
              <span className="text-emerald-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Còn lại {stock} sản phẩm
              </span>
            ) : (
              <span className="text-red-500">Tạm hết hàng</span>
            )}
          </p>
        </div>
      </div>

      {/* Bộ điều khiển số lượng */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-widest text-stone-400">
          Chọn số lượng mua
        </label>
        <div className="flex items-center border border-stone-200 rounded-xl bg-white overflow-hidden shadow-sm w-fit">
          <button
            onClick={onDecrease}
            disabled={quantity <= 1}
            className="p-3.5 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition active:scale-90 disabled:opacity-40"
            type="button"
          >
            <Minus size={14} />
          </button>
          <span className="px-6 font-black text-stone-800 min-w-12 text-center text-sm">
            {quantity}
          </span>
          <button
            onClick={onIncrease}
            disabled={stock > 0 && quantity >= stock}
            className="p-3.5 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition active:scale-90 disabled:opacity-40"
            type="button"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Hành động chính */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onAddToCart}
            disabled={isAddingToCart || isBuyingNow || stock <= 0}
            className="flex-1 py-6 bg-white hover:bg-stone-50 text-amber-800 border-2 border-amber-800 rounded-xl font-black uppercase tracking-widest text-[12px] flex items-center justify-center gap-2 active:scale-95 transition-transform duration-100 cursor-pointer"
          >
            <ShoppingCart size={18} />
            {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
          </Button>

          <Button
            onClick={onBuyNow}
            disabled={isAddingToCart || isBuyingNow || stock <= 0}
            className="flex-1 py-6 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-black uppercase tracking-widest text-[12px] shadow-lg shadow-amber-900/15 flex items-center justify-center gap-2 active:scale-95 transition-transform duration-100 cursor-pointer"
          >
            {isBuyingNow ? "Đang xử lý..." : "Mua ngay"}
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onWishlist}
            className={`flex-1 sm:flex-none p-3 sm:w-12 h-12 flex items-center justify-center rounded-xl active:scale-90 transition-all cursor-pointer ${
              isWishlisted
                ? "border-red-200 text-red-500 bg-red-50"
                : "border-stone-200 text-stone-500 hover:text-red-500 hover:border-red-200"
            }`}
          >
            <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
          </Button>

          <Button
            variant="outline"
            onClick={onShare}
            className="flex-1 sm:flex-none p-3 sm:w-12 h-12 flex items-center justify-center rounded-xl border-stone-200 text-stone-500 hover:text-blue-500 hover:border-blue-200 active:scale-90 transition-all cursor-pointer"
          >
            <Share2 size={18} />
          </Button>
        </div>
      </div>

      {/* Chính sách hỗ trợ */}
      <div className="pt-6 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-stone-500">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-stone-50 rounded-lg text-amber-800">
            <Truck size={16} />
          </div>
          <div>
            <p className="font-bold text-stone-800">Miễn phí ship</p>
            <p className="text-[10px]">Đơn hàng toàn quốc</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-stone-50 rounded-lg text-amber-800">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="font-bold text-stone-800">Bảo hành cam kết</p>
            <p className="text-[10px]">Đóng gói chuẩn chỉnh</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-stone-50 rounded-lg text-amber-800">
            <RefreshCw size={16} />
          </div>
          <div>
            <p className="font-bold text-stone-800">Hỗ trợ đổi trả</p>
            <p className="text-[10px]">Trong vòng 7 ngày</p>
          </div>
        </div>
      </div>
    </div>
  );
}
