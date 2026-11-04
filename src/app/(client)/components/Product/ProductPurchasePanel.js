"use client";

import {
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Loader2,
  Star,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Award,
} from "lucide-react";
import { GiftOptions } from "./GiftOptions";

export function ProductPurchasePanel({
  product,
  finalPrice,
  quantity,
  onIncrease,
  onDecrease,
  isAddingToCart,
  onAddToCart,
  isReady = true,
  isBuyingNow,
  onBuyNow,
  isWishlisted,
  onWishlist,
  onShare,
  fmtPrice,
  onGiftChange,
}) {
  const discount = product.salePercent || 0;
  const stock = product.stock ?? 0;
  const hasPrice = Number.isFinite(finalPrice) && finalPrice >= 0;
  const busy = isAddingToCart || isBuyingNow;

  const brandName =
    product.brand?.name ||
    (typeof product.brand === "string" ? product.brand : "");
  const avgRating = Number(product.rating) || 5;
  const reviewCount =
    Number.isSafeInteger(product.reviewCount) && product.reviewCount >= 0
      ? product.reviewCount
      : null;

  return (
    <section
      className="tm-purchase lg:col-span-5 space-y-6"
      aria-label="Thông tin mua sản phẩm"
    >
      {/* 1. Header: Brand, Title, Rating - Chuẩn Bokksu Boutique */}
      <div className="space-y-3">
        {brandName && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full shadow-2xs">
              <Award size={12} className="text-primary" />
              {brandName}
            </span>
            {product.category?.name && (
              <span className="text-xs text-muted-foreground font-medium">
                • {product.category.name}
              </span>
            )}
          </div>
        )}

        <h1 className="tm-product-title font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight leading-tight">
          {product.name}
        </h1>

        {/* Rating stars & curation note */}
        <div className="flex items-center gap-2.5 pt-1">
          <div className="flex items-center text-amber-500">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.round(avgRating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                }
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {reviewCount !== null
              ? `(${reviewCount} đánh giá)`
              : "Sản vật thủ công tuyển chọn"}
          </span>
        </div>
      </div>

      {/* 2. Price Block - Khung giá cao cấp với tỷ lệ Bokksu Market */}
      <div className="tm-price-block rounded-2xl bg-stone-50/80 dark:bg-stone-900/40 border border-border/80 p-4 sm:p-5 space-y-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="tm-price text-3xl sm:text-4xl font-black text-primary tabular-nums tracking-tight">
            {hasPrice ? fmtPrice(finalPrice) : "Chưa có giá"}
          </span>
          {discount > 0 && (
            <>
              <del className="text-base text-muted-foreground line-through tabular-nums">
                {fmtPrice(product.price)}
              </del>
              <span className="bg-destructive/15 text-destructive-text text-[11px] font-bold px-2.5 py-0.5 rounded-full tabular-nums border border-destructive/20">
                Tiết kiệm {discount}%
              </span>
            </>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Giá và khuyến mãi được xác nhận bằng báo giá chính xác khi thanh toán.
        </p>
      </div>

      {/* 3. Stock Status Badge */}
      <div className="flex items-center gap-2">
        {stock > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success-text bg-success/10 border border-success/20 px-3 py-1 rounded-full">
            <CheckCircle2 size={13} />
            Còn {stock} sản phẩm
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive-text bg-destructive/10 border border-destructive/20 px-3 py-1 rounded-full">
            <AlertCircle size={13} />
            Tạm hết hàng
          </span>
        )}
      </div>

      {/* 4. Quantity Selector - Chuẩn Emil Kowalski nảy vật lý */}
      <div className="tm-quantity-row flex items-center justify-between gap-4 py-1">
        <span
          id="product-quantity-label"
          className="text-xs uppercase font-bold tracking-wider text-foreground"
        >
          Số lượng
        </span>
        <div
          className="tm-quantity inline-flex items-center border border-border rounded-xl bg-card overflow-hidden shadow-2xs"
          role="group"
          aria-labelledby="product-quantity-label"
        >
          <button
            type="button"
            aria-label="Giảm số lượng"
            disabled={quantity <= 1 || busy || stock <= 0 || !isReady}
            onClick={onDecrease}
            className="w-10 h-10 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90 disabled:opacity-40 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
          >
            <Minus size={16} />
          </button>
          <output
            aria-live="polite"
            aria-atomic="true"
            className="w-12 text-center text-sm font-bold tabular-nums text-foreground select-none"
          >
            {quantity}
          </output>
          <button
            type="button"
            aria-label="Tăng số lượng"
            disabled={stock <= 0 || quantity >= stock || busy || !isReady}
            onClick={onIncrease}
            className="w-10 h-10 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90 disabled:opacity-40 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* 4.5. Gift Wrapping Options */}
      <GiftOptions onChange={onGiftChange} ownerConfirmed={true} />

      {/* 5. Primary CTAs - Thêm giỏ & Mua ngay với feedback mượt mà */}
      <div className="space-y-3 pt-1" aria-busy={Boolean(busy)}>
        <button
          type="button"
          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-3.5 px-6 min-h-11 rounded-xl font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2.5 shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-50 pointer-coarse:min-h-11 cursor-pointer"
          disabled={busy || stock <= 0 || !hasPrice || !isReady}
          onClick={onAddToCart}
        >
          {isAddingToCart ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ShoppingCart size={18} />
          )}
          <span>
            {isAddingToCart
              ? "Đang thêm vào giỏ…"
              : stock <= 0
                ? "Tạm hết hàng"
                : "Thêm vào giỏ hàng"}
          </span>
        </button>

        <button
          type="button"
          className="w-full bg-card hover:bg-muted text-foreground border-2 border-border hover:border-primary/50 py-3.5 px-6 min-h-11 rounded-xl font-bold uppercase tracking-widest text-xs transition-all active:scale-[0.98] disabled:opacity-50 pointer-coarse:min-h-11 cursor-pointer shadow-2xs"
          disabled={busy || stock <= 0 || !hasPrice || !isReady}
          onClick={onBuyNow}
        >
          {isBuyingNow ? "Đang chuyển đến thanh toán…" : "Mua ngay"}
        </button>
      </div>

      {/* 6. Wishlist & Share buttons */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-all active:scale-[0.97] pointer-coarse:min-h-11 cursor-pointer"
          onClick={onWishlist}
          aria-pressed={isWishlisted}
        >
          <Heart
            size={16}
            className={
              isWishlisted
                ? "fill-destructive text-destructive"
                : "text-muted-foreground"
            }
          />
          <span>{isWishlisted ? "Đã yêu thích" : "Yêu thích"}</span>
        </button>

        <button
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-all active:scale-[0.97] pointer-coarse:min-h-11 cursor-pointer"
          onClick={onShare}
        >
          <Share2 size={16} className="text-muted-foreground" />
          <span>Chia sẻ</span>
        </button>
      </div>

      {/* 7. Bokksu Boutique Trust Highlights Card */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 text-xs text-muted-foreground shadow-2xs">
        <div className="flex items-start gap-3">
          <Truck size={17} className="shrink-0 text-primary mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Vận chuyển linh hoạt</p>
            <p className="leading-relaxed">Phí giao hàng được tính riêng theo địa chỉ thực tế khi xác nhận đơn.</p>
          </div>
        </div>
        <div className="h-px bg-border/60" />
        <div className="flex items-start gap-3">
          <ShieldCheck size={17} className="shrink-0 text-primary mt-0.5" />
          <div>
            <p className="font-semibold text-foreground">Bảo chứng thủ công 100%</p>
            <p className="leading-relaxed">Cam kết 100% nông sản & thủ công chính gốc từ nghệ nhân bản địa.</p>
          </div>
        </div>
        {product.sku && (
          <>
            <div className="h-px bg-border/60" />
            <p className="pt-0.5 text-[11px] text-muted-foreground">
              Mã sản phẩm:{" "}
              <span className="font-mono text-foreground font-semibold">
                {product.sku}
              </span>
            </p>
          </>
        )}
      </div>

      {/* 8. Sticky Purchase Bar for Mobile (< md) */}
      <div className="fixed bottom-0 left-0 right-0 p-3 pb-[max(0.75rem,calc(0.5rem+env(safe-area-inset-bottom,0px)))] bg-background/95 backdrop-blur-md border-t border-border z-30 md:hidden flex items-center justify-between gap-3 shadow-lg pointer-events-auto">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate font-medium">
            {product.name}
          </p>
          <p className="text-sm font-bold text-primary tabular-nums">
            {hasPrice ? fmtPrice(finalPrice) : "Chưa có giá"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="bg-primary text-primary-foreground px-4 py-2.5 min-h-11 text-xs font-bold rounded-xl shadow-xs active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
            disabled={busy || stock <= 0 || !hasPrice || !isReady}
            onClick={onAddToCart}
          >
            {isAddingToCart ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ShoppingCart size={15} />
            )}
            <span>{stock <= 0 ? "Hết hàng" : "Thêm giỏ"}</span>
          </button>
        </div>
      </div>
      <div className="h-16 md:hidden" aria-hidden="true" />
    </section>
  );
}

export default ProductPurchasePanel;
