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
} from "lucide-react";
import { axiosConfig } from "@/app/services/api/axiosConfig";

const money = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value || 0);

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
  shipped: "Đang giao",
  delivered: "Đã giao",
  completed: "Đã hoàn tất",
  cancelled: "Đã hủy",
  returned: "Đã trả hàng",
  on_hold: "Tạm giữ",
};

const statusTone = {
  pending: "text-amber-700 bg-amber-50",
  processing: "text-blue-700 bg-blue-50",
  shipped: "text-violet-700 bg-violet-50",
  delivered: "text-emerald-700 bg-emerald-50",
  completed: "text-emerald-700 bg-emerald-50",
  cancelled: "text-stone-500 bg-stone-100",
};

function OrderCard({ order, onConfirmReceipt, confirming }) {
  const canConfirm = order.status === "shipped" && order.paymentMethod === "online" && order.paymentStatus === "paid";
  return (
    <article className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_10px_30px_-24px_rgba(58,43,33,0.45)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
          <span className={`rounded-full px-2.5 py-1 text-[10px] tracking-normal ${statusTone[order.status] || "bg-stone-100 text-stone-600"}`}>
            {statusCopy[order.status] || order.status}
          </span>
          <span className="text-stone-300">•</span>
          <span>{order.orderId || `#${order._id?.slice(-8)}`}</span>
        </div>
        <span className="text-xs text-stone-400">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
      </header>

      <div className="divide-y divide-stone-100">
        {(order.products || []).map((item, index) => (
          <div key={`${order._id}-${index}`} className="flex items-center gap-3 px-4 py-3 sm:px-5">
            <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f6efe8] text-stone-400">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" className="size-full object-cover" />
              ) : <ShoppingBag size={18} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-stone-800">{item.name || "Sản phẩm TotMart"}</p>
              <p className="mt-1 text-xs text-stone-400">x{item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-stone-700">{money(item.totalPrice)}</p>
          </div>
        ))}
      </div>

      <footer className="flex flex-col gap-3 bg-[#fcfaf7] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-xs text-stone-500">Tổng thanh toán</p>
          <p className="text-lg font-black text-[#b95735]">{money(order.totalAmount)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-600 hover:border-stone-300">
              Chi tiết <ChevronRight size={13} />
            </summary>
            <div className="absolute bottom-11 right-0 z-10 w-72 rounded-xl border border-stone-200 bg-white p-4 text-xs text-stone-600 shadow-xl">
              <p className="font-bold text-stone-800">Thông tin giao hàng</p>
              <p className="mt-2">{order.shippingAddress?.fullName} · {order.shippingAddress?.phone}</p>
              <p className="mt-1">{[order.shippingAddress?.address, order.shippingAddress?.district, order.shippingAddress?.city].filter(Boolean).join(", ")}</p>
            </div>
          </details>
          {canConfirm && (
            <button
              type="button"
              onClick={() => onConfirmReceipt(order._id)}
              disabled={confirming === order._id}
              className="rounded-xl bg-[#b95735] px-4 py-2 text-xs font-black text-white transition hover:bg-[#994629] disabled:cursor-wait disabled:opacity-60"
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

  const loadOrders = async () => {
    setRefreshing(true);
    setError("");
    try {
      const response = await axiosConfig.get("/orders", { params: { page: 1, limit: 50 } });
      const payload = response.data?.data || response.data;
      setResult({ data: Array.isArray(payload) ? payload : payload?.data || [], pagination: payload?.pagination });
    } catch {
      setError("Không thể tải đơn hàng. Vui lòng thử lại.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const orders = useMemo(() => result?.data || [], [result]);
  const counts = useMemo(() => statusGroups.reduce((acc, group) => {
    acc[group.key] = group.key === "all" ? orders.length : orders.filter((order) => order.status === group.key).length;
    return acc;
  }, {}), [orders]);
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = activeStatus === "all" || order.status === activeStatus;
    const query = search.trim().toLowerCase();
    return matchesStatus && (!query || `${order.orderId} ${order.products?.map((item) => item.name).join(" ")}`.toLowerCase().includes(query));
  });

  const confirmReceipt = async (orderId) => {
    setConfirming(orderId);
    try {
      const confirmed = await axiosConfig.post(`/orders/${orderId}/confirm-receipt`);
      setResult((current) => current ? { ...current, data: current.data.map((order) => order._id === orderId ? { ...order, status: confirmed.data.status } : order) } : current);
      toast.success("Đã xác nhận nhận hàng. Cảm ơn bạn!");
    } catch {
      toast.error("Chưa thể xác nhận nhận hàng. Vui lòng thử lại.");
    } finally {
      setConfirming(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f5f0] px-4 py-6 text-stone-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link href="/profile" className="mb-3 inline-flex items-center gap-1 text-xs font-bold text-stone-400 hover:text-[#b95735]"><ArrowLeft size={14} /> Hồ sơ cá nhân</Link>
            <h1 className="text-3xl font-black tracking-tight text-stone-900">Đơn hàng của tôi</h1>
            <p className="mt-1 text-sm text-stone-500">Theo dõi hành trình của từng món quà TotMart.</p>
          </div>
          <button type="button" onClick={loadOrders} disabled={refreshing} className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-600 hover:border-stone-300 disabled:opacity-60"><RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Làm mới</button>
        </div>

        <div className="mb-5 overflow-x-auto rounded-2xl border border-stone-200 bg-white p-1">
          <div className="flex min-w-max">
            {statusGroups.map(({ key, label, icon: Icon }) => (
              <button key={key} type="button" onClick={() => setActiveStatus(key)} className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition sm:px-5 ${activeStatus === key ? "border-[#b95735] text-[#b95735]" : "border-transparent text-stone-500 hover:text-stone-800"}`}>
                <Icon size={14} /> {label}<span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px]">{counts[key] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3">
          <Search size={16} className="text-stone-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo mã đơn hoặc tên sản phẩm" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-stone-400" />
        </div>

        {error ? <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{error}<button type="button" onClick={loadOrders} className="ml-2 font-bold underline">Thử lại</button></div> : !result ? <div role="status" className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">Đang tải đơn hàng...</div> : filteredOrders.length ? <div className="flex flex-col gap-4">{filteredOrders.map((order) => <OrderCard key={order._id} order={order} onConfirmReceipt={confirmReceipt} confirming={confirming} />)}</div> : <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center"><ShoppingBag className="mx-auto mb-3 text-stone-300" size={30} /><p className="font-bold text-stone-700">Chưa có đơn hàng trong mục này</p><p className="mt-1 text-sm text-stone-400">Hãy khám phá những món quà mới từ TotMart.</p><Link href="/products" className="mt-5 inline-flex rounded-xl bg-[#b95735] px-4 py-2 text-xs font-black text-white">Mua sắm ngay</Link></div>}
      </div>
    </main>
  );
}
