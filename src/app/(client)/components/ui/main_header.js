"use client";

import { useState, useContext } from "react";
import {
  User,
  Heart,
  LogOut,
  LayoutDashboard,
  UserCircle,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SearchBar from "./search_bar";
import CartBox from "./cart_box";
import CartDrawer from "../Cart_component/cart_drawer";
import { useCart } from "@/app/context/CartContext";
import { AppContext } from "@/app/context/AppContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MainHeader() {
  const { cartCount, cartTotal, isMounted } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistCount] = useState(0);

  /**
   * Fix 1: Bỏ useEffect gọi userService.getUserById(localStorage.getItem("userId"))
   *   - localStorage.getItem("userId") luôn trả null (không lưu userId, chỉ lưu token)
   *   - Gọi API không cần thiết khi AppContext đã có user từ token
   *
   * Fix 2: Dùng AppContext thay thế
   *   - user và isLoading đã được xử lý đúng trong AppContext (decode JWT, check expire)
   *   - isLoading = true khi chưa mount → tránh flash nội dung
   */
  const { user: userData, isLoading: loading, logout } = useContext(AppContext);

  const handleLogout = () => {
    logout(); // AppContext.logout() dọn token + redirect /login
  };

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-1000">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between gap-8">
          <div className="flex items-center space-x-6">
            <Link href="/homepage" className="shrink-0 block">
              <Image
                src="/assets/logo.png"
                alt="Tốt Box Logo"
                width={150}
                height={48}
                priority
                className="h-12 w-auto object-contain"
              />
            </Link>
            <div className="hidden lg:block bg-[#4a7c44] text-white text-[10px] font-bold px-4 py-1.5 rounded-sm tracking-widest uppercase">
              Save up to 70% now!
            </div>
          </div>

          <div className="flex-1 max-w-xl hidden md:block">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center min-w-30 justify-end">
              {loading ? (
                <div className="w-24 h-9 bg-gray-100 animate-pulse rounded-md" />
              ) : !userData ? (
                <div className="flex items-center gap-4 animate-in fade-in duration-500">
                  <Link
                    href="/login"
                    className="text-sm font-bold text-gray-700 hover:text-[#4a7c44] transition-colors uppercase tracking-tight"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="text-[11px] font-bold bg-[#1e3040] text-white px-5 py-2.5 rounded-sm hover:bg-[#4a7c44] transition-all uppercase tracking-widest shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              ) : (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 group outline-none animate-in fade-in duration-500">
                      <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200 group-hover:border-[#4a7c44] transition-all">
                        <User
                          className={`w-5 h-5 ${userData.role === "admin" ? "text-blue-600" : "text-gray-600"} group-hover:text-[#4a7c44]`}
                        />
                      </div>
                      <div className="hidden lg:flex flex-col items-start leading-none text-left">
                        <span className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">
                          {userData.role === "admin"
                            ? "Administrator"
                            : "My Account"}
                        </span>
                        {/* userData từ JWT: { _id, name, email, role, avatar } */}
                        <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                          {userData.name || "User"}
                          <ChevronDown className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={12}
                    className="w-52 z-1100 shadow-xl border-gray-100 p-1 animate-in slide-in-from-top-2 duration-200"
                  >
                    {userData.role === "admin" ? (
                      <DropdownMenuItem
                        asChild
                        className="py-2.5 cursor-pointer rounded-md focus:bg-blue-50 focus:text-blue-700"
                      >
                        <Link
                          href="/dashboard"
                          className="flex items-center font-bold"
                        >
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        asChild
                        className="py-2.5 cursor-pointer rounded-md focus:bg-green-50 focus:text-green-700"
                      >
                        <Link
                          href="/profile"
                          className="flex items-center font-bold"
                        >
                          <UserCircle className="mr-3 h-4 w-4" />
                          <span>My Profile</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="py-2.5 text-red-600 font-bold cursor-pointer rounded-md focus:bg-red-50 focus:text-red-700"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>Log Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex items-center gap-2 border-l pl-6 border-gray-100">
              <Link
                href="/wishlist"
                className="relative p-2 hover:bg-gray-100 rounded-full transition-all group"
              >
                <Heart className="w-5 h-5 text-gray-700 group-hover:text-red-500 transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-[#8cc63f] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* CartBox chỉ render số lượng thật sau khi isMounted = true */}
              <div
                onClick={() => setIsCartOpen(true)}
                className="cursor-pointer"
              >
                <CartBox
                  itemCount={isMounted ? cartCount : 0}
                  totalAmount={isMounted ? cartTotal : 0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <CartDrawer open={isCartOpen} setOpen={setIsCartOpen} />
    </header>
  );
}
