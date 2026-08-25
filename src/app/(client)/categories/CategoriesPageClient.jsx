// app/(client)/categories/CategoriesPageClient.jsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight, PackageSearch } from "lucide-react";
import AnnouncementBar from "../components/ui/AnnouncementBar";
import MainHeader from "../components/ui/main_header";
import NavMenu from "../components/ui/nav_menu";
import TotMartSupport from "../components/layout/totmart_suppport";
import Footer from "../components/ui/footer";
import { getAllCategoriesApi, getAllProductsApi } from "@/app/services/api/productServices";
import {
  buildCategoryTree,
  countProductsByCategory,
  getRootProductTotal,
  getCategoryVisual,
} from "../utils/catalogHelpers";

function parseList(res) {
  const data = res?.data?.data || res?.data || res;
  return Array.isArray(data) ? data : [];
}

export default function CategoryPage() {
  const [categoryTree, setCategoryTree] = useState([]);
  const [productCounts, setProductCounts] = useState(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          getAllCategoriesApi(),
          getAllProductsApi(),
        ]);
        if (!isMounted) return;
        setCategoryTree(buildCategoryTree(parseList(catRes)));
        setProductCounts(countProductsByCategory(parseList(prodRes)));
      } catch (err) {
        console.error("Lỗi tải danh mục:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

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
      <div className="relative overflow-hidden border-b border-[#F0DDD5] py-16 md:py-20">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #C85C3C 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#C85C3C]">
              Kệ hàng TotMart
            </p>
            <h1 className="mb-4 font-serif text-4xl font-bold text-[#2C1810] md:text-5xl">
              Mỗi ngành hàng, một câu chuyện
            </h1>
            <p className="text-base text-[#2C1810]/60 md:text-lg">
              Từ nông sản hữu cơ đến mỹ phẩm thiên nhiên — mỗi danh mục là sản phẩm
              của những doanh nghiệp xã hội và làng nghề Việt.
            </p>
          </div>
        </div>
      </div>

      {/* Quick jump rail */}
      {!loading && categoryTree.length > 0 && (
        <div className="border-b border-[#F0DDD5] bg-white/60">
          <div className="container mx-auto flex gap-2 overflow-x-auto px-4 py-4">
            {categoryTree.map((root) => {
              const { Icon } = getCategoryVisual(root.name);
              return (
                <a
                  key={root._id}
                  href={`#cat-${root._id}`}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#F0DDD5] bg-white px-4 py-2 text-sm font-medium text-[#2C1810]/70 transition-colors hover:border-[#C85C3C]/40 hover:text-[#C85C3C]"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {root.name}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="container mx-auto px-4 py-16">
        {loading ? (
          <CategorySkeleton />
        ) : categoryTree.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-14">
            {categoryTree.map((root) => (
              <CategorySection
                key={root._id}
                root={root}
                total={getRootProductTotal(root, productCounts)}
                productCounts={productCounts}
              />
            ))}
          </div>
        )}
      </div>

      <TotMartSupport />
      <Footer />
    </div>
  );
}

function CategorySection({ root, total, productCounts }) {
  const { Icon, tintClass } = getCategoryVisual(root.name);

  return (
    <section id={`cat-${root._id}`} className="scroll-mt-32">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-[#F0DDD5] pb-5">
        <div className="flex items-center gap-4">
          <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1 ${tintClass}`}>
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <Link
              href={`/categories/${root.slug || root._id}`}
              className="font-serif text-2xl font-bold text-[#2C1810] transition-colors hover:text-[#C85C3C] md:text-3xl"
            >
              {root.name}
            </Link>
            {root.description && (
              <p className="mt-1 max-w-xl text-sm text-[#2C1810]/50">{root.description}</p>
            )}
          </div>
        </div>
        <span className="whitespace-nowrap text-sm font-semibold text-[#2C1810]/40">
          {total} sản phẩm
        </span>
      </div>

      {root.subcategories.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {root.subcategories.map((sub) => (
            <Link
              key={sub._id}
              href={`/categories/${sub.slug || sub._id}`}
              className="group relative flex items-center gap-2 rounded-xl border border-[#F0DDD5] bg-white py-2.5 pl-4 pr-3 transition-all hover:-translate-y-0.5 hover:border-[#C85C3C]/40 hover:shadow-md hover:shadow-[#C85C3C]/5"
            >
              <span
                aria-hidden
                className="absolute -left-[3px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#FFFAF8] ring-1 ring-[#F0DDD5]"
              />
              <span className="text-sm font-medium text-[#2C1810]">{sub.name}</span>
              <span className="rounded-full bg-[#F0DDD5]/60 px-1.5 py-0.5 text-[11px] font-semibold text-[#2C1810]/50">
                {productCounts.get(String(sub._id)) || 0}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-[#2C1810]/20 transition-transform group-hover:translate-x-0.5 group-hover:text-[#C85C3C]" />
            </Link>
          ))}
        </div>
      ) : (
        <Link
          href={`/categories/${root.slug || root._id}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C85C3C] hover:text-[#B14B2D]"
        >
          Xem tất cả sản phẩm
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </section>
  );
}

function CategorySkeleton() {
  return (
    <div className="space-y-14">
      {[0, 1, 2].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="mb-6 flex items-center gap-4 border-b border-[#F0DDD5] pb-5">
            <div className="h-14 w-14 rounded-2xl bg-[#F0DDD5]" />
            <div className="h-6 w-48 rounded bg-[#F0DDD5]" />
          </div>
          <div className="flex flex-wrap gap-3">
            {[0, 1, 2, 3, 4].map((j) => (
              <div key={j} className="h-10 w-32 rounded-xl bg-[#F0DDD5]/60" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[#F0DDD5] py-24 text-center">
      <PackageSearch className="h-10 w-10 text-[#2C1810]/20" />
      <p className="font-medium text-[#2C1810]/50">Chưa có danh mục nào được kích hoạt.</p>
    </div>
  );
}
