"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchAdminBrands,
  deleteAdminBrand,
} from "../../app/(admin)/admin-brands/services/brandsAdminService";

export function useAdminBrands() {
  const [brands, setBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (silent) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminBrands();
      setBrands(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Không thể tải danh sách thương hiệu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredBrands = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return brands.filter((b) => b.name?.toLowerCase().includes(q));
  }, [brands, searchQuery]);

  const openDeleteTarget = useCallback((brand) => {
    setDeleteTarget(brand);
  }, []);

  const closeDeleteTarget = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleConfirmDelete = useCallback(async (id) => {
    setIsDeleting(true);
    try {
      await deleteAdminBrand(id);
      setBrands((prev) => prev.filter((b) => b._id !== id));
      toast.success("Đã xóa thương hiệu");
      setDeleteTarget(null);
    } catch {
      toast.error("Xóa thất bại. Vui lòng thử lại.");
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    brands: filteredBrands,
    totalCount: brands.length,
    isLoading,
    isRefreshing,
    error,
    searchQuery,
    setSearchQuery,
    deleteTarget,
    isDeleting,
    openDeleteTarget,
    closeDeleteTarget,
    handleConfirmDelete,
    fetchData,
  };
}
