"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Filter } from "lucide-react";

// Import các Component UI của Dashboard
import { AdvancedFilterDrawer } from "../components/products/advanced_filter_drawer";
import { BulkActionsBar } from "../components/products/bulk_action_bar";
import { DeleteProductDialog } from "../components/products/delete_product_dialog";

// IMPORT MIDDLEWARE BẢO MẬT[cite: 11]
import { withAdmin } from "@/app/middleware/roleMiddleware";

function AdminDemoPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  const handleApplyFilters = (filters) => {
    console.log("Filters applied:", filters);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          Quản lý sản phẩm (Khu vực Admin)
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Mở Bộ Lọc
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Thống kê nhanh</CardTitle>
            <CardDescription>Tổng số sản phẩm hiện có</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1,234</p>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Chưa có hoạt động mới.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Các Component chức năng điều khiển */}
      <AdvancedFilterDrawer
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        onApplyFilters={handleApplyFilters}
      />

      <BulkActionsBar
        selectedCount={selectedCount}
        onClearSelection={() => setSelectedCount(0)}
        onDelete={() => setIsDeleteDialogOpen(true)}
      />

      <DeleteProductDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        productName="Sản phẩm Demo"
        onConfirm={() => {
          alert("Đã xác nhận xóa!");
          setSelectedCount(0);
        }}
      />
    </div>
  );
}

/**
 * THỰC THI BẢO MẬT:
 * Sử dụng withAdmin để bảo vệ route này.
 * Chỉ những người dùng có token hợp lệ và role === 'admin' mới có thể truy cập.
 */
export default withAdmin(AdminDemoPage);
