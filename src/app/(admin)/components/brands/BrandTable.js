"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, Globe, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function BrandTable({ brands = [], onDeleteClick }) {
  const [hoveredRow, setHoveredRow] = useState(null);

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-xs uppercase tracking-widest text-zinc-500">
            <th className="px-6 py-4 text-left font-medium">Logo</th>
            <th className="px-6 py-4 text-left font-medium">Tên thương hiệu</th>
            <th className="px-6 py-4 text-left font-medium">Mô tả</th>
            <th className="px-6 py-4 text-left font-medium">Website</th>
            <th className="px-6 py-4 text-right font-medium">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {brands.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-16 text-center text-zinc-500">
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
                className="border-b border-zinc-800/50 transition-colors hover:bg-zinc-800/40"
                onMouseEnter={() => setHoveredRow(brand._id)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="px-6 py-4">
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="h-10 w-10 rounded-lg object-contain bg-white p-1"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`h-10 w-10 rounded-lg bg-zinc-700 items-center justify-center text-zinc-400 text-xs font-bold ${brand.logo ? "hidden" : "flex"}`}
                  >
                    {brand.name?.charAt(0)?.toUpperCase()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-white">{brand.name}</span>
                  {brand.slug && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      /{brand.slug}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-zinc-400 max-w-xs">
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
                      className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors text-xs"
                    >
                      <Globe size={13} />
                      <span className="max-w-30 truncate">
                        {brand.website.replace(/^https?:\/\//, "")}
                      </span>
                      <ExternalLink size={11} />
                    </a>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin-brands/update?id=${brand._id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-xs font-medium text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-all"
                    >
                      <Pencil size={12} />
                      Sửa
                    </Link>
                    <button
                      onClick={() => onDeleteClick?.(brand)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
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
