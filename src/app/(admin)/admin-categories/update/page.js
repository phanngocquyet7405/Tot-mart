"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutGrid,
  Loader2,
  FolderTree,
  CheckCircle2,
  Info,
  AlertTriangle,
  Save,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Services
import {
  updateCategoryApi,
  getAllCategoriesApi,
} from "@/app/services/api/productServices";

function UpdateCategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingCategories, setExistingCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    childrenIds: [],
  });

  // 1. Tải dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;
      try {
        setIsLoading(true);
        // Lấy tất cả danh mục để tìm thông tin danh mục hiện tại và danh sách cha
        const res = await getAllCategoriesApi();
        const data = res?.data?.data || res?.data || [];
        setExistingCategories(data);

        // Tìm danh mục cần sửa trong list (vì hiện tại chưa có API getById riêng biệt)
        const currentCat = data.find((c) => c._id === categoryId);
        if (currentCat) {
          setFormData({
            name: currentCat.name || "",
            description: currentCat.description || "",
            isActive:
              currentCat.isActive !== undefined ? currentCat.isActive : true,
            childrenIds: currentCat.childrenIds || [],
          });
        }
      } catch (err) {
        toast.error("Không thể tải thông tin danh mục");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [categoryId]);

  // 2. Xử lý cập nhật
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim())
      return toast.error("Tên danh mục không được để trống");

    try {
      setIsSubmitting(true);

      // Tối ưu Payload: Chuyển mảng Object (nếu có) thành mảng ID chuỗi tinh khiết
      const cleanChildrenIds = (formData.childrenIds || []).map((item) =>
        typeof item === "object" ? item._id : item,
      );

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
        childrenIds: cleanChildrenIds,
      };

      await updateCategoryApi(categoryId, payload);

      toast.success("Cập nhật thành công!");
      router.push("/admin-categories");
      router.refresh();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi khi cập nhật";
      toast.error(errorMsg);
      console.error("Update Error:", error.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        {/* Cột chính: Form nhập liệu[cite: 1] */}
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-11 focus-visible:ring-orange-500 border-zinc-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-zinc-700">
                  Mô tả (Description)
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
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
                hệ thống phân cấp <strong>Child-Referencing</strong>[cite: 1].
              </p>
            </div>
          </div>
        </div>

        {/* Cột phụ: Trạng thái & Preview[cite: 1] */}
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
                onCheckedChange={(val) =>
                  setFormData({ ...formData, isActive: val })
                }
              />
            </CardContent>
          </Card>

          {/* Live Preview Card - Đồng bộ style[cite: 1] */}
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
