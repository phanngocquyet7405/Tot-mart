"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingBag,
  Truck,
  AlertCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { axiosConfig } from "@/app/services/api/axiosConfig";
import { orderService } from "@/app/services/api/orderService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value || 0,
  );

const statusGroups = [
  { key: "all", label: "Tất cả", icon: ShoppingBag },
  { key: "pending", label: "Chờ xác nhận", icon: Clock3 },
  { key: "processing", label: "Đang xử lý", icon: PackageCheck },
  { key: "shipped", label: "Đang giao", icon: Truck },
  { key: "delivered", label: "Đã giao", icon: Check },
  { key: "cancelled", label: "Đã hủy", icon: RotateCcw },
];

const statusCopy = {
  pending: "Chờ xác nhận",
  processing: "Đang xử lý",
  shipped: "Đang giao hàng",
  delivered: "Đã giao hàng",
  completed: "Đã hoàn tất",
  cancelled: "Đã hủy",
  returned: "Đã trả hàng",
  on_hold: "Tạm giữ",
};

const statusTone = {
  pending: "text-warning-text bg-warning-text/10 border-warning-text/25",
  processing: "text-primary bg-primary/10 border-primary/20",
  shipped: "text-primary bg-primary/15 border-primary/25",
  delivered: "text-success-text bg-success-text/10 border-success-text/25",
  completed: "text-success-text bg-success-text/10 border-success-text/25",
  cancelled: "text-destructive-text bg-destructive/10 border-destructive/25",
  returned: "text-destructive-text bg-destructive/10 border-destructive/25",
  on_hold: "text-muted-foreground bg-muted border-border",
};

const CANCEL_REASONS = [
  "Muốn thay đổi địa chỉ nhận hàng",
  "Muốn thay đổi sản phẩm hoặc số lượng",
  "Tìm thấy giá tốt hơn ở nơi khác",
  "Thời gian giao hàng không phù hợp",
  "Không còn nhu cầu mua nữa",
  "Lý do khác",
];

