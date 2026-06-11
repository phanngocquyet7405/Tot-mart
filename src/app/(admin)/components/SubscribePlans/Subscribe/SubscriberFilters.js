/**
 * SubscriberFilters.js
 * Thanh tìm kiếm + bộ lọc trạng thái, gói, sắp xếp cho Admin
 */

"use client";

import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { PLAN_TYPE_LABELS } from "@/app/util/formatter";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "cancelled", label: "Đã hủy" },
  { value: "paused", label: "Tạm dừng" },
  { value: "completed", label: "Hoàn thành" },
];

const PLAN_OPTIONS = [
  { value: "all", label: "Tất cả gói" },
  ...Object.entries(PLAN_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "oldest", label: "Cũ nhất" },
  { value: "price_desc", label: "Giá cao → thấp" },
  { value: "price_asc", label: "Giá thấp → cao" },
];

export function SubscriberFilters({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  planFilter,
  setPlanFilter,
  sortBy,
  setSortBy,
  totalCount,
  filteredCount,
}) {
  const hasActiveFilter =
    searchQuery ||
    statusFilter !== "all" ||
    planFilter !== "all" ||
    sortBy !== "newest";

  const clearAll = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPlanFilter("all");
    setSortBy("newest");
  };

  return (
    <div className="space-y-3">
      {/* Search + Result count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Tìm theo tên, email, mã đăng ký..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-stone-200 bg-white focus:outline-none focus:border-[#C85C3C] focus:ring-2 focus:ring-[#C85C3C]/10 transition-all placeholder:text-stone-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <span className="text-xs text-stone-500 whitespace-nowrap shrink-0">
          <span className="font-bold text-stone-700">{filteredCount}</span>
          {filteredCount !== totalCount && <> / {totalCount}</>} kết quả
        </span>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={13} className="text-stone-400 shrink-0" />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#C85C3C] transition-colors cursor-pointer"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="text-xs px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#C85C3C] transition-colors cursor-pointer"
        >
          {PLAN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown size={12} className="text-stone-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:border-[#C85C3C] transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilter && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-[#C85C3C] hover:text-[#B14B2D] font-semibold transition-colors px-2 py-2 rounded-lg hover:bg-[#C85C3C]/5"
          >
            <X size={12} />
            Xóa lọc
          </button>
        )}
      </div>
    </div>
  );
}
