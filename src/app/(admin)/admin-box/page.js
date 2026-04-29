"use client";

import { useState, useEffect, useRef } from "react";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  MoreHorizontal,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Tag,
  Calendar,
  Layers,
  Gift,
  AlertTriangle,
  X,
  Upload,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";

// ✅ Chỉnh sửa phần import: Sử dụng named exports từ boxService
import {
  getAllBoxesApi,
  createBoxApi,
  updateBoxApi,
  deleteBoxApi,
} from "@/app/services/api/boxService";

// ─── HELPERS ────────────────────────────────────────────────────────────────
const formatCurrency = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n ?? 0,
  );

const formatDate = (d) => {
  if (!d) return "—";
  try {
    return format(new Date(d), "dd/MM/yyyy", { locale: vi });
  } catch {
    return "—";
  }
};

const EMPTY_FORM = {
  name: "",
  descriptions: "",
  stock: "",
  validFrom: "",
  validTo: "",
  discountPercent: 0,
  isGift: false,
  products: [],
};

// ─── COMPONENTS ─────────────────────────────────────────────────────────────
function ProductRow({ item, onChange, onRemove }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <Input
        className="col-span-5"
        placeholder="Product ID"
        value={item._id}
        onChange={(e) => onChange({ ...item, _id: e.target.value })}
      />
      <Input
        className="col-span-3"
        placeholder="Tên SP"
        value={item.name}
        onChange={(e) => onChange({ ...item, name: e.target.value })}
      />
      <Input
        className="col-span-2"
        type="number"
        placeholder="Giá"
        value={item.price}
        onChange={(e) => onChange({ ...item, price: Number(e.target.value) })}
      />
      <Input
        className="col-span-1"
        type="number"
        min={1}
        placeholder="SL"
        value={item.quantity}
        onChange={(e) =>
          onChange({ ...item, quantity: Number(e.target.value) })
        }
      />
      <Button
        variant="ghost"
        size="icon"
        className="col-span-1 h-8 w-8 text-destructive hover:bg-red-50"
        onClick={onRemove}
      >
        <X size={14} />
      </Button>
    </div>
  );
}

// ─── BOX FORM DIALOG ────────────────────────────────────────────────────────
function BoxFormDialog({ open, onOpenChange, box, onSuccess }) {
  const isEdit = !!box;
  const [form, setForm] = useState(EMPTY_FORM);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setForm({
          name: box.name || "",
          descriptions: box.descriptions || "",
          stock: box.stock ?? "",
          validFrom: box.validFrom ? box.validFrom.split("T")[0] : "",
          validTo: box.validTo ? box.validTo.split("T")[0] : "",
          discountPercent: box.discountPercent ?? 0,
          isGift: box.isGift ?? false,
          products: (box.products || []).map((p) => ({
            _id: p.productId || p._id || "",
            name: p.name || "",
            price: p.price || 0,
            quantity: p.quantity || 1,
          })),
        });
        setPreviews((box.images || []).map((img) => img.url));
      } else {
        setForm(EMPTY_FORM);
        setFiles([]);
        setPreviews([]);
      }
    }
  }, [open, box, isEdit]);

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error("Vui lòng nhập tên box");
    if (form.products.length === 0)
      return toast.error("Thêm ít nhất 1 sản phẩm");
    if (!isEdit && files.length === 0) return toast.error("Vui lòng chọn ảnh");

    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === "products") fd.append(key, JSON.stringify(val));
      else fd.append(key, val);
    });
    files.forEach((f) => fd.append("images", f));

    setIsSaving(true);
    try {
      if (isEdit) {
        // ✅ Cập nhật: Sử dụng updateBoxApi
        await updateBoxApi(box._id, fd);
        toast.success("Cập nhật thành công");
      } else {
        // ✅ Cập nhật: Sử dụng createBoxApi
        await createBoxApi(fd);
        toast.success("Tạo mới thành công");
      }
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi hệ thống");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Chỉnh sửa Box" : "Tạo Box mới"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên Box</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Số lượng tồn</Label>
              <Input
                type="number"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mô tả</Label>
            <Textarea
              value={form.descriptions}
              onChange={(e) =>
                setForm({ ...form, descriptions: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Giảm giá (%)</Label>
              <Input
                type="number"
                value={form.discountPercent}
                onChange={(e) =>
                  setForm({ ...form, discountPercent: Number(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Từ ngày</Label>
              <Input
                type="date"
                value={form.validFrom}
                onChange={(e) =>
                  setForm({ ...form, validFrom: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Đến ngày</Label>
              <Input
                type="date"
                value={form.validTo}
                onChange={(e) => setForm({ ...form, validTo: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={form.isGift}
              onCheckedChange={(v) => setForm({ ...form, isGift: v })}
            />
            <Label>Đánh dấu là Box quà tặng</Label>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-base font-semibold">
                Danh sách sản phẩm
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setForm({
                    ...form,
                    products: [
                      ...form.products,
                      { _id: "", name: "", price: 0, quantity: 1 },
                    ],
                  })
                }
              >
                <Plus size={14} className="mr-1" /> Thêm SP
              </Button>
            </div>
            <div className="space-y-2 border rounded-lg p-3 bg-slate-50">
              {form.products.map((p, i) => (
                <ProductRow
                  key={i}
                  item={p}
                  onChange={(val) => {
                    const newList = [...form.products];
                    newList[i] = val;
                    setForm({ ...form, products: newList });
                  }}
                  onRemove={() => {
                    setForm({
                      ...form,
                      products: form.products.filter((_, idx) => idx !== i),
                    });
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hình ảnh</Label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <input
                ref={fileRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500">
                Nhấn để tải ảnh lên (tối đa 5 ảnh)
              </p>
            </div>
            {previews.length > 0 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                {previews.map((src, i) => (
                  <div
                    key={i}
                    className="relative h-20 w-20 shrink-0 border rounded overflow-hidden"
                  >
                    <Image
                      src={src}
                      alt="preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Lưu thay đổi" : "Tạo Box"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── MAIN MANAGEMENT PAGE ───────────────────────────────────────────────────
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
      // ✅ Cập nhật: Sử dụng getAllBoxesApi
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
      // ✅ Cập nhật: Sử dụng deleteBoxApi
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Ảnh</TableHead>
                <TableHead>Tên Box</TableHead>
                <TableHead>Tồn kho</TableHead>
                <TableHead>Giảm giá</TableHead>
                <TableHead>Thời hạn</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <Loader2 className="mx-auto animate-spin text-slate-400" />
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-40 text-center text-slate-400"
                  >
                    Không tìm thấy box nào
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((box) => (
                  <TableRow key={box._id}>
                    <TableCell>
                      <div className="h-10 w-10 relative rounded border overflow-hidden">
                        <Image
                          src={box.images?.[0]?.url || "/placeholder.png"}
                          alt="box"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {box.name}
                      {box.isGift && (
                        <Badge className="ml-2 bg-pink-100 text-pink-700">
                          Quà tặng
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{box.stock}</TableCell>
                    <TableCell className="text-orange-600 font-bold">
                      {box.discountPercent}%
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(box.validFrom)} - {formatDate(box.validTo)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditTarget(box);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil size={14} className="mr-2" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTarget(box)}
                          >
                            <Trash2 size={14} className="mr-2" /> Xóa box
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
