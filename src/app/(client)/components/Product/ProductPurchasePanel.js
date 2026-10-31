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
} from "lucide-react";

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
      {/* 1. Header: Brand, Title, Rating */}
      <div>
        {brandName && (
          <div className="flex items-center gap-2 mb-2.5 flex-wrap">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-primary bg-primary/10 px-2.5 py-1 rounded-md">
              {brandName}
            </span>
            {product.category?.name && (
              <span className="text-xs text-muted-foreground font-medium">
                · {product.category.name}
              </span>
            )}
          </div>
        )}

        <h1 className="tm-product-title font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-tight leading-tight">
          {product.name}
        </h1>

        {/* Rating stars */}
        <div className="flex items-center gap-2 mt-3">
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

      {/* 2. Price Block */}
      <div className="tm-price-block border-y border-border py-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="tm-price text-2xl sm:text-3xl font-black text-primary tabular-nums">
            {hasPrice ? fmtPrice(finalPrice) : "Chưa có giá"}
          </span>
          {discount > 0 && (
            <>
              <del className="text-base text-muted-foreground line-through tabular-nums">
                {fmtPrice(product.price)}
              </del>
              <span className="bg-destructive/15 text-destructive-text text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums">
                Tiết kiệm {discount}%
              </span>
            </>
          )}
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Giá và khuyến mãi được xác nhận bằng báo giá chính xác khi thanh toán.
        </p>
      </div>

      {/* 3. Stock Status */}
      <div className="flex items-center gap-2">
        {stock > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success-text bg-success/10 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={13} />
            Còn {stock} sản phẩm
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-destructive-text bg-destructive/10 px-2.5 py-1 rounded-full">
            <AlertCircle size={13} />
            Tạm hết hàng
          </span>
        )}
      </div>

      {/* 4. Quantity Selector */}
      <div className="tm-quantity-row flex items-center justify-between gap-4">
        <span
          id="product-quantity-label"
          className="text-xs uppercase font-bold tracking-wider text-foreground"
        >
          Số lượng
        </span>
        <div
          className="tm-quantity inline-flex items-center border border-border rounded-xl bg-card overflow-hidden shadow-xs"
          role="group"
          aria-labelledby="product-quantity-label"
        >
          <button
            type="button"
            aria-label="Giảm số lượng"
            disabled={quantity <= 1 || busy || stock <= 0 || !isReady}
            onClick={onDecrease}
            className="w-10 h-10 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
          >
            <Minus size={16} />
          </button>
          <output
            aria-live="polite"
            aria-atomic="true"
            className="w-12 text-center text-sm font-bold tabular-nums text-foreground"
          >
            {quantity}
          </output>
          <button
            type="button"
            aria-label="Tăng số lượng"
            disabled={stock <= 0 || quantity >= stock || busy || !isReady}
            onClick={onIncrease}
            className="w-10 h-10 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 pointer-coarse:min-h-11 pointer-coarse:min-w-11"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* 5. Primary CTAs */}
      <div className="space-y-2.5 pt-2" aria-busy={Boolean(busy)}>
        <button
          type="button"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 px-6 min-h-11 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-[0.98] disabled:opacity-50 pointer-coarse:min-h-11"
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
          className="w-full bg-card hover:bg-muted text-foreground border border-border py-3.5 px-6 min-h-11 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors active:scale-[0.98] disabled:opacity-50 pointer-coarse:min-h-11"
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
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors pointer-coarse:min-h-11"
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
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted transition-colors pointer-coarse:min-h-11"
          onClick={onShare}
        >
          <Share2 size={16} className="text-muted-foreground" />
          <span>Chia sẻ</span>
        </button>
      </div>

      {/* 7. Trust Badges / Delivery Note */}
      <div className="border-t border-border pt-4 space-y-2.5 text-xs text-muted-foreground">
        <div className="flex items-start gap-2.5">
          <Truck size={17} className="shrink-0 text-primary mt-0.5" />
          <p className="leading-relaxed">
            Phí giao hàng được tính riêng theo địa chỉ thực tế khi xác nhận đơn.
          </p>
        </div>
        <div className="flex items-start gap-2.5">
          <ShieldCheck size={17} className="shrink-0 text-primary mt-0.5" />
          <p className="leading-relaxed">
            Cam kết 100% nông sản & thủ công chính gốc từ nghệ nhân bản địa.
          </p>
        </div>
        {product.sku && (
          <p className="pt-1 text-[11px] text-muted-foreground">
            Mã sản phẩm:{" "}
            <span className="font-mono text-foreground font-semibold">
              {product.sku}
            </span>
          </p>
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
