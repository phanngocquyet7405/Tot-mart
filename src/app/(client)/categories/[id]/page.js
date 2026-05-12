"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import CategoryBaseLayout from "../../components/layout/category/category_base_layout";
import ProductsGrid from "../../components/layout/product/products_grid";
import { getAllCategoriesApi } from "@/app/services/api/productServices";

export default function CategoryDetailPage() {
  const params = useParams();
  const slugOrId = params?.id; // Đây có thể là chuỗi slug hoặc ID

  const [actualId, setActualId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resolveCategory = async () => {
      try {
        // 1. Lấy tất cả danh mục để so sánh
        const res = await getAllCategoriesApi();
        const data = res?.data?.data || res?.data || [];

        // 2. Tìm danh mục khớp với slug hoặc _id
        const foundCategory = data.find(
          (cat) => cat.slug === slugOrId || cat._id === slugOrId,
        );

        if (foundCategory) {
          setActualId(foundCategory._id);
        } else {
          setActualId(null); // Không tìm thấy
        }
      } catch (error) {
        console.error("Lỗi tìm danh mục:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slugOrId) {
      resolveCategory();
    }
  }, [slugOrId]);

  if (loading) return <div>Đang tải danh mục...</div>;
  if (!actualId) return <div>Không tìm thấy danh mục này.</div>;

  return (
    <CategoryBaseLayout categoryId={actualId}>
      {/* Truyền actualId vào ProductsGrid để fetch đúng sản phẩm */}
      <ProductsGrid categoryId={actualId} />
    </CategoryBaseLayout>
  );
}
