"use client"

import { useEffect, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ConfirmDialog({ open, onOpenChange, product, onConfirm }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xoá sản phẩm?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn chắc chắn muốn xoá "{product?.name}"? Hành động này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Huỷ</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Xoá sản phẩm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export function StockDialog({ open, onOpenChange, product, onConfirm }) {
  const [delta, setDelta] = useState("")
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (open) {
      setDelta("")
      setReason("")
    }
  }, [open, product?._id])

  const next = (product?.stock || 0) + Number(delta || 0)
  const valid = delta !== "" && Number(delta) !== 0 && next >= 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
          <DialogDescription>{product?.name} · Tồn hiện tại: {product?.stock}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2"><Label htmlFor="delta">Mức điều chỉnh</Label><Input id="delta" type="number" value={delta} onChange={(event) => setDelta(event.target.value)} placeholder="Ví dụ: -2 hoặc 10" /></div>
          <p className={next < 0 ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>Tồn sau điều chỉnh: <strong>{next}</strong></p>
          <div className="grid gap-2"><Label htmlFor="reason">Lý do <span className="text-muted-foreground">(không bắt buộc)</span></Label><Input id="reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Nhập lý do điều chỉnh" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
          <Button disabled={!valid} onClick={() => onConfirm(Number(delta), reason.trim())}>Lưu điều chỉnh</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ProductSheet({ open, onOpenChange, product, onSave, categories, brands }) {
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", brand: "", stock: "", images: [] })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) setForm(product ? { name: product.name || "", description: product.description || "", price: product.price || "", category: product.category?.name || "", brand: product.brand?.name || "", stock: product.stock ?? "", images: product.images || [] } : { name: "", description: "", price: "", category: categories[0] || "", brand: brands[0] || "", stock: "", images: [] })
  }, [open, product, categories, brands])

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const validate = () => {
    const next = {}
    if (form.name.trim().length < 3 || form.name.trim().length > 100) next.name = "Tên sản phẩm từ 3 đến 100 ký tự."
    if (form.description.length > 500) next.description = "Mô tả tối đa 500 ký tự."
    if (!Number.isInteger(Number(form.price)) || Number(form.price) <= 0) next.price = "Giá phải là số nguyên lớn hơn 0."
    if (!form.category) next.category = "Vui lòng chọn danh mục."
    if (!form.brand) next.brand = "Vui lòng chọn thương hiệu."
    if (!product && (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0)) next.stock = "Tồn kho phải là số nguyên không âm."
    setErrors(next)
    return Object.keys(next).length === 0
  }
  const save = async () => { if (!validate()) return; setSaving(true); await new Promise((resolve) => setTimeout(resolve, 400)); onSave(form); setSaving(false) }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{product ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}</DialogTitle><DialogDescription>Nhập thông tin sản phẩm bằng tiếng Việt.</DialogDescription></DialogHeader><div className="grid gap-4 pb-16">
    {[['name','Tên sản phẩm','text'],['description','Mô tả','textarea'],['price','Giá (VNĐ)','number'],...(!product ? [['stock','Tồn kho','number']] : [])].map(([key,label,type]) => <div className="grid gap-2" key={key}><Label htmlFor={`product-${key}`}>{label}</Label>{type === 'textarea' ? <textarea id={`product-${key}`} className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm" value={form[key]} onChange={(event) => update(key, event.target.value)} /> : <Input id={`product-${key}`} type={type} value={form[key]} onChange={(event) => update(key, event.target.value)} />}{errors[key] && <p className="text-sm text-destructive">{errors[key]}</p>}</div>)}
    <div className="grid gap-2"><Label htmlFor="product-category">Danh mục</Label><select id="product-category" className="h-10 rounded-md border bg-background px-3 text-sm" value={form.category} onChange={(event) => update('category', event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select>{errors.category && <p className="text-sm text-destructive">{errors.category}</p>}</div>
    <div className="grid gap-2"><Label htmlFor="product-brand">Thương hiệu</Label><select id="product-brand" className="h-10 rounded-md border bg-background px-3 text-sm" value={form.brand} onChange={(event) => update('brand', event.target.value)}>{brands.map((item) => <option key={item}>{item}</option>)}</select>{errors.brand && <p className="text-sm text-destructive">{errors.brand}</p>}</div>
  </div><DialogFooter className="sticky bottom-0 bg-background pt-3"><Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button><Button disabled={saving} onClick={save}>{saving ? "Đang lưu…" : "Lưu sản phẩm"}</Button></DialogFooter></DialogContent></Dialog>
}

export function ImageUploader() { return <p className="text-xs text-muted-foreground">Ảnh có thể thêm sau khi lưu sản phẩm.</p> }
