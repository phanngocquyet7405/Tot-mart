"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

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
      <nav className="flex mb-4 text-xs font-medium text-gray-500 dark:text-gray-400 gap-2 items-center">
        <Link href="/admin" className="hover:text-foreground">
          Admin
        </Link>
        <ChevronRight size={12} />
        <Link href="/admin-box" className="hover:text-foreground">
          Boxes
        </Link>
        <ChevronRight size={12} />
        <span className="text-foreground">Tạo mới</span>
      </nav>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </>
  );
}
