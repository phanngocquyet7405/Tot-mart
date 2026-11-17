"use client";
// components/SubscribePlans/DeleteTemplateDialog.jsx
// Xác nhận xoá một Subscription Template.
// Logic gọi API nằm ở page.js (onConfirm callback).

import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseDialog, BaseDialogFooter } from "./BaseDialog";

/**
 * DeleteTemplateDialog
 *
 * @param {boolean}  open
 * @param {function} onOpenChange  (false) => void
 * @param {object}   template      mẫu gói cần xoá
 * @param {function} onConfirm     () => void — page.js gọi API
 * @param {boolean}  isDeleting
 */
export function DeleteTemplateDialog({
  open,
  onOpenChange,
  template,
  onConfirm,
  isDeleting,
}) {
  if (!template) return null;

  return (
    <BaseDialog
      open={open}
      onOpenChange={onOpenChange}
      maxWidth="max-w-md"
      maxHeight="max-h-fit"
      closeOnOverlay={!isDeleting}
      showClose={false}
    >
      {/* Body */}
      <div className="px-6 pt-8 pb-2 flex flex-col items-center text-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 text-destructive-text">
          <Trash2 size={24} />
        </div>

        <h2 className="text-lg font-bold text-destructive-text">Xoá mẫu gói?</h2>

        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
          Mẫu gói{" "}
          <span className="font-semibold text-foreground">{template.name}</span>{" "}
          sẽ bị xoá vĩnh viễn. Các subscription hiện tại của khách hàng sẽ không
          bị ảnh hưởng.
        </p>

        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-destructive/10 text-destructive-text border border-destructive/20">
          <AlertTriangle size={11} />
          Không thể hoàn tác
        </div>
      </div>

      <BaseDialogFooter className="justify-center gap-3 py-5">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
          className="min-w-25 min-h-11"
        >
          Hủy bỏ
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDeleting}
          className="min-w-30 bg-destructive hover:bg-destructive/90 text-destructive-foreground min-h-11"
        >
          {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Xoá mẫu gói
        </Button>
      </BaseDialogFooter>
    </BaseDialog>
  );
}
