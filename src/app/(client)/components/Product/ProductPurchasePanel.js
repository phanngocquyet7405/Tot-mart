"use client";
import { Minus, Plus, ShoppingCart, Heart, Share2, Truck, Loader2 } from "lucide-react";
export function ProductPurchasePanel({ product, finalPrice, quantity, onIncrease, onDecrease, isAddingToCart, onAddToCart,
  isBuyingNow, onBuyNow, isWishlisted, onWishlist, onShare, fmtPrice }) {
  const discount = product.salePercent || 0;
  const stock = product.stock ?? 0;
  const hasPrice = Number.isFinite(finalPrice) && finalPrice >= 0;
  const busy = isAddingToCart || isBuyingNow;
  return <section className="tm-purchase" aria-label="Thông tin mua sản phẩm">
    <div><h1 className="tm-product-title">{product.name}</h1>
      {product.category?.name && <p className="mt-3 text-sm text-stone-600">{product.category.name}</p>}
    </div>
    <div className="tm-price-block">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2"><p className="tm-price">{hasPrice ? fmtPrice(finalPrice) : 'Chưa có giá'}</p>
        {discount > 0 && <del className="text-base text-stone-500">{fmtPrice(product.price)}</del>}
      </div>
      <p className="mt-2 text-sm text-stone-600">Giá cuối cùng được xác nhận bằng báo giá tại thanh toán.</p>
    </div>
    <p className={stock > 0 ? 'text-sm font-semibold text-green-800' : 'text-sm font-semibold text-red-700'}>{stock > 0 ? `Còn ${stock} sản phẩm` : 'Tạm hết hàng'}</p>
    <div className="tm-quantity-row"><span id="product-quantity-label" className="font-medium">Số lượng</span>
      <div className="tm-quantity" role="group" aria-labelledby="product-quantity-label">
        <button type="button" aria-label="Giảm số lượng" disabled={quantity <= 1 || busy || stock <= 0} onClick={onDecrease}><Minus size={18} /></button>
        <output aria-live="polite" aria-atomic="true">{quantity}</output>
        <button type="button" aria-label="Tăng số lượng" disabled={stock <= 0 || quantity >= stock || busy} onClick={onIncrease}><Plus size={18} /></button>
      </div>
    </div>
    <div className="space-y-3" aria-busy={Boolean(busy)}>
      <button type="button" className="tm-button tm-button--primary w-full" disabled={busy || stock <= 0 || !hasPrice} onClick={onAddToCart}>
        {isAddingToCart ? <Loader2 size={19} className="animate-spin" /> : <ShoppingCart size={19} />}{isAddingToCart ? 'Đang thêm…' : stock <= 0 ? 'Tạm hết hàng' : 'Thêm vào giỏ hàng'}
      </button>
      <button type="button" className="tm-button tm-button--outline w-full" disabled={busy || stock <= 0 || !hasPrice} onClick={onBuyNow}>{isBuyingNow ? 'Đang chuyển đến thanh toán…' : 'Mua ngay'}</button>
      <p className="text-sm text-stone-600">Mua ngay sẽ thanh toán cùng các sản phẩm đang có trong giỏ.</p>
    </div>
    <div className="flex flex-wrap gap-3">
      <button type="button" className="tm-text-button" onClick={onWishlist} aria-pressed={isWishlisted}><Heart size={18} className={isWishlisted ? 'fill-current' : ''} />{isWishlisted ? 'Đã yêu thích' : 'Yêu thích'}</button>
      <button type="button" className="tm-text-button" onClick={onShare}><Share2 size={18} />Chia sẻ</button>
    </div>
    <div className="tm-delivery-note"><Truck size={20} className="shrink-0" /><p>Phí giao hàng trả riêng cho đơn vị vận chuyển, ngoài tiền đơn TotMart. Phí cần được thống nhất trước khi giao.</p></div>
    {product.sku && <p className="text-sm text-stone-600">Mã sản phẩm: <span className="text-stone-900">{product.sku}</span></p>}
  </section>;
}
