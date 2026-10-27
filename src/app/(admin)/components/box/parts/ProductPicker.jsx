"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Search, ChevronDown, Package } from "lucide-react";

const fmtPrice = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    val ?? 0,
  );

export function ProductPicker({ onSelect, availableProducts = [] }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = availableProducts.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 h-9 px-3 text-sm rounded-lg border border-input bg-white hover:bg-slate-50 text-slate-600 transition-colors w-full truncate focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
      >
        <Search size={14} className="text-slate-400 shrink-0" />
        <span className="truncate text-slate-500">Tìm và chọn sản phẩm...</span>
        <ChevronDown
          size={14}
          className={`ml-auto text-slate-400 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nhập tên sản phẩm..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                <Package size={24} className="mx-auto mb-2 opacity-40" />
                <p>Không tìm thấy sản phẩm</p>
              </div>
            ) : (
              filtered.map((p) => {
                const imgUrl =
                  Array.isArray(p.images) && p.images[0]?.url
                    ? p.images[0].url
                    : null;
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => {
                      onSelect(p);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left border-b border-slate-50 last:border-b-0"
                  >
                    <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 relative">
                      {imgUrl ? (
                        <Image
                          src={imgUrl}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={14} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                        {fmtPrice(p.price)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPicker;
