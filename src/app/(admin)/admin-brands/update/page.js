"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Tag,
  FileText,
  ImageIcon,
  Save,
  Pencil,
  Loader2,
} from "lucide-react";
import {
  getAllBrandsApi,
  updateBrandApi,
} from "@/app/services/api/productServices";
import Image from "next/image";

function FormField({ label, icon: Icon, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
        {Icon && <Icon size={14} className="text-zinc-500" />}
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// 1. Tách logic chính vào Component này
function UpdateBrandContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = searchParams.get("id");

  const [form, setForm] = useState({ name: "", description: "", logo: "" });
  const [original, setOriginal] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!brandId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    const loadBrand = async () => {
      try {
        const res = await getAllBrandsApi();
        const brands = res?.brands || res?.data || res || [];
        const brand = brands.find((b) => b._id === brandId);
        if (!brand) {
          setNotFound(true);
        } else {
          setOriginal(brand);
          setForm({
            name: brand.name || "",
            description: brand.description || "",
            logo: brand.logo || "",
          });
        }
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    loadBrand();
  }, [brandId]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Tên thương hiệu không được để trống.";
    if (form.logo && !/^https?:\/\/.+/.test(form.logo))
      e.logo = "URL logo không hợp lệ.";
    return e;
  };

  const isDirty =
    form.name !== (original?.name || "") ||
    form.description !== (original?.description || "") ||
    form.logo !== (original?.logo || "");

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        logo: form.logo.trim(),
      };
      await updateBrandApi(brandId, payload);
      setSuccess(true);
      setTimeout(() => router.push("/admin-brands"), 1500);
    } catch (err) {
      const msg = err?.response?.data?.message || "Cập nhật thất bại.";
      setErrors({ submit: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-zinc-950 text-center px-4">
        <span className="text-5xl">🔍</span>
        <h2 className="text-xl font-semibold text-white">
          Không tìm thấy thương hiệu
        </h2>
        <p className="text-sm text-zinc-500">
          ID không hợp lệ hoặc thương hiệu đã bị xóa.
        </p>
        <Link
          href="/admin-brands/"
          className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-3xl text-emerald-500">
            ✓
          </div>
          <p className="text-lg font-semibold text-white">
            Cập nhật thành công!
          </p>
          <p className="text-sm text-zinc-500">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href="/admin-brands/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Quay lại danh sách
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
            <Pencil size={18} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cập nhật thương hiệu</h1>
            <p className="text-sm text-zinc-500">
              Đang chỉnh sửa:{" "}
              <span className="text-white font-medium">{original?.name}</span>
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 flex flex-col gap-5">
          {errors.submit && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
              {errors.submit}
            </div>
          )}

          <FormField label="Tên thương hiệu" icon={Tag} error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              className={`rounded-xl border bg-zinc-800/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                errors.name
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-zinc-700 focus:border-amber-500 focus:ring-amber-500/30"
              }`}
            />
          </FormField>

          <FormField label="Mô tả" icon={FileText} error={errors.description}>
            <textarea
              rows={3}
              value={form.description}
              onChange={handleChange("description")}
              className="rounded-xl border border-zinc-700 bg-zinc-800/60 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30 resize-none transition-all"
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
                  ? "border-red-500 focus:ring-red-500/30"
                  : "border-zinc-700 focus:border-amber-500 focus:ring-amber-500/30"
              }`}
            />
            {form.logo && !errors.logo && (
              <div className="mt-2 flex items-center gap-3 rounded-lg bg-zinc-800 p-2">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-white p-0.5">
                  <Image
                    src={form.logo}
                    alt="Logo preview"
                    fill
                    className="object-contain"
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </div>
                <span className="text-xs text-zinc-400">Preview logo</span>
              </div>
            )}
          </FormField>

          <div className="flex gap-3 pt-2 border-t border-zinc-800">
            <Link
              href="/admin-brands/"
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-center text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Hủy
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isDirty}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>

          {!isDirty && (
            <p className="text-center text-xs text-zinc-600">
              Chưa có thay đổi nào
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UpdateBrandPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      }
    >
      <UpdateBrandContent />
    </Suspense>
  );
}
