"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateBrand } from "../hooks/useUpdateBrand";
import BrandForm from "../components/BrandForm";

function UpdateBrandContent() {
  const router = useRouter();
  const {
    original,
    form,
    errors,
    updateField,
    logoPreview,
    handleLogoChange,
    clearNewLogo,
    isLoading,
    notFound,
    isDirty,
    isSubmitting,
    handleSubmit,
  } = useUpdateBrand();

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-5xl">🔍</span>
        <h2 className="text-xl font-semibold text-zinc-800">
          Không tìm thấy thương hiệu
        </h2>
        <p className="text-sm text-muted-foreground">
          ID không hợp lệ hoặc thương hiệu đã bị xóa.
        </p>
        <Link href="/admin-brands">
          <Button className="bg-orange-600 hover:bg-orange-700">
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl p-6 space-y-6">
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
            Cập nhật thương hiệu
          </h1>
          <p className="text-sm text-muted-foreground">
            Đang chỉnh sửa:{" "}
            <span className="font-medium text-zinc-700">{original?.name}</span>
          </p>
        </div>
      </div>

      <BrandForm
        form={form}
        errors={errors}
        updateField={updateField}
        logoPreview={logoPreview}
        existingLogoUrl={original?.logo}
        onLogoChange={handleLogoChange}
        onClearLogo={clearNewLogo}
        isSubmitting={isSubmitting}
        submitLabel="Lưu thay đổi"
        submittingLabel="Đang lưu..."
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin-brands")}
      />

      {!isDirty && (
        <p className="text-center text-xs text-muted-foreground">
          Chưa có thay đổi nào
        </p>
      )}
    </div>
  );
}

export default function UpdateBrandPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <UpdateBrandContent />
    </Suspense>
  );
}
