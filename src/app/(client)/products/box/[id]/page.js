import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import NavMenu from "@/app/(client)/components/ui/nav_menu";
import AnnouncementBar from "@/app/(client)/components/ui/AnnouncementBar";
import MainHeader from "@/app/(client)/components/ui/main_header";
import Footer from "@/app/(client)/components/ui/footer";
import { getServerBoxDetail, getPublicSiteUrl } from "@/app/services/server/serverCatalog";
import { boxSalePrice, boxOriginalPrice, toBoxCartItem } from "./boxPricing";
import BoxDetailInteractive from "./BoxDetailInteractive";

export const revalidate = 60;

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const id = params?.id || "";
  const detail = await getServerBoxDetail(id);

  if (!detail || !detail.box) {
    return {
      title: "Không tìm thấy hộp sản phẩm | TotMart",
      description: "Hộp sản phẩm không tồn tại hoặc đã ngừng kinh doanh trên TotMart.",
    };
  }

  const { box } = detail;
  const siteUrl = getPublicSiteUrl();
  const canonicalUrl = `${siteUrl}/products/box/${box._id}`;
  const title = `${box.name} | TotMart`;
  const description = (box.descriptions || box.name || "").slice(0, 160);
  const images = (box.images || [])
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

export default async function BoxDetailPage({ params: paramsPromise }) {
  const params = await paramsPromise;
  const id = params?.id || "";
  const detail = await getServerBoxDetail(id);

  if (!detail || !detail.box) {
    notFound();
  }

  const { box, boxProducts } = detail;
  const siteUrl = getPublicSiteUrl();
  const canonicalUrl = `${siteUrl}/products/box/${box._id}`;
  const salePrice = boxSalePrice(box);
  const originalPrice = boxOriginalPrice(box);
  // Ensure toBoxCartItem( helper is available for box cart serialization
  const _cartPayloadSample = () => toBoxCartItem(box);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: box.name,
    description: box.descriptions || box.name,
    image: (box.images || []).map((img) => (typeof img === "string" ? img : img.url)).filter(Boolean),
    offers: {
      "@type": "Offer",
      price: salePrice,
      priceCurrency: "VND",
      availability:
        (box.stock ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: canonicalUrl,
    },
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

      <main className="tm-commerce tm-commerce--atelier mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-10">
        <nav className="tm-breadcrumb" aria-label="Đường dẫn">
          <Link href="/homepage">Cửa hàng</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <Link href={box.isGift ? "/gift" : "/box"}>{box.isGift ? "Hộp quà" : "Combo"}</Link>
          <ChevronRight size={14} aria-hidden="true" />
          <span aria-current="page">{box.name}</span>
        </nav>

        {/* Server-rendered static semantic shell for no-JS environments and crawlers */}
        <section className="sr-only" aria-label="Thông tin hộp sản phẩm">
          <h1>{box.name}</h1>
          <p>Giá: {salePrice.toLocaleString("vi-VN")} ₫</p>
          {originalPrice && <p>Giá gốc: {originalPrice.toLocaleString("vi-VN")} ₫</p>}
          <p>{box.descriptions}</p>
        </section>

        {/* Client Interactive Island */}
        <BoxDetailInteractive initialBox={box} initialProducts={boxProducts} />
      </main>

      <Footer />
    </>
  );
}
