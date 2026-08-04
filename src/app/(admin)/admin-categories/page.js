"use client";

import React from "react";
import { useRouter } from "next/navigation";
import GetAllCategories from "../components/categories/get_all_categories.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Info,
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
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      {/* Header đồng nhất với AddCategory - Màu cam chủ đạo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-800 flex items-center gap-3">
            <div className="p-2 bg-orange-600 rounded-xl shadow-lg shadow-orange-200">
              <FolderTree className="h-6 w-6 text-white" />
            </div>
            Cấu trúc Danh mục
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-1 italic">
            <Info className="h-3 w-3" /> Quản lý phân cấp dựa trên mảng
            Reference IDs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchCategories}
            className="border-zinc-200 hover:bg-zinc-50"
            disabled={isLoading}
          >
            <RotateCcw
              className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
            />
            Làm mới
          </Button>
          <Button
            className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200"
            onClick={() => router.push("/admin-categories/create")}
          >
            <Plus className="h-4 w-4 mr-2" /> Thêm danh mục mới
          </Button>
        </div>
      </div>

      {/* Stats Cards - Màu sắc đồng bộ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Tổng danh mục"
          value={stats.total}
          icon={<Layers className="h-5 w-5" />}
          color="blue"
          isActive={filterType === "all"}
          onClick={() => setFilterType("all")}
        />
        <StatsCard
          label="Đang hoạt động"
          value={stats.active}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="green"
          isActive={filterType === "active"}
          onClick={() => setFilterType("active")}
        />
        <StatsCard
          label="Danh mục gốc"
          value={stats.root}
          icon={<FolderTree className="h-5 w-5" />}
          color="orange"
          isActive={filterType === "root"}
          onClick={() => setFilterType("root")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          {/* Search Box - Đồng nhất Input style */}
          <Card className="border-orange-100 shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b bg-orange-50/30">
              <CardTitle className="text-xs font-bold uppercase text-orange-800 tracking-wider">
                Bộ lọc & Tìm kiếm
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Tìm theo tên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 focus-visible:ring-orange-500 border-zinc-200 h-10"
                />
              </div>

              <Button
                variant="secondary"
                className="w-full justify-start gap-2 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border-none"
                onClick={toggleExpandAll}
                disabled={searchQuery.length > 0 || filterType !== "all"}
              >
                <LayoutGrid className="h-4 w-4" />
                {expandedIds.size > 0 ? "Thu gọn cây" : "Mở rộng toàn bộ"}
              </Button>
            </CardContent>
          </Card>

          {/* Guide Box - Giống trang Add */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-700 space-y-2">
            <p className="font-bold flex items-center gap-1 uppercase tracking-tighter">
              <AlertCircle className="h-3 w-3" /> Thông tin Schema
            </p>
            <p className="opacity-80 leading-relaxed">
              Dữ liệu được tổ chức theo <code>childrenIds[]</code>. Danh mục con
              nằm bên trong mảng của danh mục cha.
            </p>
          </div>
        </div>

        {/* Tree Table Area */}
        <div className="lg:col-span-3">
          <Card className="shadow-xl border-none overflow-hidden rounded-2xl bg-white">
            <CardHeader className="bg-zinc-900 text-white py-4 px-6 flex flex-row items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                {filterType === "all"
                  ? "Cấu trúc phân cấp hệ thống"
                  : `Danh sách lọc: ${filterType}`}
              </span>
              <div className="hidden md:flex gap-12 text-[10px] font-bold uppercase tracking-widest opacity-70 mr-8">
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

// Sub-component cho Stats Card để code sạch hơn
function StatsCard({ label, value, icon, color, isActive, onClick }) {
  const colorMap = {
    blue: "bg-blue-500 border-blue-100 text-blue-600",
    green: "bg-green-500 border-green-100 text-green-600",
    orange: "bg-orange-500 border-orange-100 text-orange-600",
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-300 border-2",
        isActive
          ? `border-${color}-500 shadow-lg scale-[1.02]`
          : "border-transparent hover:border-zinc-200",
      )}
    >
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={cn(
            "p-3 rounded-xl text-white shadow-inner",
            colorMap[color].split(" ")[0],
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-60">
            {label}
          </p>
          <p className="text-2xl font-black text-zinc-800">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
