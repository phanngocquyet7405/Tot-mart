"use client";

import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteBrandModal({
  brand,
  onConfirm,
  onCancel,
  isLoading,
}) {
  return (
    <AlertDialog open={!!brand} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xóa thương hiệu?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn sắp xóa thương hiệu{" "}
            <span className="font-semibold text-foreground">
              {brand?.name}
            </span>
            . Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm(brand._id);
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Đang xóa...
              </>
            ) : (
              "Xác nhận xóa"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
