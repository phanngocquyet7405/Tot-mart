"use client";
import logger from "@/app/util/Logger";
import { useState, useEffect } from "react";
import Link from "next/link";
import { BrandCard } from "./brand_card";
import { getAllBrandsApi } from "@/app/services/api/productServices";

export default function BrandsGrid() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        // Thay bằng API lấy danh sách brand của bạn
        const response = await getAllBrandsApi();
        const data = response?.data?.data || response?.data || response;

        if (Array.isArray(data)) {
          setBrands(data);
        }
      } catch (err) {
        logger.error("Lỗi khi lấy gian hàng:", err);
        setError("Không thể tải danh sách gian hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  if (loading)
    return (
      <div className="py-20 text-center text-muted-foreground">
        Đang tải gian hàng...
      </div>
    );
  if (error)
    return <div className="py-20 text-center text-destructive-text font-semibold">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-black">
          Trang chủ
        </Link>{" "}
        / <span className="text-black">Gian hàng</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Bên Trái */}
        <aside className="w-full lg:w-1/4 space-y-6">
          {/* Block 1: Tác động xã hội */}
          <div className="border border-border p-5 rounded-xl bg-card">
            <h2 className="text-xl font-medium mb-4 text-foreground">
              Tác động xã hội
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="hover:text-primary cursor-pointer">
                Sức khỏe cộng đồng
              </li>
              {/* Thêm các mục khác nếu cần */}
            </ul>
          </div>

          {/* Block 2: Danh sách Tên gian hàng */}
          <div className="border border-border p-5 rounded-xl bg-card">
            <h2 className="text-xl font-medium mb-4 text-foreground">
              Tên gian hàng
            </h2>
            <ul className="space-y-3 text-sm text-muted-foreground max-h-150 overflow-y-auto custom-scrollbar">
              {brands.map((brand) => (
                <li key={brand._id || brand.id}>
                  <Link
                    href={`/brands/${brand.slug || brand._id}`}
                    className="hover:text-primary transition-colors block"
                  >
                    {brand.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Cột chính bên phải: Danh sách Thẻ Gian Hàng */}
        <main className="w-full lg:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {brands.length > 0 ? (
              brands.map((brand) => (
                <BrandCard key={brand._id || brand.id} brand={brand} />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                Không tìm thấy gian hàng nào.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
