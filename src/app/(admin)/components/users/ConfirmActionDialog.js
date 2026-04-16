"use client";

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
import { Loader2 } from "lucide-react";

export function ConfirmActionDialog({
  open,
  onOpenChange,
  userName,
  onConfirm,
  type = "delete", // "delete" hoặc "lock"
  isLoading = false,
}) {
  const isDelete = type === "delete";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle
            className={isDelete ? "text-destructive" : "text-amber-600"}
          >
            {isDelete ? "Xác nhận xóa vĩnh viễn?" : "Xác nhận khóa tài khoản?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isDelete ? (
              <>
                Bạn đang chuẩn bị xóa tài khoản của{" "}
                <strong className="text-foreground">{userName}</strong>. Hành
                động này <strong>không thể hoàn tác</strong> và mọi dữ liệu liên
                quan sẽ bị mất.
              </>
            ) : (
              <>
                Bạn có chắc muốn khóa tài khoản của{" "}
                <strong className="text-foreground">{userName}</strong>? Người
                dùng này sẽ không thể đăng nhập cho đến khi được mở khóa.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={
              isDelete
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDelete ? "Xác nhận xóa" : "Xác nhận khóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
