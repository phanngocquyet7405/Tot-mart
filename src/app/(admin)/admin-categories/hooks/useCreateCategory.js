"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  fetchAdminCategories,
  createAdminCategory,
} from "../services/categoriesAdminService";

const INITIAL_FORM = {
  name: "",
  description: "",
  isActive: true,
  parentId: null,
};

export function useCreateCategory() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCategories, setExistingCategories] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    let isMounted = true;
    const fetchCats = async () => {
      try {
        const data = await fetchAdminCategories();
        if (isMounted) setExistingCategories(data);
      } catch (err) {
        console.error("Lỗi fetch categories:", err);
      }
    };
    fetchCats();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedParent =
    existingCategories.find((c) => c._id === form.parentId) || null;

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (!form.name.trim()) {
        return toast.error("Vui lòng nhập tên danh mục");
      }
      try {
        setIsSubmitting(true);
        await createAdminCategory({
          form,
          parentId: form.parentId,
          existingCategories,
        });
        toast.success("Thêm và liên kết danh mục thành công!");
        router.push("/admin-categories");
        router.refresh();
      } catch (err) {
        console.error("Lỗi:", err);
        const errorMsg = err.response?.data?.message || "Lỗi khi lưu dữ liệu";
        toast.error(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, existingCategories, router],
  );

  return {
    form,
    updateField,
    existingCategories,
    selectedParent,
    isSubmitting,
    handleSubmit,
  };
}
