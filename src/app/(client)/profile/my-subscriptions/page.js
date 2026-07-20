/**
 * page.js — Client: Trang quản lý gói đăng ký cá nhân
 * Route: /my-subscriptions
 *
 * Pure orchestrator: chỉ compose hooks + components, không có logic trực tiếp
 */

"use client";

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
    { key: "completed", label: "Hoàn thành" },
  ];

  return (
    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
            activeTab === tab.key
              ? "bg-white text-stone-800 shadow-sm"
              : "text-stone-500 hover:text-stone-700"
          }`}
        >
          {tab.label}
          <span
            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key
                ? "bg-[#C85C3C] text-white"
                : "bg-stone-200 text-stone-500"
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
    <div className="bg-linear-to-r from-[#C85C3C] to-[#E8835E] rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        <Truck size={18} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-black text-white uppercase tracking-wider">
          Giao hàng hôm nay
        </p>
        <p className="text-[11px] text-white/80 mt-0.5">
          Bạn có{" "}
          <span className="font-black text-white">{deliveries.length}</span> đơn
          hàng được giao hôm nay
        </p>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
        <span className="text-sm font-black text-white">
          {deliveries.length}
        </span>
      </div>
    </div>
  );
}

// ─── Gói khác dành cho bạn ─────────────────────────────────────────────────
function OtherPlansSection({ excludeBoxIds, onSubscribed }) {
  const { otherPlans, isLoading } = useOtherPlans(excludeBoxIds);
  const [selectedBoxForModal, setSelectedBoxForModal] = useState(null);

  if (!isLoading && otherPlans.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 pb-16">
      <div className="flex items-center gap-2 mb-5">
        <Package size={16} className="text-[#C85C3C]" />
        <h2 className="text-sm font-black text-stone-800 uppercase tracking-widest">
          Gói khác dành cho bạn
        </h2>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-stone-400 text-xs py-6">
          <Loader2 size={14} className="animate-spin" />
          Đang tải gợi ý...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherPlans.map((box, index) => (
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
            onSubscribed?.(); // refresh danh sách gói đã đăng ký ở trên sau khi đóng modal
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
    <div className="min-h-screen bg-[#FFFAF8]">
      {/* ─── Page Header ─── */}
      <div className="sticky top-0 z-10 bg-[#FFFAF8]/95 backdrop-blur-md border-b border-[#F0DDD5]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="w-8 h-8 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors text-stone-500"
              >
                <ArrowLeft size={15} />
              </Link>
              <div>
                <h1 className="text-base font-black text-stone-800 leading-tight">
                  Gói đăng ký của tôi
                </h1>
                <p className="text-[10px] text-stone-400">
                  Quản lý các gói subscription box
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refresh}
                disabled={isLoading}
                className="w-8 h-8 rounded-xl border border-stone-200 bg-white flex items-center justify-center text-stone-400 hover:text-stone-600 transition-all"
              >
                <RefreshCw
                  size={13}
                  className={isLoading ? "animate-spin" : ""}
                />
              </button>

              <Link
                href="/products/Subscriber"
                className="flex items-center gap-1.5 px-3 py-2 bg-[#C85C3C] text-white rounded-xl text-[11px] font-black uppercase tracking-wide hover:bg-[#B14B2D] transition-colors"
              >
                <Sparkles size={11} />
                Thêm gói
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-700 font-medium">{error}</p>
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
          <div className="flex flex-col items-center py-24 gap-4">
            <Loader2 size={32} className="animate-spin text-stone-300" />
            <p className="text-sm text-stone-400">Đang tải gói đăng ký...</p>
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
      </div>

      {/* ─── Gói khác dành cho bạn ─── */}
      {!isLoading && (
        <OtherPlansSection
          excludeBoxIds={subscriptions
            .map((sub) => sub.boxId?._id)
            .filter(Boolean)}
          onSubscribed={refresh}
        />
      )}

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
