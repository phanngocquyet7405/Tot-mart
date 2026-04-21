"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LayoutGrid,
  Loader2,
  FolderTree,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  createCategoryApi,
  getAllCategoriesApi,
  updateCategoryApi,
} from "@/app/services/api/productServices";

export default function AddCategoryPage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingCategories, setExistingCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
    parentId: null,
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await getAllCategoriesApi();
        const data = res?.data?.data || res?.data || [];
        setExistingCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Lỗi fetch categories:", err);
      }
    };
    fetchCats();
  }, []);

  const selectedParent =
    existingCategories.find((c) => c._id === form.parentId) || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      return toast.error("Vui lòng nhập tên danh mục");
    }

    try {
      setIsSubmitting(true);

      // 1. Tạo danh mục mới
      const createPayload = {
        name: form.name.trim(),
        description: form.description.trim(),
        isActive: form.isActive,
        childrenIds: [], // Luôn là rỗng khi mới tạo
      };

      const createRes = await createCategoryApi(createPayload);
      const newCategory = createRes?.data?.data || createRes?.data;
      const newId = newCategory?._id;

      if (!newId) {
        throw new Error("Không lấy được ID của danh mục mới");
      }

      // 2. Cập nhật danh mục cha (NẾU CÓ)
      if (form.parentId) {
        const parentDoc = existingCategories.find(
          (c) => c._id === form.parentId,
        );

        if (parentDoc) {
          // FIX LỖI: Đảm bảo tất cả phần tử trong mảng cũ đều được chuyển về String ID
          const currentChildrenIds = (parentDoc.childrenIds || [])
            .map((item) => {
              // Nếu là string thì giữ nguyên, nếu là object thì lấy field ID
              if (typeof item === "string") return item;
              return item?.categoryId || item?._id;
            })
            .filter(Boolean); // Loại bỏ các giá trị undefined/null

          // Thêm ID mới vào và loại bỏ trùng lặp (nếu có)
          const updatedChildren = Array.from(
            new Set([...currentChildrenIds, newId]),
          );

          console.log("Dữ liệu gửi lên để cập nhật cha:", updatedChildren);

          await updateCategoryApi(form.parentId, {
            childrenIds: updatedChildren,
          });
        }
      }

      toast.success("Thêm và liên kết danh mục thành công!");
      router.push("/admin-categories");
      router.refresh(); // Làm mới dữ liệu trang danh sách
    } catch (err) {
      console.error("Lỗi:", err);
      const errorMsg = err.response?.data?.message || "Lỗi khi lưu dữ liệu";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
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
              Thêm Danh Mục
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" /> Sử dụng cơ chế Child-Referencing
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => router.back()}>
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 text-white min-w-35 shadow-lg shadow-orange-200"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Lưu danh mục
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <Card className="border-orange-100 shadow-sm">
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
                  placeholder="Ví dụ: Đồ gia dụng, Điện tử..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-11 focus-visible:ring-orange-500 border-zinc-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-zinc-700">Mô tả</Label>
                <Input
                  placeholder="Mô tả ngắn gọn..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="h-11 border-zinc-200"
                />
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-zinc-700">
                  Vị trí trong cây danh mục
                </Label>
                <div className="border rounded-xl overflow-hidden divide-y bg-white shadow-inner max-h-72 overflow-y-auto">
                  <div
                    onClick={() => setForm({ ...form, parentId: null })}
                    className={cn(
                      "flex items-center gap-4 p-4 cursor-pointer transition-all",
                      form.parentId === null
                        ? "bg-orange-50 border-l-4 border-l-orange-500"
                        : "hover:bg-zinc-50",
                    )}
                  >
                    <RadioDot selected={form.parentId === null} />
                    <div className="flex-1">
                      <p
                        className={cn(
                          "text-sm font-bold",
                          form.parentId === null
                            ? "text-orange-700"
                            : "text-zinc-700",
                        )}
                      >
                        Danh mục gốc (Root)
                      </p>
                    </div>
                  </div>

                  {existingCategories.map((cat) => (
                    <div
                      key={cat._id}
                      onClick={() => setForm({ ...form, parentId: cat._id })}
                      className={cn(
                        "flex items-center gap-4 p-4 cursor-pointer transition-all",
                        form.parentId === cat._id
                          ? "bg-orange-50 border-l-4 border-l-orange-500"
                          : "hover:bg-zinc-50",
                      )}
                    >
                      <RadioDot selected={form.parentId === cat._id} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-zinc-700">
                          {cat.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono italic">
                          {cat._id}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-zinc-100 text-zinc-500 uppercase">
                        {cat.childrenIds?.length || 0} Children
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="text-sm text-amber-900">
              <p className="font-bold">Lưu ý về đồng bộ dữ liệu:</p>
              <p className="opacity-80">
                Hệ thống thực hiện cập nhật mảng <code>childrenIds</code> dạng
                chuỗi (String) để đảm bảo tính toàn vẹn của API.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <Label className="font-bold">Kích hoạt</Label>
                <p className="text-[11px] text-muted-foreground">
                  Hiển thị trên Website
                </p>
              </div>
              <Switch
                checked={form.isActive}
                onCheckedChange={(val) => setForm({ ...form, isActive: val })}
              />
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 text-white border-none shadow-xl">
            <CardHeader className="pb-2 border-b border-zinc-800">
              <CardTitle className="text-[10px] uppercase tracking-widest text-zinc-500">
                Cấu trúc hiển thị
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-zinc-400">
                  <FolderTree className="h-4 w-4" />
                  <span className="text-xs">
                    {selectedParent?.name || "Root System"}
                  </span>
                </div>
                <div className="ml-6 border-l border-orange-500/50 pl-4 py-1">
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded p-2 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-orange-500" />
                    <span className="text-sm font-medium text-orange-100">
                      {form.name || "Tên danh mục..."}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RadioDot({ selected }) {
  return (
    <div
      className={cn(
        "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
        selected
          ? "border-orange-500 bg-orange-500"
          : "border-zinc-300 bg-white",
      )}
    >
      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  );
}
