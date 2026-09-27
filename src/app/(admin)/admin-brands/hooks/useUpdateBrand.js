"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  fetchAdminBrandById,
  updateAdminBrand,
} from "../services/brandsAdminService";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 2 * 1024 * 1024;

export function useUpdateBrand() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = searchParams.get("id");

  const [original, setOriginal] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", cityAddress: "" });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!brandId) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    let isMounted = true;
    (async () => {
      try {
        const brand = await fetchAdminBrandById(brandId);
        if (!isMounted) return;
        if (!brand) {
          setNotFound(true);
        } else {
          setOriginal(brand);
          setForm({
            name: brand.name || "",
            description: brand.description || "",
            cityAddress: brand.cityAddress || "",
          });
        }
      } catch {
        if (isMounted) setNotFound(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [brandId]);

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

  const handleLogoChange = useCallback((file) => {
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
  }, []);

  const clearNewLogo = useCallback(() => {
    setLogoFile(null);
    setLogoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const isDirty =
    !!logoFile ||
    form.name !== (original?.name || "") ||
    form.description !== (original?.description || "") ||
    form.cityAddress !== (original?.cityAddress || "");

  const validate = useCallback(() => {
    const e = {};
    if (!form.name.trim()) e.name = "Tên thương hiệu không được để trống.";
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
        await updateAdminBrand(brandId, { ...form, logoFile });
        toast.success("Cập nhật thương hiệu thành công!");
        router.push("/admin-brands");
        router.refresh();
      } catch (err) {
        const msg = err?.response?.data?.message || "Cập nhật thất bại.";
        toast.error(msg);
        setErrors((prev) => ({ ...prev, submit: msg }));
      } finally {
        setIsSubmitting(false);
      }
    },
    [brandId, form, logoFile, validate, router],
  );

  return {
    original,
    form,
    errors,
    updateField,
    logoPreview,
    handleLogoChange,
    clearNewLogo,
    isLoading,
    notFound,
    isDirty,
    isSubmitting,
    handleSubmit,
  };
}
