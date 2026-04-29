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
      setError("Name is required");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setError("Please enter a valid email");
      return;
    }
    setError(null);
    await onSave({ ...form, avatarUrl: preview });
  };

  return (
    <Card className="border-emerald-100">
      <CardHeader>
        <CardTitle className="text-emerald-700">Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 ring-2 ring-emerald-200">
            <AvatarImage src={preview} alt={form.name} />
            <AvatarFallback>
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
            <span className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
              <Camera className="h-4 w-4" />
              Upload Avatar
            </span>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Name</label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="you@totmart.com"
            />
          </div>
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <Button
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Profile
        </Button>
      </CardContent>
    </Card>
  );
}
