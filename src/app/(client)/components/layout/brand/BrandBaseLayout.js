// components/layout/brand/BrandBaseLayout.jsx
"use client";

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

export default function BrandBaseLayout({ children, slug }) {
  // Logic đóng mở menu trên mobile giống ProductPage
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [brand, setBrand] = useState(null);
  const [loadingBrand, setLoadingBrand] = useState(true);

  // Không có endpoint GET brand theo slug ở BE, nên lấy cả danh sách rồi tìm
  // đúng slug — giống cách admin-brands/hooks/useUpdateBrand.js đang làm.
  useEffect(() => {
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
        console.error("Lỗi tải thông tin gian hàng:", error);
        if (isMounted) setBrand(null);
      } finally {
        if (isMounted) setLoadingBrand(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hệ thống Header cố định */}
      <div className="sticky top-0 bg-white shadow-sm z-1000">
        <AnnouncementBar />
        <MainHeader
          onMenuClick={() => setIsSidebarOpen(true)}
          cartItemCount={0}
          cartTotal={0}
        />
        <div className="border-b border-gray-100">
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
