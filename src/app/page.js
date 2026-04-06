"use client"

import { useRouter } from "next/navigation"

export default function Home() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('token');

        router.push('/auth/login'); 
    }

    return (
        <main className="flex flex-col items-center p-24">
            <h1 className="text-4xl font-bold mb-8">Introduction to TotMart</h1>
            
            <button 
                onClick={handleLogout}
                className="bg-black text-white px-4 py-2 rounded transition"
            >
                Logout
            </button>
        </main>
    )
}