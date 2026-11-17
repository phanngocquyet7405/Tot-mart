import { notFound, permanentRedirect } from "next/navigation";
import CategoryDetailClient from "./CategoryDetailClient";
import {
  getServerCategoryDetail,
  getPublicSiteUrl,
} from "@/app/services/server/serverCatalog";

export const revalidate = 60;

export async function generateMetadata({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
  const id = params?.id || "";
  const detail = await getServerCategoryDetail(id);

  if (!detail || !detail.category) {
    notFound();
  }

  const { category } = detail;
  const canonicalId = category.slug || String(category._id);
  if (id !== canonicalId) {
    const qs = new URLSearchParams(searchParams).toString();
    permanentRedirect(`/categories/${canonicalId}${qs ? `?${qs}` : ""}`);
  }

  const siteUrl = getPublicSiteUrl();
  const canonicalUrl = `${siteUrl}/categories/${canonicalId}`;
  const title = `${category.name} | Danh mục TotMart`;
  const description =
    category.description ||
    `Khám phá các sản phẩm chất lượng thuộc danh mục ${category.name} tại TotMart.`;

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
      images: category.image ? [{ url: category.image }] : undefined,
      type: "website",
    },
  };
}

export default async function Page({ params: paramsPromise, searchParams: searchParamsPromise }) {
  const params = await paramsPromise;
  const searchParams = searchParamsPromise ? await searchParamsPromise : {};
  const id = params?.id || "";
  const detail = await getServerCategoryDetail(id);

  if (!detail || !detail.category) {
    notFound();
  }

  const { category } = detail;
  const canonicalId = category.slug || String(category._id);
  if (id !== canonicalId) {
    const qs = new URLSearchParams(searchParams).toString();
    permanentRedirect(`/categories/${canonicalId}${qs ? `?${qs}` : ""}`);
  }

  return (
    <>
      {/* Server HTML semantic fallback for search engines and no-JS */}
      <section className="sr-only" aria-label="Thông tin danh mục">
        <h1>{category.name}</h1>
        <p>{category.description}</p>
      </section>
      <CategoryDetailClient initialCategory={category} />
    </>
  );
}
