"use client";

import { Camera, Loader2 } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ProfileInfo({ name, email, avatarUrl, onSave, saving }) {
  const [form, setForm] = useState({ name, email });
  const [preview, setPreview] = useState(avatarUrl);
  const [error, setError] = useState(null);

  const handleUploadPreview = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Vui lòng nhập họ và tên");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }
    setError(null);
    await onSave({ ...form, avatarUrl: preview });
  };

  return (
    <Card className="border-border bg-card shadow-xs rounded-2xl">
      <CardHeader>
        <CardTitle className="text-foreground text-lg font-bold">
          Thông tin cá nhân
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 ring-2 ring-primary/20">
            <AvatarImage src={preview} alt={form.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
              {form.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <label className="w-full sm:w-auto">
            <input
              className="hidden"
              accept="image/*"
              type="file"
              onChange={handleUploadPreview}
            />
            <span className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 min-h-11 text-xs font-semibold text-foreground hover:bg-muted transition-colors">
              <Camera className="h-4 w-4" />
              Thay đổi ảnh đại diện
            </span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 text-left">
            <label htmlFor="profile-name" className="block text-sm font-medium text-foreground">
              Họ và tên <span className="text-destructive">*</span>
            </label>
            <Input
              id="profile-name"
              name="name"
              autoComplete="name"
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }));
                if (error) setError(null);
              }}
              placeholder="Nguyễn Văn A"
              className="min-h-11 rounded-xl border-border bg-card text-foreground"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <label htmlFor="profile-email" className="block text-sm font-medium text-foreground">
              Địa chỉ email <span className="text-destructive">*</span>
            </label>
            <Input
              id="profile-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, email: e.target.value }));
                if (error) setError(null);
              }}
              placeholder="you@totmart.com"
              className="min-h-11 rounded-xl border-border bg-card text-foreground"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-xs text-destructive-text font-medium">
            {error}
          </p>
        )}

        <Button
          className="min-h-11 bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 rounded-xl px-5 shadow-xs"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Lưu thay đổi
        </Button>
      </CardContent>
    </Card>
  );
}
