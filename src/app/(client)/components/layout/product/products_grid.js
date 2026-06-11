"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "./product_card";
import {
  getAllProductsApi,
  getProductsByCategoryApi,
} from "@/app/services/api/productServices";
import { useCart } from "@/app/context/CartContext";

export default function ProductsGrid({ categoryId, brandSlug }) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let response = categoryId
          ? await getProductsByCategoryApi(categoryId)
          : await getAllProductsApi();

        const data = response?.data?.data || response?.data || response;
        if (Array.isArray(data)) {
          let sorted = [...data];
          if (sortBy === "price-asc") {
            sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
          } else if (sortBy === "price-desc") {
            sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
          }
          setProducts(sorted);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Could not load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, brandSlug, sortBy]);

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
            Showing {products.length} results
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
              onChange={(e) => setSortBy(e.target.value)}
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
          products.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onAddToCart={(p) => addToCart(p)}
              onToggleWishlist={(p) => console.log("Wishlist:", p.name)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
            No products available in this category.
          </div>
        )}
      </div>

      {/* Pagination */}
      {products.length > 0 && (
        <div className="flex justify-center gap-2 mt-12">
          <button className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            ←
          </button>
          <button className="px-3 py-2 bg-green-700 text-white rounded-md">
            1
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            3
          </button>
          <button className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            →
          </button>
        </div>
      )}
    </div>
  );
}
