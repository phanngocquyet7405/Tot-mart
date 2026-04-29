"use client";

import { useState, useEffect } from "react";
import {
  CalendarClock,
  Search,
  RefreshCw,
  Plus,
  MoreHorizontal,
  Truck,
  XCircle,
  Zap,
  Eye,
  Loader2,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Clock,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// ✅ Thay thế import cũ bằng Named Exports từ subscribePlanService
import {
  getAllPlansApi,
  cancelPlanApi,
  cancelImmediatelyApi,
  triggerDeliveryApi,
} from "@/app/services/api/subscribePlanService";

import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatCurrency = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n ?? 0,
  );

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd/MM/yyyy", { locale: vi });
  } catch {
    return "—";
  }
};

const formatRelative = (d) => {
  if (!d) return "—";
  try {
    return formatDistanceToNow(new Date(d), { addSuffix: true, locale: vi });
  } catch {
    return "—";
  }
};

const PLAN_TYPE_LABELS = {
  "1_month": "1 tháng",
  "3_month": "3 tháng",
  "6_month": "6 tháng",
  "12_month": "12 tháng",
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, cancelAtPeriodEnd }) {
  if (cancelAtPeriodEnd && status === "active") {
    return (
      <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
        <Clock size={11} /> Hủy cuối kỳ
      </Badge>
    );
  }
  const map = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    expired: "bg-gray-100 text-gray-600 border-gray-200",
  };
  const icons = {
    active: <CheckCircle2 size={11} />,
    cancelled: <Ban size={11} />,
    expired: <XCircle size={11} />,
  };
  const labels = {
    active: "Đang hoạt động",
    cancelled: "Đã hủy",
    expired: "Hết hạn",
  };
  return (
    <Badge className={`${map[status] || ""} gap-1`}>
      {icons[status]} {labels[status] || status}
    </Badge>
  );
}

