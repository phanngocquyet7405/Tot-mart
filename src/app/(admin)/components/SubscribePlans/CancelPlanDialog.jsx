// components/SubscribePlans/CancelPlanDialog.jsx
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
import { Loader2, Zap, XCircle } from "lucide-react";

export function CancelPlanDialog({
  cancelTarget,
  open,
  onOpenChange,
  onConfirm,
  isProcessing,
}) {
  if (!cancelTarget) return null;

  const isImmediate = cancelTarget.mode === "immediate";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div
            className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
              isImmediate
                ? "bg-red-100 text-destructive"
                : "bg-orange-100 text-orange-600"
            }`}
          >
            {isImmediate ? <Zap size={22} /> : <XCircle size={22} />}
          </div>
          <AlertDialogTitle
            className={`text-center ${isImmediate ? "text-destructive" : "text-orange-600"}`}
          >
            {isImmediate ? "Hủy ngay lập tức?" : "Hủy cuối kỳ?"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {isImmediate ? (
              <>
                Gói{" "}
                <strong className="text-foreground">
                  {cancelTarget.plan?.name}
                </strong>{" "}
                sẽ bị hủy ngay. Người dùng sẽ không nhận được các lần giao hàng
                còn lại.
              </>
            ) : (
              <>
                Gói{" "}
                <strong className="text-foreground">
                  {cancelTarget.plan?.name}
                </strong>{" "}
                sẽ tiếp tục đến hết kỳ hiện tại rồi tự động hủy.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center gap-2">
          <AlertDialogCancel disabled={isProcessing}>Hủy bỏ</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isProcessing}
            className={`w-36 ${
              isImmediate
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-orange-600 text-white hover:bg-orange-700"
            }`}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
