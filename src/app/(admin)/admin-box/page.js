"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  Gift,
  Calendar,
  Boxes,
  BadgePercent,
} from "lucide-react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { BoxFormDialog } from "../components/box/BoxFormDialog";
import { BoxTable } from "../components/box/BoxTable";

import { getAllBoxesApi, deleteBoxApi } from "@/app/services/api/boxService";

export default function BoxManagement() {
  const [boxes, setBoxes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBoxes = async () => {
    setIsLoading(true);
    try {
      const res = await getAllBoxesApi();
      console.log("Dữ liệu API trả về:", res);
      setBoxes(res?.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách box");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoxes();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteBoxApi(deleteTarget._id);
      toast.success("Xóa box thành công");
      fetchBoxes();
    } catch (error) {
      toast.error("Xóa box thất bại");
    } finally {
      setDeleteTarget(null);
      setIsDeleting(false);
    }
  };

  const filteredBoxes = useMemo(() => {
    return boxes.filter((box) =>
      box?.name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [boxes, search]);

  const isExpired = (validTo) => {
    if (!validTo) return false;
    return new Date(validTo) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Package className="text-indigo-600" />
            Quản lý Box Sản phẩm
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý các combo sản phẩm, quà tặng và ưu đãi
          </p>
        </div>

        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Tạo Box mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tổng Box</p>
                <h2 className="text-2xl font-bold">{boxes.length}</h2>
              </div>
              <div className="p-3 rounded-xl bg-indigo-100">
                <Boxes className="text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Box quà tặng</p>
                <h2 className="text-2xl font-bold">
                  {boxes.filter((b) => b.isGift).length}
                </h2>
              </div>
              <div className="p-3 rounded-xl bg-pink-100">
                <Gift className="text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Đang hoạt động</p>
                <h2 className="text-2xl font-bold">
                  {boxes.filter((b) => !isExpired(b.validTo)).length}
                </h2>
              </div>
              <div className="p-3 rounded-xl bg-emerald-100">
                <Calendar className="text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Tổng tồn kho</p>
                <h2 className="text-2xl font-bold">
                  {boxes.reduce((acc, item) => acc + (item.stock || 0), 0)}
                </h2>
              </div>
              <div className="p-3 rounded-xl bg-amber-100">
                <Package className="text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <CardTitle>Danh sách Box</CardTitle>

            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-72">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <Input
                  placeholder="Tìm kiếm box..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={fetchBoxes}
                disabled={isLoading}
              >
                <RefreshCw
                  className={isLoading ? "animate-spin" : ""}
                  size={18}
                />
              </Button>
            </div>
          </div>
        </CardHeader>

        <BoxTable
          boxes={filteredBoxes}
          isLoading={isLoading}
          onEditClick={(box) => {
            setEditTarget(box);
            setFormOpen(true);
          }}
          onDeleteClick={(box) => setDeleteTarget(box)}
        />
      </Card>

      {/* Form Dialog */}
      <BoxFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        box={editTarget}
        onSuccess={fetchBoxes}
      />

      {/* Delete Confirm Dialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Xác nhận xóa Box
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa box <strong>{deleteTarget?.name}</strong>?
              <br />
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
              Xóa ngay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
