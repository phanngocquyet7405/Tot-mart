"use client";
import { Minus, Plus, ShoppingCart, Heart, Share2, Truck, Loader2 } from "lucide-react";

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

  return (
    <section className="tm-purchase" aria-label="Thông tin mua sản phẩm">
      <div>
        <h1 className="tm-product-title">{product.name}</h1>
        {product.category?.name && (
          <p className="mt-3 text-sm text-muted-foreground">{product.category.name}</p>
        )}
      </div>

      <div className="tm-price-block">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <p className="tm-price tabular-nums">{hasPrice ? fmtPrice(finalPrice) : "Chưa có giá"}</p>
          {discount > 0 && (
            <del className="text-base text-muted-foreground tabular-nums">{fmtPrice(product.price)}</del>
          )}
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          Giá cuối cùng được xác nhận bằng báo giá tại thanh toán.
        </p>
      </div>

      <p
        className={
          stock > 0
            ? "text-sm font-semibold text-success-text"
            : "text-sm font-semibold text-destructive-text"
        }
      >
        {stock > 0 ? `Còn ${stock} sản phẩm` : "Tạm hết hàng"}
      </p>

      <div className="tm-quantity-row">
        <span id="product-quantity-label" className="font-medium text-foreground">
          Số lượng
        </span>
        <div className="tm-quantity" role="group" aria-labelledby="product-quantity-label">
          <button
            type="button"
            aria-label="Giảm số lượng"
            disabled={quantity <= 1 || busy || stock <= 0 || !isReady}
            onClick={onDecrease}
            className="pointer-coarse:min-h-11 pointer-coarse:min-w-11"
          >
            <Minus size={18} />
          </button>
          <output aria-live="polite" aria-atomic="true" className="tabular-nums">
            {quantity}
          </output>
          <button
            type="button"
            aria-label="Tăng số lượng"
            disabled={stock <= 0 || quantity >= stock || busy || !isReady}
            onClick={onIncrease}
            className="pointer-coarse:min-h-11 pointer-coarse:min-w-11"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-3" aria-busy={Boolean(busy)}>
        <button
          type="button"
          className="tm-button tm-button--primary w-full shadow-xs"
          disabled={busy || stock <= 0 || !hasPrice || !isReady}
          onClick={onAddToCart}
        >
          {isAddingToCart ? (
            <Loader2 size={19} className="animate-spin" />
          ) : (
            <ShoppingCart size={19} />
          )}
          {isAddingToCart ? "Đang thêm…" : stock <= 0 ? "Tạm hết hàng" : "Thêm vào giỏ hàng"}
        </button>
        <button
          type="button"
          className="tm-button tm-button--outline w-full"
          disabled={busy || stock <= 0 || !hasPrice || !isReady}
          onClick={onBuyNow}
        >
          {isBuyingNow ? "Đang chuyển đến thanh toán…" : "Mua ngay"}
        </button>
        <p className="text-sm text-muted-foreground">
          Mua ngay sẽ thanh toán cùng các sản phẩm đang có trong giỏ.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="tm-text-button pointer-coarse:min-h-11"
          onClick={onWishlist}
          aria-pressed={isWishlisted}
        >
          <Heart size={18} className={isWishlisted ? "fill-destructive text-destructive" : ""} />
          {isWishlisted ? "Đã yêu thích" : "Yêu thích"}
        </button>
        <button type="button" className="tm-text-button pointer-coarse:min-h-11" onClick={onShare}>
          <Share2 size={18} />
          Chia sẻ
        </button>
      </div>

      <div className="tm-delivery-note">
        <Truck size={20} className="shrink-0 text-muted-foreground" />
        <p>
          Phí giao hàng trả riêng cho đơn vị vận chuyển, ngoài tiền đơn TotMart. Phí cần được thống nhất trước khi giao.
        </p>
      </div>

      {product.sku && (
        <p className="text-sm text-muted-foreground">
          Mã sản phẩm: <span className="text-foreground font-medium">{product.sku}</span>
        </p>
      )}

      {/* Sticky Purchase Bar for Mobile (< md) */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-sm border-t border-border z-40 md:hidden flex items-center justify-between gap-3 shadow-lg pointer-events-auto">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{product.name}</p>
          <p className="text-base font-bold text-foreground tabular-nums">
            {hasPrice ? fmtPrice(finalPrice) : "Chưa có giá"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            className="tm-button tm-button--primary px-4 py-2 min-h-11 text-xs font-bold shadow-xs active:scale-[0.97]"
            disabled={busy || stock <= 0 || !hasPrice || !isReady}
            onClick={onAddToCart}
          >
            {isAddingToCart ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ShoppingCart size={16} />
            )}
            <span>{stock <= 0 ? "Hết hàng" : "Thêm giỏ"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
