"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Sparkles, Gift, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import AnnouncementBar from "./ui/AnnouncementBar";
import NavMenu from "./ui/nav_menu";
import { toast } from "sonner";
import { getAllBoxesApi } from "@/app/services/api/boxService";
import { getActiveTemplatesApi } from "@/app/services/api/subscribePlanService";
import { useCart } from "@/app/context/CartContext";
import { toBoxCartItem } from "../products/box/[id]/boxPricing";
import ChoosePlan from "@/components_box/ChoosePlan";
import MainHeader from "./ui/main_header";
import Footer from "./ui/footer";

const money = (n) => Number(n || 0).toLocaleString("vi-VN") + " ₫";
const names = {
  combo: "Combo sản phẩm đặc sản",
  gift: "Hộp quà tặng thủ công cao cấp",
  subscription: "Đăng ký nhận hộp định kỳ",
};

const descs = {
  combo: "Các bộ sản phẩm tuyển chọn kết hợp hài hòa giữa trà ngon, bánh mứt và đặc sản ba miền với chi phí ưu đãi nhất.",
  gift: "Những set quà thủ công độc bản được đóng gói trang trọng bằng giấy dó và ruy băng vải thô, gửi trao tâm ý chân tình đến người thân và đối tác.",
  subscription: "Trải nghiệm hộp quà bất ngờ mỗi tháng từ nghệ nhân bản địa khắp 3 miền Việt Nam.",
};

