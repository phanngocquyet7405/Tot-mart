'use client'

import { UserPen } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import AuthContainer from "@/app/components/auth/auth_container"
import AuthCard from "@/app/components/auth/auth_card"
import FormInput from "@/app/components/auth/form_input"
import AuthButton from "@/app/components/auth/auth_button"
import { registerApi } from "@/app/services/api/authService" 

export default function RegisterPage({ onSwitchToLogin }) {
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.password !== formData.confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        setLoading(true);

        try {
            await registerApi({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });

            alert("Đăng ký thành công! Hãy đăng nhập.");
            onSwitchToLogin();
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Có lỗi xảy ra khi đăng ký. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthContainer>
            <AuthCard>
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f0dca4] rounded-2xl mb-2">
                        <UserPen className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#f0dca4]">Create an Account</h2>
                    <p className="text-sm text-[#f0dca4]">Get started with your free account</p>
                </div>

                {error && (
                    <div className="mt-4 p-2 text-sm text-center text-red-600 bg-red-50 border border-red-200 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <FormInput
                        Label="Full Name"
                        type="text"
                        id="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <FormInput
                        Label="Email"
                        type="email"
                        id="email"
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <FormInput
                        Label="Password"
                        type="password"
                        id="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <FormInput
                        Label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                    />

                    <AuthButton type="submit" disabled={loading}>
                        {loading ? "Creating account..." : "Register"}
                    </AuthButton>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-[#f0dca4]">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={(e) => {
                            e.preventDefault();
                            onSwitchToLogin();
                            }}
                            className="text-[#e2b12b] hover:text-[#e7cc8f] transition-colors ml-1 font-semibold"
                        >
                            Login
                        </button>
                    </p>
                </div>
            </AuthCard>
        </AuthContainer>
    )
}