// app/(client)/brands/BrandsPageClient.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Store, ArrowRight, ArrowUpAZ, PackageSearch } from "lucide-react";
import AnnouncementBar from "../components/ui/AnnouncementBar";
import MainHeader from "../components/ui/main_header";
import NavMenu from "../components/ui/nav_menu";
import TotMartSupport from "../components/layout/totmart_suppport";
import Footer from "../components/ui/footer";
import { getAllBrandsApi, getAllProductsApi } from "@/app/services/api/productServices";
import { countProductsByBrand, stripHtml } from "../utils/catalogHelpers";

function parseList(res) {
  const data = res?.data?.data || res?.data || res;
  return Array.isArray(data) ? data : [];
}

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [productCounts, setProductCounts] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [brandRes, prodRes] = await Promise.all([
          getAllBrandsApi(),
          getAllProductsApi(),
        ]);
        if (!isMounted) return;
        setBrands(parseList(brandRes).filter((b) => b.isActive !== false));
        setProductCounts(countProductsByBrand(parseList(prodRes)));
      } catch (err) {
        console.error("Lỗi tải gian hàng:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleBrands = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = q ? brands.filter((b) => b.name?.toLowerCase().includes(q)) : brands;

    list = [...list].sort((a, b) => {
      if (sortBy === "products") {
        const diff =
          (productCounts.get(String(b._id)) || 0) - (productCounts.get(String(a._id)) || 0);
        if (diff !== 0) return diff;
      }
      return a.name.localeCompare(b.name, "vi");
    });
    return list;
  }, [brands, query, sortBy, productCounts]);

  return (
    <div className="min-h-screen bg-[#FFFAF8]">
      <div className="sticky top-0 bg-white shadow-sm z-1000">
        <AnnouncementBar />
        <MainHeader onMenuClick={() => {}} cartItemCount={0} cartTotal={0} />
        <div className="border-b border-[#F0DDD5]">
          <NavMenu />
        </div>
      </div>

      {/* Hero */}
      <div className="border-b border-[#F0DDD5] bg-[#2C1810] py-14 text-white md:py-20">
        <div className="container mx-auto px-4">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#E8835E]">
            Chợ phiên TotMart
          </p>
          <h1 className="mb-3 font-serif text-4xl font-bold md:text-5xl">Gian hàng đối tác</h1>
          <p className="max-w-2xl text-white/60">
            {brands.length} gian hàng đến từ các doanh nghiệp xã hội, hợp tác xã và làng nghề
            khắp Việt Nam — mỗi thương hiệu một câu chuyện.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 lg:w-64">
            <div className="space-y-5 lg:sticky lg:top-32">
              <div className="rounded-2xl border border-[#F0DDD5] bg-white p-4">
                <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#2C1810]/40">
                  <Search className="h-3.5 w-3.5" />
                  Tìm gian hàng
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="VD: Karose, Loho..."
                  className="w-full rounded-xl border border-[#F0DDD5] bg-[#FFFAF8] px-3.5 py-2.5 text-sm text-[#2C1810] placeholder:text-[#2C1810]/30 focus:border-[#C85C3C] focus:outline-none focus:ring-2 focus:ring-[#C85C3C]/10"
                />
              </div>

              <div className="rounded-2xl border border-[#F0DDD5] bg-white p-4">
                <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#2C1810]/40">
                  <ArrowUpAZ className="h-3.5 w-3.5" />
                  Sắp xếp
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-xl border border-[#F0DDD5] bg-[#FFFAF8] px-3.5 py-2.5 text-sm text-[#2C1810] focus:border-[#C85C3C] focus:outline-none focus:ring-2 focus:ring-[#C85C3C]/10"
                >
                  <option value="name">Tên A–Z</option>
                  <option value="products">Nhiều sản phẩm nhất</option>
                </select>
              </div>

              <div className="hidden rounded-2xl border border-[#F0DDD5] bg-white p-4 lg:block">
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#2C1810]/40">
                  <Store className="h-3.5 w-3.5" />
                  Tên gian hàng
                </p>
                <ul className="max-h-80 space-y-2 overflow-y-auto pr-1 text-sm">
                  {brands.map((b) => (
                    <li key={b._id}>
                      <a
                        href={`#brand-${b._id}`}
                        className="block truncate text-[#2C1810]/60 transition-colors hover:text-[#C85C3C]"
                      >
                        {b.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Grid */}
          <main className="min-w-0 flex-1">
            {loading ? (
              <BrandSkeleton />
            ) : visibleBrands.length === 0 ? (
              <EmptyState query={query} />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visibleBrands.map((brand) => (
                  <BrandTile key={brand._id} brand={brand} count={productCounts.get(String(brand._id)) || 0} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <TotMartSupport />
      <Footer />
    </div>
  );
}

function BrandTile({ brand, count }) {
  const [logoFailed, setLogoFailed] = useState(false);
  const href = `/brands/${brand.slug || brand._id}`;
  const hasLogo = brand.logo && !logoFailed;

  return (
    <Link
      id={`brand-${brand._id}`}
      href={href}
      className="group relative flex scroll-mt-32 flex-col overflow-hidden rounded-2xl border border-[#F0DDD5] bg-white transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#C85C3C]/10"
    >
      <span
        aria-hidden
        className="absolute left-4 top-0 h-3 w-3 -translate-y-1/2 rounded-full border border-[#F0DDD5] bg-[#FFFAF8]"
      />

      <div className="flex h-28 items-center justify-center border-b border-[#F0DDD5] bg-[#FFFAF8] p-5">
        {hasLogo ? (
          <div className="relative h-full w-full">
            <Image
              src={brand.logo}
              alt={brand.name}
              fill
              sizes="200px"
              className="object-contain"
              onError={() => setLogoFailed(true)}
            />
          </div>
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C85C3C]/10 font-serif text-xl font-bold text-[#C85C3C]">
            {brand.name?.charAt(0) || "?"}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-bold text-[#2C1810] transition-colors group-hover:text-[#C85C3C]">
          Gian hàng {brand.name}
        </h3>
        <p className="mb-3 mt-1 line-clamp-3 flex-1 text-sm leading-relaxed text-[#2C1810]/50">
          {stripHtml(brand.description) || "Đang cập nhật thông tin giới thiệu về gian hàng này."}
        </p>
        <div className="flex items-center justify-between border-t border-[#F0DDD5] pt-3 text-xs">
          <span className="font-semibold text-[#2C1810]/40">{count} sản phẩm</span>
          <span className="flex items-center gap-1 font-semibold text-[#C85C3C]">
            Chi tiết
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function BrandSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-[#F0DDD5] bg-white">
          <div className="h-28 border-b border-[#F0DDD5] bg-[#F0DDD5]/40" />
          <div className="space-y-2 p-5">
            <div className="h-4 w-2/3 rounded bg-[#F0DDD5]" />
            <div className="h-3 w-full rounded bg-[#F0DDD5]/60" />
            <div className="h-3 w-4/5 rounded bg-[#F0DDD5]/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#F0DDD5] py-24 text-center">
      <PackageSearch className="h-10 w-10 text-[#2C1810]/20" />
      <p className="font-medium text-[#2C1810]/50">
        {query ? `Không tìm thấy gian hàng nào khớp với "${query}".` : "Chưa có gian hàng nào được kích hoạt."}
      </p>
    </div>
  );
}
