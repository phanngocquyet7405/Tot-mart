"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchAdminProducts,
  fetchAdminProductFilters,
  deleteAdminProduct,
  deleteAdminProducts,
} from "../services/productsAdminService";

const DEFAULT_FILTERS = {
  category: "all",
  brand: "all",
  minPrice: 0,
  maxPrice: 1000000000,
};

export function useAdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS);

  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodData, filterData] = await Promise.all([
        fetchAdminProducts(),
        fetchAdminProductFilters(),
      ]);
      setProducts(prodData);
      setCategories(filterData.categories);
      setBrands(filterData.brands);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        "Không thể tải danh sách sản phẩm. Vui lòng kiểm tra kết nối API.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const matchSearch = p.name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

      const pCatId = p.category?._id || p.category;
      const pBrandId = p.brand?._id || p.brand;

      const matchCategory =
        activeFilters.category === "all" ||
        String(pCatId) === activeFilters.category;
      const matchBrand =
        activeFilters.brand === "all" ||
        String(pBrandId) === activeFilters.brand;

      const price = Number(p.price ?? 0);
      const matchPrice =
        price >= activeFilters.minPrice && price <= activeFilters.maxPrice;

      return matchSearch && matchCategory && matchBrand && matchPrice;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;
      if (typeof aValue === "string")
        return aValue.localeCompare(bValue) * modifier;
      return ((aValue ?? 0) - (bValue ?? 0)) * modifier;
    });

    return filtered;
  }, [products, searchQuery, sortField, sortDirection, activeFilters]);

  const toggleSort = useCallback(
    (field) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
    },
    [sortField],
  );

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === filteredAndSortedProducts.length
        ? []
        : filteredAndSortedProducts.map((p) => p._id),
    );
  }, [filteredAndSortedProducts]);

  const toggleSelectOne = useCallback((id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const openDeleteSingle = useCallback((product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  }, []);

  const openDeleteBulk = useCallback(() => {
    setProductToDelete(null);
    setDeleteDialogOpen(true);
  }, []);

  const applyFilters = useCallback((f) => {
    setActiveFilters({
      category: f.category || "all",
      brand: f.brand || "all",
      minPrice: f.minPrice ?? 0,
      maxPrice: f.maxPrice ?? 1000000000,
    });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      if (productToDelete) {
        await deleteAdminProduct(productToDelete._id);
        toast.success(`Đã xóa "${productToDelete.name}"`);
      } else {
        await deleteAdminProducts(selectedIds);
        toast.success(`Đã xóa ${selectedIds.length} sản phẩm thành công`);
      }
      setSelectedIds([]);
      setDeleteDialogOpen(false);
      fetchData();
    } catch {
      toast.error("Lỗi hệ thống khi xóa sản phẩm");
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  }, [productToDelete, selectedIds, fetchData]);

  return {
    products: filteredAndSortedProducts,
    categories,
    brands,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedIds,
    setSelectedIds,
    sortField,
    sortDirection,
    toggleSort,
    toggleSelectAll,
    toggleSelectOne,
    filterOpen,
    setFilterOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    productToDelete,
    isDeleting,
    openDeleteSingle,
    openDeleteBulk,
    applyFilters,
    handleConfirmDelete,
    fetchData,
  };
}
