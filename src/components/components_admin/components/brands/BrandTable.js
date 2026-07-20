"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Globe, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function BrandTable({ brands = [], onDeleteClick }) {
  const [hoveredRow, setHoveredRow] = useState(null);

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/75 text-xs uppercase tracking-widest text-zinc-500">
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
              <td colSpan={5} className="px-6 py-16 text-center text-zinc-400">
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
                className="border-b border-zinc-100 transition-colors hover:bg-zinc-50/80"
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
                        className="h-10 w-10 rounded-lg object-contain bg-zinc-50 border border-zinc-100 p-1"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-10 w-10 rounded-lg bg-zinc-100 items-center justify-center text-zinc-600 text-xs font-bold border border-zinc-200 ${brand.logo ? "hidden" : "flex"}`}
                    >
                      {brand.name?.charAt(0)?.toUpperCase()}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-zinc-900">
                    {brand.name}
                  </span>
                  {brand.slug && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      /{brand.slug}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-zinc-600 max-w-xs">
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
                      className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 hover:underline transition-colors text-xs font-medium"
                    >
                      <Globe size={13} />
                      <span className="max-w-30 truncate">
                        {brand.website.replace(/^https?:\/\//, "")}
                      </span>
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="text-zinc-300">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin-brands/update?id=${brand._id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300 transition-all"
                    >
                      <Pencil size={12} />
                      Sửa
                    </Link>
                    <button
                      onClick={() => onDeleteClick?.(brand)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 hover:border-red-300 transition-all"
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
