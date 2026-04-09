'use client'

import { useState, useContext, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Lock, Loader2 } from "lucide-react" // Thêm Loader icon

import AuthContainer from "@/app/(client)/components/ui/auth/auth_container"
import AuthCard from "@/app/(client)/components/ui/auth/auth_card"
import FormInput from "@/app/(client)/components/ui/auth/form_input"
import AuthButton from "@/app/(client)/components/ui/auth/auth_button"
import { AppContext } from "@/app/context/AppContext"
import { loginApi } from "../../api/authService"

export default function LoginPage() {
    const router = useRouter();
    const { refreshUser } = useContext(AppContext);

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = useCallback((e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (error) setError("");
    }, [error]);

    const handleOnSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError("");

        try {
            const res = await loginApi(formData.email, formData.password);
        
        // Kiểm tra xem token nằm ở đâu (res.token hay res.data.token)
            const token = res.token || res.data?.token;

        if (token) {
            localStorage.setItem("token", token);
            console.log("Token đã được lưu vào Storage");
        } else {
            console.error("Cấu trúc trả về không có token:", res);
        }
            
            if (rememberMe) {
                localStorage.setItem("rememberedEmail", formData.email);
            } else {
                localStorage.removeItem("rememberedEmail");
            }

            if (refreshUser) {
                await refreshUser();
            }
            
            router.push("/homepage");
        } catch (err) {
            const errorMessage = err.response?.data?.message 
                || "Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.";
            setError(errorMessage);
            console.error("Login Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContainer>
            <AuthCard>
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f0dca4] rounded-2xl mb-2 shadow-sm">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#f0dca4]">Welcome Back TotMart</h2>
                    <p className="text-sm text-[#f0dca4]/80">Enter your credentials to access your account</p>
                </div>

                {error && (
                    <div className="mt-4 p-3 text-sm text-center text-red-600 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleOnSubmit} className="mt-6 space-y-4">
                    <FormInput
                        Label="Email"
                        type="email"
                        id="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <FormInput
                        Label="Password"
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />

                    <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#f0dca4] focus:ring-[#f0dca4] transition-all"
                            />
                            <span className="text-sm text-[#f0dca4] group-hover:text-[#e7cc8f]">Remember Me</span>
                        </label>
                        <button 
                            type="button"
                            className="text-sm text-[#f0dca4] hover:text-[#e7cc8f] transition-colors font-medium"
                        >
                            Forgot Password?
                        </button>
                    </div>

                    <AuthButton type="submit" disabled={loading}>
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Logging in...</span>
                            </div>
                        ) : (
                            "Login"
                        )}
                    </AuthButton>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-[#f0dca4]">
                        Do not have an account?{' '}
                        <button
                            type="button"
                            onClick={() => router.push("/auth/register")}
                            className="text-[#e2b12b] hover:text-[#e7cc8f] transition-colors font-bold underline-offset-4 hover:underline"
                        >
                            Register
                        </button>
                    </p>
                </div>
            </AuthCard>
        </AuthContainer>
    )
}