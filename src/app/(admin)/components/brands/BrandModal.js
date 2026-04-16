"use client";

//su dung sau

import React, { useState, useEffect } from "react";
import { Loader2, ImageIcon } from "lucide-react";
import {
  createBrandApi,
  updateBrandApi,
} from "@/app/services/api/productServices";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Image from "next/image";

export default function BrandModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo: "",
    website: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Đường dẫn ảnh tĩnh mặc định từ thư mục public
  const DEFAULT_LOGO = "/assets/logo.png";

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          description: initialData.description || "",
          logo: initialData.logo || "",
          website: initialData.website || "",
        });
      } else {
        setFormData({ name: "", description: "", logo: "", website: "" });
      }
      setError("");
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Tên thương hiệu là bắt buộc.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      if (isEditMode) {
        await updateBrandApi(initialData._id, formData);
      } else {
        await createBrandApi(formData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Có lỗi xảy ra khi lưu dữ liệu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Sửa chiều rộng thành giá trị chuẩn */}
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Cập nhật Thương hiệu" : "Thêm Thương hiệu mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">
              Tên thương hiệu <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ví dụ: Nike, Adidas..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả ngắn gọn về thương hiệu"
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-4 gap-4 items-end">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="logo">URL Logo</Label>
              <Input
                id="logo"
                name="logo"
                type="url"
                value={formData.logo}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
              />
            </div>

            {/* Phần Preview Logo với xử lý ảnh tĩnh */}
            <div className="flex items-center justify-center w-full h-10 border rounded-md bg-muted/30 overflow-hidden relative">
              <Image
                src={formData.logo || DEFAULT_LOGO}
                alt="Preview"
                fill
                className="object-contain p-1"
                // Thêm unoptimized để bypass việc check domain trong khi dev nếu cần
                // hoặc đảm bảo đã config next.config.js như trên
                unoptimized
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://brand-website.com"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {isEditMode ? "Lưu thay đổi" : "Tạo mới"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
