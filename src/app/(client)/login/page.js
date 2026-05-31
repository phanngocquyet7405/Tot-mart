/**
 * page.js (Login) - Fixed + Redesigned UI
 *
 * Fix:
 *  1. refreshUser() là sync → trả về userData ngay, nhưng để an toàn tuyệt đối
 *     ta decode role trực tiếp từ token bằng getTokenRole() để không phụ thuộc
 *     vào timing của React state update.
 *  2. rememberMe giờ được truyền vào saveToken()
 *  3. Forgot Password có onClick → router.push("/forgot-password")
 *  4. Xóa console.log("Role người dùng:") khỏi production flow
 *
 * UI: Giữ màu nền tối + #f0dca4, nâng cấp toàn bộ visual lên luxury editorial
 */

"use client";

import { useState, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Eye, EyeOff, Sparkles } from "lucide-react";

import AuthContainer from "@/app/(client)/components/ui/auth/auth_container";
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
  const [focusedField, setFocusedField] = useState(null);

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

      // 🔍 DEBUG: xem loginApi trả về gì
      console.log("[Login] Raw response từ loginApi:", res);
      console.log("[Login] res?.token:", res?.token);
      console.log("[Login] res?.data?.token:", res?.data?.token);
      console.log("[Login] typeof res:", typeof res);

      // interceptor đã unwrap response.data rồi → res chính là { token, ... }
      // Nhưng phòng trường hợp interceptor chưa unwrap → thử cả res.data.token
      const token = res?.token ?? res?.data?.token;

      console.log(
        "[Login] Token sẽ dùng:",
        token ? token.slice(0, 30) + "..." : "UNDEFINED ❌",
      );
      console.log("[Login] rememberMe:", rememberMe);

      if (!token) {
        console.error(
          "[Login] ❌ Không có token trong response — kiểm tra loginApi/authService",
        );
        setError("Không nhận được token từ hệ thống!");
        return;
      }

      // Lưu token theo lựa chọn rememberMe
      saveToken(token, { persistent: rememberMe });

      // 🔍 DEBUG: verify đã lưu thật sự chưa
      const savedLocal = localStorage.getItem("token");
      const savedSession = sessionStorage.getItem("token");
      console.log("[Login] Sau saveToken:");
      console.log(
        "  localStorage.token:",
        savedLocal ? savedLocal.slice(0, 30) + "..." : "null ❌",
      );
      console.log(
        "  sessionStorage.token:",
        savedSession ? savedSession.slice(0, 30) + "..." : "null ❌",
      );

      if (!savedLocal && !savedSession) {
        console.error(
          "[Login] ❌ saveToken không lưu được vào bất kỳ storage nào!",
        );
      }

      // Sync AppContext
      refreshUser();

      // Lấy role trực tiếp từ token — không phụ thuộc React state timing
      const role = getTokenRole();
      console.log(
        "[Login] Role từ token:",
        role,
        "→ redirect đến",
        role === "admin" ? "/dashboard" : "/homepage",
      );
      router.push(role === "admin" ? "/dashboard" : "/homepage");
    } catch (err) {
      console.error(
        "[Login] ❌ catch error:",
        err?.response?.status,
        err?.response?.data || err?.message,
      );
      setError(
        err.response?.data?.message || "Email hoặc mật khẩu không đúng.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      {/*
        AuthContainer cần có background tối để UI bên dưới hiện đúng.
        Nếu AuthContainer chưa có style nền, thêm className vào đây:
        className="min-h-screen bg-[#1a1610] flex items-center justify-center"
      */}
      <div className="w-full max-w-md mx-auto">
        {/* ── Floating logo badge ── */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="relative flex items-center justify-center w-20 h-20 rounded-3xl mb-4 shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #f0dca4 0%, #c9a84c 100%)",
              boxShadow:
                "0 0 40px rgba(240,220,164,0.25), 0 8px 32px rgba(0,0,0,0.4)",
            }}
          >
            <Lock className="w-9 h-9 text-[#1a1610]" strokeWidth={2.5} />
            {/* Glow ring */}
            <div
              className="absolute inset-0 rounded-3xl animate-pulse"
              style={{
                background: "linear-gradient(135deg, #f0dca4 0%, #c9a84c 100%)",
                filter: "blur(12px)",
                opacity: 0.3,
                zIndex: -1,
              }}
            />
          </div>

          <h1
            className="text-3xl font-black tracking-tight"
            style={{
              color: "#f0dca4",
              fontFamily: "'Georgia', 'Times New Roman', serif",
              letterSpacing: "-0.02em",
            }}
          >
            TotMart
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "rgba(240,220,164,0.55)" }}
          >
            Chào mừng trở lại
          </p>
        </div>

        {/* ── Card ── */}
        <div
          className="rounded-3xl p-8 relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(240,220,164,0.15)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(240,220,164,0.1)",
          }}
        >
          {/* Subtle corner accent */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-bl-full opacity-10"
            style={{
              background: "radial-gradient(circle, #f0dca4, transparent)",
            }}
          />

          {/* Error message */}
          {error && (
            <div
              className="mb-6 px-4 py-3 rounded-xl text-sm text-center animate-in fade-in slide-in-from-top-2 duration-300"
              style={{
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#fca5a5",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleOnSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(240,220,164,0.6)" }}
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all duration-300 disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border:
                      focusedField === "email"
                        ? "1px solid rgba(240,220,164,0.6)"
                        : "1px solid rgba(240,220,164,0.15)",
                    color: "#f0dca4",
                    caretColor: "#f0dca4",
                    boxShadow:
                      focusedField === "email"
                        ? "0 0 0 3px rgba(240,220,164,0.08), inset 0 1px 0 rgba(255,255,255,0.05)"
                        : "none",
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(240,220,164,0.6)" }}
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm outline-none transition-all duration-300 disabled:opacity-50"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border:
                      focusedField === "password"
                        ? "1px solid rgba(240,220,164,0.6)"
                        : "1px solid rgba(240,220,164,0.15)",
                    color: "#f0dca4",
                    caretColor: "#f0dca4",
                    boxShadow:
                      focusedField === "password"
                        ? "0 0 0 3px rgba(240,220,164,0.08), inset 0 1px 0 rgba(255,255,255,0.05)"
                        : "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
                  style={{ color: "rgba(240,220,164,0.4)", opacity: 0.7 }}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className="w-4 h-4 rounded flex items-center justify-center transition-all"
                    style={{
                      background: rememberMe
                        ? "#f0dca4"
                        : "rgba(255,255,255,0.05)",
                      border: rememberMe
                        ? "1px solid #f0dca4"
                        : "1px solid rgba(240,220,164,0.25)",
                    }}
                    onClick={() => setRememberMe((v) => !v)}
                  >
                    {rememberMe && (
                      <svg
                        className="w-2.5 h-2.5 text-[#1a1610]"
                        viewBox="0 0 10 8"
                        fill="none"
                      >
                        <path
                          d="M1 4l3 3 5-6"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span
                  className="text-xs transition-colors"
                  style={{ color: "rgba(240,220,164,0.6)" }}
                >
                  Ghi nhớ đăng nhập
                </span>
              </label>

              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-xs font-medium transition-colors hover:underline"
                style={{ color: "rgba(240,220,164,0.6)" }}
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all duration-300 relative overflow-hidden group"
              style={{
                background: loading
                  ? "rgba(240,220,164,0.3)"
                  : "linear-gradient(135deg, #f0dca4 0%, #c9a84c 100%)",
                color: "#1a1610",
                boxShadow: loading
                  ? "none"
                  : "0 4px 20px rgba(240,220,164,0.3), 0 1px 0 rgba(255,255,255,0.2) inset",
                transform: loading ? "none" : undefined,
              }}
            >
              {/* Shine sweep on hover */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)",
                }}
              />
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang đăng nhập...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Đăng nhập
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(240,220,164,0.1)" }}
            />
            <span
              className="text-[11px] uppercase tracking-widest"
              style={{ color: "rgba(240,220,164,0.3)" }}
            >
              hoặc
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(240,220,164,0.1)" }}
            />
          </div>

          {/* Register link */}
          <p
            className="text-center text-sm"
            style={{ color: "rgba(240,220,164,0.5)" }}
          >
            Chưa có tài khoản?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="font-bold transition-all hover:underline underline-offset-4"
              style={{ color: "#f0dca4" }}
            >
              Đăng ký ngay →
            </button>
          </p>
        </div>

        {/* Footer note */}
        <p
          className="text-center text-[10px] mt-6"
          style={{ color: "rgba(240,220,164,0.2)" }}
        >
          Bằng cách đăng nhập, bạn đồng ý với{" "}
          <button
            type="button"
            onClick={() => router.push("/terms")}
            className="underline hover:opacity-80"
          >
            Điều khoản
          </button>{" "}
          &{" "}
          <button
            type="button"
            onClick={() => router.push("/privacy")}
            className="underline hover:opacity-80"
          >
            Chính sách bảo mật
          </button>
        </p>
      </div>
    </AuthContainer>
  );
}

export default withGuest(LoginPage);
