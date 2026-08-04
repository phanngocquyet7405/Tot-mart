"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  fetchAdminCategories,
  updateAdminCategory,
} from "../services/categoriesAdminService";

export function useUpdateCategory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingCategories, setExistingCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    childrenIds: [],
  });

  useEffect(() => {
    if (!categoryId) return;
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchAdminCategories();
        if (!isMounted) return;
        setExistingCategories(data);

        const currentCat = data.find((c) => c._id === categoryId);
        if (currentCat) {
          setFormData({
            name: currentCat.name || "",
            description: currentCat.description || "",
            isActive:
              currentCat.isActive !== undefined ? currentCat.isActive : true,
            childrenIds: currentCat.childrenIds || [],
          });
        }
      } catch {
        if (isMounted) toast.error("Không thể tải thông tin danh mục");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [categoryId]);

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleUpdate = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (!formData.name.trim())
        return toast.error("Tên danh mục không được để trống");

      try {
        setIsSubmitting(true);
        await updateAdminCategory(categoryId, formData);
        toast.success("Cập nhật thành công!");
        router.push("/admin-categories");
        router.refresh();
      } catch (error) {
        const errorMsg = error.response?.data?.message || "Lỗi khi cập nhật";
        toast.error(errorMsg);
        console.error("Update Error:", error.response?.data);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, categoryId, router],
  );

  return {
    categoryId,
    formData,
    updateField,
    existingCategories,
    isLoading,
    isSubmitting,
    handleUpdate,
  };
}
