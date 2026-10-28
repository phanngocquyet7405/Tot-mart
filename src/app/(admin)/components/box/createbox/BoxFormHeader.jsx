"use client";

import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";

/**
 * BoxFormHeader
 * Props:
 *  - title: string
 *  - subtitle: string
 */
export function BoxFormHeader({
  title = "Tạo Box mới",
  subtitle = "Điền thông tin để tạo một box sản phẩm mới",
}) {
  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex mb-4 text-xs font-medium text-[var(--foreground)]/50 gap-2 items-center">
        <Link href="/admin" className="hover:text-[var(--foreground)]">
          Admin
        </Link>
        <ChevronRight size={12} />
        <Link href="/admin-box" className="hover:text-[var(--foreground)]">
          Boxes
        </Link>
        <ChevronRight size={12} />
        <span className="text-[var(--foreground)]">Tạo mới</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20">
          <Package size={18} className="text-[hsl(var(--primary))]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {title}
          </h1>
          <p className="text-sm text-[var(--foreground)]/50">{subtitle}</p>
        </div>
      </div>
    </>
  );
}
