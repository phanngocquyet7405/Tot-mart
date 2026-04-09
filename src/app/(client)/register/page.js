'use client'

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { UserPen, Loader2 } from "lucide-react"

import AuthContainer from "@/app/(client)/components/ui/auth/auth_container"
import AuthCard from "@/app/(client)/components/ui/auth/auth_card"
import FormInput from "@/app/(client)/components/ui/auth/form_input"
import AuthButton from "@/app/(client)/components/ui/auth/auth_button"
import { registerApi } from "../../api/authService" 

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });


    const router = useRouter();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Xử lý thay đổi input tập trung
    const handleChange = useCallback((e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        if (error) setError(""); // Xóa lỗi khi người dùng bắt đầu sửa
    }, [error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        // Validation cơ bản tại client
        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
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
                password: formData.password
            });

            router.push("/auth/login");
        } catch (err) {
            const errorMessage = err.response?.data?.message 
                || "Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.";
                console.error("Register :",err)
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthContainer>
            <AuthCard>
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f0dca4] rounded-2xl mb-2 shadow-sm">
                        <UserPen className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#f0dca4]">Create an Account</h2>
                    <p className="text-sm text-[#f0dca4]/80">Get started with your free account</p>
                </div>

                {error && (
                    <div className="mt-4 p-3 text-sm text-center text-red-600 bg-red-50 border border-red-200 rounded-lg animate-in fade-in duration-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <FormInput
                        Label="Full Name"
                        type="text"
                        id="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
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
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <FormInput
                        Label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />

                    <AuthButton type="submit" disabled={loading}>
                        {loading ? (
                            <div className="flex items-center justify-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Creating account...</span>
                            </div>
                        ) : (
                            "Register"
                        )}
                    </AuthButton>
                </form>


                <div className="text-center mt-6">
                    <p className="text-sm text-[#f0dca4]">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={() => router.push("/auth/login")}
                            className="text-[#e2b12b] hover:text-[#e7cc8f] transition-colors font-bold underline-offset-4 hover:underline"
                        >
                            Login
                        </button>
                    </p>
                </div>
            </AuthCard>
        </AuthContainer>
    )
}