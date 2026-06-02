"use client";
/**
 * page.js — AdminSubscribePlanPage
 * ─────────────────────────────────────────────────────────────────
 * Orchestrator thuần: chỉ wire hooks → props, không có logic.
 *
 * BE router hỗ trợ:
 *   POST   create-subcribe-plan          PlanFormDialog (create only)
 *   GET    get-all-subcribe-plans        usePlanList
 *   GET    /:id                          PlanDetailDialog
 *   GET    /user/:userId                 (dùng khi cần)
 *   PATCH  /:id/cancel                   usePlanActions
 *   PATCH  /:id/cancel-immediately       usePlanActions
 *   POST   process-deliveries            usePlanActions
 *
 * KHÔNG có: PUT /:id (update), DELETE /:id — bỏ hoàn toàn.
 * ─────────────────────────────────────────────────────────────────
 */

import {
  Plus,
  RefreshCw,
  Zap,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";

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
  usePlanList,
  STATUS_OPTIONS,
  PLAN_TYPE_OPTIONS,
} from "../../../hooks/usePlanList";
import { usePlanDialog } from "../../../hooks/usePlanDialog";
import { usePlanActions } from "../../../hooks/usePlanActions";

export default function AdminSubscribePlanPage() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const {
    plans,
    filtered,
    isLoading,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    planTypeFilter,
    setPlanTypeFilter,
    hasActiveFilters,
    clearFilters,
    sortKey,
    sortDir,
    handleSort,
    fetchPlans,
  } = usePlanList();

  // ── Dialog state ──────────────────────────────────────────────────────────
  const {
    detailPlan,
    detailOpen,
    setDetailOpen,
    handleViewDetail,
    closeDetail,
    formOpen,
    setFormOpen,
    handleOpenCreate,
  } = usePlanDialog();

  // ── Actions ───────────────────────────────────────────────────────────────
  const {
    isTriggeringDelivery,
    handleTriggerDelivery,
    cancelTarget,
    cancelOpen,
    setCancelOpen,
    isProcessing,
    handleCancelClick,
    handleCancelConfirm,
  } = usePlanActions({ fetchPlans, closeDetail });

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
              {/* Status filter */}
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

              {/* Plan type filter */}
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
                  onClick={clearFilters}
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

        <PlanTable
          filtered={filtered}
          totalPlans={plans.length}
          isLoading={isLoading}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          onViewDetail={handleViewDetail}
          onCancelClick={handleCancelClick}
        />
      </Card>

      {/* ── Dialogs ── */}
      <PlanDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        plan={detailPlan}
        onCancelClick={handleCancelClick}
      />

      <CancelPlanDialog
        cancelTarget={cancelTarget}
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        onConfirm={handleCancelConfirm}
        isProcessing={isProcessing}
      />

      <PlanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={fetchPlans}
      />
    </div>
  );
}
