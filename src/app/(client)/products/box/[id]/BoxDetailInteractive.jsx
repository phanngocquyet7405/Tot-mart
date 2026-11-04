"use client";

import { useState } from "react";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Truck, CalendarClock } from "lucide-react";
import { useAddToCart } from "@/app/hook/useAddToCart";
import { ProductGallery } from "../../../components/Product/ProductGallery";
import { boxSalePrice, boxOriginalPrice, toBoxCartItem } from "./boxPricing";

const PLACEHOLDER_IMAGE = "/assets/placeholder.png";

export default function BoxDetailInteractive({ initialBox, initialProducts = [] }) {
  const { addToCart } = useAddToCart();
  const box = initialBox;
  const boxProducts = initialProducts;

  const [selectedImage, setSelectedImage] = useState(
    box?.images?.[0]?.url || boxProducts?.[0]?.product?.images?.[0]?.url || PLACEHOLDER_IMAGE,
  );
  const [quantity, setQuantity] = useState(1);

  const salePrice = boxSalePrice(box);
  const originalPrice = boxOriginalPrice(box);
  const giftPercent = (box?.giftPolicy?.bulkTiers || [])
    .filter((t) => quantity >= t.minQuantity)
    .sort((a, b) => b.minQuantity - a.minQuantity)[0]?.percent || 0;
  const amenityFee = (box?.giftPolicy?.amenities || []).reduce((sum, a) => sum + a.fee, 0);
  const giftTotal = Math.round(salePrice * quantity * (1 - giftPercent / 100)) + amenityFee * quantity;
  const stock = box?.stock ?? 0;

  // Validity checks per BE Box schema (validFrom, validTo)
  const now = new Date();
  const validFrom = box?.validFrom ? new Date(box.validFrom) : null;
  const validTo = box?.validTo ? new Date(box.validTo) : null;

  const isNotYetOpen = Boolean(validFrom && now < validFrom);
  const isExpired = Boolean(validTo && now > validTo);
  const isSaleActive = !isNotYetOpen && !isExpired;

  const daysRemaining =
    validTo && isSaleActive
      ? Math.max(0, Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : null;

  const canBuy =
    isSaleActive &&
    stock > 0 &&
    Number.isInteger(quantity) &&
    quantity > 0 &&
    quantity <= Math.min(999, stock);

  const buyButtonText = isExpired
    ? "Đã hết hạn mở bán"
    : isNotYetOpen
    ? "Chưa mở bán"
    : stock > 0
    ? "Thêm vào giỏ hàng"
    : "Tạm hết hàng";

  const mobileBuyButtonText = isExpired
    ? "Hết hạn"
    : isNotYetOpen
    ? "Chưa mở"
    : stock > 0
    ? "Thêm vào giỏ"
    : "Hết hàng";

  const handleAddToCart = () => {
    if (!box || !canBuy) return;
    addToCart(toBoxCartItem(box, PLACEHOLDER_IMAGE), quantity);
  };

  return (
    <>
      <div className="grid items-start gap-8 lg:grid-cols-12 lg:gap-12">
        <ProductGallery
          images={box.images || []}
          productName={box.name}
          selectedImage={selectedImage}
          onSelectImage={setSelectedImage}
          discountPercent={box.discountPercent || 0}
        />
        <section className="tm-purchase lg:col-span-5" aria-label="Thông tin mua hộp">
          <div>
            <h1 className="tm-product-title">{box.name}</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              {box.isGift ? "Hộp quà TotMart" : "Combo sản phẩm TotMart"}
            </p>
          </div>
          <div className="tm-price-block">
            <div className="flex flex-wrap items-baseline gap-4">
              <p className="tm-price">{salePrice.toLocaleString("vi-VN")} ₫</p>
              {originalPrice && (
                <del className="text-muted-foreground">{originalPrice.toLocaleString("vi-VN")} ₫</del>
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Giá cuối cùng được xác nhận tại thanh toán.</p>
          </div>

          {/* Validity Notice */}
          {(validFrom || validTo) && (
            <div
              className={`rounded-xl border p-3 text-xs font-medium flex items-start gap-2.5 ${
                isExpired
                  ? "bg-destructive/10 border-destructive/25 text-destructive-text"
                  : isNotYetOpen
                  ? "bg-amber-500/10 border-amber-500/25 text-amber-700 dark:text-amber-400"
                  : "bg-primary/10 border-primary/20 text-primary"
              }`}
            >
              <CalendarClock size={16} className="shrink-0 mt-0.5" />
              <div className="flex-1">
                {isExpired ? (
                  <span>
                    Hộp sản phẩm này đã ngừng bán vào ngày{" "}
                    <strong>{validTo.toLocaleDateString("vi-VN")}</strong>.
                  </span>
                ) : isNotYetOpen ? (
                  <span>
                    Hộp sản phẩm sẽ bắt đầu mở bán từ ngày{" "}
                    <strong>{validFrom.toLocaleDateString("vi-VN")}</strong>.
                  </span>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span>
                      Thời gian mở bán:{" "}
                      <strong>
                        {validFrom ? validFrom.toLocaleDateString("vi-VN") : "Hiện tại"} –{" "}
                        {validTo ? validTo.toLocaleDateString("vi-VN") : "Không giới hạn"}
                      </strong>
                    </span>
                    {daysRemaining !== null && daysRemaining <= 14 && (
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        (Còn {daysRemaining} ngày)
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <p
            className={
              stock > 0 && isSaleActive
                ? "font-semibold text-success-text"
                : "font-semibold text-destructive-text"
            }
          >
            {!isSaleActive
              ? isExpired
                ? "Đã kết thúc thời gian mở bán"
                : "Chưa tới thời gian mở bán"
              : stock > 0
              ? `Còn ${stock} hộp`
              : "Tạm hết hàng"}
          </p>

          <div className="tm-quantity-row">
            <span id="box-quantity-label">Số lượng</span>
            <div className="tm-quantity" role="group" aria-labelledby="box-quantity-label">
              <button
                type="button"
                aria-label="Giảm số lượng hộp"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || stock <= 0 || !isSaleActive}
                className="transition-colors motion-reduce:transition-none"
              >
                <Minus size={18} />
              </button>
              <output aria-live="polite">{quantity}</output>
              <button
                type="button"
                aria-label="Tăng số lượng hộp"
                onClick={() => setQuantity((q) => Math.min(Math.min(999, stock), q + 1))}
                disabled={stock <= 0 || quantity >= Math.min(999, stock) || !isSaleActive}
                className="transition-colors motion-reduce:transition-none"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
          {box.sourceComboId && (
            <div className="rounded-xl border border-border bg-card p-5 text-sm space-y-3">
              <h2 className="font-bold text-base">Ưu đãi & tiện ích theo hộp</h2>
              {(box.giftPolicy?.bulkTiers || []).map((t) => (
                <p key={t.minQuantity}>
                  Từ {t.minQuantity} hộp: giảm {t.percent}% giá hộp
                </p>
              ))}
              {(box.giftPolicy?.amenities || []).map((a, i) => (
                <p key={i}>
                  {a.name}: +{a.fee.toLocaleString("vi-VN")} ₫/hộp
                </p>
              ))}
              <p className="font-semibold">
                Tạm tính {quantity} hộp: {giftTotal.toLocaleString("vi-VN")} ₫
              </p>
              <p>Tiện ích đã cấu hình được tính theo từng hộp. Báo giá khi thanh toán xác nhận số tiền cuối.</p>
            </div>
          )}
          <button
            type="button"
            className="tm-button tm-button--primary w-full transition-colors motion-reduce:transition-none"
            disabled={!canBuy}
            onClick={handleAddToCart}
          >
            <ShoppingCart size={20} />
            {buyButtonText}
          </button>
          <div className="tm-delivery-note">
            <Truck size={20} className="shrink-0" />
            <p>
              Khách trả phí vận chuyển trực tiếp cho đơn vị giao hàng, ngoài số tiền đơn TotMart. Phí
              cần được thống nhất trước khi giao.
            </p>
          </div>
        </section>
      </div>

      <section className="tm-section">
        <h2>Sản phẩm trong hộp</h2>
        {boxProducts.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {boxProducts.map((item, index) => {
              const product = item.product || item.productId || item;
              return (
                <li
                  key={product._id || index}
                  className="flex items-center gap-4 rounded-xl border border-border p-4 bg-card"
                >
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={product.images?.[0]?.url || PLACEHOLDER_IMAGE}
                      alt={product.name || "Sản phẩm trong hộp"}
                      fill
                      sizes="80px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold">{product.name || "Sản phẩm trong hộp"}</h3>
                    <p className="text-sm text-muted-foreground">Số lượng: {item.quantity || 1}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-muted-foreground">Chưa có thông tin chi tiết sản phẩm trong hộp.</p>
        )}
      </section>

      <section className="tm-section">
        <h2>Về hộp sản phẩm</h2>
        <p className="max-w-prose whitespace-pre-line text-muted-foreground">
          {box.descriptions || "Chưa có mô tả chi tiết cho hộp này."}
        </p>
      </section>
      {/* Mobile Sticky Purchase Bar with Safe Area */}
      <div className="fixed bottom-0 left-0 right-0 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-background/95 backdrop-blur-sm border-t border-border z-30 md:hidden flex items-center justify-between gap-3 shadow-lg pointer-events-auto">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground truncate">{box.name || "Combo TotMart"}</p>
          <p className="text-base font-bold text-foreground tabular-nums">
            {(box.value || box.price || 0).toLocaleString("vi-VN")} ₫
          </p>
        </div>
        <button
          type="button"
          className="tm-button tm-button--primary px-4 py-2 min-h-11 text-xs font-bold shrink-0 shadow-xs active:scale-[0.97]"
          disabled={!canBuy}
          onClick={handleAddToCart}
        >
          <ShoppingCart size={16} />
          <span>{mobileBuyButtonText}</span>
        </button>
      </div>
      {/* Khoảng đệm cuối trang tránh che nội dung */}
      <div className="h-24 md:hidden" aria-hidden="true" />
    </>
  );
}
