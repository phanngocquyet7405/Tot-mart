"use client";

import Link from "next/link";
import { Plus, Search, RefreshCw, Tag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAdminBrands } from "@/app/hook/useAdminBrands";
import { BrandTable } from "@/components/components_admin/components/brands/BrandTable";
import DeleteBrandModal from "../components/brands/DeleteBrandModal";
import { AdminPageHeader, AdminLoadingState } from "../components/shared";

export default function BrandsPage() {
  const {
    brands,
    totalCount,
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
  } = useAdminBrands();

  return (
    <div className="space-y-6 p-6">
      <AdminPageHeader
        title="Thương hiệu"
        description={`${totalCount} thương hiệu trong hệ thống`}
        icon={Tag}
        actions={
          <>
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
            >
              <RefreshCw
                size={16}
                className={isRefreshing ? "animate-spin" : ""}
              />
            </Button>
            <Button asChild className="gap-2 bg-indigo-600 hover:bg-indigo-700">
              <Link href="/admin-brands/create">
                <Plus size={16} />
                Thêm thương hiệu
              </Link>
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg">Danh sách thương hiệu</CardTitle>
            <div className="relative flex-1 sm:w-64 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm thương hiệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <AdminLoadingState message="Đang tải dữ liệu..." />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-destructive/5 border-destructive/20">
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={() => fetchData()}>
                Thử lại
              </Button>
            </div>
          ) : (
            <BrandTable brands={brands} onDelete={openDeleteTarget} />
          )}
        </CardContent>
      </Card>

      <DeleteBrandModal
        brand={deleteTarget}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteTarget}
        isLoading={isDeleting}
      />
    </div>
  );
}
