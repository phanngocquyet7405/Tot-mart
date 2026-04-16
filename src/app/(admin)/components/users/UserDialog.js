"use client";

import { useState, useEffect } from "react";
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
import { Loader2 } from "lucide-react";
import { userService } from "@/app/services/api/userService";
import { toast } from "sonner"; // Sử dụng Sonner

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
          phone: user.phone || "",
          avatar: user.avatar || "",
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isEdit) {
        await userService.updateUser(user._id, formData);
        toast.success("Cập nhật thông tin thành công");
      } else {
        await userService.createUser(formData);
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
            {isEdit ? `Chỉnh sửa: ${user.name}` : "Thêm người dùng mới"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin chính</TabsTrigger>
            <TabsTrigger value="address" disabled={!isEdit}>
              Địa chỉ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Họ và tên</Label>
                <Input
                  name="fullName"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              {!isEdit && (
                <>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mật khẩu</Label>
                    <Input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>Số điện thoại</Label>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? "Lưu thay đổi" : "Tạo người dùng"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
