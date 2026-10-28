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
    <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-card rounded-b-2xl">
      <Button
        variant="outline"
        type="button"
        onClick={() => router.push(cancelHref)}
        className="border-border bg-white text-[var(--foreground)]/70 hover:bg-border hover:text-[var(--foreground)]"
      >
        Huỷ
      </Button>

      <Button
        variant="default"
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="flex items-center gap-1.5 bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary))]/90"
      >
        <Package size={14} />
        {loading ? "Đang tạo..." : "Tạo box"}
      </Button>
    </div>
  );
}
