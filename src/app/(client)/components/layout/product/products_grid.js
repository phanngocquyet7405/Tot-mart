"use client";
import { useState, useEffect } from "react";
import { ProductCard } from "./product_card";
import { getAllProductsApi } from "@/app/services/api/productServices";

export default function ProductsGrid() {
  const [products, setProducts] = useState([]); // Khởi tạo mảng rỗng
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getAllProductsApi();

        // Kiểm tra cấu trúc dữ liệu trả về từ axiosConfig của bạn
        // Thông thường là response.data hoặc trực tiếp response nếu bạn đã xử lý ở axiosConfig
        const data = response?.data || response;

        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error("Lỗi khi lấy sản phẩm:", err);
        setError("Không thể tải danh sách sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading)
    return <div className="py-10 text-center">Đang tải sản phẩm...</div>;
  if (error)
    return <div className="py-10 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-xl font-bold">Tên Sản Phẩm</h2>
          <p className="text-gray-600 text-sm">
            Số lượng: {products.length} kết quả
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="font-medium">
            Sort by:
          </label>
          <select
            id="sort"
            className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="popular">Bán chạy nhất</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard
              key={product._id || product.id} // Sử dụng _id của MongoDB hoặc id
              product={product}
              onAddToCart={(p) => console.log("Thêm vào giỏ:", p.name)}
              onToggleWishlist={(p) => console.log("Yêu thích:", p.name)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500">
            Không tìm thấy sản phẩm nào.
          </div>
        )}
      </div>
    </div>
  );
}
