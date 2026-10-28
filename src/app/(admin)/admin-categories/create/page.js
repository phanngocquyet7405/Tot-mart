"use client";

import React from "react";
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
import { useCreateCategory } from "../hooks/useCreateCategory";

export default function AddCategoryPage() {
  const router = useRouter();
  const {
    form,
    updateField,
    existingCategories,
    selectedParent,
    isSubmitting,
    handleSubmit,
  } = useCreateCategory();

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
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
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
            className="bg-warning-text hover:bg-warning-text text-white min-w-35 shadow-sm"
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
          <Card className="border-warning/20 shadow-sm">
            <CardHeader className="bg-warning/10/30 border-b">
              <CardTitle className="text-lg flex items-center gap-2 text-warning-text">
                <LayoutGrid className="h-5 w-5 text-warning-text" />
                Cấu hình thuộc tính
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="font-bold text-foreground">
                  Tên danh mục <span className="text-destructive-text">*</span>
                </Label>
                <Input
                  placeholder="Ví dụ: Đồ gia dụng, Điện tử..."
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="h-11 focus-visible:ring-primary border-border"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-foreground">Mô tả</Label>
                <Input
                  placeholder="Mô tả ngắn gọn..."
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="h-11 border-border"
                />
              </div>

              <div className="space-y-3">
                <Label className="font-bold text-foreground">
                  Vị trí trong cây danh mục
                </Label>
                <div className="border rounded-xl overflow-hidden divide-y bg-white shadow-inner max-h-72 overflow-y-auto">
                  <div
                    onClick={() => updateField("parentId", null)}
                    className={cn(
                      "flex items-center gap-4 p-4 cursor-pointer transition-all",
                      form.parentId === null
                        ? "bg-warning/10 border-l-4 border-l-primary"
                        : "hover:bg-muted/30",
                    )}
                  >
                    <RadioDot selected={form.parentId === null} />
                    <div className="flex-1">
                      <p
                        className={cn(
                          "text-sm font-bold",
                          form.parentId === null
                            ? "text-warning-text"
                            : "text-foreground",
                        )}
                      >
                        Danh mục gốc (Root)
                      </p>
                    </div>
                  </div>

                  {existingCategories.map((cat) => (
                    <div
                      key={cat._id}
                      onClick={() => updateField("parentId", cat._id)}
                      className={cn(
                        "flex items-center gap-4 p-4 cursor-pointer transition-all",
                        form.parentId === cat._id
                          ? "bg-warning/10 border-l-4 border-l-primary"
                          : "hover:bg-muted/30",
                      )}
                    >
                      <RadioDot selected={form.parentId === cat._id} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {cat.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono italic">
                          {cat._id}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-1 rounded bg-muted text-muted-foreground uppercase">
                        {cat.childrenIds?.length || 0} Children
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-warning/10 border border-warning/20 p-4 rounded-xl flex gap-3">
            <AlertTriangle className="h-5 w-5 text-warning-text shrink-0" />
            <div className="text-sm text-warning-text">
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
                onCheckedChange={(val) => updateField("isActive", val)}
              />
            </CardContent>
          </Card>

          <Card className="bg-card text-white border-none shadow-xl">
            <CardHeader className="pb-2 border-b border-border">
              <CardTitle className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Cấu trúc hiển thị
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FolderTree className="h-4 w-4" />
                  <span className="text-xs">
                    {selectedParent?.name || "Root System"}
                  </span>
                </div>
                <div className="ml-6 border-l border-primary/50 pl-4 py-1">
                  <div className="bg-warning-text/10 border border-primary/30 rounded p-2 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-warning-text" />
                    <span className="text-sm font-medium text-primary">
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
          ? "border-primary bg-primary"
          : "border-border bg-white",
      )}
    >
      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  );
}
