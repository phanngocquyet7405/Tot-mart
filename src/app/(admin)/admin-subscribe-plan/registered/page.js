"use client";

import {
  Users,
  TrendingUp,
  XCircle,
  DollarSign,
  Truck,
  RefreshCw,
  Zap,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminSubscriptions } from "@/app/hook/adminSub/UseAdminSubscriptions";
import { SubscriberTable } from "../../components/SubscribePlans/Subscribe/SubscriberTable";
import { SubscriberFilters } from "../../components/SubscribePlans/Subscribe/SubscriberFilters";
import { SubscriberDetailDialog } from "../../components/SubscribePlans/Subscribe/SubscriberDetailDialog";
import { AdminPageHeader } from "../../components/shared";
import { formatCurrency } from "@/app/util/formatter";

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  const colorMap = {
    blue: { bg: "bg-primary/10", icon: "text-primary", value: "text-primary" },
    green: {
      bg: "bg-success/15",
      icon: "text-success-text",
      value: "text-success-text",
    },
    red: { bg: "bg-destructive/15", icon: "text-destructive-text", value: "text-destructive-text" },
    orange: {
      bg: "bg-warning/15",
      icon: "text-warning-text",
      value: "text-warning-text",
    },
  };
  const c = colorMap[color] ?? colorMap.blue;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex items-start gap-4 shadow-sm">
      <div
        className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}
      >
        <Icon size={18} className={c.icon} />
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={`text-2xl font-bold ${c.value} leading-tight mt-0.5 tabular-nums`}>
          {value}
        </p>
        {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Today Delivery Mini Panel ────────────────────────────────────────────────
function TodayDeliveryPanel({ deliveries, loading, onLoad }) {
  if (!deliveries.length && !loading) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onLoad}
        className="min-h-11 gap-2 text-xs"
      >
        <Truck size={14} className="text-muted-foreground" />
        Kiểm tra giao hôm nay
      </Button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground min-h-11 px-3">
        <Loader2 size={13} className="animate-spin text-primary" />
        Đang kiểm tra...
      </div>
    );
  }

  return (
    <div className="bg-warning/15 border border-warning/20 rounded-xl px-4 min-h-11 flex items-center gap-2.5">
      <Truck size={15} className="text-warning-text shrink-0" />
      <span className="text-xs font-semibold text-warning-text tabular-nums">
        {deliveries.length} đơn cần giao hôm nay
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function RegisteredSubscriptionsPage() {
  const {
    subscriptions,
    todayDeliveries,
    stats,
    loading,
    todayLoading,
    error,
    triggeringDelivery,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    planFilter,
    setPlanFilter,
    sortBy,
    setSortBy,
    selectedSubscription,
    detailOpen,
    openDetail,
    closeDetail,
    refresh,
    loadTodayDeliveries,
    handleTriggerDelivery,
  } = useAdminSubscriptions();

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title="Danh sách đăng ký"
        description="Quản lý tiến độ giao hàng và danh sách gói đăng ký định kỳ của khách hàng"
        icon={Users}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <TodayDeliveryPanel
              deliveries={todayDeliveries}
              loading={todayLoading}
              onLoad={loadTodayDeliveries}
            />

            <Button
              variant="outline"
              onClick={handleTriggerDelivery}
              disabled={triggeringDelivery}
              className="gap-2 min-h-11 text-xs"
            >
              {triggeringDelivery ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Zap size={14} />
              )}
              Xử lý giao hàng
            </Button>

            <Button
              variant="outline"
              onClick={refresh}
              disabled={loading}
              className="gap-2 min-h-11 text-xs"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Làm mới
            </Button>
          </div>
        }
      />

      {error && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 text-destructive-text">
          <AlertCircle size={16} className="shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Tổng đăng ký"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          label="Đang hoạt động"
          value={stats.active}
          color="green"
          sub={`${stats.total ? Math.round((stats.active / stats.total) * 100) : 0}% tổng số`}
        />
        <StatCard
          icon={XCircle}
          label="Đã hủy"
          value={stats.cancelled}
          color="red"
          sub={`${stats.pendingCancel} chờ hủy`}
        />
        <StatCard
          icon={DollarSign}
          label="Doanh thu active"
          value={formatCurrency(stats.totalRevenue)}
          color="orange"
          sub="Doanh thu từ các gói đang chạy"
        />
      </div>

      {/* Filter */}
      <SubscriberFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        planFilter={planFilter}
        setPlanFilter={setPlanFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalCount={stats.total}
        filteredCount={subscriptions.length}
      />

      {/* Table */}
      <SubscriberTable
        subscriptions={subscriptions}
        onViewDetail={openDetail}
      />

      {/* Detail Dialog */}
      <SubscriberDetailDialog
        subscription={selectedSubscription}
        open={detailOpen}
        onClose={closeDetail}
      />
    </div>
  );
}
