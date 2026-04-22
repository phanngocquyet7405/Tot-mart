// app/categories/[id]/page.jsx
"use client";
import { useParams } from "next/navigation";
import CategoryBaseLayout from "../../components/layout/category/category_base_layout";
import ProductsGrid from "../../components/layout/product/products_grid";

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = params?.id;

  return (
    <CategoryBaseLayout categoryId={categoryId}>
      <ProductsGrid categoryId={categoryId} />
    </CategoryBaseLayout>
  );
}
