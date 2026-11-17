"use client";

import React from "react";
import { useRouter } from "next/navigation";
import GetAllCategories from "../components/categories/get_all_categories.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageHeader } from "../components/shared";
import { cn } from "@/lib/utils";
import {
  Search,
  LayoutGrid,
  FolderTree,
  RotateCcw,
  Plus,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useAdminCategoriesList } from "./hooks/useAdminCategoriesList";

export default function CategoriesPage() {
  const router = useRouter();
  const {
    isLoading,
    searchQuery,
    setSearchQuery,
    expandedIds,
    setExpandedIds,
    filterType,
    setFilterType,
    stats,
    categoryTree,
    toggleExpandAll,
    fetchCategories,
  } = useAdminCategoriesList();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Cấu trúc Danh mục"
        description="Quản lý phân cấp dựa trên mảng Reference IDs"
        icon={FolderTree}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchCategories}
              className="min-h-11"
              disabled={isLoading}
            >
              <RotateCcw
                className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
              />
              Làm mới
            </Button>
            <Button
              className="min-h-11"
              onClick={() => router.push("/admin-categories/create")}
            >
              <Plus className="h-4 w-4 mr-2" /> Thêm danh mục mới
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Tổng danh mục"
          value={stats.total}
          icon={<Layers className="h-5 w-5" />}
          color="primary"
          isActive={filterType === "all"}
          onClick={() => setFilterType("all")}
        />
        <StatsCard
          label="Đang hoạt động"
          value={stats.active}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="success"
          isActive={filterType === "active"}
          onClick={() => setFilterType("active")}
        />
        <StatsCard
          label="Danh mục gốc"
          value={stats.root}
          icon={<FolderTree className="h-5 w-5" />}
          color="warning"
          isActive={filterType === "root"}
          onClick={() => setFilterType("root")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          {/* Search Box */}
          <Card className="border-border shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b border-border bg-muted/40">
              <CardTitle className="text-xs font-bold uppercase text-foreground tracking-wider">
                Bộ lọc & Tìm kiếm
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm theo tên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 min-h-11 text-base sm:text-sm"
                />
              </div>

              <Button
                variant="outline"
                className="w-full justify-start gap-2 min-h-11"
                onClick={toggleExpandAll}
                disabled={searchQuery.length > 0 || filterType !== "all"}
              >
                <LayoutGrid className="h-4 w-4" />
                {expandedIds.size > 0 ? "Thu gọn cây" : "Mở rộng toàn bộ"}
              </Button>
            </CardContent>
          </Card>

          {/* Guide Box */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-foreground space-y-2">
            <p className="font-bold flex items-center gap-1 uppercase tracking-tighter text-primary">
              <AlertCircle className="h-3.5 w-3.5" /> Thông tin Schema
            </p>
            <p className="opacity-80 leading-relaxed text-muted-foreground">
              Dữ liệu được tổ chức theo <code>childrenIds[]</code>. Danh mục con
              nằm bên trong mảng của danh mục cha.
            </p>
          </div>
        </div>

        {/* Tree Table Area */}
        <div className="lg:col-span-3">
          <Card className="shadow-sm border border-border overflow-hidden rounded-xl bg-card">
            <CardHeader className="bg-muted/50 border-b border-border py-4 px-6 flex flex-row items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                {filterType === "all"
                  ? "Cấu trúc phân cấp hệ thống"
                  : `Danh sách lọc: ${filterType}`}
              </span>
              <div className="hidden md:flex gap-12 text-xs font-bold uppercase tracking-wider text-muted-foreground mr-8">
                <span>Trạng thái</span>
                <span>Thao tác</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <GetAllCategories
                categories={categoryTree}
                isLoading={isLoading}
                onRefresh={fetchCategories}
                isTreeView={filterType === "all" && !searchQuery}
                expandedIds={expandedIds}
                setExpandedIds={setExpandedIds}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ label, value, icon, color, isActive, onClick }) {
  const colorMap = {
    primary: "bg-primary/10 text-primary border-primary/25",
    success: "bg-success/15 text-success-text border-success/30",
    warning: "bg-warning/15 text-warning-text border-warning/30",
  };

  const c = colorMap[color] || colorMap.primary;

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all border border-border bg-card hover:border-border/80",
        isActive && "border-primary shadow-sm scale-[1.01]",
      )}
    >
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn("p-3 rounded-xl border shrink-0", c)}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
