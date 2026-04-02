'use client'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Settings, LogOut, User, LayoutDashboard, Package, ShoppingBag, Users } from 'lucide-react'

export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const menuItems = [
    { name: 'Bảng điều khiển', href: '/admin', icon: LayoutDashboard },
    { name: 'Quản lý Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Danh sách Đơn hàng', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Khách hàng', href: '/admin/users', icon: Users },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 shadow-xl z-20">
        <div className="h-16 flex items-center justify-center bg-slate-950 border-b border-slate-800 text-white font-bold tracking-widest text-lg">
          TOTMART <span className="text-red-500 ml-1">ADMIN</span>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-red-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* HEADER */}
        <header className="h-16 bg-white border-b flex items-center px-8 sticky top-0 z-30 shadow-sm justify-between">
          <div className="flex items-center gap-4 flex-1">
             <span className="font-medium text-gray-600 whitespace-nowrap">Hệ thống quản trị</span>
             {/* Search bar */}
             <input 
               placeholder='Tìm kiếm...' 
               className='w-1/3 h-9 px-4 bg-gray-100 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all'
             />
          </div>

          {/* PROFILE - Thêm relative ở đây để dropdown bám theo */}
          <div className='relative flex items-center gap-3'>
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-700 leading-none">Admin Manager</p>
              <p className="text-[10px] text-gray-400 mt-1 uppercase">Quyền quản trị</p>
            </div>
            
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 bg-red-100 rounded-full border-2 border-red-500 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform focus:outline-none shadow-sm"
            >
              <User size={20} className="text-red-600" />
            </button>

            {/* DROPDOWN MENU */}
            {isOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>

                <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Tùy chọn tài khoản</p>
                  </div>

                  <Link 
                    href="/admin/settings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>

                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      alert("Đang đăng xuất...");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors border-t border-gray-50"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* CONTENT */}
        <main className="p-8 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>
    </div>
  )
}