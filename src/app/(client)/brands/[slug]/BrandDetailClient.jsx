"use client";
// app/brands/[slug]/page.jsx

import { useParams } from "next/navigation";
import BrandBaseLayout from "../../components/layout/brand/BrandBaseLayout";
import ProductsGrid from "../../components/layout/product/products_grid";

export default function BrandDetailPage({ initialBrand = null }) {
  const params = useParams();
  const slug = params?.slug;

  return (
    <BrandBaseLayout slug={slug} initialBrand={initialBrand}>
      <ProductsGrid brandSlug={slug} />
    </BrandBaseLayout>
  );
}
