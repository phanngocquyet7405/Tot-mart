import { notFound } from "next/navigation";
import CategoryDetailClient from "./CategoryDetailClient";
import {
  getServerCategoryDetail,
  getPublicSiteUrl,
} from "@/app/services/server/serverCatalog";

export const revalidate = 60;

export async function generateMetadata({ params: paramsPromise }) {
  const params = await paramsPromise;
  const id = params?.id || "";
  const detail = await getServerCategoryDetail(id);

  if (!detail || !detail.category) {
    return {
      title: "Không tìm thấy danh mục | TotMart",
      description: "Danh mục sản phẩm không tồn tại hoặc đã ngừng hoạt động.",
    };
  }

  const { category } = detail;
  const siteUrl = getPublicSiteUrl();
  const canonicalUrl = `${siteUrl}/categories/${category.slug || category._id}`;
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

export default async function Page({ params: paramsPromise }) {
  const params = await paramsPromise;
  const id = params?.id || "";
  const detail = await getServerCategoryDetail(id);

  if (!detail || !detail.category) {
    notFound();
  }

  const { category } = detail;

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
