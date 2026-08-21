"use client";

import { ShoppingBag, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { AdminPageHeader, AdminLoadingState } from "../components/shared";
import { OrderTable } from "../components/orders/OrderTable";
import { OrderDetailDialog } from "../components/orders/OrderDetailDialog";
import { withAdmin } from "@/app/middleware/roleMiddleware";
import { useAdminOrdersTable } from "./hooks/useAdminOrdersTable";
import { ORDER_STATUS_CONFIG } from "./services/ordersAdminService";

const STATUS_TABS = [
  { value: "all", label: "Tất cả" },
  ...Object.entries(ORDER_STATUS_CONFIG).map(([value, cfg]) => ({
    value,
    label: cfg.label,
  })),
];

function AdminOrdersPage() {
  const {
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
  } = useAdminOrdersTable();

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title="Quản lý đơn hàng"
        description="Xem, xác nhận và cập nhật trạng thái đơn hàng"
        icon={ShoppingBag}
        actions={
          <Button variant="outline" onClick={refresh} disabled={isLoading}>
            <RefreshCw className={isLoading ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"} />
            Làm mới
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-4 space-y-4">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              placeholder="Tìm theo mã đơn, tên hoặc SĐT khách hàng..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="flex-wrap h-auto justify-start">
              {STATUS_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                  {tab.label}
                  <span className="text-[10px] text-muted-foreground">
                    ({statusCounts[tab.value] ?? 0})
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <AdminLoadingState message="Đang tải danh sách đơn hàng..." />
          ) : (
            <OrderTable orders={filteredOrders} onViewDetail={openDetail} />
          )}
        </CardContent>
      </Card>

      <OrderDetailDialog
        open={isDetailOpen}
        onOpenChange={closeDetail}
        order={selectedOrder}
        onChangeStatus={changeStatus}
        isUpdatingStatus={isUpdatingStatus}
      />
    </div>
  );
}

/**
 * THỰC THI BẢO MẬT:
 * Chỉ user có token hợp lệ và role === 'admin' mới truy cập được route này.
 */
export default withAdmin(AdminOrdersPage);
