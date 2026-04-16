"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  X,
  ImageIcon,
  Loader2,
  Save,
  Edit2,
  Search,
  Package,
  ChevronRight,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// API Services
import {
  updateProductApi,
  getAllCategoriesApi,
  getAllBrandsApi,
  getAllProductsApi,
} from "@/app/services/api/productServices";

export default function UpdateProductPage() {
  const router = useRouter();
  const params = useParams();

  // States hệ thống
  const [viewMode, setViewMode] = useState(params?.id ? "edit" : "list");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // States Form
  const [currentId, setCurrentId] = useState(params?.id);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    description: "",
    sku: "",
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const fileInputRef = useRef(null);

  // --- 1. Load Data ---
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [catRes, brandRes, prodRes] = await Promise.all([
          getAllCategoriesApi(),
          getAllBrandsApi(),
          getAllProductsApi(),
        ]);

        setCategories(catRes.data || []);
        setBrands(brandRes.data || []);
        const allProducts = prodRes.data?.data ?? prodRes.data ?? [];
        setProducts(allProducts);

        if (currentId) {
          const product = allProducts.find(
            (p) => String(p.id || p._id) === String(currentId),
          );
          if (product) fillForm(product);
        }
      } catch (error) {
        console.error(error);
        toast.error("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, [currentId]);

  const fillForm = (product) => {
    setFormData({
      name: product.name || "",
      price: product.price || "",
      stock: product.quantity || product.stock || "",
      category:
        product.categoryId || product.category?._id || product.category || "",
      brand: product.brandId || product.brand?._id || product.brand || "",
      description: product.description || "",
      sku: product.sku || "",
    });

    // Đồng bộ logic lấy URL ảnh
    const imgs = product.images || (product.image ? [product.image] : []);
    const formattedImgs = imgs
      .map((img) => (typeof img === "string" ? img : img.url))
      .filter((url) => url && url.trim() !== "");

    setExistingImages(formattedImgs);
  };

  const handleSelectProduct = (id) => {
    const product = products.find((p) => String(p.id || p._id) === String(id));
    if (product) {
      setCurrentId(id);
      fillForm(product);
      setViewMode("edit");
      window.history.pushState(null, "", `/admin-products/update?id=${id}`);
    }
  };

  const handleFileChange = (files) => {
    if (!files) return;
    const validFiles = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...validFiles]);
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleUpdate = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      submitData.append(key, value),
    );
    submitData.append("existingImages", JSON.stringify(existingImages));
    newImages.forEach((img) => submitData.append("images", img.file));

    try {
      const res = await updateProductApi(currentId, submitData);
      if (res.success || res.status === 200) {
        toast.success("Cập nhật thành công");
        setViewMode("list");
      }
    } catch (error) {
      toast.error("Cập nhật thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  // --- GIAO DIỆN 1: DANH SÁCH SẢN PHẨM ---
  if (viewMode === "list") {
    return (
      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Quản lý sản phẩm
            </h1>
            <p className="text-muted-foreground text-sm">
              Nhấp để chọn sản phẩm cần cập nhật
            </p>
          </div>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm sản phẩm..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-3">
          {products
            .filter((p) =>
              p.name.toLowerCase().includes(searchTerm.toLowerCase()),
            )
            .map((p) => (
              <div
                key={p.id || p._id}
                onClick={() => handleSelectProduct(p.id || p._id)}
                className="flex items-center justify-between p-3 bg-white border rounded-2xl hover:border-primary hover:shadow-md transition-all cursor-pointer group active:scale-[0.98]"
              >
                <div className="flex items-center gap-4">
                  {/* Áp dụng chuẩn hiển thị từ ProductList */}
                  <div className="relative w-14 h-14 shrink-0">
                    <Image
                      src={
                        p.images && p.images[0]?.url
                          ? p.images[0].url
                          : "/placeholder.svg"
                      }
                      alt={p.name || "product"}
                      fill
                      sizes="56px"
                      className="rounded-md object-cover border"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base line-clamp-1">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-primary font-bold text-sm">
                        ${Number(p.price).toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        | Kho: {p.quantity || p.stock || 0}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full h-10 w-10 shrink-0 group-hover:bg-primary group-hover:text-white transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN 2: FORM CHỈNH SỬA ---
  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Button
            variant="ghost"
            className="pl-0 text-muted-foreground hover:text-primary"
            onClick={() => setViewMode("list")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Chỉnh sửa sản phẩm
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode("list")}>
            Hủy
          </Button>
          <Button onClick={handleUpdate} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="general">Thông tin</TabsTrigger>
          <TabsTrigger value="images">Hình ảnh</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tên sản phẩm *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Giá bán ($)</Label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({ ...formData, price: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Số lượng tồn</Label>
                      <Input
                        type="number"
                        value={formData.stock}
                        onChange={(e) =>
                          setFormData({ ...formData, stock: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mô tả chi tiết</Label>
                    <Textarea
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
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Phân loại</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Danh mục</Label>
                    <Select
                      value={String(formData.category)}
                      onValueChange={(v) =>
                        setFormData({ ...formData, category: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem
                            key={c.id || c._id}
                            value={String(c.id || c._id)}
                          >
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Card đồng bộ style */}
              <Card className="bg-muted/30 border-dashed">
                <CardContent className="pt-6 space-y-4">
                  <div className="aspect-square relative rounded-xl overflow-hidden border bg-white">
                    <Image
                      src={
                        newImages[0]?.preview ||
                        existingImages[0] ||
                        "/placeholder.svg"
                      }
                      fill
                      alt="preview"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-bold truncate">
                    {formData.name || "Tên sản phẩm"}
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    ${formData.price || "0"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-2xl p-12 text-center hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p>Click để tải lên hình ảnh mới</p>
                <input
                  type="file"
                  multiple
                  hidden
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {/* Ảnh hiện có */}
                {existingImages.map((url, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="relative aspect-square rounded-xl overflow-hidden border"
                  >
                    <Image
                      src={url}
                      fill
                      alt="existing"
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {/* Ảnh mới chọn */}
                {newImages.map((img, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-primary"
                  >
                    <Image
                      src={img.preview}
                      fill
                      alt="new"
                      className="object-cover"
                    />
                    <button
                      onClick={() =>
                        setNewImages((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
