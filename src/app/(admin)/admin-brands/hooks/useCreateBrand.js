"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createAdminBrand } from "../services/brandsAdminService";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024; // 2MB — khớp giới hạn của brandLogoUpload.js ở backend

const INITIAL_FORM = {
  name: "",
  description: "",
  cityAddress: "",
};

export function useCreateBrand() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dọn URL preview để tránh rò rỉ bộ nhớ
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const updateField = useCallback(
    (field) => (eOrValue) => {
      const value =
        eOrValue && typeof eOrValue === "object" && "target" in eOrValue
          ? eOrValue.target.value
          : eOrValue;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    },
    [errors],
  );

  const handleLogoChange = useCallback(
    (file) => {
      if (!file) return;
      if (!ALLOWED_TYPES.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          logo: "Logo phải là ảnh JPEG, PNG hoặc WebP.",
        }));
        return;
      }
      if (file.size > MAX_SIZE) {
        setErrors((prev) => ({ ...prev, logo: "Logo tối đa 2MB." }));
        return;
      }
      setErrors((prev) => ({ ...prev, logo: "" }));
      setLogoFile(file);
      setLogoPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(file);
      });
    },
    [],
  );

  const clearLogo = useCallback(() => {
    setLogoFile(null);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const validate = useCallback(() => {
    const e = {};
    if (!form.name.trim()) e.name = "Tên thương hiệu là bắt buộc.";
    else if (form.name.trim().length < 3)
      e.name = "Tên thương hiệu tối thiểu 3 ký tự.";
    return e;
  }, [form]);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      const errs = validate();
      if (Object.keys(errs).length) {
        setErrors((prev) => ({ ...prev, ...errs }));
        return;
      }
      setIsSubmitting(true);
      try {
        await createAdminBrand({ ...form, logoFile });
        toast.success("Tạo thương hiệu thành công!");
        router.push("/admin-brands");
        router.refresh();
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          "Tạo thương hiệu thất bại. Vui lòng thử lại.";
        toast.error(msg);
        setErrors((prev) => ({ ...prev, submit: msg }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, logoFile, validate, router],
  );

  return {
    form,
    errors,
    updateField,
    logoPreview,
    handleLogoChange,
    clearLogo,
    isSubmitting,
    handleSubmit,
  };
}
