"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, Globe, FileText, ImageIcon, Plus } from "lucide-react";
import { createBrandApi } from "@/app/services/api/productServices";
import RichTextEditor from "../../components/ui/RichTextEditor";

function FormField({ label, icon: Icon, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-sm font-medium text-[#2C1810]/80">
        {Icon && <Icon size={14} className="text-[#2C1810]/40" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export default function CreateBrandPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    logo: "",
    website: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Tên thương hiệu là bắt buộc.";
    if (form.website && !/^https?:\/\/.+/.test(form.website))
      e.website = "URL website phải bắt đầu bằng http:// hoặc https://";
    if (form.logo && !/^https?:\/\/.+/.test(form.logo))
      e.logo = "URL logo phải bắt đầu bằng http:// hoặc https://";
    return e;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      const payload = {};
      if (form.name) payload.name = form.name.trim();
      if (form.description) payload.description = form.description.trim();
      if (form.logo) payload.logo = form.logo.trim();
      if (form.website) payload.website = form.website.trim();

      await createBrandApi(payload);
      setSuccess(true);
      setTimeout(() => router.push("/admin-brands"), 1500);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Tạo thương hiệu thất bại. Vui lòng thử lại.";
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (eOrValue) => {
    const value =
      eOrValue && typeof eOrValue === "object" && "target" in eOrValue
        ? eOrValue.target.value
        : eOrValue;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFAF8]">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-3xl">
            ✓
          </div>
          <p className="text-lg font-semibold text-[#2C1810]">
            Tạo thương hiệu thành công!
          </p>
          <p className="text-sm text-[#2C1810]/50">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFAF8] text-[#2C1810]">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href="/admin-brands"
          className="inline-flex items-center gap-2 text-sm text-[#2C1810]/50 hover:text-[#2C1810] transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Quay lại danh sách
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C85C3C]/10 border border-[#C85C3C]/20">
            <Plus size={18} className="text-[#C85C3C]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#2C1810]">
              Tạo thương hiệu mới
            </h1>
            <p className="text-sm text-[#2C1810]/50">
              Điền thông tin thương hiệu bên dưới
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#F0DDD5] bg-white p-6 flex flex-col gap-5">
          {errors.submit && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {errors.submit}
            </div>
          )}

          <FormField
            label="Tên thương hiệu"
            icon={Tag}
            required
            error={errors.name}
          >
            <input
              type="text"
              placeholder="VD: Nike, Adidas..."
              value={form.name}
              onChange={handleChange("name")}
              className={`rounded-xl border bg-[#FFFAF8] px-4 py-2.5 text-sm text-[#2C1810] placeholder:text-[#2C1810]/30 focus:outline-none focus:ring-1 transition-all ${
                errors.name
                  ? "border-red-400 focus:border-red-400 focus:ring-red-400/30"
                  : "border-[#F0DDD5] focus:border-[#C85C3C] focus:ring-[#C85C3C]/30"
              }`}
            />
          </FormField>

          <FormField label="Mô tả" icon={FileText}>
            <RichTextEditor
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Mô tả ngắn về thương hiệu..."
              minHeight={140}
              error={errors.description}
            />
          </FormField>

          <FormField label="URL Logo" icon={ImageIcon} error={errors.logo}>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={form.logo}
              onChange={handleChange("logo")}
              className={`rounded-xl border bg-[#FFFAF8] px-4 py-2.5 text-sm text-[#2C1810] placeholder:text-[#2C1810]/30 focus:outline-none focus:ring-1 transition-all ${
                errors.logo
                  ? "border-red-400 focus:border-red-400 focus:ring-red-400/30"
                  : "border-[#F0DDD5] focus:border-[#C85C3C] focus:ring-[#C85C3C]/30"
              }`}
            />
            {form.logo && !errors.logo && (
              <div className="mt-2 flex items-center gap-3 rounded-lg bg-[#F0DDD5]/40 p-2">
                {/* Dùng thẻ img truyền thống để tránh lỗi Hostname không cấu hình */}
                <Image
                  src={form.logo}
                  alt="Logo preview"
                  width={16}
                  height={16}
                  className="h-10 w-10 rounded object-contain bg-white p-0.5"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span className="text-xs text-[#2C1810]/50">Preview logo</span>
              </div>
            )}
          </FormField>

          <FormField label="Website" icon={Globe} error={errors.website}>
            <input
              type="url"
              placeholder="https://nike.com"
              value={form.website}
              onChange={handleChange("website")}
              className={`rounded-xl border bg-[#FFFAF8] px-4 py-2.5 text-sm text-[#2C1810] placeholder:text-[#2C1810]/30 focus:outline-none focus:ring-1 transition-all ${
                errors.website
                  ? "border-red-400 focus:border-red-400 focus:ring-red-400/30"
                  : "border-[#F0DDD5] focus:border-[#C85C3C] focus:ring-[#C85C3C]/30"
              }`}
            />
          </FormField>

          <div className="flex gap-3 pt-2 border-t border-[#F0DDD5]">
            <Link
              href="/admin-brands"
              className="flex-1 rounded-xl border border-[#F0DDD5] bg-[#FFFAF8] px-4 py-2.5 text-center text-sm font-medium text-[#2C1810]/70 hover:bg-[#F0DDD5] hover:text-[#2C1810] transition-colors"
            >
              Hủy
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#C85C3C] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#C85C3C]/90 transition-colors disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Tạo thương hiệu
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
