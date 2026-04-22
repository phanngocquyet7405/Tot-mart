"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "./product_card";
import {
  getAllProductsApi,
  getProductsByCategoryApi,
} from "@/app/services/api/productServices";
import { useCart } from "@/app/context/CartContext"; // Thêm dòng này

export default function ProductsGrid({ categoryId, brandSlug }) {
  const { addToCart } = useCart(); // Lấy hàm addToCart
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let response = categoryId
          ? await getProductsByCategoryApi(categoryId)
          : await getAllProductsApi();

        const data = response?.data?.data || response?.data || response;
        if (Array.isArray(data)) setProducts(data);
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
        setError("Không thể tải danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, brandSlug]);

  if (loading)
    return (
      <div className="py-20 text-center text-gray-500 italic">
        Đang tải sản phẩm...
      </div>
    );
  if (error)
    return (
      <div className="py-20 text-center text-red-500 font-medium">{error}</div>
    );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-8">
        <div>
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">
            {categoryId ? "Sản phẩm theo danh mục" : "Tất cả sản phẩm"}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Tìm thấy {products.length} kết quả
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="text-sm font-semibold text-gray-700">
            Sắp xếp:
          </label>
          <select
            id="sort"
            className="border border-gray-300 rounded-sm px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onAddToCart={(p) => addToCart(p)}
              onToggleWishlist={(p) => console.log("Yêu thích:", p.name)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-sm border border-dashed border-gray-300 text-gray-500">
            Hiện chưa có sản phẩm nào trong danh mục này.
          </div>
        )}
      </div>
    </div>
  );
}
