import { notFound, permanentRedirect } from "next/navigation";
import BrandDetailClient from "./BrandDetailClient";
import {
  getServerBrandDetail,
  getPublicSiteUrl,
} from "@/app/services/server/serverCatalog";

export const revalidate = 60;

export async function generateMetadata({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
  const slug = params?.slug || "";
  const detail = await getServerBrandDetail(slug);

  if (!detail || !detail.brand) {
    notFound();
  }

  const { brand } = detail;
  const canonicalSlug = brand.slug || String(brand._id);
  if (slug !== canonicalSlug) {
    const qs = new URLSearchParams(searchParams).toString();
    permanentRedirect(`/brands/${canonicalSlug}${qs ? `?${qs}` : ""}`);
  }

  const siteUrl = getPublicSiteUrl();
  const canonicalUrl = `${siteUrl}/brands/${canonicalSlug}`;
  const title = `${brand.name} | Thương hiệu TotMart`;
  const description =
    brand.description ||
    `Khám phá các sản phẩm chính hãng từ thương hiệu ${brand.name} tại TotMart.`;

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
      images: brand.logo ? [{ url: brand.logo }] : undefined,
      type: "website",
    },
  };
}

export default async function Page({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
  const slug = params?.slug || "";
  const detail = await getServerBrandDetail(slug);

  if (!detail || !detail.brand) {
    notFound();
  }

  const { brand } = detail;
  const canonicalSlug = brand.slug || String(brand._id);
  if (slug !== canonicalSlug) {
    const qs = new URLSearchParams(searchParams).toString();
    permanentRedirect(`/brands/${canonicalSlug}${qs ? `?${qs}` : ""}`);
  }

  return (
    <>
      {/* Server HTML semantic fallback for search engines and no-JS */}
      <section className="sr-only" aria-label="Thông tin thương hiệu">
        <h1>{brand.name}</h1>
        <p>{brand.description}</p>
      </section>
      <BrandDetailClient initialBrand={brand} />
    </>
  );
}
