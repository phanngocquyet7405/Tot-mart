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

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
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
  const passwordStrength = formData.password.length >= 6 ? "strong" : formData.password.length >= 3 ? "medium" : "weak";

  return (
    <AuthContainer>
      <div className="w-full max-w-md mx-auto px-4 py-12">
        <AuthCard>
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl mb-3 border border-green-100">
              <UserPlus className="w-8 h-8 text-green-700" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Tạo Tài Khoản
            </h1>
            <p className="text-gray-600 text-sm">
              Tham gia TotMart để khám phá các sản phẩm hữu cơ cao cấp
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <div className="text-red-600 flex-shrink-0 pt-0.5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <FormInput
              Label="Họ Và Tên"
              type="text"
              id="name"
              placeholder="Nguyễn Văn A"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />

            {/* Email */}
            <FormInput
              Label="Địa Chỉ Email"
              type="email"
              id="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Mật Khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Tạo một mật khẩu mạnh"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="flex items-center gap-2 text-xs">
                  <div className={`h-1.5 flex-1 rounded-full ${passwordStrength === "strong" ? "bg-green-500" : passwordStrength === "medium" ? "bg-yellow-500" : "bg-red-500"}`}></div>
                  <span className={`font-medium ${passwordStrength === "strong" ? "text-green-600" : passwordStrength === "medium" ? "text-yellow-600" : "text-red-600"}`}>
                    {passwordStrength === "strong" ? "Mạnh" : passwordStrength === "medium" ? "Trung Bình" : "Yếu"}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                Xác Nhận Mật Khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="Xác nhận mật khẩu của bạn"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formData.password && formData.confirmPassword && (
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className={`w-4 h-4 ${formData.password === formData.confirmPassword ? "text-green-500" : "text-red-500"}`} />
                  <span className={formData.password === formData.confirmPassword ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {formData.password === formData.confirmPassword ? "Mật khẩu trùng khớp" : "Mật khẩu không trùng khớp"}
                  </span>
                </div>
              )}
            </div>

            {/* Terms Agreement */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                disabled={loading}
                className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 accent-green-600 mt-0.5 flex-shrink-0"
              />
              <span className="text-xs text-gray-700">
                Tôi đồng ý với{" "}
                <Link href="/terms" className="text-green-700 font-semibold hover:text-green-800">
                  Điều Khoản Dịch Vụ
                </Link>{" "}
                và{" "}
                <Link href="/privacy" className="text-green-700 font-semibold hover:text-green-800">
                  Chính Sách Quyền Riêng Tư
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <AuthButton type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tạo tài khoản...</span>
                </div>
              ) : (
                "Tạo Tài Khoản"
              )}
            </AuthButton>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs font-medium text-gray-500 uppercase">Hoặc</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Sign In Link */}
          <p className="text-center text-gray-600 text-sm">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-green-700 font-semibold hover:text-green-800 transition-colors">
              Đăng nhập
            </Link>
          </p>
        </AuthCard>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-8">
          Bằng cách tạo tài khoản, bạn tham gia cộng đồng của những người tiêu dùng có ý thức
        </p>
      </div>
    </AuthContainer>
  );
}
