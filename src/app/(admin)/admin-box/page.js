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
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

import Image from "next/image";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { BoxFormDialog } from "../components/box/BoxFormDialog";

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
      // Thử set trực tiếp res.data hoặc log ra để kiểm tra
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("vi-VN");
  };

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Search */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <CardTitle>Danh sách Box</CardTitle>

            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-75">
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

        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
          ) : filteredBoxes.length === 0 ? (
            <div className="text-center py-20">
              <Package className="mx-auto h-12 w-12 text-slate-300" />

              <h3 className="mt-4 text-lg font-semibold">Không có dữ liệu</h3>

              <p className="text-slate-500 text-sm">Chưa có box nào được tạo</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredBoxes.map((box) => (
                <Card
                  key={box._id}
                  className="overflow-hidden border hover:shadow-lg transition-all"
                >
                  {/* Image */}
                  <div className="relative h-60 bg-slate-100">
                    <Image
                      src={box?.images?.[0]?.url || "/placeholder.png"}
                      alt={box.name}
                      fill
                      className="object-cover"
                    />

                    <div className="absolute top-3 left-3 flex gap-2">
                      {box.isGift && (
                        <Badge className="bg-pink-600">
                          <Gift className="mr-1 h-3 w-3" />
                          Gift
                        </Badge>
                      )}

                      {box.discountPercent > 0 && (
                        <Badge className="bg-red-600">
                          <BadgePercent className="mr-1 h-3 w-3" />-
                          {box.discountPercent}%
                        </Badge>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <Badge
                        variant={
                          isExpired(box.validTo) ? "destructive" : "default"
                        }
                      >
                        {isExpired(box.validTo) ? "Hết hạn" : "Đang bán"}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent className="p-5 space-y-4">
                    <div>
                      <h2 className="text-xl font-bold line-clamp-1">
                        {box.name}
                      </h2>

                      <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                        {box.descriptions}
                      </p>
                    </div>

                    <Separator />

                    {/* Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Giá trị box</p>

                        <h3 className="font-bold text-indigo-600">
                          {formatCurrency(box.value)}
                        </h3>
                      </div>

                      <div>
                        <p className="text-slate-500">Tồn kho</p>

                        <h3 className="font-bold">{box.stock}</h3>
                      </div>

                      <div>
                        <p className="text-slate-500">Tổng sản phẩm</p>

                        <h3 className="font-bold">
                          {box.totalItem || box.products?.length || 0}
                        </h3>
                      </div>

                      <div>
                        <p className="text-slate-500">Sản phẩm trong box</p>

                        <h3 className="font-bold">
                          {box.products?.length || 0}
                        </h3>
                      </div>
                    </div>

                    <Separator />

                    {/* Dates */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Từ ngày:</span>

                        <span className="font-medium">
                          {formatDate(box.validFrom)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">Đến ngày:</span>

                        <span className="font-medium">
                          {formatDate(box.validTo)}
                        </span>
                      </div>
                    </div>

                    {/* Product Preview */}
                    {box.products?.length > 0 && (
                      <>
                        <Separator />

                        <div>
                          <p className="font-medium mb-2 text-sm">
                            Sản phẩm trong box
                          </p>

                          <div className="space-y-2 max-h-28 overflow-y-auto">
                            {box.products.slice(0, 4).map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-sm bg-slate-50 rounded-lg p-2"
                              >
                                <span className="line-clamp-1">
                                  {item.name ||
                                    item.productId?.name ||
                                    "Sản phẩm"}
                                </span>

                                <span className="font-medium">
                                  x{item.quantity}
                                </span>
                              </div>
                            ))}

                            {box.products.length > 4 && (
                              <p className="text-xs text-slate-400 text-center">
                                +{box.products.length - 4} sản phẩm khác
                              </p>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1">
                        <Eye className="mr-2 h-4 w-4" />
                        Chi tiết
                      </Button>

                      <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => {
                          setEditTarget(box);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Sửa
                      </Button>

                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setDeleteTarget(box)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form */}
      <BoxFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        box={editTarget}
        onSuccess={fetchBoxes}
      />

      {/* Delete Dialog */}
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
