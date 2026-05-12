"use client";

import { useState, useEffect } from "react";
import { Package, Plus, Search, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { toast } from "sonner";

// Components đã phân tách
import { BoxTable } from "../components/box/BoxTable";
import { BoxFormDialog } from "../components/box/BoxFormDialog";

// API services
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
      setBoxes(res.data?.data || []);
    } catch {
      toast.error("Không thể tải danh sách");
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
      toast.success("Đã xóa box");
      fetchBoxes();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const filtered = boxes.filter((b) =>
    b.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="text-indigo-600" /> Quản lý Box Sản phẩm
          </h1>
          <p className="text-slate-500 text-sm">
            Quản lý các gói sản phẩm và quà tặng
          </p>
        </div>
        <Button
          onClick={() => {
            setEditTarget(null);
            setFormOpen(true);
          }}
          className="bg-indigo-600"
        >
          <Plus size={18} className="mr-2" /> Tạo Box mới
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <Input
                placeholder="Tìm kiếm tên box..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="ghost"
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
        </CardHeader>
        <CardContent className="p-0">
          <BoxTable
            boxes={filtered}
            isLoading={isLoading}
            onEditClick={(box) => {
              setEditTarget(box);
              setFormOpen(true);
            }}
            onDeleteClick={(box) => setDeleteTarget(box)}
          />
        </CardContent>
      </Card>

      <BoxFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        box={editTarget}
        onSuccess={fetchBoxes}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Xác nhận xóa?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn box{" "}
              <strong>{deleteTarget?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{" "}
              Xóa ngay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
