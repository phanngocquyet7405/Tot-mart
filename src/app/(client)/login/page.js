"use client";

import { useState, useContext, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";

import AuthContainer from "@/app/(client)/components/ui/auth/auth_container";
import AuthCard from "@/app/(client)/components/ui/auth/auth_card";
import FormInput from "@/app/(client)/components/ui/auth/form_input";
import AuthButton from "@/app/(client)/components/ui/auth/auth_button";
import { AppContext } from "@/app/context/AppContext";
import { loginApi, pingApi } from "../../services/api/authService";
import { saveToken, getTokenRole } from "@/app/middleware/tokenMiddleware";
import { withGuest } from "@/app/middleware/authMiddleware";
import { getLoginError } from "@/app/util/authErrors";

function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useContext(AppContext);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [passwordPolicyNotice, setPasswordPolicyNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  // Đánh thức API (Render cold start) trong lúc người dùng nhập thông tin.
  useEffect(() => {
    pingApi().catch(() => {});
  }, []);

  const handleChange = useCallback(
    (e) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
      if (error) setError(null);
      if (passwordPolicyNotice) setPasswordPolicyNotice(null);
    },
    [error, passwordPolicyNotice],
  );

  const handleOnSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await loginApi(formData.email, formData.password, rememberMe);
      const token = res?.token ?? res?.data?.token;

      if (!token) {
        setError({ message: "Không nhận được token từ hệ thống!", isTransient: false });
        return;
      }

      saveToken(token, { persistent: rememberMe });
      await refreshUser();

      if (res?.passwordChangeRequired) {
        setPasswordPolicyNotice({
          required: true,
          reason: res.passwordPolicyReason || "LEGACY_BCRYPT_BYTE_LIMIT",
          message:
            res.passwordPolicyReason === "LEGACY_BCRYPT_BYTE_LIMIT"
              ? "Mật khẩu của bạn đang sử dụng định dạng cũ vượt quá giới hạn an toàn (tối đa 72 byte UTF-8). Vui lòng đặt lại mật khẩu để bảo vệ tài khoản của bạn."
              : "Tài khoản của bạn yêu cầu cập nhật mật khẩu mới theo chính sách bảo mật.",
        });
        return;
      }

      const role = getTokenRole();
      router.push(role === "admin" ? "/dashboard" : role === "merchant" ? "/manager" : "/homepage");
    } catch (err) {
      setError(getLoginError(err));
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

          {/* Password Policy Notice (passwordChangeRequired) */}
          {passwordPolicyNotice && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-2">
              <div className="font-semibold text-sm flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>Yêu cầu cập nhật mật khẩu</span>
              </div>
              <p className="text-sm text-amber-800">{passwordPolicyNotice.message}</p>
              <div className="pt-2 flex items-center gap-3">
                <Link
                  href="/forgot-password"
                  className="inline-block text-xs font-semibold px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
                >
                  Đặt lại mật khẩu ngay
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const role = getTokenRole();
                    router.push(role === "admin" ? "/dashboard" : role === "merchant" ? "/manager" : "/homepage");
                  }}
                  className="text-xs text-amber-700 hover:underline"
                >
                  Để sau và tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex flex-col gap-2">
              <div className="flex gap-3">
                <div className="text-red-600 flex-shrink-0 pt-0.5">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-red-700 text-sm">{error.message || String(error)}</p>
                  {error.requestId && (
                    <p className="text-xs text-stone-500 font-mono mt-1">
                      Mã yêu cầu (requestId): {error.requestId}
                    </p>
                  )}
                </div>
              </div>
              {error.isTransient && (
                <div className="pl-8 pt-1">
                  <button
                    type="button"
                    onClick={handleOnSubmit}
                    disabled={loading}
                    className="text-xs font-semibold text-red-700 hover:text-red-800 underline cursor-pointer"
                  >
                    Thử lại
                  </button>
                </div>
              )}
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
