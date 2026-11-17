"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Globe, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function BrandTable({ brands = [], onDeleteClick }) {
  const [hoveredRow, setHoveredRow] = useState(null);

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30 text-xs uppercase tracking-widest text-muted-foreground">
            <th className="px-6 py-4 text-left font-semibold">Logo</th>
            <th className="px-6 py-4 text-left font-semibold">
              Tên thương hiệu
            </th>
            <th className="px-6 py-4 text-left font-semibold">Mô tả</th>
            <th className="px-6 py-4 text-left font-semibold">Website</th>
            <th className="px-6 py-4 text-right font-semibold">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {brands.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">🏷️</span>
                  <span>Chưa có thương hiệu nào</span>
                </div>
              </td>
            </tr>
          ) : (
            brands.map((brand) => (
              <tr
                key={brand._id}
                className="border-b border-border transition-colors hover:bg-muted/30"
                onMouseEnter={() => setHoveredRow(brand._id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-6 py-4">
                  <div className="relative h-10 w-10 flex items-center justify-center">
                    {brand.logo ? (
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        className="h-10 w-10 rounded-lg object-contain bg-muted/30 border border-border p-1"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-10 w-10 rounded-lg bg-muted items-center justify-center text-muted-foreground text-xs font-bold border border-border ${brand.logo ? "hidden" : "flex"}`}
                    >
                      {brand.name?.charAt(0)?.toUpperCase()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-foreground">
                    {brand.name}
                  </span>
                  {brand.slug && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      /{brand.slug}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-muted-foreground max-w-xs">
                  <span className="line-clamp-2">
                    {brand.description || "—"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {brand.website ? (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 hover:underline transition-colors text-xs font-medium"
                    >
                      <Globe size={13} />
                      <span className="max-w-30 truncate">
                        {brand.website.replace(/^https?:\/\//, "")}
                      </span>
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin-brands/update?id=${brand._id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/15 transition-all"
                    >
                      <Pencil size={12} />
                      Sửa
                    </Link>
                    <button
                      onClick={() => onDeleteClick?.(brand)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-1.5 text-xs font-medium text-destructive-text hover:bg-destructive/15 hover:border-destructive/30 transition-all"
                    >
                      <Trash2 size={12} />
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
