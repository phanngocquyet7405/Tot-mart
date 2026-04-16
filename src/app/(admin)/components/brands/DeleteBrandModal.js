"use client";

import { AlertTriangle, X } from "lucide-react";

export default function DeleteBrandModal({
  brand,
  onConfirm,
  onCancel,
  isLoading,
}) {
  if (!brand) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={24} className="text-red-400" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              Xóa thương hiệu?
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">
              Bạn sắp xóa thương hiệu{" "}
              <span className="font-semibold text-white">`{brand.name}`</span>.
              Hành động này không thể hoàn tác.
            </p>
          </div>

          <div className="flex w-full gap-3 pt-2">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={() => onConfirm(brand._id)}
              disabled={isLoading}
              className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Đang xóa...
                </>
              ) : (
                "Xác nhận xóa"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
