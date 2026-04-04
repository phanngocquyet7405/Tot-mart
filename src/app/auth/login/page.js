'use client'

import AuthContainer from "@/app/components/auth/auth_container"
import AuthCard from "@/app/components/auth/auth_card"
import FormInput from "@/app/components/auth/form_input"
import AuthButton from "@/app/components/auth/auth_button"
import { Lock } from "lucide-react"
import { useState,useContext } from "react"
import { AppContext } from "@/app/context/AppContext"
import { useRouter } from "next/navigation"
import  {loginApi}  from "@/app/services/api/authService"

export default function LoginPage({onSwitchToRegister}) {

    const [formData, setFormData] = useState({email: "", password: ""});
    const [rememberMe, setRememberMe] = useState(false);
    const {setUser, refreshUser} = useContext(AppContext);
    const router = useRouter();

    const [error, setError] = useState("");
    const [loading ,setLoading] = useState(false);

    const handleOnsubmit = async(e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await loginApi(formData);
            localStorage.setItem("token", response.token);
            if (refreshUser) {
                await refreshUser();
            }
            router.push("/");
        }catch (error){
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            }else {
                console.log("Something went wrong.",error);
                setError("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.");
            }
        }finally {
            setLoading(false);
        }
    };

    return (
        <AuthContainer>
            <AuthCard>
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f0dca4] rounded-2xl mb-2">
                        <Lock className="w-8 h-8 text-white"></Lock>
                    </div>
                    <h2 className="text-2xl font-bold text-[#f0dca4]">Welcome Back TotMart</h2>
                    <p className="text-sm text-[#f0dca4]">Enter your credentials to access your account</p>
                </div>

                {error && (
                    <div className="mt-4 p-2 text-sm text-center text-red-600 bg-red-50 border border-red-200 rounded">
                        {error}
                    </div>
                )}

                {/* Form*/}
                <form onSubmit={handleOnsubmit} className="space-y-4">
                    <FormInput
                    Label="Email"
                    type="email"
                    id="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData,email:e.target.value})}
                    required
                    />
                    <FormInput
                    Label="Password"
                    type="password"
                    id="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData,password:e.target.value})}
                    required
                    />

                    {/* Remember Me && Forgot Password */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-[#f0dca4] focus:ring-2 focus:ring-[#f0dca4]"/>
                            <span className="text-sm text-[#f0dca4]">Remember Me</span>
                        </label>
                        <button 
                        type="button"
                        className="test-sm text-[#f0dca4] hover:text-[#e7cc8f] transition-colors ml-1">
                            Forgot Password?
                        </button>
                    </div>

                    {/** Button */}
                    <AuthButton type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </AuthButton>

                </form>
                    {/* Switch to Signup */}
                    <div className="text-center">
                        <p className="text-sm text-[#f0dca4]">
                            Do not have an account?{''}
                            <button
                                type="button"
                                onClick={(e) => {
                                e.preventDefault();
                                onSwitchToRegister();
                                }}
                                className="text-[#e2b12b] hover:text-[#e7cc8f] transition-colors ml-1 font-semibold">
                                Register
                            </button>
                        </p>
                    </div>
            </AuthCard>
        </AuthContainer>
    )
}