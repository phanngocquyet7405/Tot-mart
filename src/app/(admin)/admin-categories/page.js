"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getAllCategoriesApi } from "@/app/services/api/productServices.js";
import GetAllCategories from "../components/categories/get_all_categories.js";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  XCircle,
  Info,
} from "lucide-react";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [filterType, setFilterType] = useState("all");

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await getAllCategoriesApi();
      // Đồng nhất cách lấy data: res?.data?.data
      const result = res?.data?.data || res?.data || [];
      setCategories(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Tính toán Stats dựa trên Schema Child Reference
  const stats = useMemo(() => {
    // Tìm các ID là "con" của một ai đó
    const allChildIds = new Set(
      categories.flatMap((cat) => cat.childrenIds || []),
    );

    return {
      total: categories.length,
      active: categories.filter((c) => c.isActive).length,
      // Root là những danh mục KHÔNG nằm trong mảng childrenIds của bất kỳ ai
      root: categories.filter((c) => !allChildIds.has(c._id)).length,
    };
  }, [categories]);

  const categoryTree = useMemo(() => {
    if (!categories.length) return [];

    let filteredData = [...categories];

    if (searchQuery) {
      return filteredData.filter((cat) =>
        cat.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterType === "active") {
      filteredData = filteredData.filter((c) => c.isActive);
    } else if (filterType === "root") {
      const allChildIds = new Set(
        categories.flatMap((cat) => cat.childrenIds || []),
      );
      filteredData = filteredData.filter((c) => !allChildIds.has(c._id));
    }

    if (filterType !== "all") return filteredData;

    // Xây dựng cây dựa trên logic: Một node là Root nếu ID của nó không nằm trong bất kỳ childrenIds nào
    const allChildIds = new Set(
      categories.flatMap((cat) => cat.childrenIds || []),
    );
    const map = {};
    categories.forEach((cat) => {
      map[cat._id] = { ...cat, children: [] };
    });

    const tree = [];
    categories.forEach((cat) => {
      // Nếu có childrenIds, đi tìm các node con tương ứng để bỏ vào mảng children của node hiện tại
      if (cat.childrenIds && cat.childrenIds.length > 0) {
        cat.childrenIds.forEach((childId) => {
          if (map[childId]) map[cat._id].children.push(map[childId]);
        });
      }

      // Nếu ID này không phải là con của ai, thì nó là Root của cây
      if (!allChildIds.has(cat._id)) {
        tree.push(map[cat._id]);
      }
    });
    return tree;
  }, [categories, searchQuery, filterType]);

  const toggleExpandAll = () => {
    setExpandedIds(
      expandedIds.size > 0 ? new Set() : new Set(categories.map((c) => c._id)),
    );
  };

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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) setFilterType("all");
                  }}
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
