"use client";
import logger from "@/app/util/Logger";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ProductCard } from "./product_card";
import {
  getAllProductsApi,
} from "@/app/services/api/productServices";
import { useAddToCart } from "@/app/hook/useAddToCart";
import { useWishlist } from "@/app/context/WishlistContext";

export default function ProductsGrid({
  categoryId,
  brandSlug,
  searchQuery = "",
  initialProducts = null,
  initialPagination = null,
  initialPage = 1,
  initialSort = "newest",
  initialError = null,
}) {
  const { addToCart } = useAddToCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts && !initialError);
  const [error, setError] = useState(initialError);
  const [reloadToken, setReloadToken] = useState(0);
  const [sortBy, setSortBy] = useState(initialSort || "newest");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const pageSize = 12;

  const [pagination, setPagination] = useState(
    initialPagination || {
      total: initialProducts?.length || 0,
      totalPages: Math.ceil((initialProducts?.length || 0) / pageSize) || 1,
    }
  );
  const totalPages = pagination.totalPages;
  const visibleProducts = products;
  const isInitialMount = useRef(Boolean(initialProducts));

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      setLoading(false);
    }
    if (initialPagination) {
      setPagination(initialPagination);
    }
    if (initialPage) {
      setCurrentPage(initialPage);
    }
    if (initialError !== undefined) {
      setError(initialError);
    }
  }, [initialProducts, initialPagination, initialPage, initialError]);

  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    setCurrentPage(1);
  }, [categoryId, brandSlug, searchQuery, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (isInitialMount.current && reloadToken === 0 && !initialError) {
      isInitialMount.current = false;
      return;
    }

    let active = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAllProductsApi({
          page: currentPage,
          limit: pageSize,
          keyword: searchQuery.trim() || undefined,
          category: categoryId || undefined,
          brandSlug: brandSlug || undefined,
          sort: sortBy === "price-asc" ? "price_asc" : sortBy === "price-desc" ? "price_desc" : undefined,
        });
        if (!active) return;
        setProducts(res.data || []);
        setPagination(res.pagination || { total: res.data?.length || 0, totalPages: 1 });
      } catch (err) {
        if (!active) return;
        logger.error("Error fetching products:", err);
        const status = err?.response?.status;
        const requestId = err?.response?.data?.requestId || err?.requestId || err?.response?.headers?.["x-request-id"];
        const safeMessage = status >= 500 ? "Lỗi hệ thống. Vui lòng thử lại." : (err?.response?.data?.message || "Không thể tải danh sách sản phẩm.");
        setError({ message: safeMessage, requestId });
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      active = false;
    };
  }, [categoryId, brandSlug, searchQuery, sortBy, currentPage, reloadToken, initialError]);

  if (loading)
    return (
      <div className="py-12" role="status" aria-label="Đang tải danh sách sản phẩm">
        <span className="sr-only">Đang tải danh sách sản phẩm...</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse motion-reduce:animate-none bg-muted/70 rounded-xl aspect-square border border-border"
            />
          ))}
        </div>
      </div>
    );
  if (error)
    return (
      <div role="alert" className="py-20 text-center space-y-4">
        <p className="text-destructive-text font-semibold text-base">{error.message}</p>
        {error.requestId && (
          <p className="text-xs text-muted-foreground font-mono">Mã yêu cầu (Request ID): {error.requestId}</p>
        )}
        <div>
          <button
            type="button"
            onClick={() => setReloadToken((n) => n + 1)}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 shadow-xs transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );

  return (
    <div className="w-full">
      {/* Header with sorting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6 mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">
            {categoryId ? "Category Products" : "All Products"}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Showing {products.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} results
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-semibold text-foreground">
              Sort:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="border border-border bg-card text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 ml-auto md:ml-4">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              title="Grid View"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4z" />
                <path d="M3 10a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              title="List View"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div
        className={`${
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        } mb-12`}
      >
        {products.length > 0 ? (
            visibleProducts.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onAddToCart={(p) => addToCart(p)}
              isWishlisted={isInWishlist(product._id || product.id)}
              onToggleWishlist={(p) => {
                const added = toggleWishlist({
                  _id: p._id || p.id,
                  id: p._id || p.id,
                  name: p.name,
                  slug: p.slug,
                  image: p.images?.[0]?.url || "/assets/placeholder.png",
                  price: Math.round(p.price * (1 - (p.salePercent || 0) / 100)),
                });
                toast.success(
                  added
                    ? "Đã thêm vào danh sách yêu thích"
                    : "Đã xóa khỏi danh sách yêu thích",
                );
              }}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-card rounded-xl border border-dashed border-border text-muted-foreground">
            Không tìm thấy sản phẩm phù hợp.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-2 mt-12" aria-label="Product pagination">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => {
              isInitialMount.current = false;
              setCurrentPage((page) => page - 1);
            }}
            className="px-3 py-2 border border-border rounded-md text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, index) => Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + index).map((page) => (
            <button
              key={page}
              type="button"
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => {
                isInitialMount.current = false;
                setCurrentPage(page);
              }}
              className={`min-w-10 px-3 py-2 rounded-md ${page === currentPage ? "bg-primary text-primary-foreground font-bold" : "border border-border text-foreground hover:bg-muted"}`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => {
              isInitialMount.current = false;
              setCurrentPage((page) => page + 1);
            }}
            className="px-3 py-2 border border-border rounded-md text-foreground hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
