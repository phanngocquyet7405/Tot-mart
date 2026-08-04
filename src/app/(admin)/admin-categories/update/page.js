"use client";

import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LayoutGrid,
  Loader2,
  FolderTree,
  Info,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateCategory } from "../hooks/useUpdateCategory";

function UpdateCategoryContent() {
  const router = useRouter();
  const {
    categoryId,
    formData,
    updateField,
    existingCategories,
    isLoading,
    isSubmitting,
    handleUpdate,
  } = useUpdateCategory();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
        <p className="text-zinc-500 animate-pulse text-sm">
          Đang tải dữ liệu danh mục...
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
      {/* Header Bar - Đồng nhất với trang Add */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-800">
              Chỉnh sửa Danh mục
            </h1>
            <p className="text-xs text-muted-foreground font-mono bg-zinc-100 px-2 py-1 rounded w-fit mt-1">
              ID: {categoryId}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleUpdate}
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white min-w-35 shadow-lg shadow-orange-200"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Cột chính: Form nhập liệu */}
        <div className="md:col-span-2 space-y-4">
          <Card className="border-orange-100 shadow-sm overflow-hidden">
            <CardHeader className="bg-orange-50/30 border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                <LayoutGrid className="h-5 w-5 text-orange-600" />
                Cấu hình thuộc tính
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="font-bold text-zinc-700">
                  Tên danh mục <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="h-11 focus-visible:ring-orange-500 border-zinc-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-zinc-700">
                  Mô tả (Description)
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="min-h-30 border-zinc-200 focus-visible:ring-orange-500"
                  placeholder="Nhập mô tả cho danh mục..."
                />
              </div>

              {/* Thông tin về danh mục con hiện tại */}
              <div className="p-4 rounded-xl border border-zinc-100 bg-zinc-50/50">
                <Label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                  Danh mục con trực thuộc
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.childrenIds.length > 0 ? (
                    formData.childrenIds.map((id) => {
                      const child = existingCategories.find(
                        (c) => c._id === id,
                      );
                      return (
                        <div
                          key={id}
                          className="flex items-center gap-2 bg-white border px-3 py-1.5 rounded-lg text-sm shadow-sm"
                        >
                          <FolderTree className="h-3 w-3 text-orange-500" />
                          <span className="font-medium text-zinc-700">
                            {child?.name || id}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-zinc-400 italic">
                      Danh mục này hiện chưa có danh mục con.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0" />
            <div className="text-sm text-blue-900">
              <p className="font-bold">Lưu ý về cấu trúc:</p>
              <p className="opacity-80">
                Việc thay đổi tên hoặc mô tả tại đây sẽ cập nhật trực tiếp vào
                hệ thống phân cấp <strong>Child-Referencing</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Cột phụ: Trạng thái & Preview */}
        <div className="space-y-4">
          <Card className="shadow-sm border-zinc-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <Label className="font-bold">Kích hoạt</Label>
                <p className="text-[11px] text-muted-foreground">
                  Trạng thái hiển thị công khai
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(val) => updateField("isActive", val)}
              />
            </CardContent>
          </Card>

          {/* Live Preview Card */}
          <Card className="bg-zinc-900 text-white border-none shadow-xl overflow-hidden">
            <CardHeader className="pb-2 border-b border-zinc-800">
              <CardTitle className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                Xem trước hiển thị
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-zinc-400">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="text-xs font-mono">CATEGORY_NODE</span>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-orange-500 rounded-lg">
                      <FolderTree className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-orange-50">
                      {formData.name || "Tên danh mục..."}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 italic leading-relaxed">
                    {formData.description ||
                      "Chưa có mô tả chi tiết cho danh mục này."}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-2 font-mono text-[10px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Trạng thái:</span>
                  <span
                    className={
                      formData.isActive ? "text-green-400" : "text-red-400"
                    }
                  >
                    {formData.isActive ? "● ACTIVE" : "○ INACTIVE"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Số lượng con:</span>
                  <span className="text-orange-400">
                    {formData.childrenIds.length} Nodes
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function UpdateCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin h-8 w-8 text-orange-600" />
        </div>
      }
    >
      <UpdateCategoryContent />
    </Suspense>
  );
}
