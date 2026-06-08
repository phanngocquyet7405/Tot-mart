"use client";
/**
 * page.js — AdminSubscribePlanPage
 * ─────────────────────────────────────────────────────────────────
 * Quản lý Subscription Templates (mẫu gói).
 *
 * BE routes được dùng:
 *   POST   create-subscription-template    PlanFormDialog (create)
 *   GET    all-subscription-templates      usePlanList
 *   GET    get-subscription-template/:id   PlanDetailDialog
 *   PATCH  update-subscription-template/:id PlanFormDialog (edit)
 *   DELETE delete-subscription-template/:id DeleteConfirmDialog
 *
 * KHÔNG quản lý user subscriptions ở đây — đó là trang riêng.
 * ─────────────────────────────────────────────────────────────────
 */

import { useState, useCallback } from "react";
import { Plus, RefreshCw, Search, Filter, ChevronDown } from "lucide-react";
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

import { PlanStats } from "../components/SubscribePlans/PlanTemplate/PlanStats";
import { PlanTable } from "../components/SubscribePlans/PlanTemplate/PlanTable";
import { PlanDetailDialog } from "../components/SubscribePlans/PlanTemplate/PlanDetailDialog";
import { PlanFormDialog } from "../components/SubscribePlans/PlanTemplate/PlanFormDialog";
import { DeleteTemplateDialog } from "../components/SubscribePlans/PlanTemplate/DeleteTemplateDialog";

import { deleteTemplateApi } from "@/app/services/api/subscribePlanService";

import {
  usePlanList,
  STATUS_OPTIONS,
  PLAN_TYPE_OPTIONS,
} from "../../../hooks/usePlanList";

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

  // ── Detail dialog ─────────────────────────────────────────────────────────
  const [detailTemplate, setDetailTemplate] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewDetail = useCallback((template) => {
    setDetailTemplate(template);
    setDetailOpen(true);
  }, []);

  // ── Form dialog (create / edit) ───────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null); // null = create mode

  const handleOpenCreate = useCallback(() => {
    setEditTarget(null);
    setFormOpen(true);
  }, []);

  const handleEditClick = useCallback((template) => {
    setEditTarget(template);
    setFormOpen(true);
  }, []);

  // ── Delete dialog ─────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = useCallback((template) => {
    setDeleteTarget(template);
    setDeleteOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTemplateApi(deleteTarget._id);
      toast.success(`Đã xoá mẫu gói "${deleteTarget.name}"`);
      setDeleteOpen(false);
      fetchPlans();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Xoá thất bại";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, fetchPlans]);

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Mẫu gói đăng ký
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Quản lý các mẫu gói hiển thị cho khách hàng chọn đăng ký
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            Tạo mẫu gói
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
              Danh sách mẫu gói
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
                  placeholder="Tên gói, ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs w-44"
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
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
        />
      </Card>

      {/* ── Dialogs ── */}

      {/* Detail */}
      <PlanDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        template={detailTemplate}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
      />

      {/* Create / Edit form */}
      <PlanFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editTarget={editTarget}
        onSuccess={fetchPlans}
      />

      {/* Delete confirm */}
      <DeleteTemplateDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        template={deleteTarget}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
