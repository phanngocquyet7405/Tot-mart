"use client";
import logger from "@/app/util/Logger";
// components/layout/brand/BrandBaseLayout.jsx

import React, { useState, useEffect } from "react";
import AnnouncementBar from "../../ui/AnnouncementBar";
import MainHeader from "../../ui/main_header";
import NavMenu from "../../ui/nav_menu";
import TotMartSupport from "../totmart_suppport";
import Footer from "../../ui/footer";
import BrandSidebar from "./brand_sidebar"; //
import BrandDetailHero from "./BrandDetailHero";
import { getAllBrandsApi } from "@/app/services/api/productServices";

function parseList(res) {
  const data = res?.data?.data || res?.data || res;
  return Array.isArray(data) ? data : [];
}

export default function BrandBaseLayout({ children, slug, initialBrand = null }) {
  // Logic đóng mở menu trên mobile giống ProductPage
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [brand, setBrand] = useState(initialBrand);
  const [loadingBrand, setLoadingBrand] = useState(!initialBrand);

  // Không có endpoint GET brand theo slug ở BE, nên lấy cả danh sách rồi tìm
  // đúng slug — giống cách admin-brands/hooks/useUpdateBrand.js đang làm.
  useEffect(() => {
    if (initialBrand) {
      setLoadingBrand(false);
      return;
    }
    if (!slug) return;
    let isMounted = true;
    (async () => {
      setLoadingBrand(true);
      try {
        const res = await getAllBrandsApi();
        if (!isMounted) return;
        const found = parseList(res).find((b) => b.slug === slug) || null;
        setBrand(found);
      } catch (error) {
        logger.error("Lỗi tải thông tin gian hàng:", error);
        if (isMounted) setBrand(null);
      } finally {
        if (isMounted) setLoadingBrand(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [slug, initialBrand]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hệ thống Header cố định */}
      <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border shadow-xs z-50">
        <AnnouncementBar />
        <MainHeader
          onMenuClick={() => setIsSidebarOpen(true)}
          cartItemCount={0}
          cartTotal={0}
        />
        <div className="border-b border-border">
          <NavMenu />
        </div>
      </div>

      {/* Hero Section cho Brand — hiện đúng tên/logo/địa chỉ/mô tả của
          chính gian hàng này, thay cho nội dung mẫu dùng chung trước đây */}
      <div className="container mx-auto px-4 pt-8">
        <BrandDetailHero brand={brand} loading={loadingBrand} />
      </div>

      {/* Nội dung chính: Sidebar + Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar danh sách gian hàng[cite: 14] */}
          <BrandSidebar currentSlug={slug} />

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      <TotMartSupport />
      <Footer />
    </div>
  );
}
