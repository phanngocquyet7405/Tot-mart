"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  X,
  ImageIcon,
  Loader2,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
} from "lucide-react";

// Shadcn UI & Utils
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// API Services
import {
  getAllCategoriesApi,
  getAllBrandsApi,
  createProductApi,
} from "@/app/services/api/productServices";

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  // States dữ liệu hệ thống
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // States Form
  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    sku: "",
    category: "",
    brand: "",
    description: "",
  });

  // State Hình ảnh
  const [images, setImages] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 1. Load Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          getAllCategoriesApi(),
          getAllBrandsApi(),
        ]);
        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
      } catch (error) {
        toast.error("Không thể tải dữ liệu danh mục hoặc thương hiệu");
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- 2. Cleanup Preview URLs (Tránh Memory Leak) ---
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  // --- 3. Xử lý Hình ảnh ---
  const processFiles = (files) => {
    // Validate số lượng
    if (images.length + files.length > 10) {
      toast.error("Tối đa chỉ được tải lên 10 hình ảnh");
      return;
    }

    // Validate định dạng và dung lượng (Max 2MB)
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isImage) toast.error(`${file.name} không phải là ảnh hợp lệ`);
      if (!isLt2M) toast.error(`${file.name} vượt quá 2MB`);
      return isImage && isLt2M;
    });

    const newImages = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      preview: URL.createObjectURL(file),
      isMain: images.length === 0, // Ảnh đầu tiên tự động là ảnh chính
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.preview);

      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isMain)) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const setMainImage = (id) => {
    setImages(images.map((img) => ({ ...img, isMain: img.id === id })));
  };

  // --- 4. Submit Data ---
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!form.name || !form.price || !form.category || !form.brand) {
      return toast.error("Vui lòng nhập đầy đủ các trường bắt buộc (*)");
    }
    if (images.length === 0) {
      return toast.error("Vui lòng tải lên ít nhất một hình ảnh");
    }

    setIsSubmitting(true);
    const formData = new FormData();

    // Append text fields
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const sortedImages = [...images].sort((a, b) => (a.isMain ? -1 : 1));
    sortedImages.forEach((img) => {
      formData.append("images", img.file);
    });

    try {
      const res = await createProductApi(formData);
      if (res.success) {
        toast.success("Tạo sản phẩm thành công!");
        router.push("/admin-products/");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lỗi khi lưu sản phẩm";
      toast.error(errorMsg);
      console.error("Submit Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <Link
            href="/admin-products/"
            className="flex items-center text-sm text-muted-foreground hover:text-primary mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">
            Thêm sản phẩm mới
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Editor Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên sản phẩm *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ví dụ: iPhone 15 Pro Max..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">Mã SKU (Nếu có)</Label>
                  <Input
                    id="sku"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="IP15-PM-BLK"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Số lượng kho *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh sản phẩm</CardTitle>
              <CardDescription>
                Chọn ảnh đẹp nhất làm ảnh chính (có viền xanh).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-all cursor-pointer",
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50",
                )}
              >
                <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-medium">
                  Kéo thả hoặc click để chọn ảnh
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    processFiles(Array.from(e.target.files || []))
                  }
                />
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      onClick={() => setMainImage(img.id)}
                      className={cn(
                        "group relative aspect-square cursor-pointer rounded-lg border-2 overflow-hidden",
                        img.isMain
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent",
                      )}
                    >
                      <Image
                        src={img.preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      {img.isMain && (
                        <div className="absolute bottom-1 left-1 bg-primary text-[10px] text-white px-1.5 py-0.5 rounded shadow-sm">
                          Chính
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mô tả chi tiết</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-1 rounded-md border bg-muted/50 p-1 w-fit">
                <Toggle size="sm">
                  <Bold className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm">
                  <Italic className="h-4 w-4" />
                </Toggle>
                <Separator orientation="vertical" className="h-4 mx-1" />
                <Toggle size="sm">
                  <List className="h-4 w-4" />
                </Toggle>
                <Toggle size="sm">
                  <LinkIcon className="h-4 w-4" />
                </Toggle>
              </div>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Mô tả các đặc điểm nổi bật của sản phẩm..."
                className="min-h-50 resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Phân loại & Giá</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="price">Giá bán ($) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Danh mục *</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Thương hiệu *</Label>
                <Select
                  value={form.brand}
                  onValueChange={(v) => setForm({ ...form, brand: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn thương hiệu" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((b) => (
                      <SelectItem key={b._id} value={b._id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang
                      lưu...
                    </>
                  ) : (
                    "Lưu sản phẩm"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full mt-2"
                  disabled={isSubmitting}
                  onClick={() => router.push("/admin-products/")}
                >
                  Hủy bỏ
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <Card className="bg-muted/30 border-dashed overflow-hidden hidden lg:block">
            <CardHeader className="py-3 bg-muted/50 border-b">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                Xem trước hiển thị
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="aspect-square relative rounded-lg overflow-hidden border bg-white flex items-center justify-center">
                {images.length > 0 ? (
                  <Image
                    src={
                      images.find((i) => i.isMain)?.preview || images[0].preview
                    }
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground/20" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm truncate">
                  {form.name || "Tên sản phẩm"}
                </h3>
                <p className="text-lg font-bold text-primary">
                  ${form.price || "0.00"}
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                      Number(form.stock) > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700",
                    )}
                  >
                    {Number(form.stock) > 0 ? "Còn hàng" : "Hết hàng"}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    SKU: {form.sku || "N/A"}
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
