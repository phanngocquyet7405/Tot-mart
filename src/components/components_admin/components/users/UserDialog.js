"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Plus, Trash2, User } from "lucide-react";
import { userService } from "@/app/services/api/userService";
import { toast } from "sonner";

function AddressTab({ userId, addresses = [] }) {
  const [list, setList] = useState(addresses);
  const [isSaving, setIsSaving] = useState(false);

  const addAddress = () => {
    setList((prev) => [
      ...prev,
      { country: "", city: "", district: "", address: "", phone: "" },
    ]);
  };

  const removeAddress = (idx) => {
    setList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (idx, field, value) => {
    setList((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await userService.updateUser(userId, { addresses: list });
      toast.success("Cập nhật địa chỉ thành công");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lưu địa chỉ thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pt-4">
      {list.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
          <MapPin size={28} className="opacity-30" />
          <p className="text-sm">Chưa có địa chỉ nào được lưu.</p>
        </div>
      ) : (
        list.map((addr, idx) => (
          <div
            key={idx}
            className="border rounded-lg p-4 space-y-3 bg-muted/20 relative"
          >
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className="text-xs font-normal">
                Địa chỉ {idx + 1}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                onClick={() => removeAddress(idx)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase opacity-70">
                  Quốc gia
                </Label>
                <Input
                  value={addr.country}
                  onChange={(e) => handleChange(idx, "country", e.target.value)}
                  placeholder="Việt Nam"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase opacity-70">
                  Tỉnh / Thành phố
                </Label>
                <Input
                  value={addr.city}
                  onChange={(e) => handleChange(idx, "city", e.target.value)}
                  placeholder="Hà Nội"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase opacity-70">
                  Quận / Huyện
                </Label>
                <Input
                  value={addr.district}
                  onChange={(e) =>
                    handleChange(idx, "district", e.target.value)
                  }
                  placeholder="Đống Đa"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] uppercase opacity-70">
                  Số điện thoại
                </Label>
                <Input
                  value={addr.phone}
                  onChange={(e) => handleChange(idx, "phone", e.target.value)}
                  placeholder="0912..."
                  className="h-8 text-sm"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-[11px] uppercase opacity-70">
                  Địa chỉ chi tiết
                </Label>
                <Input
                  value={addr.address}
                  onChange={(e) => handleChange(idx, "address", e.target.value)}
                  placeholder="Số nhà, tên đường..."
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        ))
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={addAddress}
        className="w-full gap-1.5 border-dashed border-2"
      >
        <Plus size={14} /> Thêm địa chỉ mới
      </Button>

      <div className="flex justify-end gap-2 pt-2">
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          {isSaving && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
          Lưu danh sách địa chỉ
        </Button>
      </div>
    </div>
  );
}

export default function UserDialog({ open, onOpenChange, user, onSuccess }) {
  const isEdit = !!user;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    avatar: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setFormData({
          name: user.name || "",
          phone: user.phone || user.addresses?.[0]?.phone || "",
          avatar: user.avatar?.url || "",
          email: user.email || "",
        });
      } else {
        setFormData({
          name: "",
          phone: "",
          email: "",
          password: "",
          avatar: "",
        });
      }
    }
  }, [user, open, isEdit]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error("Vui lòng nhập họ và tên");
    if (!isEdit && !formData.email.trim())
      return toast.error("Vui lòng nhập email");
    if (!isEdit && !formData.password)
      return toast.error("Vui lòng nhập mật khẩu");

    setIsSaving(true);
    try {
      if (isEdit) {
        const payload = {
          name: formData.name,
          phone: formData.phone,
          ...(formData.avatar && { avatar: { url: formData.avatar } }),
        };
        await userService.updateUser(user._id, payload);
        toast.success("Cập nhật thông tin thành công");
      } else {
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          ...(formData.phone && { phone: formData.phone }),
        };
        await userService.createUser(payload);
        toast.success("Đã thêm người dùng mới");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? (
              <span>
                Chỉnh sửa người dùng:{" "}
                <span className="text-indigo-600 font-bold">{user.name}</span>
              </span>
            ) : (
              "Thêm người dùng mới"
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin chính</TabsTrigger>
            <TabsTrigger value="address" disabled={!isEdit}>
              Địa chỉ
              {isEdit && user.addresses?.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-4 px-1.5 text-[10px]"
                >
                  {user.addresses.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                />
              </div>

              {!isEdit && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912 345 678"
                />
              </div>

              {isEdit && (
                <div className="space-y-2">
                  <Label htmlFor="avatar">Link ảnh đại diện (URL)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="avatar"
                      name="avatar"
                      value={formData.avatar}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="flex-1"
                    />
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-muted bg-muted flex items-center justify-center">
                      {formData.avatar ? (
                        <Image
                          src={formData.avatar}
                          alt="Avatar Preview"
                          fill
                          unoptimized={true}
                          className="object-cover"
                          onError={() =>
                            setFormData((p) => ({ ...p, avatar: "" }))
                          }
                        />
                      ) : (
                        <User className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Lưu thay đổi" : "Tạo người dùng"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="address">
            {isEdit && (
              <AddressTab userId={user._id} addresses={user.addresses || []} />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
