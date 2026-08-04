"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  fetchAdminCategories,
  getCategoryStats,
  buildCategoryView,
} from "../services/categoriesAdminService";

export function useAdminCategoriesList() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [filterType, setFilterType] = useState("all");

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const stats = useMemo(() => getCategoryStats(categories), [categories]);

  const categoryTree = useMemo(
    () => buildCategoryView(categories, { searchQuery, filterType }),
    [categories, searchQuery, filterType],
  );

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    if (value) setFilterType("all");
  }, []);

  const toggleExpandAll = useCallback(() => {
    setExpandedIds((prev) =>
      prev.size > 0 ? new Set() : new Set(categories.map((c) => c._id)),
    );
  }, [categories]);

  return {
    categories,
    isLoading,
    searchQuery,
    setSearchQuery: handleSearchChange,
    expandedIds,
    setExpandedIds,
    filterType,
    setFilterType,
    stats,
    categoryTree,
    toggleExpandAll,
    fetchCategories,
  };
}
