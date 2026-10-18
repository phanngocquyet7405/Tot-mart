"use client";

import { Info, Star } from "lucide-react";

const TABS = [
  { key: "details", label: "Mô tả sản phẩm" },
  { key: "reviews", label: "Đánh giá" },
  { key: "specs", label: "Thông số" },
];

export function ProductInfoTabs({ product, activeTab, onTabChange }) {
  const avgRating = Number(product.rating);
  const reviewCount = Number.isSafeInteger(Number(product.reviewCount)) && Number(product.reviewCount) > 0 ? Number(product.reviewCount) : 0;
  const hasRating = reviewCount > 0 && Number.isFinite(avgRating) && avgRating > 0 && avgRating <= 5;

  return (
    <div className="tm-section">
      {/* Header điều hướng tab */}
      <div className="tm-tab-list" role="group" aria-label="Thông tin sản phẩm">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            aria-pressed={activeTab === tab.key} aria-controls="product-information"
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-800 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab: Mô tả */}
      {activeTab === "details" && (
        <div id="product-information" className="space-y-4">
          <div className="bg-stone-50 rounded-xl p-5 text-sm text-stone-700 leading-relaxed">
            {product.description ? (
              <div
                className="prose prose-sm max-w-none prose-p:my-2 prose-p:leading-relaxed prose-stone"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            ) : (
              <span className="italic text-stone-400">
                Chưa có mô tả chi tiết cho sản phẩm này.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tab: Đánh giá */}
      {activeTab === "reviews" && (
        <div id="product-information" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-stone-800 mb-2">
                Đánh giá từ khách hàng
              </h3>
              <p className="text-stone-500 text-sm">{reviewCount} đánh giá</p>
            </div>
            {hasRating && <div className="text-center">
              <div className="text-4xl font-black text-green-800 mb-1">
                {avgRating.toFixed(1)}
              </div>
              <div className="flex gap-1 justify-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300"
                    }`}
                  />
                ))}
              </div>
            </div>}
          </div>

          {reviewCount === 0 ? (
            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3 items-start text-xs text-amber-900/80 leading-relaxed">
              <Info size={16} className="text-green-800 shrink-0 mt-0.5" />
              <p>Chưa có đánh giá nào cho sản phẩm này.</p>
            </div>
          ) : (
            <p className="text-stone-600 text-sm">
              Sản phẩm có {reviewCount} đánh giá từ khách hàng.
            </p>
          )}
        </div>
      )}

      {/* Tab: Thông số */}
      {activeTab === "specs" && (
        <div id="product-information" className="space-y-1">
          {product.sku && (
            <div className="flex justify-between py-3 border-b border-stone-100 text-sm">
              <span className="text-stone-500">Mã sản phẩm (SKU)</span>
              <span className="font-bold text-stone-800">{product.sku}</span>
            </div>
          )}
          {product.category && (
            <div className="flex justify-between py-3 border-b border-stone-100 text-sm">
              <span className="text-stone-500">Danh mục</span>
              <span className="font-bold text-stone-800">
                {product.category.name || product.category}
              </span>
            </div>
          )}
          {product.brand && (
            <div className="flex justify-between py-3 border-b border-stone-100 text-sm">
              <span className="text-stone-500">Thương hiệu</span>
              <span className="font-bold text-stone-800">
                {product.brand.name || product.brand}
              </span>
            </div>
          )}
          <div className="flex justify-between py-3 border-b border-stone-100 text-sm">
            <span className="text-stone-500">Tồn kho</span>
            <span className="font-bold text-stone-800">
              {product.stock ?? 0}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
