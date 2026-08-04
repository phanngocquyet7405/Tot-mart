"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { fetchAdminCategories } from "../services/categoriesAdminService";

export function useDeleteCategoriesList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi khi tải danh mục:", error);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(
    () =>
      categories.filter((cat) =>
        cat.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [categories, searchQuery],
  );

  return {
    searchQuery,
    setSearchQuery,
    categories: filteredCategories,
    isLoading,
    fetchCategories,
  };
}
