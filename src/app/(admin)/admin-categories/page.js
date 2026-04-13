"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getAllCategoriesApi } from "@/app/services/api/productServices.js";
import GetAllCategories from "../components/categories/get_all_categories.js";
import CreateCategory from "../components/categories/create.js";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Download, LayoutGrid } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await getAllCategoriesApi();

      // FIX LỖI Ở ĐÂY: Khai báo biến 'result' thay vì dùng 'data' trước khi gán
      const result = res?.data || res || [];

      console.log("Dữ liệu đã xử lý:", result);

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

  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories.filter(
      (cat) =>
        cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      const modifier = sortDirection === "asc" ? 1 : -1;

      if (typeof aValue === "string") {
        return aValue.localeCompare(bValue) * modifier;
      }
      return (aValue - bValue) * modifier;
    });

    return filtered;
  }, [categories, searchQuery, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="container py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Quản lý Danh mục
          </h2>
          <p className="text-sm text-muted-foreground">
            Phân loại và tổ chức hệ thống nhóm sản phẩm của bạn.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
            <Download className="h-4 w-4" /> Xuất dữ liệu
          </Button>
          <CreateCategory onSuccess={fetchCategories} />
        </div>
      </div>

      <Separator />

      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-primary" />
              Danh sách nhóm ngành
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:w-80 sm:flex-none">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm tên hoặc mô tả danh mục..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <GetAllCategories
            categories={filteredAndSortedCategories}
            isLoading={isLoading}
            onRefresh={fetchCategories}
            currentSort={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />

          {!isLoading && filteredAndSortedCategories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border-t mt-4">
              <p className="text-muted-foreground italic">
                Không tìm thấy kết quả nào phù hợp.
              </p>
              {searchQuery && (
                <Button
                  variant="link"
                  onClick={() => setSearchQuery("")}
                  className="text-primary"
                >
                  Xóa bộ lọc tìm kiếm
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
