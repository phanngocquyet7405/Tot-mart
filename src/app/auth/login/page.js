'use client'

import AuthContainer from "@/app/components/auth/auth_container"
import AuthCard from "@/app/components/auth/auth_card"
import FormInput from "@/app/components/auth/form_input"
import AuthButton from "@/app/components/auth/auth_button"
import { Lock } from "lucide-react"
import { useState } from "react"

export default function LoginPage() {

    const [email, setEmail] =useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    const handleOnsubmit = (e) => {
        e.preventDefault();
        console.log('login submitted:', {email,password,rememberMe});
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

                {/* Form*/}
                <form onSubmit={handleOnsubmit} className="space-y-4">
                    <FormInput
                    Label="Email"
                    type="email"
                    id="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    />
                    <FormInput
                    Label="Password"
                    type="password"
                    id="password"
                    placeholder="enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    <AuthButton type="submit">
                        Login
                    </AuthButton>

                </form>
                    {/* Switch to Signup */}
                    <div className="text-center">
                        <p className="text-sm text-[#f0dca4]">
                            Do not have an account?
                            <button
                            type="button"
                            className="text-[#f0dca4] hover:text-[#e7cc8f] transition-colors ml-1">
                                Register
                            </button>
                        </p>
                    </div>
            </AuthCard>
        </AuthContainer>
    )
}