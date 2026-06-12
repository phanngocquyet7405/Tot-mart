"use client";

import { useState, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";

import AuthContainer from "@/app/(client)/components/ui/auth/auth_container";
import AuthCard from "@/app/(client)/components/ui/auth/auth_card";
import FormInput from "@/app/(client)/components/ui/auth/form_input";
import AuthButton from "@/app/(client)/components/ui/auth/auth_button";
import { AppContext } from "@/app/context/AppContext";
import { loginApi } from "../../services/api/authService";
import { saveToken, getTokenRole } from "@/app/middleware/tokenMiddleware";
import { withGuest } from "@/app/middleware/authMiddleware";

function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useContext(AppContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback(
    (e) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
      if (error) setError("");
    },
    [error],
  );

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await loginApi(formData.email, formData.password);
      const token = res?.token ?? res?.data?.token;

      if (!token) {
        setError("Không nhận được token từ hệ thống!");
        return;
      }

      saveToken(token, { persistent: rememberMe });
      refreshUser();

      const role = getTokenRole();
      router.push(role === "admin" ? "/dashboard" : "/homepage");
    } catch (err) {
      setError(
        err.response?.data?.message || "Email hoặc mật khẩu không đúng.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <div className="w-full max-w-md mx-auto px-4 py-12">
        <AuthCard>
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 rounded-2xl mb-3 border border-green-100">
              <Lock className="w-8 h-8 text-green-700" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Chào Mừng Trở Lại
            </h1>
            <p className="text-gray-600 text-sm">
              Đăng nhập để truy cập tài khoản TotMart của bạn
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
          <form onSubmit={handleOnSubmit} className="space-y-5">
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

            {/* Password Field with Show/Hide */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Mật Khẩu
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="Nhập mật khẩu của bạn"
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 accent-green-600"
                />
                <span className="text-gray-700 font-medium">Ghi nhớ tôi</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-green-700 font-medium hover:text-green-800 transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <AuthButton type="submit" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                "Đăng Nhập"
              )}
            </AuthButton>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs font-medium text-gray-500 uppercase">Hoặc</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600 text-sm">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="text-green-700 font-semibold hover:text-green-800 transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </AuthCard>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-8">
          Bằng cách đăng nhập, bạn đồng ý với{" "}
          <Link href="/terms" className="text-gray-700 hover:text-gray-900 underline">
            Điều Khoản Dịch Vụ
          </Link>{" "}
          và{" "}
          <Link href="/privacy" className="text-gray-700 hover:text-gray-900 underline">
            Chính Sách Quyền Riêng Tư
          </Link>
        </p>
      </div>
    </AuthContainer>
  );
}

export default withGuest(LoginPage);
