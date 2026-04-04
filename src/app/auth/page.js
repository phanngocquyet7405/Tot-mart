'use client'

import { useState } from "react"
import LoginPage from "./login/page"
import RegisterPage from "./register/page"

export default function AuthHomePage() {
    const [currentPage, setCurrentPage] = useState('login');

    return (
        <div className="size-full">
            {currentPage === 'login' ? (
                <LoginPage 
                    key="login-component" 
                    onSwitchToRegister={() => setCurrentPage('register')} 
                /> 
            ) : ( 
                <RegisterPage 
                    key="register-component" 
                    onSwitchToLogin={() => setCurrentPage('login')} 
                />
            )}
        </div>
    );
}