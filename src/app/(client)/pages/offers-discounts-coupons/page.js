"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Tag,
  ArrowRight,
  Copy,
  Check,
  Percent,
  Sparkles,
  ShoppingBag,
  Calendar,
  Gift,
} from "lucide-react";
import Layout from "../layout-page";
import { getBoxOffersApi, getAllCouponsApi } from "@/app/services/api/boxService";
import { boxSalePrice, boxOriginalPrice } from "../../products/box/[id]/boxPricing";

const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );

const PLACEHOLDER_IMAGE = "/assets/placeholder.png";

export default function OffersPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [coupons, setCoupons] = useState([]);
  const [discountBoxes, setDiscountBoxes] = useState([]);
  const [featuredBoxes, setFeaturedBoxes] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadOffers() {
      setLoading(true);
      setError("");
      try {
        const [offersRes, couponsRes] = await Promise.allSettled([
          getBoxOffersApi(),
          getAllCouponsApi({ limit: 50 }),
        ]);

        if (!active) return;

        if (offersRes.status === "fulfilled") {
          const payload = offersRes.value?.data?.data || offersRes.value?.data || {};
          setDiscountBoxes(Array.isArray(payload.discountBoxes) ? payload.discountBoxes : []);
          setFeaturedBoxes(
            Array.isArray(payload.giftBoxes) && payload.giftBoxes.length
              ? payload.giftBoxes.slice(0, 4)
              : Array.isArray(payload.newBoxes)
              ? payload.newBoxes.slice(0, 4)
              : [],
          );
        }

        if (couponsRes.status === "fulfilled") {
          const payload = couponsRes.value?.data?.data || couponsRes.value?.data || [];
          const list = Array.isArray(payload) ? payload : [];
          // Filter active and unexpired coupons
          const now = new Date();
          const validCoupons = list.filter((c) => {
            if (c.isActive === false) return false;
            if (c.expiresAt && new Date(c.expiresAt) < now) return false;
            return true;
          });
          setCoupons(validCoupons);
        }
      } catch {
        if (active) setError("Không thể tải thông tin ưu đãi. Vui lòng thử lại sau.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOffers();

    return () => {
      active = false;
    };
  }, []);

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast.success(`Đã sao chép mã ${code}`);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      toast.error("Không thể sao chép tự động. Bạn vui lòng tự sao chép.");
    }
  };

  return (
    <Layout>
      <title>Ưu đãi & Khuyến mãi | TotMart</title>
      <meta
        name="description"
        content="Khám phá các chương trình ưu đãi, mã giảm giá độc quyền và combo hộp quà tặng đặc sản hữu cơ từ TotMart."
      />

      {/* Hero Section */}
      <section className="bg-card/60 border-b border-border py-12 sm:py-20 text-center px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-full">
            <Tag size={13} />
            <span>Ưu đãi & Khuyến mãi</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl text-foreground leading-tight tracking-tight">
            Ưu đãi đặc biệt từ TotMart
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Tổng hợp các mã giảm giá và các hộp quà tặng, combo nông sản tuyển chọn có mức giá ưu đãi nhất dành riêng cho bạn.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        {/* Loading State */}
        {loading && (
          <div className="space-y-8 animate-pulse">
            <div className="h-6 w-48 bg-muted rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 rounded-2xl bg-muted/60 border border-border" />
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-center text-sm text-destructive-text">
            <p>{error}</p>
          </div>
        )}

        {/* Section 1: Coupons */}
        {!loading && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-border pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-foreground flex items-center gap-2">
                  <Percent size={20} className="text-primary" />
                  Mã Giảm Giá Áp Dụng
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Sao chép mã và nhập tại bước thanh toán để nhận ưu đãi trực tiếp.
                </p>
              </div>
            </div>

            {coupons.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {coupons.map((coupon) => {
                  const isCopied = copiedCode === coupon.code;
                  const discountLabel =
                    coupon.discountType === "fixed"
                      ? `Giảm ${money(coupon.discount)}`
                      : `Giảm ${coupon.discount}%`;

                  return (
                    <div
                      key={coupon._id || coupon.code}
                      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between gap-4"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-sm font-bold text-primary bg-primary/10 border border-primary/25 px-2.5 py-1 rounded-lg">
                            {coupon.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(coupon.code)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                            aria-label={`Sao chép mã ${coupon.code}`}
                          >
                            {isCopied ? (
                              <>
                                <Check size={13} className="text-success-text" />
                                <span className="text-success-text">Đã sao chép</span>
                              </>
                            ) : (
                              <>
                                <Copy size={13} />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>

                        <p className="text-lg font-bold text-foreground">
                          {discountLabel}
                        </p>

                        <div className="text-xs text-muted-foreground space-y-1">
                          {coupon.minOrderValue > 0 ? (
                            <p>Đơn tối thiểu: {money(coupon.minOrderValue)}</p>
                          ) : (
                            <p>Áp dụng cho mọi giá trị đơn hàng</p>
                          )}
                          {coupon.expiresAt && (
                            <p className="flex items-center gap-1">
                              <Calendar size={12} />
                              HSD: {new Date(coupon.expiresAt).toLocaleDateString("vi-VN")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-dashed border-border pt-3">
                        <Link
                          href="/products"
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline underline-offset-4"
                        >
                          Dùng mã mua ngay <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center space-y-2">
                <Tag size={28} className="mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-sm font-semibold text-foreground">
                  Hiện tại các mã giảm giá công khai đang được cập nhật
                </p>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Hãy theo dõi bản tin TotMart hoặc đặt hàng để nhận các mã ưu đãi độc quyền dành riêng cho khách hàng thân thiết.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Section 2: Discounted Boxes */}
        {!loading && discountBoxes.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-border pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-foreground flex items-center gap-2">
                  <Sparkles size={20} className="text-primary" />
                  Combo & Hộp Quà Giảm Giá Sâu
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Bộ sưu tập hộp quà được chiết khấu hấp dẫn trực tiếp từ nhà sản xuất.
                </p>
              </div>
              <Link
                href="/box"
                className="text-xs sm:text-sm font-bold text-primary hover:underline underline-offset-4 inline-flex items-center gap-1"
              >
                Xem tất cả combo <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {discountBoxes.map((box) => {
                const salePrice = boxSalePrice(box);
                const originalPrice = boxOriginalPrice(box);
                const imgSrc = box.images?.[0]?.url || PLACEHOLDER_IMAGE;

                return (
                  <article
                    key={box._id}
                    className="group overflow-hidden rounded-2xl border border-border bg-card shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                        <Image
                          src={imgSrc}
                          alt={box.name || "Combo TotMart"}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {box.discountPercent > 0 && (
                          <span className="absolute top-3 left-3 rounded-full bg-destructive text-destructive-foreground px-2.5 py-1 text-xs font-bold shadow-xs">
                            -{box.discountPercent}%
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5 space-y-2">
                        <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {box.name}
                        </h3>
                        {box.descriptions && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {box.descriptions}
                          </p>
                        )}
                        <div className="flex items-baseline gap-2 pt-1">
                          <span className="text-base font-bold text-primary tabular-nums">
                            {money(salePrice)}
                          </span>
                          {originalPrice && (
                            <del className="text-xs text-muted-foreground tabular-nums">
                              {money(originalPrice)}
                            </del>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 pt-0">
                      <Link
                        href={`/products/box/${box._id}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 min-h-11 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
                      >
                        <ShoppingBag size={14} />
                        <span>Xem chi tiết & Mua ngay</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Section 3: Featured Gift Boxes */}
        {!loading && featuredBoxes.length > 0 && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-border pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-foreground flex items-center gap-2">
                  <Gift size={20} className="text-primary" />
                  Hộp Quà Thủ Công Tuyển Chọn
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                  Được đóng gói trang trọng, tích hợp tiện ích và chiết khấu theo số lượng.
                </p>
              </div>
              <Link
                href="/gift"
                className="text-xs sm:text-sm font-bold text-primary hover:underline underline-offset-4 inline-flex items-center gap-1"
              >
                Xem tất cả hộp quà <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredBoxes.map((box) => {
                const salePrice = boxSalePrice(box);
                const imgSrc = box.images?.[0]?.url || PLACEHOLDER_IMAGE;

                return (
                  <Link
                    key={box._id}
                    href={`/products/box/${box._id}`}
                    className="group overflow-hidden rounded-2xl border border-border bg-card p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
                        <Image
                          src={imgSrc}
                          alt={box.name || "Hộp quà TotMart"}
                          fill
                          sizes="(max-width: 640px) 100vw, 25vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="mt-3 space-y-1">
                        <p className="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {box.name}
                        </p>
                        <p className="text-xs font-bold text-primary tabular-nums">
                          {money(salePrice)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <div className="rounded-2xl border border-border bg-card/60 p-8 sm:p-12 text-center space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">
            Bạn đang tìm kiếm sản phẩm nông sản lẻ?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
            Hàng trăm sản phẩm đặc sản ba miền, trà Shan tuyết, cà phê nguyên chất và nông sản hữu cơ đang chờ bạn khám phá.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 min-h-11 text-xs sm:text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs"
            >
              <span>Xem danh mục sản phẩm</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
