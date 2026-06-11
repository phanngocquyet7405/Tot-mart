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
import { useAdminSubscriptions } from "@/app/hook/adminSub/UseAdminSubscriptions";
import { SubscriberTable } from "../../components/SubscribePlans/Subscribe/SubscriberTable";
import { SubscriberFilters } from "../../components/SubscribePlans/Subscribe/SubscriberFilters";
import { SubscriberDetailDialog } from "../../components/SubscribePlans/Subscribe/SubscriberDetailDialog";
import { formatCurrency } from "@/app/util/formatter";

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  const colorMap = {
    blue: { bg: "bg-blue-50", icon: "text-blue-500", value: "text-blue-700" },
    green: {
      bg: "bg-green-50",
      icon: "text-green-500",
      value: "text-green-700",
    },
    red: { bg: "bg-red-50", icon: "text-red-500", value: "text-red-700" },
    orange: {
      bg: "bg-orange-50",
      icon: "text-[#C85C3C]",
      value: "text-[#C85C3C]",
    },
  };
  const c = colorMap[color] ?? colorMap.blue;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 flex items-start gap-4">
      <div
        className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}
      >
        <Icon size={18} className={c.icon} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
          {label}
        </p>
        <p className={`text-2xl font-black ${c.value} leading-tight mt-0.5`}>
          {value}
        </p>
        {sub && <p className="text-[10px] text-stone-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Today Delivery Mini Panel ────────────────────────────────────────────────
function TodayDeliveryPanel({ deliveries, loading, onLoad }) {
  if (!deliveries.length && !loading) {
    return (
      <button
        onClick={onLoad}
        className="flex items-center gap-2 text-xs text-[#C85C3C] font-bold hover:text-[#B14B2D] transition-colors px-4 py-2.5 rounded-xl border border-[#C85C3C]/20 bg-[#FFF8F5] hover:bg-[#FFF0EB]"
      >
        <Truck size={13} />
        Xem đơn giao hôm nay
      </button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-stone-400 px-4 py-2.5">
        <Loader2 size={12} className="animate-spin" />
        Đang tải...
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
      <Truck size={14} className="text-amber-600 shrink-0" />
      <span className="text-xs font-bold text-amber-800">
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
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* ─── Header ─── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-stone-800 tracking-tight">
              Danh sách đăng ký
            </h1>
            <p className="text-sm text-stone-400 mt-1">
              Quản lý tất cả các gói đăng ký của người dùng
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Today deliveries */}
            <TodayDeliveryPanel
              deliveries={todayDeliveries}
              loading={todayLoading}
              onLoad={loadTodayDeliveries}
            />

            {/* Trigger delivery */}
            <button
              onClick={handleTriggerDelivery}
              disabled={triggeringDelivery}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 text-stone-600 hover:text-stone-800 transition-all disabled:opacity-50"
            >
              {triggeringDelivery ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Zap size={13} />
              )}
              Xử lý giao hàng
            </button>

            {/* Refresh */}
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 text-stone-600 transition-all disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Làm mới
            </button>
          </div>
        </div>

        {/* ─── Error ─── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* ─── Stats ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Tổng đăng ký"
            value={stats.total}
            color="blue"
            sub="Tất cả trạng thái"
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
          />
          <StatCard
            icon={DollarSign}
            label="Doanh thu hiện tại"
            value={formatCurrency(stats.revenue)}
            color="orange"
            sub="Từ gói đang active"
          />
        </div>

        {/* ─── Filters ─── */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4">
          <SubscriberFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            planFilter={planFilter}
            setPlanFilter={setPlanFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalCount={
              // raw count before filter (re-compute from hook)
              subscriptions.length
            }
            filteredCount={subscriptions.length}
          />
        </div>

        {/* ─── Table ─── */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-stone-200 py-24 flex flex-col items-center gap-4">
            <Loader2 size={32} className="animate-spin text-stone-300" />
            <p className="text-sm text-stone-400">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <SubscriberTable
            subscriptions={subscriptions}
            onViewDetail={openDetail}
          />
        )}
      </div>

      {/* ─── Detail Dialog ─── */}
      <SubscriberDetailDialog
        subscription={selectedSubscription}
        open={detailOpen}
        onClose={closeDetail}
      />
    </div>
  );
}
