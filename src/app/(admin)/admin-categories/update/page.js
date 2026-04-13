"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  X,
  LayoutGrid,
  Loader2,
  Clock,
  User,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  updateCategoryApi,
  getCategoryByIdApi,
} from "@/app/services/api/productServices";
import { toast } from "sonner";

function UpdateCategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");

  // States quản lý dữ liệu
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });

  // 1. Fetch dữ liệu danh mục khi load trang (Giống logic edit product)
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categoryId) return;
      try {
        setIsLoading(true);
        // Giả sử bạn có hàm lấy chi tiết category theo ID
        const response = await getCategoryByIdApi(categoryId);
        const data = response.data;
        setFormData({
          name: data.name || "",
          description: data.description || "",
          icon: data.icon || "",
        });
      } catch (error) {
        toast.error("Không thể tải thông tin danh mục");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategory();
  }, [categoryId]);

  // --- 2. Các phương thức xử lý ảnh (Kế thừa từ UpdateProductContent) ---
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Logic upload ảnh mô phỏng
    setFormData({ ...formData, icon: "/placeholder.svg?height=300&width=300" });
  };

  const removeImage = () => setFormData({ ...formData, icon: "" });

  // --- 3. Xử lý Cập nhật ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Tên danh mục không được để trống");

    try {
      setIsSubmitting(true);
      await updateCategoryApi(categoryId, formData);
      toast.success("Cập nhật danh mục thành công");
      router.push("/categories");
    } catch (error) {
      toast.error("Lỗi khi cập nhật danh mục");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/categories">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Chỉnh sửa Danh mục
          </h1>
          <p className="text-muted-foreground font-mono text-sm">
            ID: {categoryId}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form Column - Left */}
        <div className="space-y-6 lg:col-span-2">
          <Tabs defaultValue="edit">
            <TabsList className="mb-4">
              <TabsTrigger value="edit">Thông tin chi tiết</TabsTrigger>
              <TabsTrigger value="history">Lịch sử thay đổi</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên danh mục</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả</Label>
                    <Textarea
                      id="description"
                      className="min-h-37.5"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hình ảnh / Biểu tượng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50",
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {formData.icon ? (
                      <div className="relative aspect-square w-40 overflow-hidden rounded-lg border">
                        <Image
                          src={formData.icon}
                          alt="Category"
                          fill
                          className="object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute right-1 top-1 h-6 w-6"
                          onClick={removeImage}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Kéo thả ảnh để cập nhật
                        </p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Nhật ký hệ thống</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                    <History className="h-4 w-4" /> Tính năng lịch sử đang được
                    phát triển...
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/categories">Hủy</Link>
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </div>

        {/* Preview Column - Right (Tương tự UpdateProductContent) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle>Xem trước hiển thị</CardTitle>
              <CardDescription>
                Cách danh mục xuất hiện trên ứng dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video relative rounded-lg border bg-muted overflow-hidden flex items-center justify-center">
                {formData.icon ? (
                  <Image
                    src={formData.icon}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <LayoutGrid className="h-12 w-12 text-muted-foreground/20" />
                )}
              </div>
              <div className="space-y-2 text-center">
                <h3 className="font-bold text-xl uppercase text-blue-600">
                  {formData.name || "Tên danh mục"}
                </h3>
                <Separator className="my-2" />
                <p className="text-sm text-muted-foreground line-clamp-4 italic px-2">
                  {formData.description || "Chưa có mô tả cho danh mục này..."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Export trang chính với Suspense để bọc useSearchParams
export default function UpdateCategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center">
          <Loader2 className="animate-spin inline mr-2" /> Đang tải...
        </div>
      }
    >
      <UpdateCategoryContent />
    </Suspense>
  );
}
