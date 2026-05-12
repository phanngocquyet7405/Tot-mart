import { useState, useEffect, useRef } from "react";
import { Plus, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";
import { ProductRow } from "./ProductRow";

import { createBoxApi, updateBoxApi } from "@/app/services/api/boxService";

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

export function BoxFormDialog({ open, onOpenChange, box, onSuccess }) {
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
        await updateBoxApi(box._id, fd);
        toast.success("Cập nhật thành công");
      } else {
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
