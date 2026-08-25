"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategoryVisual } from "../../utils/catalogHelpers";

export default function CategoryDropdown({ root, columns, onMouseEnter, onMouseLeave }) {
  if (!root) return null;
  const { Icon, tintClass } = getCategoryVisual(root.name);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-0 top-full z-50 w-full border-t border-[#F0DDD5] bg-white shadow-xl"
    >
      <div className="mx-auto flex max-w-5xl gap-10 p-8">
        {/* Panel giới thiệu danh mục gốc */}
        <div className="w-56 shrink-0 border-r border-[#F0DDD5] pr-8">
          <span className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${tintClass}`}>
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="mb-1 font-serif text-lg font-bold text-[#2C1810]">{root.name}</h3>
          {root.description && (
            <p className="mb-4 line-clamp-3 text-xs leading-relaxed text-[#2C1810]/50">
              {root.description}
            </p>
          )}
          <Link
            href={`/categories/${root.slug || root._id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#C85C3C] hover:text-[#B14B2D]"
          >
            Xem tất cả
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Danh mục con */}
        {columns.length > 0 ? (
          <div className="grid flex-1 grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-8 gap-y-6">
            {columns.map((col, idx) => {
              const visual = getCategoryVisual(col.title);
              return (
                <div key={idx} className="space-y-3">
                  <Link
                    href={col.titleHref}
                    className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-[#2C1810] hover:text-[#C85C3C]"
                  >
                    <visual.Icon className="h-3.5 w-3.5 text-[#C85C3C]" />
                    {col.title}
                  </Link>
                  {col.links.length > 0 && (
                    <ul className="space-y-1.5">
                      {col.links.map((link, lIdx) => (
                        <li key={lIdx}>
                          <Link
                            href={link.href}
                            className="text-[13px] text-[#2C1810]/50 transition-colors hover:text-[#C85C3C]"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-1 items-center text-sm text-[#2C1810]/40">
            Chưa có danh mục con nào.
          </div>
        )}
      </div>
    </div>
  );
}
