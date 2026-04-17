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
// CHỈ import những gì thực sự tồn tại
import { updateCategoryApi } from "@/app/services/api/productServices";
import { toast } from "sonner";

function UpdateCategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Để false vì hiện tại không fetch chi tiết
  const [isDragging, setIsDragging] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });

  // Xử lý cập nhật
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

  // ... (Các hàm handleDragOver, handleDrop giữ nguyên như code của bạn)
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setFormData({ ...formData, icon: "https://via.placeholder.com/300" });
  };
  const removeImage = () => setFormData({ ...formData, icon: "" });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/categories">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa Danh mục</h1>
          <p className="text-muted-foreground text-sm font-mono">
            ID: {categoryId}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tên danh mục</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

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

        {/* Cột Preview bên phải */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-blue-100 shadow-sm">
            <CardHeader>
              <CardTitle>Xem trước</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="aspect-video relative rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
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
              <h3 className="font-bold text-xl uppercase text-blue-600">
                {formData.name || "Tên danh mục"}
              </h3>
              <p className="text-sm text-muted-foreground italic line-clamp-3">
                {formData.description || "Mô tả..."}
              </p>
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
        <div className="p-10 text-center">
          <Loader2 className="animate-spin inline mr-2" /> Đang tải...
        </div>
      }
    >
      <UpdateCategoryContent />
    </Suspense>
  );
}