// ─── Plan Detail Dialog ───────────────────────────────────────────────────────
function PlanDetailDialog({ open, onOpenChange, plan }) {
  if (!plan) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock size={18} className="text-indigo-500" />
            Chi tiết gói: {plan.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm">
          {/* User */}
          <div className="rounded-lg bg-muted/30 p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Người dùng
            </p>
            <p className="font-medium">{plan.userId?.name || "—"}</p>
            <p className="text-muted-foreground">
              {plan.userId?.email || plan.userId}
            </p>
          </div>
          {/* Plan info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Loại gói",
                value: PLAN_TYPE_LABELS[plan.planType] || plan.planType,
              },
              {
                label: "Trạng thái",
                value: (
                  <StatusBadge
                    status={plan.status}
                    cancelAtPeriodEnd={plan.cancelAtPeriodEnd}
                  />
                ),
              },
              { label: "Giá hiện tại", value: formatCurrency(plan.price) },
              {
                label: "Giá gốc",
                value: (
                  <span className="line-through text-muted-foreground">
                    {formatCurrency(plan.oldPrice)}
                  </span>
                ),
              },
              {
                label: "Giảm giá",
                value: plan.discountPercent ? `${plan.discountPercent}%` : "0%",
              },
              { label: "Tổng giao hàng", value: plan.totalDeliveries },
              { label: "Đã giao", value: plan.completeDeliveries ?? 0 },
              { label: "Còn lại", value: plan.remainDeliveries },
              {
                label: "Giao hàng tiếp theo",
                value: formatDate(plan.nextDeliveries),
              },
              {
                label: "Giao hàng gần nhất",
                value: formatDate(plan.lastDeliveries),
              },
              {
                label: "Kỳ bắt đầu",
                value: formatDate(plan.currentPeriodStart),
              },
              {
                label: "Kỳ kết thúc",
                value: formatDate(plan.currentPeriodEnd),
              },
            ].map((r) => (
              <div key={r.label} className="rounded-lg border p-2.5">
                <p className="text-[11px] text-muted-foreground mb-1">
                  {r.label}
                </p>
                <p className="font-medium text-sm">{r.value}</p>
              </div>
            ))}
          </div>
          {/* Địa chỉ giao hàng */}
          <div className="rounded-lg bg-muted/30 p-3 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Địa chỉ giao hàng
            </p>
            {plan.shippingAddress ? (
              <>
                <p>{plan.shippingAddress.address}</p>
                <p className="text-muted-foreground">
                  {plan.shippingAddress.district}, {plan.shippingAddress.city},{" "}
                  {plan.shippingAddress.country}
                </p>
                <p className="text-muted-foreground">
                  SĐT: {plan.shippingAddress.phone}
                </p>
                <p className="text-muted-foreground">
                  Zip: {plan.shippingAddress.zipCode}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">Chưa có</p>
            )}
          </div>
          {/* Quà tặng */}
          {plan.gift && plan.gift.length > 0 && (
            <div className="rounded-lg bg-pink-50 border border-pink-100 p-3 space-y-1">
              <p className="text-xs font-semibold text-pink-700 uppercase tracking-wide">
                Quà tặng kèm
              </p>
              {plan.gift.map((g, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{g.boxId?.name || g.boxId}</span>
                  <span className="text-muted-foreground">x{g.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SubscribePlanManagement() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("desc");

  const [detailPlan, setDetailPlan] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null); // { plan, mode: 'end' | 'immediate' }
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTriggeringDelivery, setIsTriggeringDelivery] = useState(false);

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      // ✅ Cập nhật: Sử dụng getAllPlansApi
      const res = await getAllPlansApi();
      const data = res.data?.data || [];
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Không thể tải danh sách gói đăng ký");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const filtered = plans
    .filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.userId?.name?.toLowerCase().includes(q) ||
        p.userId?.email?.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }) =>
    sortKey === col ? (
      sortDir === "asc" ? (
        <ChevronUp size={12} className="inline ml-1" />
      ) : (
        <ChevronDown size={12} className="inline ml-1" />
      )
    ) : (
      <ChevronUp size={12} className="inline ml-1 opacity-20" />
    );

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setIsProcessing(true);
    try {
      if (cancelTarget.mode === "immediate") {
        // ✅ Cập nhật: Sử dụng cancelImmediatelyApi
        await cancelImmediatelyApi(cancelTarget.plan._id);
        toast.success("Đã hủy gói ngay lập tức");
      } else {
        // ✅ Cập nhật: Sử dụng cancelPlanApi
        await cancelPlanApi(cancelTarget.plan._id);
        toast.success("Gói sẽ bị hủy vào cuối kỳ hiện tại");
      }
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    } finally {
      setIsProcessing(false);
      setCancelTarget(null);
    }
  };

  const handleTriggerDelivery = async () => {
    setIsTriggeringDelivery(true);
    try {
      // ✅ Cập nhật: Sử dụng triggerDeliveryApi
      await triggerDeliveryApi();
      toast.success("Đã kích hoạt xử lý giao hàng thủ công");
    } catch (err) {
      toast.error(err.response?.data?.message || "Thất bại");
    } finally {
      setIsTriggeringDelivery(false);
    }
  };

  // Stats
  const activePlans = plans.filter((p) => p.status === "active").length;
  const cancelledPlans = plans.filter((p) => p.status === "cancelled").length;
  const expiredPlans = plans.filter((p) => p.status === "expired").length;
  const pendingCancelPlans = plans.filter(
    (p) => p.cancelAtPeriodEnd && p.status === "active",
  ).length;
  const totalRevenue = plans
    .filter((p) => p.status === "active")
    .reduce((s, p) => s + (p.price || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 rounded-xl border border-violet-500/20">
            <CalendarClock size={20} className="text-violet-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gói Đăng Ký</h1>
            <p className="text-sm text-muted-foreground">
              Quản lý Subscribe Plans của khách hàng
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={handleTriggerDelivery}
          disabled={isTriggeringDelivery}
        >
          {isTriggeringDelivery ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Truck size={15} />
          )}
          Kích hoạt giao hàng
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: "Đang hoạt động",
            value: activePlans,
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-100",
          },
          {
            label: "Hủy cuối kỳ",
            value: pendingCancelPlans,
            color: "text-orange-600",
            bg: "bg-orange-50 border-orange-100",
          },
          {
            label: "Đã hủy",
            value: cancelledPlans,
            color: "text-red-600",
            bg: "bg-red-50 border-red-100",
          },
          {
            label: "Hết hạn",
            value: expiredPlans,
            color: "text-gray-600",
            bg: "bg-gray-50 border-gray-100",
          },
          {
            label: "Doanh thu active",
            value: formatCurrency(totalRevenue),
            color: "text-violet-600",
            bg: "bg-violet-50 border-violet-100",
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="flex gap-3">
              <div className="relative w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={15}
                />
                <Input
                  className="pl-9"
                  placeholder="Tìm tên gói, email user..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {/* Filter by status */}
              <div className="flex gap-1.5">
                {["all", "active", "cancelled", "expired"].map((s) => (
                  <Button
                    key={s}
                    variant={statusFilter === s ? "default" : "outline"}
                    size="sm"
                    className={
                      statusFilter === s
                        ? "bg-violet-600 hover:bg-violet-700"
                        : ""
                    }
                    onClick={() => setStatusFilter(s)}
                  >
                    {s === "all"
                      ? "Tất cả"
                      : s === "active"
                        ? "Active"
                        : s === "cancelled"
                          ? "Đã hủy"
                          : "Hết hạn"}
                  </Button>
                ))}
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={fetchPlans}>
              <RefreshCw size={15} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-lg bg-muted animate-pulse"
                  style={{ opacity: 1 - i * 0.2 }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-b-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort("name")}
                    >
                      Tên gói <SortIcon col="name" />
                    </TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort("planType")}
                    >
                      Loại gói <SortIcon col="planType" />
                    </TableHead>
                    <TableHead>Tiến độ</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => toggleSort("price")}
                    >
                      Giá <SortIcon col="price" />
                    </TableHead>
                    <TableHead>Giao tiếp theo</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center h-32 text-muted-foreground"
                      >
                        <CalendarClock
                          size={32}
                          className="mx-auto mb-2 opacity-20"
                        />
                        Không tìm thấy gói đăng ký nào.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((plan) => {
                      const progress =
                        plan.totalDeliveries > 0
                          ? Math.round(
                              ((plan.completeDeliveries || 0) /
                                plan.totalDeliveries) *
                                100,
                            )
                          : 0;
                      return (
                        <TableRow
                          key={plan._id}
                          className="group hover:bg-muted/20"
                        >
                          {/* Tên */}
                          <TableCell>
                            <p className="font-medium">{plan.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {plan._id?.slice(-6)}
                            </p>
                          </TableCell>
                          {/* User */}
                          <TableCell>
                            <p className="text-sm font-medium">
                              {plan.userId?.name || "—"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {plan.userId?.email || ""}
                            </p>
                          </TableCell>
                          {/* Loại gói */}
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-violet-700 border-violet-200 bg-violet-50"
                            >
                              {PLAN_TYPE_LABELS[plan.planType] || plan.planType}
                            </Badge>
                          </TableCell>
                          {/* Tiến độ */}
                          <TableCell>
                            <div className="space-y-1 min-w-25">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">
                                  {plan.completeDeliveries || 0}/
                                  {plan.totalDeliveries}
                                </span>
                                <span className="font-medium">{progress}%</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-violet-500 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          {/* Giá */}
                          <TableCell>
                            <p className="font-medium">
                              {formatCurrency(plan.price)}
                            </p>
                            {plan.discountPercent > 0 && (
                              <p className="text-xs text-muted-foreground line-through">
                                {formatCurrency(plan.oldPrice)}
                              </p>
                            )}
                          </TableCell>
                          {/* Giao tiếp theo */}
                          <TableCell>
                            {plan.nextDeliveries ? (
                              <div>
                                <p className="text-sm">
                                  {formatDate(plan.nextDeliveries)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatRelative(plan.nextDeliveries)}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                —
                              </span>
                            )}
                          </TableCell>
                          {/* Trạng thái */}
                          <TableCell>
                            <StatusBadge
                              status={plan.status}
                              cancelAtPeriodEnd={plan.cancelAtPeriodEnd}
                            />
                          </TableCell>
                          {/* Actions */}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <MoreHorizontal size={15} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => setDetailPlan(plan)}
                                >
                                  <Eye
                                    size={14}
                                    className="mr-2 text-blue-500"
                                  />{" "}
                                  Xem chi tiết
                                </DropdownMenuItem>
                                {plan.status === "active" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-orange-600 cursor-pointer focus:text-orange-700 focus:bg-orange-50"
                                      onClick={() =>
                                        setCancelTarget({ plan, mode: "end" })
                                      }
                                    >
                                      <XCircle size={14} className="mr-2" /> Hủy
                                      cuối kỳ
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-destructive cursor-pointer focus:text-destructive focus:bg-red-50"
                                      onClick={() =>
                                        setCancelTarget({
                                          plan,
                                          mode: "immediate",
                                        })
                                      }
                                    >
                                      <Zap size={14} className="mr-2" /> Hủy
                                      ngay lập tức
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              {filtered.length > 0 && (
                <div className="border-t px-4 py-2.5 bg-muted/20 text-xs text-muted-foreground flex justify-between">
                  <span>
                    Hiển thị{" "}
                    <strong className="text-foreground">
                      {filtered.length}
                    </strong>{" "}
                    / {plans.length} gói
                  </span>
                  <span>
                    {filtered.filter((p) => p.status === "active").length}{" "}
                    active ·{" "}
                    {
                      filtered.filter(
                        (p) => p.cancelAtPeriodEnd && p.status === "active",
                      ).length
                    }{" "}
                    pending cancel
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <PlanDetailDialog
        open={!!detailPlan}
        onOpenChange={(o) => !o && setDetailPlan(null)}
        plan={detailPlan}
      />

      {/* Cancel Confirm */}
      <AlertDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <div
              className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${
                cancelTarget?.mode === "immediate"
                  ? "bg-red-100 text-destructive"
                  : "bg-orange-100 text-orange-600"
              }`}
            >
              {cancelTarget?.mode === "immediate" ? (
                <Zap size={22} />
              ) : (
                <XCircle size={22} />
              )}
            </div>
            <AlertDialogTitle
              className={`text-center ${
                cancelTarget?.mode === "immediate"
                  ? "text-destructive"
                  : "text-orange-600"
              }`}
            >
              {cancelTarget?.mode === "immediate"
                ? "Hủy ngay lập tức?"
                : "Hủy cuối kỳ?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {cancelTarget?.mode === "immediate" ? (
                <>
                  Gói{" "}
                  <strong className="text-foreground">
                    {cancelTarget?.plan?.name}
                  </strong>{" "}
                  sẽ bị hủy ngay. Người dùng sẽ không nhận được các lần giao
                  hàng còn lại.
                </>
              ) : (
                <>
                  Gói{" "}
                  <strong className="text-foreground">
                    {cancelTarget?.plan?.name}
                  </strong>{" "}
                  sẽ tiếp tục đến hết kỳ hiện tại rồi tự động hủy.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel disabled={isProcessing}>
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleCancel();
              }}
              disabled={isProcessing}
              className={`w-36 ${
                cancelTarget?.mode === "immediate"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : "bg-orange-600 text-white hover:bg-orange-700"
              }`}
            >
              {isProcessing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
