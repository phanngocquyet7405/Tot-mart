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
    <div className="px-6 py-4 border-t border-[#F0DDD5] flex items-center justify-between bg-[#FFFAF8] rounded-b-2xl">
      <Button
        variant="outline"
        type="button"
        onClick={() => router.push(cancelHref)}
        className="border-[#F0DDD5] bg-white text-[#2C1810]/70 hover:bg-[#F0DDD5] hover:text-[#2C1810]"
      >
        Huỷ
      </Button>

      <Button
        variant="default"
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="flex items-center gap-1.5 bg-[#C85C3C] text-white hover:bg-[#C85C3C]/90"
      >
        <Package size={14} />
        {loading ? "Đang tạo..." : "Tạo box"}
      </Button>
    </div>
  );
}
