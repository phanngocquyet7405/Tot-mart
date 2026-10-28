"use client";

import { useContext } from "react";
import { useTranslations } from "next-intl";
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
import { useWishlist } from "@/app/context/WishlistContext";
import { AppContext } from "@/app/context/AppContext";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MainHeader() {
  const t = useTranslations("header");
  const { cartCount, cartTotal, isMounted, isCartOpen, setIsCartOpen, openCart } =
    useCart();
  const { wishlistCount } = useWishlist();

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
    <header className="w-full bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
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
            <div className="hidden lg:block bg-primary text-white text-[11px] font-bold px-4 py-1.5 rounded-sm tracking-widest uppercase">
              Khám phá sản phẩm
            </div>
          </div>

          <div className="flex-1 max-w-xl hidden md:block">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center min-w-30 justify-end">
              {loading ? (
                <div className="w-24 h-9 bg-muted animate-pulse rounded-md" />
              ) : !userData ? (
                <div className="flex items-center gap-4 animate-in fade-in duration-500">
                  <Link
                    href="/login"
                    className="text-sm font-bold text-foreground hover:text-primary transition-colors uppercase tracking-tight"
                  >
                    {t("signIn")}
                  </Link>
                  <Link
                    href="/register"
                    className="text-[11px] font-bold bg-primary text-primary-foreground px-5 py-2.5 rounded-sm hover:bg-primary transition-all uppercase tracking-widest shadow-sm"
                  >
                    {t("signUp")}
                  </Link>
                </div>
              ) : (
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 group outline-none animate-in fade-in duration-500">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border border-border group-hover:border-primary transition-all">
                        <User
                          className={`w-5 h-5 ${userData.role === "admin" ? "text-blue-600" : "text-muted-foreground"} group-hover:text-primary`}
                        />
                      </div>
                      <div className="hidden lg:flex flex-col items-start leading-none text-left">
                        <span className="text-[11px] font-bold text-foreground uppercase tracking-tight">
                          {userData.role === "admin"
                            ? t("administrator")
                            : t("myAccount")}
                        </span>
                        {/* userData từ JWT: { _id, name, email, role, avatar } */}
                        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                          {userData.name || "User"}
                          <ChevronDown className="w-3 h-3" />
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="end"
                    sideOffset={12}
                    className="w-52 z-1100 shadow-xl border-border p-1 animate-in slide-in-from-top-2 duration-200"
                  >
                    {userData.role === "admin" ? (
                      <DropdownMenuItem
                        asChild
                        className="py-2.5 cursor-pointer rounded-md focus:bg-muted focus:text-foreground"
                      >
                        <Link
                          href="/dashboard"
                          className="flex items-center font-bold"
                        >
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          <span>{t("dashboard")}</span>
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        asChild
                        className="py-2.5 cursor-pointer rounded-md focus:bg-muted focus:text-foreground"
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
                      className="py-2.5 text-destructive-text font-bold cursor-pointer rounded-md focus:bg-destructive/15 focus:text-destructive-text"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      <span>{t("logOut")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex items-center gap-4 border-l pl-6 border-border">
              <Link
                href="/wishlist"
                className="relative p-2 hover:bg-muted rounded-full transition-all group"
              >
                <Heart className="w-5 h-5 text-foreground group-hover:text-destructive transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-white text-[11px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* CartBox chỉ render số lượng thật sau khi isMounted = true */}
              <div onClick={openCart} className="cursor-pointer">
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
