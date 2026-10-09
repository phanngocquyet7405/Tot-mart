"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProductCard } from "./product_card";
import {
  getAllProductsApi,
} from "@/app/services/api/productServices";
import { useAddToCart } from "@/app/hook/useAddToCart";
import { useWishlist } from "@/app/context/WishlistContext";

export default function ProductsGrid({ categoryId, brandSlug }) {
  const { addToCart } = useAddToCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });
  const totalPages = pagination.totalPages;
  const visibleProducts = products;

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryId, brandSlug, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAllProductsApi({ page: currentPage, limit: pageSize, category: categoryId || undefined, brandSlug: brandSlug || undefined, sort: sortBy === 'price-asc' ? 'price_asc' : sortBy === 'price-desc' ? 'price_desc' : undefined });
        if (!active) return;
        setProducts(res.data || []); setPagination(res.pagination);
      } catch (err) {
        if (!active) return;
        console.error("Error fetching products:", err);
        setError("Could not load products.");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchProducts();
    return () => { active = false; };
  }, [categoryId, brandSlug, sortBy, currentPage]);

  if (loading)
    return (
      <div className="py-20 text-center text-gray-500 italic">
        Loading products...
      </div>
    );
  if (error)
    return (
      <div className="py-20 text-center text-red-500 font-medium">{error}</div>
    );

  return (
    <div className="w-full">
      {/* Header with sorting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6 mb-8">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            {categoryId ? "Category Products" : "All Products"}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Showing {products.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} results
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm font-semibold text-gray-700">
              Sort:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
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
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
            No products available in this category.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-2 mt-12" aria-label="Product pagination">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, index) => Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + index).map((page) => (
            <button
              key={page}
              type="button"
              aria-current={page === currentPage ? "page" : undefined}
              onClick={() => setCurrentPage(page)}
              className={`min-w-10 px-3 py-2 rounded-md ${page === currentPage ? "bg-green-700 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
            className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}
