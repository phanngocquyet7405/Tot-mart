'use client' // Đảm bảo có dòng này vì dùng useState

import { useState } from 'react';
import { User, Heart } from 'lucide-react'; // Dùng Heart cho đồng bộ với Lucide
import Link from 'next/link';
import Image from 'next/image';
import SearchBar from './search_bar';
import CartBox from './cart_box';
import CartDrawer from '../Cart_component/cart_drawer';

export default function MainHeader() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  return (
    // Tăng z-index của header lên một chút để an toàn
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-1000">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between gap-8">
          
          {/* LEFT: Logo & CTA */}
          <div className="flex items-center space-x-6">
            <Link href="/homepage" className="shrink-0 block">
              <div className="flex items-center">
                <Image 
                  src="/assets/logo.png" 
                  alt="Tốt Box Logo" 
                  width={150}
                  height={48} 
                  priority
                  className="h-12 w-auto object-contain"
                />
              </div>
            </Link>

            <a
              href="#sale"
              className="hidden lg:block bg-[#4a7c44] hover:bg-[#3d6638] text-white text-sm font-bold px-6 py-2 rounded-full transition-all duration-200 hover:shadow-lg active:scale-95"
            >
              SAVE UP TO 70% NOW!
            </a>
          </div>

          {/* CENTER: Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <SearchBar />
          </div>

          {/* RIGHT: Utility Icons */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link
              href="#wishlist"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 hidden sm:block"
            >
              <Heart className="w-6 h-6 text-gray-700" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#8cc63f] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              href="#account"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 hidden sm:block"
            >
              <User className="w-6 h-6 text-gray-700" />
            </Link>

            <div 
              onClick={() => setIsCartOpen(true)} 
              className="cursor-pointer hover:opacity-80 transition-opacity"
            >
              <CartBox itemCount={cartCount} totalAmount={cartTotal} />
            </div>
          </div>
        </div>
      </div>

      <CartDrawer open={isCartOpen} setOpen={setIsCartOpen} />
    </header>
  );
}