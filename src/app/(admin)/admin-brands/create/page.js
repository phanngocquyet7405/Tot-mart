"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreateBrand } from "../hooks/useCreateBrand";
import BrandForm from "../components/BrandForm";

export default function CreateBrandPage() {
  const router = useRouter();
  const {
    form,
    errors,
    updateField,
    logoPreview,
    handleLogoChange,
    clearLogo,
    isSubmitting,
    handleSubmit,
  } = useCreateBrand();

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
            Thêm thương hiệu
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Info className="h-3 w-3" /> Điền thông tin thương hiệu bên dưới
          </p>
        </div>
      </div>

      <BrandForm
        form={form}
        errors={errors}
        updateField={updateField}
        logoPreview={logoPreview}
        onLogoChange={handleLogoChange}
        onClearLogo={clearLogo}
        isSubmitting={isSubmitting}
        submitLabel="Tạo thương hiệu"
        submittingLabel="Đang tạo..."
        onSubmit={handleSubmit}
        onCancel={() => router.push("/admin-brands")}
      />
    </div>
  );
}
