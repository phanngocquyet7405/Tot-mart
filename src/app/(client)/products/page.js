import Link from "next/link";
import AnnouncementBar from "../components/ui/AnnouncementBar";
import MainHeader from "../components/ui/main_header";
import NavMenu from "../components/ui/nav_menu";
import TotMartSupport from "../components/layout/totmart_suppport";
import SideBar from "../components/ui/SideBar";
import Footer from "../components/ui/footer";
import ProductsGrid from "../components/layout/product/products_grid";
import {
  getServerProductsCatalog,
  getPublicSiteUrl,
} from "@/app/services/server/serverCatalog";

export const revalidate = 60;

export async function generateMetadata({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const search = (searchParams?.search || searchParams?.keyword || "").trim();
  const category = (searchParams?.category || "").trim();
  const brandSlug = (searchParams?.brand || searchParams?.brandSlug || "").trim();

  const siteUrl = getPublicSiteUrl();
  const queryParts = [];
  if (page > 1) queryParts.push(`page=${page}`);
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  if (category) queryParts.push(`category=${encodeURIComponent(category)}`);
  if (brandSlug) queryParts.push(`brand=${encodeURIComponent(brandSlug)}`);
  const qs = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  const canonicalUrl = `${siteUrl}/products${qs}`;

  let title = "Sản phẩm hữu cơ chọn lọc | TotMart";
  if (search) {
    title = `Tìm kiếm: "${search}" | TotMart`;
  } else if (page > 1) {
    title = `Sản phẩm hữu cơ - Trang ${page} | TotMart`;
  }

  const description =
    "Khám phá danh mục các sản phẩm hữu cơ, nông sản sạch tự nhiên và các mặt hàng dinh dưỡng chọn lọc tại TotMart.";

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "TotMart",
      type: "website",
    },
  };
}

export default async function ProductsPage({ searchParams: searchParamsPromise }) {
  const searchParams = await searchParamsPromise;
  const page = Math.max(1, parseInt(searchParams?.page || "1", 10) || 1);
  const limit = 12;
  const searchQuery = (searchParams?.search || searchParams?.keyword || "").trim();
  const categoryId = (searchParams?.category || "").trim();
  const brandSlug = (searchParams?.brand || searchParams?.brandSlug || "").trim();
  const sortBy = (searchParams?.sort || "newest").trim();

  // Data access server-only with absolute URL & 60s cache
  const catalog = await getServerProductsCatalog({
    page,
    limit,
    keyword: searchQuery,
    category: categoryId,
    brandSlug,
    sort: sortBy,
  });

  const products = catalog.products || [];
  const initialError = catalog.error || null;
  const pagination = catalog.pagination || {
    total: products.length,
    totalPages: Math.ceil(products.length / limit) || 1,
    page,
    limit,
  };

  const formatPrice = (price) => {
    if (!price || price <= 0) return "Liên hệ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    })
      .format(price)
      .replace("₫", "đ");
  };

  return (
    <div className="page-canvas min-h-screen">
      <div className="sticky top-0 bg-white shadow-sm z-1000">
        <AnnouncementBar />
        <MainHeader cartItemCount={0} cartTotal={0} />
        <div className="border-b border-gray-100">
          <NavMenu />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-900 via-green-800 to-green-900 text-white py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-white blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <p className="text-sm font-semibold uppercase tracking-wider mb-3 text-green-200">
            {searchQuery ? "Kết quả tìm kiếm" : "Premium Organic Curations"}
          </p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
            {searchQuery ? `"${searchQuery}"` : "Premium Organic Snacks"}
          </h1>
          <p className="text-lg text-green-100 max-w-2xl">
            {searchQuery
              ? "Đây là các sản phẩm phù hợp với từ khoá bạn tìm."
              : "Discover our curated selection of hand-picked organic snacks that nourish the soul and respect the planet."}
          </p>
        </div>
      </div>

      {/* Main Products with Client Island */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter */}
          <div className="w-full lg:w-64 shrink-0">
            <SideBar />
          </div>

          {/* Main Products Grid with Initial Server Data */}
          <main className="flex-1 min-w-0">
            <ProductsGrid
              categoryId={categoryId}
              brandSlug={brandSlug}
              searchQuery={searchQuery}
              initialProducts={products}
              initialPagination={pagination}
              initialPage={page}
              initialSort={sortBy}
              initialError={initialError}
            />
          </main>
        </div>
      </div>

      <TotMartSupport />
      <Footer />
    </div>
  );
}
