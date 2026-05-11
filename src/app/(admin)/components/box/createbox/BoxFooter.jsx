"use client";

import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * FormFooter
 *
 * Props:
 *  - loading: boolean
 *  - cancelHref: string  (đường dẫn khi bấm Huỷ, mặc định "/admin/boxes")
 *  - onSubmit(): void
 */
export function FormFooter({
  loading = false,
  cancelHref = "/admin-box",
  onSubmit,
}) {
  const router = useRouter();

  return (
    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/20 rounded-b-xl">
      <Button
        variant="outline"
        type="button"
        onClick={() => router.push(cancelHref)}
      >
        Huỷ
      </Button>

      <Button
        variant="default"
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="flex items-center gap-1.5"
      >
        <Package size={14} />
        {loading ? "Đang tạo..." : "Tạo box"}
      </Button>
    </div>
  );
}
