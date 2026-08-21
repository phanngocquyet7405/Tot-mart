"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchAdminOrders,
  updateAdminOrderStatus,
  ORDER_STATUS,
} from "../services/ordersAdminService";

export function useAdminOrdersTable() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminOrders();
      setOrders(data);
    } catch {
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const refresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // ─── Đếm theo trạng thái — cho tab filter ────────────────────────────────
  const statusCounts = useMemo(() => {
    const counts = { all: orders.length };
    for (const status of Object.values(ORDER_STATUS)) {
      counts[status] = orders.filter((o) => o.status === status).length;
    }
    return counts;
  }, [orders]);

  // ─── Filter + search ──────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    let list = orders;

    if (statusFilter !== "all") {
      list = list.filter((o) => o.status === statusFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((o) => {
        const code = (o.code || "").toLowerCase();
        const name = (o.customer?.name || "").toLowerCase();
        const phone = (o.customer?.phone || "").toLowerCase();
        return code.includes(q) || name.includes(q) || phone.includes(q);
      });
    }

    return list;
  }, [orders, statusFilter, search]);

  // ─── Detail dialog ────────────────────────────────────────────────────────
  const openDetail = useCallback((order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  }, []);

  const closeDetail = useCallback(() => {
    setIsDetailOpen(false);
  }, []);

  // ─── Đổi trạng thái ───────────────────────────────────────────────────────
  const changeStatus = useCallback(
    async (order, nextStatus) => {
      if (!order?.id) return;
      setIsUpdatingStatus(true);
      try {
        await updateAdminOrderStatus(order.id, nextStatus);
        toast.success(`Đã cập nhật đơn ${order.code} sang trạng thái mới`);
        setSelectedOrder((prev) =>
          prev && prev.id === order.id ? { ...prev, status: nextStatus } : prev,
        );
        refresh();
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Cập nhật trạng thái thất bại",
        );
      } finally {
        setIsUpdatingStatus(false);
      }
    },
    [refresh],
  );

  return {
    orders,
    filteredOrders,
    isLoading,
    statusCounts,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    selectedOrder,
    isDetailOpen,
    openDetail,
    closeDetail,
    isUpdatingStatus,
    changeStatus,
    refresh,
  };
}
