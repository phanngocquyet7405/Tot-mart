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
      <div className="w-full max-w-md mx-auto">
        <AuthCard>
          {/* Header */}
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-2 border border-primary/20">
              <Lock className="w-7 h-7 text-primary" strokeWidth={2} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-serif">
              Chào mừng trở lại
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Đăng nhập để truy cập tài khoản TotMart của bạn
            </p>
          </div>

          {/* Password Policy Notice (passwordChangeRequired) */}
          {passwordPolicyNotice && (
            <div className="mb-5 p-4 bg-warning-text/10 border border-warning-text/25 rounded-xl text-warning-text space-y-2">
              <div className="font-semibold text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Yêu cầu cập nhật mật khẩu</span>
              </div>
              <p className="text-xs leading-relaxed">{passwordPolicyNotice.message}</p>
              <div className="pt-1 flex items-center gap-3">
                <Link
                  href="/forgot-password"
                  className="inline-block text-xs font-semibold px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Đặt lại mật khẩu ngay
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const role = getTokenRole();
                    router.push(role === "admin" ? "/dashboard" : role === "merchant" ? "/manager" : "/homepage");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Để sau và tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 bg-destructive/10 border border-destructive/25 rounded-xl flex flex-col gap-2">
              <div className="flex gap-2.5 items-start">
                <div className="text-destructive-text flex-shrink-0 pt-0.5">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-destructive-text text-xs font-medium leading-relaxed">
                    {error.message || String(error)}
                  </p>
                  {error.requestId && (
                    <p className="text-[11px] text-muted-foreground font-mono mt-1">
                      Mã yêu cầu (requestId): {error.requestId}
                    </p>
                  )}
                </div>
              </div>
              {error.isTransient && (
                <div className="pl-6 pt-1">
                  <button
                    type="button"
                    onClick={handleOnSubmit}
                    disabled={loading}
                    className="text-xs font-semibold text-destructive-text hover:underline cursor-pointer"
                  >
                    Thử lại
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleOnSubmit} className="space-y-4">
            <FormInput
              Label="Địa chỉ Email"
              type="email"
              id="email"
              autoComplete="username email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />

            {/* Password Field with Show/Hide */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Mật khẩu <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu của bạn"
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-ring accent-primary cursor-pointer"
                />
                <span className="text-foreground font-medium">Ghi nhớ đăng nhập</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-primary font-semibold hover:underline transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <AuthButton type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang đăng nhập...</span>
                  </>
                ) : (
                  "Đăng Nhập"
                )}
              </AuthButton>
            </div>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs font-medium text-muted-foreground">
              Hoặc
            </span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-xs text-muted-foreground">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline transition-colors ml-1"
            >
              Đăng ký ngay
            </Link>
          </p>
        </AuthCard>

        {/* Footer Text */}
        <p className="text-center text-[11px] text-muted-foreground mt-6 leading-relaxed">
          Bằng cách đăng nhập, bạn đồng ý với{" "}
          <Link href="/pages/information" className="text-foreground hover:underline">
            Điều khoản dịch vụ
          </Link>{" "}
          và{" "}
          <Link href="/pages/information" className="text-foreground hover:underline">
            Chính sách quyền riêng tư
          </Link>
        </p>
      </div>
    </AuthContainer>
  );
}

export default withGuest(LoginPage);
