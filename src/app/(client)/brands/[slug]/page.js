// app/brands/[slug]/page.jsx
"use client";

import { useParams } from "next/navigation";
import BrandBaseLayout from "../../components/layout/brand/BrandBaseLayout";
import ProductsGrid from "../../components/layout/product/products_grid";

export default function BrandDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  return (
    <BrandBaseLayout slug={slug}>
      <ProductsGrid brandSlug={slug} />
    </BrandBaseLayout>
  );
}
