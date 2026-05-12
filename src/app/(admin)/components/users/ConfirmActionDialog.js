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
import { Loader2, AlertTriangle, Lock } from "lucide-react";

export function ConfirmActionDialog({
  open,
  onOpenChange,
  userName,
  onConfirm,
  type = "delete",
  isLoading = false,
}) {
  const isDelete = type === "delete";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div
            className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
              isDelete
                ? "bg-red-100 text-destructive"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            {isDelete ? <AlertTriangle size={22} /> : <Lock size={22} />}
          </div>

          <AlertDialogTitle
            className={`text-center ${
              isDelete ? "text-destructive" : "text-amber-600"
            }`}
          >
            {isDelete ? "Xác nhận xóa vĩnh viễn?" : "Xác nhận khóa tài khoản?"}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center">
            {isDelete ? (
              <>
                Bạn đang chuẩn bị xóa tài khoản của{" "}
                <strong className="text-foreground">{userName}</strong>. Hành
                động này <strong>không thể hoàn tác</strong> và mọi dữ liệu liên
                quan sẽ bị mất vĩnh viễn.
              </>
            ) : (
              <>
                Bạn có chắc muốn khóa tài khoản của{" "}
                <strong className="text-foreground">{userName}</strong>? Người
                dùng sẽ không thể đăng nhập cho đến khi được mở khóa.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel disabled={isLoading} className="w-28">
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={`w-36 ${
              isDelete
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-amber-600 text-white hover:bg-amber-700"
            }`}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isDelete ? "Xác nhận xóa" : "Xác nhận khóa"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
