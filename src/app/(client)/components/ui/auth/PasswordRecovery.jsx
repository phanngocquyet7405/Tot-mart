"use client";

import { useState } from "react";
import Link from "next/link";
import AuthContainer from "./auth_container";
import AuthCard from "./auth_card";
import FormInput from "./form_input";
import AuthButton from "./auth_button";
import { forgotPasswordApi, resetPasswordApi } from "@/app/services/api/authService";
import { clearSession } from "@/app/middleware/tokenMiddleware";

export function getResetErrorMessage(err) {
  if (!err) return "Không thể thực hiện yêu cầu. Vui lòng thử lại sau.";
  const status = err.response?.status;
  const data = err.response?.data;

  if (status === 400) {
    // 1. Kiểm tra lỗi validation mật khẩu theo hợp đồng BE
    const validationMessage =
      data?.errors?.find?.(e => e.field === "password" || !e.field)?.message ||
      (data?.message === "Validation failed" ? "Mật khẩu không hợp lệ. Vui lòng nhập tối thiểu 8 ký tự (tối đa 72 byte)." : null);
    if (validationMessage) {
      return validationMessage;
    }
    // 2. Token không hợp lệ hoặc đã hết hạn
    return "Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.";
  }

  if (status === 503) {
    return "Hệ thống tạm thời bận. Vui lòng thử lại sau.";
  }

  if (data?.requestId) {
    return `Lỗi hệ thống (${data.requestId}). Vui lòng thử lại.`;
  }

  return data?.message || "Không thể thực hiện yêu cầu. Vui lòng thử lại sau.";
}

export default function PasswordRecovery({ reset = false, token = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const invalidToken = reset && !/^[a-f0-9]{40}$/.test(token);

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    const form = new FormData(event.currentTarget);
    setError("");
    if (reset && form.get("password") !== form.get("confirmPassword")) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    let apiSuccess = false;
    try {
      if (reset) {
        await resetPasswordApi(token, form.get("password"));
      } else {
        await forgotPasswordApi(form.get("email").trim());
      }
      apiSuccess = true;
    } catch (err) {
      if (reset) {
        setError(getResetErrorMessage(err));
      } else {
        if (err.response?.status === 503) {
          setError("Hệ thống tạm thời bận. Vui lòng thử lại sau.");
        } else if (err.response?.data?.requestId) {
          setError(`Lỗi hệ thống (${err.response.data.requestId}). Vui lòng thử lại.`);
        } else {
          setError("Không thể thực hiện yêu cầu. Vui lòng thử lại sau.");
        }
      }
      return;
    } finally {
      setLoading(false);
    }

    if (apiSuccess) {
      if (reset) {
        clearSession();
        try {
          if (typeof window !== "undefined") {
            for (const name of ["localStorage", "sessionStorage"]) {
              try {
                window[name]?.removeItem("token");
                window[name]?.removeItem("user");
              } catch {
                /* Storage may be disabled or throw SecurityError */
              }
            }
          }
        } catch {
          /* Best-effort storage cleanup */
        }
      }
      setDone(true);
    }
  }

  return (
    <AuthContainer>
      <div className="w-full max-w-md mx-auto px-4 py-12">
        <AuthCard>
          <h1 className="text-2xl font-bold mb-4">{reset ? "Đặt lại mật khẩu" : "Quên mật khẩu"}</h1>
          {done ? <p role="status" className="text-green-700 mb-6">{reset
            ? "Đã cập nhật mật khẩu. Vui lòng đăng nhập lại."
            : "Nếu email đã được đăng ký, bạn sẽ nhận được liên kết đặt lại mật khẩu có hiệu lực trong 10 phút. Vui lòng kiểm tra cả thư mục spam."}</p>
            : invalidToken ? <p role="alert" className="text-red-700 mb-6">Liên kết không hợp lệ. Vui lòng yêu cầu liên kết mới.</p>
            : <form onSubmit={submit} className="space-y-5 mb-6">
              {reset ? <>
                <FormInput Label="Mật khẩu mới (ít nhất 8 ký tự)" id="password" name="password" type="password" minLength={8} autoComplete="new-password" required disabled={loading} />
                <FormInput Label="Xác nhận mật khẩu" id="confirmPassword" name="confirmPassword" type="password" minLength={8} autoComplete="new-password" required disabled={loading} />
              </> : <FormInput Label="Địa chỉ email" id="email" name="email" type="email" autoComplete="email" required disabled={loading} />}
              {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
              <AuthButton type="submit" disabled={loading}>{loading ? "Đang xử lý..." : reset ? "Lưu mật khẩu" : "Gửi liên kết"}</AuthButton>
            </form>}
          <div className="flex justify-between gap-4 text-sm text-green-700 underline">
            <Link href="/login">Đăng nhập</Link>
            {reset && <Link href="/forgot-password">Yêu cầu liên kết mới</Link>}
          </div>
        </AuthCard>
      </div>
    </AuthContainer>
  );
}
