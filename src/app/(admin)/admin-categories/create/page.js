"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  X,
  LayoutGrid,
  Loader2,
  ImageIcon,
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
import { cn } from "@/lib/utils";
import { createCategoryApi } from "@/app/services/api/productServices";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Trang Thêm Danh Mục (Phiên bản JavaScript)
 * Kế thừa giao diện 2 cột và logic xử lý ảnh từ AddProductPage
 */
export default function AddCategoryPage() {
  const router = useRouter();

  // States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });

  // --- Logic xử lý Drag & Drop (Giống AddProductPage) ---

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    // Mô phỏng logic upload ảnh
    const mockUrl = "/placeholder.svg?height=100&width=100";
    setFormData((prev) => ({ ...prev, icon: mockUrl }));
    toast.info("Đã tải ảnh lên (mô phỏng)");
  };

  const handleFileInput = () => {
    // Mô phỏng click chọn file
    const mockUrl = "/placeholder.svg?height=100&width=100";
    setFormData((prev) => ({ ...prev, icon: mockUrl }));
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, icon: "" }));
  };

  // --- Logic Submit Form ---

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục");
      return;
    }

    try {
      setIsSubmitting(true);
      await createCategoryApi(formData);
      toast.success("Thêm danh mục thành công!");
      router.push("/categories");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Có lỗi xảy ra khi tạo danh mục");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header điều hướng */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/categories">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Thêm Danh Mục Mới
          </h1>
          <p className="text-muted-foreground">
            Phân loại sản phẩm của bạn chuyên nghiệp hơn
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* CỘT TRÁI: Nhập liệu */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Cung cấp tên và mô tả chi tiết cho danh mục
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên danh mục</Label>
                <Input
                  id="name"
                  placeholder="VD: Điện tử, Gia dụng..."
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
                  placeholder="Mô tả ngắn gọn về nhóm sản phẩm này..."
                  className="min-h-30 resize-none"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh đại diện</CardTitle>
              <CardDescription>
                Sử dụng ảnh hoặc icon để nhận diện danh mục
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-all",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50",
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {formData.icon ? (
                  <div className="relative aspect-square w-40 overflow-hidden rounded-xl border-2 border-primary/20 shadow-sm">
                    <Image
                      src={formData.icon}
                      alt="Category icon"
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 h-7 w-7 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                      <Upload className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="text-sm font-semibold text-foreground">
                        Kéo thả ảnh vào đây
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG hoặc SVG
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={handleFileInput}
                    >
                      Chọn từ thiết bị
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" asChild>
              <Link href="/categories">Hủy bỏ</Link>
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Lưu danh mục
            </Button>
          </div>
        </div>

        {/* CỘT PHẢI: Xem trước (Preview) */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-primary/10 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium uppercase text-muted-foreground tracking-wider">
                Xem trước hiển thị
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Card Preview giống giao diện người dùng */}
              <div className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg">
                <div className="aspect-16/10 relative bg-muted flex items-center justify-center">
                  {formData.icon ? (
                    <Image
                      src={formData.icon}
                      alt="Preview"
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <LayoutGrid className="h-16 w-16 text-muted-foreground/10" />
                  )}
                </div>
                <div className="p-5 text-center">
                  <h3 className="text-lg font-bold text-foreground line-clamp-1">
                    {formData.name || "Tên danh mục"}
                  </h3>
                  <Separator className="my-3 mx-auto w-10" />
                  <p className="text-sm text-muted-foreground line-clamp-2 italic">
                    {formData.description ||
                      "Mô tả danh mục sẽ hiển thị tại đây khi bạn nhập liệu..."}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                  <strong>Mẹo:</strong> Hình ảnh danh mục nên có tỷ lệ 1:1 hoặc
                  16:9 để hiển thị tốt nhất trên trang chủ khách hàng.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper component cho Separator nếu bạn chưa có file ui/separator
function Separator({ className }) {
  return <div className={cn("h-px w-full bg-border", className)} />;
}
