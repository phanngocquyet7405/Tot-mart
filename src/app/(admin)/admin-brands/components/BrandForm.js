"use client";

import { useRef } from "react";
import Image from "next/image";
import { Tag, FileText, MapPin, ImageIcon, Upload, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RichTextEditor from "../../components/ui/RichTextEditor";

/**
 * Form dùng chung cho trang tạo và cập nhật thương hiệu.
 * `existingLogoUrl`: logo hiện tại (chỉ có khi update) — hiển thị nếu người dùng
 * chưa chọn ảnh mới. `logoPreview`: object URL của file mới chọn (ưu tiên hiển thị).
 */
export default function BrandForm({
  form,
  errors,
  updateField,
  logoPreview,
  existingLogoUrl,
  onLogoChange,
  onClearLogo,
  isSubmitting,
  submitLabel,
  submittingLabel,
  onSubmit,
  onCancel,
}) {
  const fileInputRef = useRef(null);
  const displayedLogo = logoPreview || existingLogoUrl;

  return (
    <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-4">
        <Card className="border-orange-100 shadow-sm">
          <CardHeader className="bg-orange-50/30 border-b">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
              <Tag className="h-5 w-5 text-orange-600" />
              Thông tin thương hiệu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            {errors.submit && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {errors.submit}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="brand-name">
                Tên thương hiệu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="brand-name"
                placeholder="VD: Nike, Adidas..."
                value={form.name}
                onChange={updateField("name")}
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Địa chỉ / khu vực
              </Label>
              <Input
                placeholder="VD: Hà Nội, Việt Nam"
                value={form.cityAddress}
                onChange={updateField("cityAddress")}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                Mô tả
              </Label>
              <RichTextEditor
                value={form.description}
                onChange={updateField("description")}
                placeholder="Mô tả ngắn về thương hiệu..."
                minHeight={140}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card className="border-orange-100 shadow-sm">
          <CardHeader className="bg-orange-50/30 border-b">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
              <ImageIcon className="h-5 w-5 text-orange-600" />
              Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div
              className="relative flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-orange-200 bg-orange-50/30 overflow-hidden cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {displayedLogo ? (
                <>
                  <Image
                    src={displayedLogo}
                    alt="Logo preview"
                    fill
                    unoptimized
                    className="object-contain p-3"
                  />
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClearLogo();
                      }}
                      className="absolute right-2 top-2 rounded-full bg-white/90 p-1 shadow hover:bg-white"
                    >
                      <X size={14} />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">Chọn ảnh logo</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => onLogoChange(e.target.files?.[0])}
            />
            <p className="text-xs text-muted-foreground">
              JPEG, PNG hoặc WebP — tối đa 2MB.
            </p>
            {errors.logo && (
              <p className="text-xs text-destructive">{errors.logo}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {submittingLabel}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