export default function CommerceCatalog({ kind, onlyAvailable = true }) {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [quantities, setQuantities] = useState({});
  const { addToCart, isMounted } = useCart();

  useEffect(() => {
    let active = true;
    const request =
      kind === "subscription"
        ? getActiveTemplatesApi()
        : getAllBoxesApi({
            kind,
            page,
            limit: 12,
            ...(onlyAvailable ? { available: true } : {}),
          });

    request
      .then((res) => {
        if (active) {
          setRows(res.data || []);
          setPages(res.pagination?.totalPages || 1);
        }
      })
      .catch(() => {
        if (active) setError("Không tải được danh sách. Vui lòng thử lại.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [kind, page, reload, onlyAvailable]);

  return (
    <>
      <AnnouncementBar />
      <MainHeader />
      <NavMenu />

      <main className="tm-commerce tm-commerce--atelier mx-auto max-w-6xl px-4 pt-[112px] sm:pt-[124px] pb-12 sm:px-6">
        {/* Breadcrumb điều hướng */}
        <nav aria-label="Mua sắm" className="tm-breadcrumb mb-6 text-xs text-muted-foreground flex items-center gap-2">
          <Link href="/homepage" className="hover:text-primary transition-colors">
            Cửa hàng
          </Link>
          <span>/</span>
          {[
            ["/subscription", "Đăng ký tháng", "subscription"],
            ["/box", "Combo đặc sản", "combo"],
            ["/gift", "Hộp quà thủ công", "gift"],
          ].map(([href, label, type]) => (
            <Link
              key={href}
              href={href}
              aria-current={kind === type ? "page" : undefined}
              className={`transition-colors ${
                kind === type
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Header danh mục chuẩn Bokksu Boutique */}
        <header className="mb-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-500" />
            <span>{kind === "gift" ? "Boutique Gift Sets" : "Artisan Combos"}</span>
          </div>
          <h1 className="tm-product-title font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-foreground">
            {names[kind]}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {descs[kind]}
          </p>
          <p className="text-xs text-muted-foreground/80 italic">
            Phí vận chuyển do khách trả trực tiếp cho bên giao hàng theo cước thực tế khi nhận hàng.
          </p>
        </header>

        {/* Trạng thái tải / Lỗi / Danh sách */}
        {loading ? (
          <div
            role="status"
            aria-label={`Đang tải ${names[kind].toLowerCase()}`}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 py-6"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl border border-border bg-card p-5 space-y-4"
              >
                <div className="aspect-16/10 rounded-2xl bg-muted" />
                <div className="h-6 w-3/4 rounded bg-muted" />
                <div className="h-5 w-1/2 rounded bg-muted" />
                <div className="h-10 rounded-xl bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="space-y-4 py-12 text-center">
            <h2 className="text-xl font-bold text-destructive-text">
              Chưa tải được danh sách
            </h2>
            <p className="text-muted-foreground">{error}</p>
            <button
              type="button"
              className="tm-button tm-button--outline"
              onClick={() => {
                setLoading(true);
                setError("");
                setReload((n) => n + 1);
              }}
            >
              Thử lại
            </button>
          </div>
        ) : !rows.length ? (
          <div className="tm-state py-12 text-center space-y-4" role="status">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Hiện chưa có {names[kind].toLowerCase()} đang bán
            </h2>
            <p className="text-muted-foreground text-sm">
              Bạn có thể xem các sản phẩm khác trong cửa hàng.
            </p>
            <Link href="/products" className="tm-button tm-button--outline">
              Khám phá sản phẩm
            </Link>
          </div>
        ) : kind === "subscription" ? (
          <ChoosePlan plans={rows} embedded />
        ) : (
          /* Lưới sản phẩm Hộp quà / Combo chuẩn Bokksu Boutique */
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => {
              const quantity = quantities[row._id] ?? 1;
              const validQuantity =
                Number.isInteger(Number(quantity)) &&
                Number(quantity) > 0 &&
                Number(quantity) <= Math.min(999, row.stock);

              return (
                <article
                  key={row._id}
                  className="tm-plan-card group rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <Link
                    href={`/products/box/${row._id}`}
                    className="tm-plan-card__image relative aspect-16/10 bg-gradient-to-b from-stone-50 via-background to-stone-100/50 dark:from-stone-900 dark:to-stone-950 border-b border-border/60 overflow-hidden block"
                  >
                    <Image
                      src={row.images?.[0]?.url || "/assets/placeholder.png"}
                      alt={row.name || names[kind]}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-xs text-primary border border-primary/20 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                      {kind === "gift" ? "Hộp quà thủ công" : "Combo tiết kiệm"}
                    </div>
                  </Link>

                  <div className="tm-plan-card__body p-6 flex flex-col flex-1 gap-4">
                    <div>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold leading-snug">
                        <Link
                          href={`/products/box/${row._id}`}
                          className="hover:text-primary transition-colors line-clamp-2"
                        >
                          {row.name}
                        </Link>
                      </h2>
                      <p className="tm-price text-2xl font-black text-primary tabular-nums mt-2">
                        {money(row.value)}
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          /hộp
                        </span>
                      </p>
                    </div>

                    {kind === "gift" &&
                      ((row.giftPolicy?.bulkTiers || []).length > 0 ||
                        (row.giftPolicy?.amenities || []).length > 0) && (
                        <details className="text-xs bg-muted/40 rounded-xl p-3 border border-border/60">
                          <summary className="cursor-pointer font-bold text-foreground hover:text-primary transition-colors">
                            Ưu đãi & tiện ích của hộp
                          </summary>
                          <ul className="space-y-1.5 pt-2 text-muted-foreground">
                            {(row.giftPolicy?.bulkTiers || []).map((t) => (
                              <li key={t.minQuantity}>
                                Từ {t.minQuantity} hộp: giảm {t.percent}% giá hộp
                              </li>
                            ))}
                            {(row.giftPolicy?.amenities || []).map((a, i) => (
                              <li key={i}>
                                {a.name}: +{money(a.fee)}/hộp
                              </li>
                            ))}
                          </ul>
                          <p className="pt-1.5 text-[10px] text-muted-foreground/80 italic">
                            Tiện ích đã cấu hình được cộng khi báo giá giỏ hàng.
                          </p>
                        </details>
                      )}

                    {/* Stock status */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      {row.stock > 0 ? (
                        <span className="text-success-text flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          Còn {row.stock} hộp
                        </span>
                      ) : (
                        <span className="text-destructive-text flex items-center gap-1">
                          <AlertCircle size={13} />
                          Tạm hết hàng
                        </span>
                      )}
                    </div>

                    {/* Quantity & CTA */}
                    <div className="flex items-center justify-between gap-3 text-xs font-bold pt-1">
                      <span>Số lượng</span>
                      <input
                        aria-label={`Số lượng ${row.name}`}
                        className="w-20 rounded-xl border border-border bg-background text-foreground px-3 py-2 text-center text-sm font-bold tabular-nums"
                        type="number"
                        min="1"
                        max={Math.min(999, row.stock)}
                        disabled={!(row.stock > 0)}
                        value={quantity}
                        onChange={(event) =>
                          setQuantities((previous) => ({
                            ...previous,
                            [row._id]: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <button
                      type="button"
                      className="tm-button tm-button--primary w-full py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-sm hover:shadow active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-auto"
                      disabled={!isMounted || !validQuantity}
                      onClick={() => {
                        addToCart(
                          toBoxCartItem(row, "/assets/placeholder.png"),
                          Number(quantity),
                        );
                        toast.success(
                          "Đã thêm vào giỏ. Giá cuối cùng được xác nhận tại checkout.",
                        );
                      }}
                    >
                      <ShoppingCart size={15} />
                      <span>{row.stock > 0 ? "Thêm vào giỏ" : "Tạm hết hàng"}</span>
                    </button>

                    <Link
                      className="inline-flex items-center justify-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary transition-colors text-center pt-1"
                      href={`/products/box/${row._id}`}
                    >
                      <span>Xem sản phẩm trong hộp</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {pages > 1 && (
          <nav
            aria-label="Phân trang"
            className="mt-12 flex flex-wrap items-center justify-center gap-4 text-xs font-bold"
          >
            <button
              type="button"
              className="tm-button tm-button--outline px-4 py-2 rounded-xl"
              disabled={page <= 1 || loading}
              onClick={() => {
                setLoading(true);
                setError("");
                setPage((p) => p - 1);
              }}
            >
              Trước
            </button>
            <span aria-live="polite" className="text-muted-foreground px-2">
              Trang {page}/{pages}
            </span>
            <button
              type="button"
              className="tm-button tm-button--outline px-4 py-2 rounded-xl"
              disabled={page >= pages || loading}
              onClick={() => {
                setLoading(true);
                setError("");
                setPage((p) => p + 1);
              }}
            >
              Sau
            </button>
          </nav>
        )}
      </main>

      <Footer />
    </>
  );
}
