/**
 * SubscriberTable.js
 * Bảng hiển thị danh sách người đăng ký với pagination + row click mở detail
 */

"use client";

import { useState } from "react";
import { Eye, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { SubscriberStatusBadge } from "./Subscriberstatusbadge";
import { formatCurrency, PLAN_TYPE_LABELS } from "@/app/util/formatter";

const PAGE_SIZE = 10;

function EmptyRow() {
  return (
    <tr>
      <td colSpan={7} className="py-20 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center">
            <Package size={24} className="text-stone-300" />
          </div>
          <p className="text-sm font-semibold text-stone-400">
            Không có dữ liệu
          </p>
          <p className="text-xs text-stone-300">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      </td>
    </tr>
  );
}

export function SubscriberTable({ subscriptions, onViewDetail }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(subscriptions.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const paginated = subscriptions.slice(start, start + PAGE_SIZE);

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  // Reset về page 1 khi list thay đổi
  const safeSetPage = (p) => setPage(Math.min(p, Math.max(totalPages, 1)));

  return (
    <div className="flex flex-col gap-0 bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              <th className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-stone-400">
                #
              </th>
              <th className="text-left px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-stone-400">
                Người dùng
              </th>
              <th className="text-left px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-stone-400">
                Gói
              </th>
              <th className="text-left px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-stone-400">
                Trạng thái
              </th>
              <th className="text-left px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-stone-400">
                Giao tiếp theo
              </th>
              <th className="text-right px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-stone-400">
                Giá
              </th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {paginated.length === 0 ? (
              <EmptyRow />
            ) : (
              paginated.map((sub, idx) => (
                <tr
                  key={sub._id}
                  className="hover:bg-stone-50 transition-colors group cursor-pointer"
                  onClick={() => onViewDetail(sub)}
                >
                  {/* # */}
                  <td className="px-5 py-4">
                    <span className="text-[11px] font-mono text-stone-400">
                      {start + idx + 1}
                    </span>
                  </td>

                  {/* User */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar placeholder */}
                      <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#F0DDD5] to-[#C85C3C]/30 flex items-center justify-center shrink-0 text-[11px] font-black text-[#C85C3C]">
                        {sub.userId?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-800 leading-tight">
                          {sub.userId?.name ?? "—"}
                        </p>
                        <p className="text-[10px] text-stone-400 leading-tight">
                          {sub.userId?.email ?? "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Plan */}
                  <td className="px-4 py-4">
                    <div>
                      <p className="text-xs font-semibold text-stone-700">
                        {sub.templateId?.name ?? "—"}
                      </p>
                      <p className="text-[10px] text-stone-400">
                        {PLAN_TYPE_LABELS[sub.planType] ?? sub.planType}
                        {" · "}
                        {sub.remainDeliveries ?? 0}/{sub.totalDeliveries ?? 0}{" "}
                        lần
                      </p>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1">
                      <SubscriberStatusBadge status={sub.status} size="sm" />
                      {sub.cancelAtPeriodEnd && (
                        <span className="text-[9px] font-bold text-amber-600">
                          ⚠ Hủy cuối kỳ
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Next delivery */}
                  <td className="px-4 py-4">
                    <span className="text-xs text-stone-600">
                      {sub.nextDeliveries ? (
                        formatDate(sub.nextDeliveries)
                      ) : (
                        <span className="text-stone-300">—</span>
                      )}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-4 text-right">
                    <div>
                      <p className="text-xs font-black text-[#C85C3C]">
                        {formatCurrency(sub.price ?? 0)}
                      </p>
                      {sub.discountPercent > 0 && (
                        <p className="text-[9px] text-stone-400 line-through">
                          {formatCurrency(sub.oldPrice ?? 0)}
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail(sub);
                      }}
                      className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:text-[#C85C3C] hover:border-[#C85C3C]/30 hover:bg-[#FFF0EB] transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-5 py-3.5 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-400">
            Trang <span className="font-bold text-stone-600">{page}</span>
            {" / "}
            <span className="font-bold text-stone-600">{totalPages}</span>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => safeSetPage(page - 1)}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:border-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
              )
              .reduce((acc, p, i, arr) => {
                if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((item, i) =>
                item === "..." ? (
                  <span
                    key={`dots-${i}`}
                    className="text-xs text-stone-300 px-1"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => safeSetPage(item)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      page === item
                        ? "bg-[#C85C3C] text-white"
                        : "border border-stone-200 text-stone-600 hover:border-stone-300"
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}

            <button
              onClick={() => safeSetPage(page + 1)}
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:border-stone-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