function OrderCard({ order, onConfirmReceipt, confirming, onOpenCancel }) {
  const canConfirm =
    order.status === "shipped" &&
    order.paymentMethod === "online" &&
    order.paymentStatus === "paid";
  const canCancel = ["pending", "processing", "on_hold"].includes(order.status);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5 bg-card/60">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
              statusTone[order.status] || "bg-muted text-muted-foreground border-border"
            }`}
          >
            {statusCopy[order.status] || order.status}
          </span>
          <span className="text-border">•</span>
          <span className="font-mono text-foreground font-semibold">
            {order.orderId || `#${order._id?.slice(-8)}`}
          </span>
        </div>
        <span className="text-xs text-muted-foreground tabular-nums">
          {new Date(order.createdAt).toLocaleDateString("vi-VN")}
        </span>
      </header>

      {order.status === "cancelled" && order.cancelReason && (
        <div className="mx-4 mt-3 sm:mx-5 rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-2 text-xs text-destructive-text flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span className="font-semibold shrink-0">Lý do hủy:</span>
          <span className="truncate">{order.cancelReason}</span>
        </div>
      )}

      <div className="divide-y divide-border/60">
        {(order.products || []).map((item, index) => (
          <div
            key={`${order._id}-${index}`}
            className="flex items-center gap-3.5 px-4 py-3 sm:px-5"
          >
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted text-muted-foreground">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt={item.name || ""}
                  className="size-full object-cover"
                />
              ) : (
                <ShoppingBag size={18} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-foreground">
                {item.name || "Sản phẩm TotMart"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                Số lượng: x{item.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold text-foreground tabular-nums text-right">
              {money(item.totalPrice)}
            </p>
          </div>
        ))}
      </div>

      <footer className="flex flex-col gap-3 bg-muted/30 border-t border-border/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Tổng thanh toán
          </p>
          <p className="text-lg font-bold text-primary tabular-nums">
            {money(order.totalAmount)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 min-h-10 text-xs font-bold text-foreground hover:bg-muted transition-colors select-none">
              Chi tiết giao hàng <ChevronRight size={13} />
            </summary>
            <div className="absolute bottom-12 right-0 z-20 w-80 rounded-xl border border-border bg-card p-4 text-xs text-foreground shadow-lg space-y-2">
              <p className="font-semibold text-xs text-muted-foreground">
                Thông tin người nhận
              </p>
              <p className="font-semibold text-foreground">
                {order.shippingAddress?.fullName} · {order.shippingAddress?.phone}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {[
                  order.shippingAddress?.address,
                  order.shippingAddress?.district,
                  order.shippingAddress?.city,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </details>

          {canCancel && (
            <button
              type="button"
              onClick={() => onOpenCancel(order)}
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2 min-h-10 text-xs font-bold text-destructive-text hover:bg-destructive/20 transition-colors select-none"
            >
              Hủy đơn
            </button>
          )}

          {canConfirm && (
            <button
              type="button"
              onClick={() => onConfirmReceipt(order._id)}
              disabled={confirming === order._id}
              className="rounded-xl bg-primary px-4 py-2 min-h-10 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60 shadow-2xs"
            >
              {confirming === order._id ? "Đang xác nhận..." : "Đã nhận được hàng"}
            </button>
          )}
        </div>
      </footer>
    </article>
  );
}

export default function MyOrdersPage() {
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [confirming, setConfirming] = useState(null);

  // Cancellation State
  const [cancelingOrder, setCancelingOrder] = useState(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState(CANCEL_REASONS[0]);
  const [customCancelReason, setCustomCancelReason] = useState("");
  const [canceling, setCanceling] = useState(false);

  const loadOrders = async () => {
    setRefreshing(true);
    setError("");
    try {
      const response = await axiosConfig.get("/orders", {
        params: { page: 1, limit: 50 },
      });
      const payload = response.data?.data || response.data;
      setResult({
        data: Array.isArray(payload) ? payload : payload?.data || [],
        pagination: payload?.pagination,
      });
    } catch {
      setError("Không thể tải danh sách đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const orders = useMemo(() => result?.data || [], [result]);
  const counts = useMemo(
    () =>
      statusGroups.reduce((acc, group) => {
        acc[group.key] =
          group.key === "all"
            ? orders.length
            : orders.filter((order) => order.status === group.key).length;
        return acc;
      }, {}),
    [orders],
  );
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      activeStatus === "all" || order.status === activeStatus;
    const query = search.trim().toLowerCase();
    return (
      matchesStatus &&
      (!query ||
        `${order.orderId} ${order.products?.map((item) => item.name).join(" ")}`
          .toLowerCase()
          .includes(query))
    );
  });

  const confirmReceipt = async (orderId) => {
    setConfirming(orderId);
    try {
      const confirmed = await axiosConfig.post(
        `/orders/${orderId}/confirm-receipt`,
      );
      setResult((current) =>
        current
          ? {
              ...current,
              data: current.data.map((order) =>
                order._id === orderId
                  ? { ...order, status: confirmed.data.status }
                  : order,
              ),
            }
          : current,
      );
      toast.success("Đã xác nhận nhận hàng. Cảm ơn bạn!");
    } catch {
      toast.error("Chưa thể xác nhận nhận hàng. Vui lòng thử lại.");
    } finally {
      setConfirming(null);
    }
  };

  const handleOpenCancel = (order) => {
    setCancelingOrder(order);
    setCancelReasonPreset(CANCEL_REASONS[0]);
    setCustomCancelReason("");
  };

  const handleConfirmCancel = async () => {
    if (!cancelingOrder) return;
    const finalReason =
      cancelReasonPreset === "Lý do khác"
        ? customCancelReason.trim()
        : cancelReasonPreset;

    if (!finalReason) {
      toast.error("Vui lòng nhập lý do hủy đơn.");
      return;
    }

    setCanceling(true);
    try {
      await orderService.cancelOrder(cancelingOrder._id, finalReason);
      toast.success("Đã hủy đơn hàng thành công.");
      setCancelingOrder(null);
      setCustomCancelReason("");
      setCancelReasonPreset(CANCEL_REASONS[0]);
      await loadOrders();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Không thể hủy đơn hàng lúc này.";
      toast.error(msg);
    } finally {
      setCanceling(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-6 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-border pb-5">
          <div>
            <Link
              href="/profile"
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} />
              Quay lại Hồ sơ cá nhân
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              Đơn hàng của tôi
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Theo dõi lịch sử mua sắm và tiến độ từng kiện hàng TotMart của bạn.
            </p>
          </div>
          <button
            type="button"
            onClick={loadOrders}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 min-h-11 text-xs font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-60 shadow-2xs self-start sm:self-auto"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Status Tabs */}
        <div className="overflow-x-auto rounded-2xl border border-border bg-card p-1.5 shadow-2xs">
          <div className="flex min-w-max gap-1">
            {statusGroups.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveStatus(key)}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2.5 min-h-11 text-xs font-bold transition-all ${
                  activeStatus === key
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                    activeStatus === key
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {counts[key] || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-1.5 shadow-2xs focus-within:ring-2 focus-within:ring-ring focus-within:border-ring">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm kiếm theo mã đơn hoặc tên sản phẩm..."
            className="min-h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground text-foreground"
          />
        </div>

        {/* State rendering */}
        {error ? (
          <div
            role="alert"
            className="flex items-center justify-between rounded-2xl border border-destructive/25 bg-destructive/10 p-5 text-sm text-destructive-text"
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <p className="font-medium text-xs sm:text-sm">{error}</p>
            </div>
            <button
              type="button"
              onClick={loadOrders}
              className="px-3 py-1.5 rounded-lg border border-destructive/30 bg-card text-destructive-text text-xs font-bold hover:bg-muted transition-colors cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : !result ? (
          /* Loading skeleton */
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-card p-5 space-y-4 animate-pulse shadow-xs"
              >
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-4 w-20 bg-muted rounded" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-14 bg-muted rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredOrders.length ? (
          /* Order List / Cards */
          <div className="flex flex-col gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onConfirmReceipt={confirmReceipt}
                confirming={confirming}
                onOpenCancel={handleOpenCancel}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-muted/60 mx-auto flex items-center justify-center text-muted-foreground mb-1">
              <ShoppingBag size={26} />
            </div>
            <p className="font-bold text-base text-foreground">
              Chưa có đơn hàng nào trong mục này
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Hãy khám phá các sản phẩm và hộp quà hữu cơ chất lượng cao từ TotMart.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center justify-center min-h-11 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-xs"
              >
                Mua sắm ngay
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Dialog Hủy Đơn Hàng */}
      <Dialog
        open={Boolean(cancelingOrder)}
        onOpenChange={(isOpen) => {
          if (!isOpen && !canceling) {
            setCancelingOrder(null);
            setCustomCancelReason("");
            setCancelReasonPreset(CANCEL_REASONS[0]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Hủy đơn hàng {cancelingOrder?.orderId || `#${cancelingOrder?._id?.slice(-8)}`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm text-foreground">
            {cancelingOrder?.paymentStatus === "paid" && (
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <p>
                  Đơn hàng này đã thanh toán trực tuyến. Khi hủy, hệ thống TotMart sẽ tự động tạo yêu cầu hoàn lại{" "}
                  <strong>{money(cancelingOrder.totalAmount)}</strong> theo quy trình hoàn tiền tự động.
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-2">
                Vui lòng chọn lý do hủy đơn:
              </label>
              <div className="space-y-2">
                {CANCEL_REASONS.map((r) => (
                  <label
                    key={r}
                    className="flex items-center gap-2.5 text-xs font-medium cursor-pointer rounded-lg border border-border p-2.5 hover:bg-muted transition-colors"
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={r}
                      checked={cancelReasonPreset === r}
                      onChange={(e) => setCancelReasonPreset(e.target.value)}
                      className="accent-primary"
                    />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>

            {cancelReasonPreset === "Lý do khác" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Nhập lý do cụ thể:
                </label>
                <textarea
                  rows={3}
                  value={customCancelReason}
                  onChange={(e) => setCustomCancelReason(e.target.value)}
                  placeholder="Vui lòng chia sẻ thêm lý do bạn muốn hủy đơn..."
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={() => setCancelingOrder(null)}
              disabled={canceling}
              className="rounded-xl border border-border bg-card px-4 py-2 min-h-10 text-xs font-bold text-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleConfirmCancel}
              disabled={
                canceling ||
                (cancelReasonPreset === "Lý do khác" && !customCancelReason.trim())
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2 min-h-10 text-xs font-bold text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {canceling ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Đang hủy...</span>
                </>
              ) : (
                <span>Xác nhận hủy đơn</span>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
