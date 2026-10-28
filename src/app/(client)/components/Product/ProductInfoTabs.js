"use client";

import { Info, Star } from "lucide-react";
import { sanitizeHtml } from "@/app/util/htmlSanitizer";

const TABS = [
  { key: "details", label: "Mô tả sản phẩm" },
  { key: "reviews", label: "Đánh giá" },
  { key: "specs", label: "Thông số" },
];

export function ProductInfoTabs({ product, activeTab, onTabChange }) {
  const avgRating = Number(product.rating);
  const reviewCount = Number.isSafeInteger(product.reviewCount) && product.reviewCount >= 0 ? product.reviewCount : null;
  const hasRating = reviewCount > 0 && Number.isFinite(avgRating) && avgRating > 0 && avgRating <= 5;

  return (
    <div className="tm-section">
      {/* Header điều hướng tab */}
      <div className="tm-tab-list" role="tablist" aria-label="Thông tin sản phẩm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            role="tab"
            aria-selected={activeTab === tab.key}
            aria-controls={`tabpanel-${tab.key}`}
            onClick={() => onTabChange(tab.key)}
            className="transition-colors motion-reduce:transition-none"
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab: Mô tả */}
      {activeTab === "details" && (
        <div id="tabpanel-details" role="tabpanel" aria-labelledby="tab-details" className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 text-sm text-foreground leading-relaxed">
            {product.description ? (
              <div
                className="prose prose-sm max-w-none prose-p:my-2 prose-p:leading-relaxed prose-stone"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
              />
            ) : (
              <span className="italic text-muted-foreground">
                Chưa có mô tả chi tiết cho sản phẩm này.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tab: Đánh giá */}
      {activeTab === "reviews" && (
        <div id="tabpanel-reviews" role="tabpanel" aria-labelledby="tab-reviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-2">
                Đánh giá từ khách hàng
              </h3>
              <p className="text-muted-foreground text-sm">{reviewCount === null ? 'Chưa có dữ liệu đánh giá được xác nhận' : `${reviewCount} đánh giá`}</p>
            </div>
            {hasRating && <div className="text-center">
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
            </div>}
          </div>

          {reviewCount === null || reviewCount === 0 ? (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex gap-3 items-start text-xs text-warning-text leading-relaxed">
              <Info size={16} className="text-warning-text shrink-0 mt-0.5" />
              <p>{reviewCount === null ? 'TotMart chưa cung cấp dữ liệu đánh giá cho sản phẩm này.' : 'Chưa có đánh giá nào cho sản phẩm này.'}</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">
              Sản phẩm có {reviewCount} đánh giá từ khách hàng.
            </p>
          )}
        </div>
      )}

      {/* Tab: Thông số */}
      {activeTab === "specs" && (
        <div id="tabpanel-specs" role="tabpanel" aria-labelledby="tab-specs" className="space-y-1">
          {product.sku && (
            <div className="flex justify-between py-3 border-b border-border text-sm">
              <span className="text-muted-foreground">Mã sản phẩm (SKU)</span>
              <span className="font-bold text-foreground font-semibold">{product.sku}</span>
            </div>
          )}
          {product.category && (
            <div className="flex justify-between py-3 border-b border-border text-sm">
              <span className="text-muted-foreground">Danh mục</span>
              <span className="font-bold text-foreground font-semibold">
                {product.category.name || product.category}
              </span>
            </div>
          )}
          {product.brand && (
            <div className="flex justify-between py-3 border-b border-border text-sm">
              <span className="text-muted-foreground">Thương hiệu</span>
              <span className="font-bold text-foreground font-semibold">
                {product.brand.name || product.brand}
              </span>
            </div>
          )}
          <div className="flex justify-between py-3 border-b border-border text-sm">
            <span className="text-muted-foreground">Tồn kho</span>
            <span className="font-bold text-foreground font-semibold">
              {product.stock ?? 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
