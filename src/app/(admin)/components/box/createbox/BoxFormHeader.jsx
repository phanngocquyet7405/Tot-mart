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
      <nav className="flex mb-4 text-xs font-medium text-[#2C1810]/50 gap-2 items-center">
        <Link href="/admin" className="hover:text-[#2C1810]">
          Admin
        </Link>
        <ChevronRight size={12} />
        <Link href="/admin-box" className="hover:text-[#2C1810]">
          Boxes
        </Link>
        <ChevronRight size={12} />
        <span className="text-[#2C1810]">Tạo mới</span>
      </nav>

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C85C3C]/10 border border-[#C85C3C]/20">
          <Package size={18} className="text-[#C85C3C]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2C1810]">
            {title}
          </h1>
          <p className="text-sm text-[#2C1810]/50">{subtitle}</p>
        </div>
      </div>
    </>
  );
}
