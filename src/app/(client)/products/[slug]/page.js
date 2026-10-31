import { notFound, permanentRedirect } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

// UI Components
import NavMenu from "@/app/(client)/components/ui/nav_menu";
import AnnouncementBar from "@/app/(client)/components/ui/AnnouncementBar";
import MainHeader from "@/app/(client)/components/ui/main_header";
import Footer from "@/app/(client)/components/ui/footer";

import {
  getServerProductDetail,
  getPublicSiteUrl,
} from "@/app/services/server/serverCatalog";
import ProductDetailInteractive from "./ProductDetailInteractive";

export const revalidate = 60;

export async function generateMetadata({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
  const slug = params?.slug || "";
  const product = await getServerProductDetail(slug);

  if (!product) {
    notFound();
  }

  const canonicalSlug = `${product.slug || "san-pham"}-${product._id}`;
  if (slug !== canonicalSlug) {
    const qs = new URLSearchParams(searchParams).toString();
    permanentRedirect(`/products/${canonicalSlug}${qs ? `?${qs}` : ""}`);
  }

  const siteUrl = getPublicSiteUrl();
  const canonicalUrl = `${siteUrl}/products/${canonicalSlug}`;
  const title = `${product.name} | TotMart`;
  const description = (product.descriptions || product.name || "").slice(0, 160);
  const images = (product.images || [])
    .map((img) => (typeof img === "string" ? img : img.url))
    .filter(Boolean);

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
      images: images.length ? images.map((url) => ({ url })) : undefined,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
  const slug = params?.slug || "";
  const product = await getServerProductDetail(slug);

  if (!product) {
    notFound();
  }

  const canonicalSlug = `${product.slug || "san-pham"}-${product._id}`;
  if (slug !== canonicalSlug) {
    const qs = new URLSearchParams(searchParams).toString();
    permanentRedirect(`/products/${canonicalSlug}${qs ? `?${qs}` : ""}`);
  }

  const siteUrl = getPublicSiteUrl();
  const canonicalUrl = `${siteUrl}/products/${canonicalSlug}`;
  const salePercent = product.salePercent || 0;
  const finalPrice =
    salePercent > 0
      ? Math.round(product.price * (1 - salePercent / 100))
      : product.price;
  const brandName =
    product.brand?.name || (typeof product.brand === "string" ? product.brand : "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.descriptions || product.name,
    image: (product.images || [])
      .map((img) => (typeof img === "string" ? img : img.url))
      .filter(Boolean),
    offers: {
      "@type": "Offer",
      price: finalPrice,
      priceCurrency: "VND",
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: canonicalUrl,
    },
    ...(brandName ? { brand: { "@type": "Brand", name: brandName } } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <AnnouncementBar />
      <MainHeader />
      <NavMenu />

      <main className="tm-commerce max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:py-10 pt-[100px]">
        <nav className="tm-breadcrumb" aria-label="Đường dẫn">
          <Link href="/homepage">Cửa hàng</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link href="/products">Sản phẩm</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span aria-current="page">{product.name}</span>
        </nav>

        {/* Server-rendered static semantic shell for no-JS environments and crawlers */}
        <section className="sr-only" aria-label="Thông tin sản phẩm">
          <h1>{product.name}</h1>
          {brandName && <p>Thương hiệu: {brandName}</p>}
          <p>Giá: {finalPrice.toLocaleString("vi-VN")} ₫</p>
          <p>{product.descriptions}</p>
        </section>

        {/* Client Interactive Island (Gallery, Purchase panel, Info Tabs, Frequently Bought) */}
        <ProductDetailInteractive initialProduct={product} slug={slug} discountPercent={product.salePercent || 0} />
      </main>

      <Footer />
    </>
  );
}
