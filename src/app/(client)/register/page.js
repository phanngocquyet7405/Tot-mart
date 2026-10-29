"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

import AuthContainer from "@/app/(client)/components/ui/auth/auth_container";
import AuthCard from "@/app/(client)/components/ui/auth/auth_card";
import FormInput from "@/app/(client)/components/ui/auth/form_input";
import AuthButton from "@/app/(client)/components/ui/auth/auth_button";
import { registerApi } from "../../services/api/authService";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = useCallback(
    (e) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
      if (error) setError("");
    },
    [error],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không trùng khớp!");
      return;
    }

    if (formData.password.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await registerApi({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      router.push("/login");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const passwordStrength =
    formData.password.length >= 8
      ? "strong"
      : formData.password.length >= 4
        ? "medium"
        : "weak";

  return (
    <AuthContainer>
      <div className="w-full max-w-md mx-auto">
        <AuthCard>
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-2 border border-primary/20">
              <UserPlus className="w-7 h-7 text-primary" strokeWidth={2} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              Tạo tài khoản
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Tham gia TotMart để khám phá các sản phẩm hữu cơ cao cấp
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 bg-destructive/10 border border-destructive/25 rounded-xl flex gap-2.5 items-start">
              <div className="text-destructive-text flex-shrink-0 pt-0.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-destructive-text text-xs font-medium leading-relaxed">
                {error}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <FormInput
              Label="Họ và tên"
              type="text"
              id="name"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />

            {/* Email */}
            <FormInput
              Label="Địa chỉ Email"
              type="email"
              id="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />

            {/* Password */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Mật khẩu <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Tạo mật khẩu an toàn (ít nhất 8 ký tự)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full min-h-11 px-3.5 py-2.5 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <div
                    className={`h-1 flex-1 rounded-full ${
                      passwordStrength === "strong"
                        ? "bg-success-text"
                        : passwordStrength === "medium"
                          ? "bg-warning-text"
                          : "bg-destructive-text"
                    }`}
                  ></div>
                  <span
                    className={`font-medium text-[11px] ${
                      passwordStrength === "strong"
                        ? "text-success-text"
                        : passwordStrength === "medium"
                          ? "text-warning-text"
                          : "text-destructive-text"
                    }`}
                  >
                    {passwordStrength === "strong"
                      ? "Mạnh"
                      : passwordStrength === "medium"
                        ? "Trung bình"
                        : "Yếu (tối thiểu 8 ký tự)"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Xác nhận mật khẩu <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Xác nhận lại mật khẩu của bạn"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full min-h-11 px-3.5 py-2.5 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                  aria-label={showConfirmPassword ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {formData.password && formData.confirmPassword && (
                <div className="flex items-center gap-1.5 pt-1 text-xs">
                  <CheckCircle
                    className={`w-3.5 h-3.5 ${
                      formData.password === formData.confirmPassword
                        ? "text-success-text"
                        : "text-destructive-text"
                    }`}
                  />
                  <span
                    className={`font-medium text-[11px] ${
                      formData.password === formData.confirmPassword
                        ? "text-success-text"
                        : "text-destructive-text"
                    }`}
                  >
                    {formData.password === formData.confirmPassword
                      ? "Mật khẩu trùng khớp"
                      : "Mật khẩu không trùng khớp"}
                  </span>
                </div>
              )}
            </div>

            {/* Terms Agreement */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1 text-left select-none">
              <input
                type="checkbox"
                required
                disabled={loading}
                className="w-4 h-4 rounded border-border text-primary focus:ring-ring accent-primary mt-0.5 flex-shrink-0 cursor-pointer"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                Tôi đồng ý với{" "}
                <Link href="/pages/information" className="text-primary font-semibold hover:underline">
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link href="/pages/information" className="text-primary font-semibold hover:underline">
                  Chính sách quyền riêng tư
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <div className="pt-2">
              <AuthButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tạo tài khoản...</span>
                  </>
                ) : (
                  "Tạo Tài Khoản"
                )}
              </AuthButton>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Hoặc
            </span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-xs text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-primary font-bold hover:underline transition-colors ml-1"
            >
              Đăng nhập
            </Link>
          </p>
        </AuthCard>

        {/* Footer Text */}
        <p className="text-center text-[11px] text-muted-foreground mt-6 leading-relaxed">
          Bằng cách tạo tài khoản, bạn tham gia cộng đồng tiêu dùng bền vững TotMart
        </p>
      </div>
    </AuthContainer>
  );
}
