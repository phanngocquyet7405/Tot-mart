"use client";
import logger from "@/app/util/Logger";

import { useState, useEffect } from "react";
import NavMenu from "../components/ui/nav_menu";
import AnnouncementBar from "../components/ui/AnnouncementBar";
import MainHeader from "../components/ui/main_header";
import HeroSection from "../components/hero_section_page/hero_section";
import FeaturedProducts from "../components/layout/product/featured_products";
import Footer from "../components/ui/footer";
import TotmartLanding from "../components/layout/totmart_landing";

// Import API service
import { getAllProductsApi } from "@/app/services/api/productServices";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Gọi API khi trang được load[cite: 6]
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getAllProductsApi();

        // Trích xuất dữ liệu dựa trên cấu trúc response[cite: 6]
        const data = response?.data?.data || response?.data || response;

        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        logger.error("Lỗi khi lấy sản phẩm cho trang chủ:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="page-canvas min-h-screen">
      {/* Header Section */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border shadow-xs z-50">
        <AnnouncementBar />
        <MainHeader />
        <div className="cursor-pointer">
          <NavMenu />
        </div>
      </div>

      {/* Hero Section[cite: 2] */}
      <HeroSection />

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">
          Đang tải dữ liệu từ hệ thống...
        </div>
      ) : (
        <div className="space-y-10">
          <FeaturedProducts title="TotBox" initialData={products.slice(0, 5)} />

          <FeaturedProducts
            title="Sản phẩm mới"
            initialData={products.slice(5, 10)}
          />

          <FeaturedProducts
            title="Bán chạy nhất"
            initialData={products.slice(10, 15)}
          />

          <FeaturedProducts
            title="Đang thịnh hành"
            initialData={products.slice(15, 20)}
          />

          <FeaturedProducts
            title="Ưu đãi độc quyền"
            initialData={products.slice(20, 25)}
          />

          <FeaturedProducts
            title="Gợi ý cho bạn"
            initialData={products.slice(25, 30)}
          />
        </div>
      )}

      <div className="pt-10 bg-background border-t border-border">
        <TotmartLanding />
      </div>

      {/* Footer[cite: 2] */}
      <Footer />
    </div>
  );
}
