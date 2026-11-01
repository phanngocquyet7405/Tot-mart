"use client";

import { Info, Star, Compass, ShieldCheck } from "lucide-react";
import { sanitizeHtml } from "@/app/util/htmlSanitizer";

const TABS = [
  { key: "details", label: "Mô tả sản phẩm" },
  { key: "reviews", label: "Đánh giá" },
  { key: "specs", label: "Thông số" },
];

export function ProductInfoTabs({ product, activeTab, onTabChange }) {
  const avgRating = Number(product.rating);
  const reviewCount =
    Number.isSafeInteger(product.reviewCount) && product.reviewCount >= 0
      ? product.reviewCount
      : null;
  const hasRating =
    reviewCount > 0 &&
    Number.isFinite(avgRating) &&
    avgRating > 0 &&
    avgRating <= 5;

  return (
    <div className="tm-section mt-12 pt-8 border-t border-border/80">
      {/* Header điều hướng tab - Thiết kế chuẩn Bokksu */}
      <div
        className="tm-tab-list flex flex-wrap gap-2 sm:gap-6 border-b border-border/80 mb-6"
        role="tablist"
        aria-label="Thông tin sản phẩm"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            onClick={() => onTabChange(tab.key)}
            className={`relative py-3.5 px-3 sm:px-4 text-sm font-bold tracking-wide transition-all motion-reduce:transition-none cursor-pointer ${
              activeTab === tab.key
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full transition-all" />
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Mô tả & Câu chuyện thủ công (Bokksu Storytelling) */}
      {activeTab === "details" && (
        <div
          id="tabpanel-details"
          role="tabpanel"
          aria-labelledby="tab-details"
          className="space-y-6"
        >
          {/* Box câu chuyện nghệ nhân & nguồn gốc */}
          <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-amber-50/50 via-stone-50 to-orange-50/30 dark:from-amber-950/20 dark:via-stone-900/40 dark:to-orange-950/10 p-5 sm:p-6 space-y-2.5 shadow-2xs">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
              <Compass size={15} />
              <span>Dấu ấn bản địa & Tinh hoa làng nghề</span>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">
              Mỗi sản phẩm tại TotMart là kết tinh của kinh nghiệm truyền đời từ các nghệ nhân và hợp tác xã địa phương khắp Việt Nam. Chúng tôi đồng hành bảo tồn nghề truyền thống, giữ vững quy trình tự nhiên và cam kết chất lượng chuẩn mực tới bàn ăn gia đình bạn.
            </p>
          </div>

          <div className="bg-card border border-border/80 rounded-2xl p-6 text-sm text-foreground leading-relaxed shadow-2xs">
            {product.description ? (
              <div
                className="prose prose-sm max-w-none prose-p:my-2 prose-p:leading-relaxed prose-stone dark:prose-invert"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(product.description),
                }}
              />
            ) : (
              <span className="italic text-muted-foreground">
                Chưa có mô tả chi tiết cho sản phẩm này.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Đánh giá */}
      {activeTab === "reviews" && (
        <div
          id="tabpanel-reviews"
          role="tabpanel"
          aria-labelledby="tab-reviews"
          className="space-y-6"
        >
          <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-6 shadow-2xs">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-1.5">
                Đánh giá từ khách hàng
              </h3>
              <p className="text-muted-foreground text-sm">
                {reviewCount === null
                  ? "Chưa có dữ liệu đánh giá được xác nhận"
                  : `${reviewCount} đánh giá`}
              </p>
            </div>
            {hasRating && (
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-1">
                  {avgRating.toFixed(1)}
                </div>
                <div className="flex gap-1 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(avgRating)
                          ? "fill-warning text-warning-text"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {reviewCount === null || reviewCount === 0 ? (
            <div className="bg-muted/40 border border-border/60 rounded-2xl p-5 flex gap-3.5 items-start text-xs text-muted-foreground leading-relaxed">
              <Info size={16} className="text-primary shrink-0 mt-0.5" />
              <p>
                {reviewCount === null
                  ? "TotMart chưa cung cấp dữ liệu đánh giá cho sản phẩm này."
                  : "Chưa có đánh giá nào cho sản phẩm này."}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Sản phẩm có {reviewCount} đánh giá từ khách hàng đã trải nghiệm.
            </p>
          )}
        </div>
      )}

      {/* Tab 3: Thông số & Tiêu chuẩn */}
      {activeTab === "specs" && (
        <div
          id="tabpanel-specs"
          role="tabpanel"
          aria-labelledby="tab-specs"
          className="rounded-2xl border border-border/80 bg-card divide-y divide-border/60 overflow-hidden shadow-2xs"
        >
          {product.sku && (
            <div className="flex justify-between py-3.5 px-5 text-sm hover:bg-muted/30 transition-colors">
              <span className="text-muted-foreground font-medium">Mã sản phẩm (SKU)</span>
              <span className="font-mono font-bold text-foreground">{product.sku}</span>
            </div>
          )}
          {product.category && (
            <div className="flex justify-between py-3.5 px-5 text-sm hover:bg-muted/30 transition-colors">
              <span className="text-muted-foreground font-medium">Danh mục</span>
              <span className="font-semibold text-foreground">
                {product.category.name || product.category}
              </span>
            </div>
          )}
          {product.brand && (
            <div className="flex justify-between py-3.5 px-5 text-sm hover:bg-muted/30 transition-colors">
              <span className="text-muted-foreground font-medium">Thương hiệu</span>
              <span className="font-semibold text-foreground">
                {product.brand.name || product.brand}
              </span>
            </div>
          )}
          <div className="flex justify-between py-3.5 px-5 text-sm hover:bg-muted/30 transition-colors">
            <span className="text-muted-foreground font-medium">Tồn kho khả dụng</span>
            <span className="font-semibold text-foreground">
              {product.stock ?? 0}
            </span>
          </div>
          <div className="flex justify-between py-3.5 px-5 text-sm hover:bg-muted/30 transition-colors">
            <span className="text-muted-foreground font-medium">Cam kết chất lượng</span>
            <span className="font-semibold text-primary flex items-center gap-1.5">
              <ShieldCheck size={14} />
              100% Nguyên liệu sạch & Tự nhiên
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductInfoTabs;
