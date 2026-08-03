"use client";

import Link from "next/link";
import { Package, Plus, Filter, Search, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { useAdminProducts } from "./hooks/useAdminProducts";
import { ProductTable } from "./components/ProductTable";
import { DeleteProductDialog } from "../components/products/delete_product_dialog";
import { AdvancedFilterDrawer } from "../components/products/advanced_filter_drawer";
import { BulkActionsBar } from "../components/products/bulk_action_bar";
import { AdminPageHeader, AdminLoadingState } from "../components/shared";

export default function ProductListPage() {
  const {
    products,
    categories,
    brands,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedIds,
    setSelectedIds,
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
  } = useAdminProducts();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        title="Sản phẩm"
        description="Quản lý danh sách và tồn kho sản phẩm"
        icon={Package}
        backHref="/admin"
        actions={
          <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
            <Link href="/admin-products/create">
              <Plus className="mr-2 h-4 w-4" /> Thêm mới
            </Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tên sản phẩm..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setFilterOpen(true)}
              className="w-fit"
            >
              <Filter className="mr-2 h-4 w-4" /> Lọc nâng cao
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <AdminLoadingState message="Đang đồng bộ dữ liệu..." />
          ) : error ? (
            <div className="text-center py-20 border-2 border-dashed rounded-lg">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-3" />
              <p className="font-medium">{error}</p>
              <Button onClick={fetchData} variant="link" className="mt-2">
                Thử tải lại trang
              </Button>
            </div>
          ) : (
            <ProductTable
              products={products}
              selectedIds={selectedIds}
              onToggleSelectAll={toggleSelectAll}
              onToggleSelectOne={toggleSelectOne}
              onSort={toggleSort}
              onDelete={openDeleteSingle}
            />
          )}
        </CardContent>
      </Card>

      {/* Các component hỗ trợ — vẫn dùng bản chung cũ, chưa có bản thay thế trong scaffold mới */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onDelete={openDeleteBulk}
      />

      <AdvancedFilterDrawer
        open={filterOpen}
        onOpenChange={setFilterOpen}
        categories={categories}
        brands={brands}
        onApplyFilters={applyFilters}
      />

      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => !isDeleting && setDeleteDialogOpen(open)}
        productName={productToDelete?.name}
        isBulk={!productToDelete}
        bulkCount={selectedIds.length}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
