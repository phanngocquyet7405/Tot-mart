"use client";
/**
 * page.js — Client: Trang quản lý gói đăng ký cá nhân
 * Route: /profile/my-subscriptions
 *
 * Pure orchestrator: chỉ compose hooks + components, không có logic trực tiếp
 */

import { useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Loader2,
  AlertCircle,
  Truck,
  ArrowLeft,
  Sparkles,
  Package,
} from "lucide-react";
import { useMySubscriptions } from "@/app/hook/clientSub/UseMySubscriptions";
import { useOtherPlans } from "@/app/hook/clientSub/useOtherPlans";
import { SubscriptionCard } from "../../components/profile/MySub/Subscriptioncard";
import { CancelDialog } from "../../components/profile/MySub/Canceldialog";
import { EmptySubscription } from "../../components/profile/MySub/Emptysubscription";
import PlanCard from "../../components/Subsciber_components/PlanCard";
import ChoosePlanModal from "../../components/Subsciber_components/ChoosePlanModal";

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
function TabBar({ activeTab, setActiveTab, tabCounts }) {
  const tabs = [
    { key: "all", label: "Tất cả" },
    { key: "active", label: "Đang hoạt động" },
    { key: "cancelled", label: "Đã hủy" },
    { key: "completed", label: "Hoàn tất" },
  ];

  return (
    <div className="flex items-center gap-1 bg-muted/60 p-1.5 rounded-2xl border border-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => setActiveTab(tab.key)}
          className={`flex items-center gap-1.5 px-3.5 py-2 min-h-10 rounded-xl text-xs font-bold transition-all ${
            activeTab === tab.key
              ? "bg-card text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{tab.label}</span>
          <span
            className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
              activeTab === tab.key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {tabCounts[tab.key] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}

// ─── Today delivery banner ────────────────────────────────────────────────────
function TodayDeliveryBanner({ deliveries }) {
  if (!deliveries.length) return null;

  return (
    <div className="bg-primary text-primary-foreground rounded-2xl p-4 flex items-center gap-3.5 shadow-xs">
      <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center shrink-0">
        <Truck size={20} className="text-primary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-primary-foreground">
          Giao hàng hôm nay
        </p>
        <p className="text-xs text-primary-foreground/90 mt-0.5">
          Bạn có <span className="font-bold underline">{deliveries.length}</span> đơn
          hàng định kỳ được giao hôm nay
        </p>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
        <span className="text-xs font-bold text-primary-foreground tabular-nums">
          {deliveries.length}
        </span>
      </div>
    </div>
  );
}

// ─── Gói khác dành cho bạn ─────────────────────────────────────────────────
function OtherPlansSection({ excludeBoxIds, onSubscribed }) {
  const { plans, isLoading, error, retry } = useOtherPlans(excludeBoxIds);
  const [selectedBoxForModal, setSelectedBoxForModal] = useState(null);

  if (!isLoading && !error && (!plans || plans.length === 0)) return null;

  return (
    <div className="pt-8 space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Package size={16} className="text-primary" />
        <h2 className="text-sm font-semibold text-foreground">
          Gói combo định kỳ gợi ý cho bạn
        </h2>
      </div>

      {error ? (
        <div role="alert" className="p-4 rounded-xl border border-destructive/25 bg-destructive/10 text-xs text-destructive-text flex items-center justify-between">
          <p>Chưa tải được gói gợi ý. Vui lòng thử lại.</p>
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg border border-destructive/30 bg-card text-destructive-text font-bold hover:bg-muted"
            onClick={retry}
          >
            Thử tải lại
          </button>
        </div>
      ) : isLoading ? (
        <div role="status" className="flex items-center gap-2 text-muted-foreground text-xs py-6">
          <Loader2 size={14} className="animate-spin text-primary" />
          Đang tải danh sách combo gợi ý...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans &&
            plans.map((box, index) => (
              <PlanCard
                key={box._id}
                box={box}
                onOpenPlan={(b) => setSelectedBoxForModal(b)}
                isFirst={index === 0}
              />
            ))}
        </div>
      )}

      {selectedBoxForModal && (
        <ChoosePlanModal
          box={selectedBoxForModal}
          plansProps={selectedBoxForModal.apiPlans}
          onClose={() => {
            setSelectedBoxForModal(null);
            onSubscribed?.();
          }}
        />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MySubscriptionsPage() {
  const {
    subscriptions,
    todayDeliveries,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    tabCounts,
    cancelTarget,
    cancelDialogOpen,
    cancelling,
    openCancelDialog,
    closeCancelDialog,
    confirmCancel,
    refresh,
  } = useMySubscriptions();

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Page Header ─── */}
      <div className="border-b border-border bg-card/60">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="w-10 h-10 rounded-xl border border-border bg-card hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
                aria-label="Quay lại Hồ sơ cá nhân"
              >
                <ArrowLeft size={16} />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-serif">
                  Gói đăng ký của tôi
                </h1>
                <p className="text-xs text-muted-foreground">
                  Quản lý và theo dõi lịch giao các combo subscription box
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={refresh}
                disabled={isLoading}
                className="w-10 h-10 rounded-xl border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                aria-label="Làm mới"
              >
                <RefreshCw
                  size={14}
                  className={isLoading ? "animate-spin" : ""}
                />
              </button>

              <Link
                href="/products/Subscriber"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-10 bg-primary text-primary-foreground rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors shadow-2xs"
              >
                <Sparkles size={13} />
                <span>Thêm gói mới</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">
        {/* Error */}
        {error && (
          <div className="flex items-center justify-between gap-3 bg-destructive/10 border border-destructive/25 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2.5 text-destructive-text">
              <AlertCircle size={15} className="shrink-0" />
              <p className="text-xs font-medium">{error}</p>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="text-xs font-bold text-destructive-text hover:underline shrink-0"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Today delivery banner */}
        <TodayDeliveryBanner deliveries={todayDeliveries} />

        {/* Tab bar */}
        <div className="overflow-x-auto pb-0.5">
          <TabBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabCounts={tabCounts}
          />
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="space-y-4 py-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border p-5 space-y-3 animate-pulse shadow-xs"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-muted rounded" />
                    <div className="h-3 w-28 bg-muted rounded" />
                    <div className="h-4 w-20 bg-muted rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <EmptySubscription filtered={activeTab !== "all"} />
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub._id}
                subscription={sub}
                onCancel={openCancelDialog}
              />
            ))}
          </div>
        )}

        {/* ─── Gói khác dành cho bạn ─── */}
        {!isLoading && (
          <OtherPlansSection
            excludeBoxIds={subscriptions
              .map((sub) => sub.boxId?._id)
              .filter(Boolean)}
            onSubscribed={refresh}
          />
        )}
      </div>

      {/* ─── Cancel Dialog ─── */}
      <CancelDialog
        target={cancelTarget}
        open={cancelDialogOpen}
        cancelling={cancelling}
        onClose={closeCancelDialog}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
