"use client";
/**
 * SubscriberFilters.js
 * Thanh tìm kiếm + bộ lọc trạng thái, gói, sắp xếp cho Admin
 */

import { Search, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder="Tìm theo tên, email, mã đăng ký..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 min-h-11 text-sm rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors min-h-9 min-w-9 flex items-center justify-center"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 self-center">
          <strong className="text-foreground tabular-nums">{filteredCount}</strong>
          {filteredCount !== totalCount && (
            <> / <span className="tabular-nums">{totalCount}</span></>
          )}{" "}
          kết quả
        </span>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal size={14} className="text-muted-foreground shrink-0" />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-3 min-h-11 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
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
          className="text-xs px-3 min-h-11 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
        >
          {PLAN_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1.5 ml-auto">
          <ArrowUpDown size={13} className="text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs px-3 min-h-11 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="min-h-11 gap-1 text-xs text-primary hover:text-primary/80 hover:bg-primary/10"
          >
            <X size={13} />
            Xóa lọc
          </Button>
        )}
      </div>
    </div>
  );
}
