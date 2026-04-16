"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Tag, Globe, FileText, ImageIcon, Plus } from "lucide-react";
import { createBrandApi } from "@/app/services/api/productServices";
import Image from "next/image";

function FormField({ label, icon: Icon, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
        {Icon && <Icon size={14} className="text-zinc-500" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
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
      setTimeout(() => router.push("/admin-brands/create"), 1500);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Tạo thương hiệu thất bại. Vui lòng thử lại.";
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-3xl">
            ✓
          </div>
          <p className="text-lg font-semibold text-white">
            Tạo thương hiệu thành công!
          </p>
          <p className="text-sm text-zinc-500">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {/* Back */}
        <Link
          href="/admin/brands"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Quay lại danh sách
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <Plus size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Tạo thương hiệu mới</h1>
            <p className="text-sm text-zinc-500">
              Điền thông tin thương hiệu bên dưới
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-5">
          {errors.submit && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
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
              className={`rounded-xl border bg-zinc-800/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                errors.name
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                  : "border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500/30"
              }`}
            />
          </FormField>

          <FormField label="Mô tả" icon={FileText} error={errors.description}>
            <textarea
              placeholder="Mô tả ngắn về thương hiệu..."
              rows={3}
              value={form.description}
              onChange={handleChange("description")}
              className="rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 resize-none transition-all"
            />
          </FormField>

          <FormField label="URL Logo" icon={ImageIcon} error={errors.logo}>
            <input
              type="url"
              placeholder="https://example.com/logo.png"
              value={form.logo}
              onChange={handleChange("logo")}
              className={`rounded-xl border bg-zinc-800/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                errors.logo
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                  : "border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500/30"
              }`}
            />
            {form.logo && !errors.logo && (
              <div className="mt-2 flex items-center gap-3 rounded-lg bg-zinc-800 p-2">
                <Image
                  src={form.logo}
                  alt="Logo preview"
                  className="h-10 w-10 rounded object-contain bg-white p-0.5"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <span className="text-xs text-zinc-400">Preview logo</span>
              </div>
            )}
          </FormField>

          <FormField label="Website" icon={Globe} error={errors.website}>
            <input
              type="url"
              placeholder="https://nike.com"
              value={form.website}
              onChange={handleChange("website")}
              className={`rounded-xl border bg-zinc-800/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                errors.website
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                  : "border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500/30"
              }`}
            />
          </FormField>

          <div className="flex gap-3 pt-2 border-t border-zinc-800">
            <Link
              href="/admin/brands"
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-center text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Hủy
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-60"
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
