"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Plus,
  RefreshCw,
  Zap,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { PlanStats } from "../components/SubscribePlans/PlanStats";
import { PlanTable } from "../components/SubscribePlans/PlanTable";
import { PlanDetailDialog } from "../components/SubscribePlans/PlanDetailDialog";
import { CancelPlanDialog } from "../components/SubscribePlans/CancelPlanDialog";

import { PlanFormDialog } from "../components/SubscribePlans/PlanFormDialog";

import {
  getAllPlansApi,
  cancelPlanApi,
  cancelImmediatelyApi,
  triggerDeliveryApi,
} from "@/app/services/api/subscribePlanService";
import { PLAN_TYPE_LABELS } from "@/app/util/formatter";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "active", label: "Đang hoạt động" },
  { value: "cancelled", label: "Đã huỷ" },
  { value: "expired", label: "Hết hạn" },
];

const PLAN_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả chu kỳ" },
  ...Object.entries(PLAN_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l })),
];

export default function AdminSubscribePlanPage() {
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & sort
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planTypeFilter, setPlanTypeFilter] = useState("all");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  // Dialog states
  const [detailPlan, setDetailPlan] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [cancelTarget, setCancelTarget] = useState(null); // { plan, mode: 'end' | 'immediate' }
  const [cancelOpen, setCancelOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create, plan = edit

  const [isTriggeringDelivery, setIsTriggeringDelivery] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAllPlansApi();
      setPlans(res.data?.plans || res.data || []);
    } catch {
      toast.error("Không thể tải danh sách gói đăng ký");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // ── Sort ───────────────────────────────────────────────────────────────────

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // ── Filter + Sort ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = plans.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.userId?.name?.toLowerCase().includes(q) ||
        p.userId?.email?.toLowerCase().includes(q) ||
        p._id?.slice(-6).includes(q);
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      const matchType =
        planTypeFilter === "all" || p.planType === planTypeFilter;
      return matchSearch && matchStatus && matchType;
    });

    result = [...result].sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [plans, search, statusFilter, planTypeFilter, sortKey, sortDir]);

  const hasActiveFilters = statusFilter !== "all" || planTypeFilter !== "all";

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleTriggerDelivery = async () => {
    setIsTriggeringDelivery(true);
    try {
      await triggerDeliveryApi();
      toast.success("Đã kích hoạt xử lý giao hàng thủ công");
      fetchPlans();
    } catch {
      toast.error("Kích hoạt thất bại");
    } finally {
      setIsTriggeringDelivery(false);
    }
  };

  const handleViewDetail = (plan) => {
    setDetailPlan(plan);
    setDetailOpen(true);
  };

  const handleCancelClick = (target) => {
    setCancelTarget(target);
    setCancelOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setIsProcessing(true);
    try {
      if (cancelTarget.mode === "immediate") {
        await cancelImmediatelyApi(cancelTarget.plan._id);
        toast.success("Đã dừng gói ngay lập tức");
      } else {
        await cancelPlanApi(cancelTarget.plan._id);
        toast.success("Đã đặt lịch huỷ cuối kỳ");
      }
      fetchPlans();
      setCancelOpen(false);
      setCancelTarget(null);
      if (detailPlan?._id === cancelTarget.plan._id) setDetailOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Thao tác thất bại");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenCreate = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditTarget(plan);
    setFormOpen(true);
    setDetailOpen(false);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gói đăng ký định kỳ
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý toàn bộ subscription của khách hàng
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTriggerDelivery}
            disabled={isTriggeringDelivery}
            className="text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            <Zap size={14} className="mr-1.5" />
            {isTriggeringDelivery ? "Đang xử lý..." : "Trigger giao hàng"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchPlans}
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </Button>

          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={handleOpenCreate}
          >
            <Plus size={14} className="mr-1.5" />
            Tạo gói mới
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <PlanStats plans={plans} />

      {/* ── Table Card ── */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-white px-5 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Danh sách gói
              {hasActiveFilters && (
                <span className="ml-2 text-xs font-normal text-indigo-500">
                  (đang lọc)
                </span>
              )}
            </CardTitle>

            <div className="flex items-center gap-2 flex-wrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                  >
                    <Filter size={11} />
                    {
                      STATUS_OPTIONS.find((o) => o.value === statusFilter)
                        ?.label
                    }
                    <ChevronDown size={11} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {STATUS_OPTIONS.map((o) => (
                    <DropdownMenuItem
                      key={o.value}
                      onClick={() => setStatusFilter(o.value)}
                      className={
                        statusFilter === o.value
                          ? "bg-slate-50 font-medium"
                          : ""
                      }
                    >
                      {o.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-xs"
                  >
                    <Filter size={11} />
                    {
                      PLAN_TYPE_OPTIONS.find((o) => o.value === planTypeFilter)
                        ?.label
                    }
                    <ChevronDown size={11} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {PLAN_TYPE_OPTIONS.map((o) => (
                    <DropdownMenuItem
                      key={o.value}
                      onClick={() => setPlanTypeFilter(o.value)}
                      className={
                        planTypeFilter === o.value
                          ? "bg-slate-50 font-medium"
                          : ""
                      }
                    >
                      {o.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-slate-400 hover:text-slate-600"
                  onClick={() => {
                    setStatusFilter("all");
                    setPlanTypeFilter("all");
                  }}
                >
                  Xoá bộ lọc
                </Button>
              )}

              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  placeholder="Tên gói, email, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs w-48"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        {/* PlanTable — thêm prop onEditClick */}
        <PlanTable
          filtered={filtered}
          totalPlans={plans.length}
          isLoading={isLoading}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onViewDetail={handleViewDetail}
          onCancelClick={handleCancelClick}
          onEditClick={handleOpenEdit} // ← THÊM MỚI
        />
      </Card>

      {/* PlanDetailDialog — thêm prop onEdit + onCancelClick */}
      <PlanDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        plan={detailPlan}
        onEdit={() => handleOpenEdit(detailPlan)} // ← THÊM MỚI
        onCancelClick={handleCancelClick} // ← THÊM MỚI
      />

      {/* CancelPlanDialog — giữ nguyên interface */}
      <CancelPlanDialog
        cancelTarget={cancelTarget}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancelConfirm}
        isProcessing={isProcessing}
      />

      {/* PlanFormDialog — component mới */}
      <PlanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        plan={editTarget}
        onSuccess={fetchPlans}
      />
    </div>
  );
}
