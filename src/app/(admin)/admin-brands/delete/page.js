"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Trash2, Loader2 } from "lucide-react";
import {
  getAllBrandsApi,
  deleteBrandApi,
} from "@/app/services/api/productServices";
import Image from "next/image";

// 1. Component chứa logic chính
function DeleteBrandContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = searchParams.get("id");

  const [brand, setBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!brandId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    const load = async () => {
      try {
        const res = await getAllBrandsApi();
        const brands = res?.brands || res?.data || res || [];
        const found = brands.find((b) => b._id === brandId);
        if (!found) setNotFound(true);
        else setBrand(found);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [brandId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await deleteBrandApi(brandId);
      setDone(true);
      setTimeout(() => router.push("/admin-brands"), 2000);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Xóa thất bại. Vui lòng thử lại.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
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
          ID không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          href="/admin-brands"
          className="rounded-xl bg-zinc-800 border border-zinc-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-3xl text-emerald-500">
            ✓
          </div>
          <p className="text-lg font-semibold text-white">
            Đã xóa thương hiệu!
          </p>
          <p className="text-sm text-zinc-500">
            Đang chuyển hướng về danh sách...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <Link
          href="/admin-brands"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={15} />
          Quay lại danh sách
        </Link>

        <div className="rounded-2xl border border-red-500/20 bg-zinc-900/60 p-8">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
              <AlertTriangle size={28} className="text-red-400" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-white">Xóa thương hiệu</h1>
              <p className="mt-2 text-sm text-zinc-400">
                Bạn đang xóa thương hiệu{" "}
                <span className="font-semibold text-white">
                  `{brand?.name}`
                </span>
                . Hành động này{" "}
                <span className="text-red-400 font-medium">
                  không thể hoàn tác
                </span>
                .
              </p>
            </div>

            <div className="w-full rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 flex items-center gap-4 text-left">
              {brand?.logo ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white p-1">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-700 text-lg font-bold text-zinc-300">
                  {brand?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-white truncate">
                  {brand?.name}
                </p>
                {brand?.description && (
                  <p className="text-xs text-zinc-500 truncate mt-0.5">
                    {brand.description}
                  </p>
                )}
              </div>
            </div>

            {error && (
              <div className="w-full rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="flex w-full gap-3">
              <Link
                href="/admin-brands"
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-center text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              >
                Hủy
              </Link>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Xác nhận xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. Export mặc định kèm Suspense Boundary
export default function DeleteBrandPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        </div>
      }
    >
      <DeleteBrandContent />
    </Suspense>
  );
}
