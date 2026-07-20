"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { updateCategoryApi } from "@/app/services/api/productServices";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function UpdateCategory({ category, onSuccess }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khởi tạo state với dữ liệu từ category prop
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    icon: category?.icon || "",
  });

  // Cập nhật lại form nếu dữ liệu category thay đổi (tránh lỗi stale data)
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        icon: category.icon || "",
      });
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      // Gọi API update với ID và data mới
      await updateCategoryApi(category._id, formData);
      setIsOpen(false);
      if (onSuccess) onSuccess(); // Gọi callback để refresh danh sách ở trang cha
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Danh mục</DialogTitle>
          {/* Thêm dòng này */}
          <DialogDescription>
            Thay đổi thông tin danh mục. Nhấn lưu để cập nhật thay đổi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Tên danh mục</Label>
            <Input
              id="edit-name"
              required
              placeholder="Nhập tên danh mục..."
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-desc">Mô tả</Label>
            <Textarea
              id="edit-desc"
              placeholder="Nhập mô tả chi tiết..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-icon">URL Hình ảnh / Icon</Label>
            <Input
              id="edit-icon"
              placeholder="https://example.com/image.png"
              value={formData.icon}
              onChange={(e) =>
                setFormData({ ...formData, icon: e.target.value })
              }
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Cập nhật"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
