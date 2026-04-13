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
import { Filter, Trash2, MousePointer2 } from "lucide-react";
import { AdvancedFilterDrawer } from "../components/products/advanced_filter_drawer";
import { BulkActionsBar } from "../components/products/bulk_action_bar";
import { DeleteProductDialog } from "../components/products/delete_product_dialog";

export default function AdminDemoPage() {
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
          Product Management Demo
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsFilterOpen(true)}>
            <Filter className="mr-2 h-4 w-4" />
            Mở Bộ Lọc
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>...</Card>
        <Card className="col-span-1 md:col-span-2">...</Card>
      </div>

      {/* Các Component chức năng */}
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
          alert("Xóa!");
          setSelectedCount(0);
        }}
      />
    </div>
  );
}
