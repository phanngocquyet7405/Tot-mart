"use client";

import { AppContext } from "./AppContext";
import { createContext, useContext, useState, useEffect } from "react";

/**
 * WishlistContext.js
 * Danh sách yêu thích — lưu localStorage giống hệt cách CartContext đang
 * làm với giỏ hàng, vì hiện chưa có API backend nào cho wishlist (đã rà
 * soát toàn bộ src/app/services, không tìm thấy wishlistService nào).
 *
 * Nếu sau này có API thật, chỉ cần thay phần đọc/ghi localStorage bằng
 * gọi API tương ứng — phần còn lại (addToWishlist/toggleWishlist/...) giữ
 * nguyên interface để không phải sửa nơi tiêu thụ.
 */
const WishlistContext = createContext(null);



export const WishlistProvider = ({ children }) => {
  const { user, isLoading } = useContext(AppContext);
  const STORAGE_KEY = user ? `totmart_wishlist_user_${user._id}` : "totmart_wishlist_guest";
  const [loadedScope, setLoadedScope] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const value = JSON.parse(saved);
        // Reading the external persisted store hydrates the account scope.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWishlistItems(Array.isArray(value) ? value : []);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    } else setWishlistItems([]);
    setLoadedScope(STORAGE_KEY);
    setIsMounted(true);
  }, [STORAGE_KEY, isLoading]);

  useEffect(() => {
    if (!isMounted || loadedScope !== STORAGE_KEY) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
  }, [wishlistItems, isMounted, loadedScope, STORAGE_KEY]);

  const isInWishlist = (productId) =>
    wishlistItems.some((item) => (item._id || item.id) === productId);

  const addToWishlist = (product) => {
    const id = product._id || product.id;
    setWishlistItems((prev) =>
      prev.some((item) => (item._id || item.id) === id)
        ? prev
        : [...prev, product],
    );
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems((prev) =>
      prev.filter((item) => (item._id || item.id) !== productId),
    );
  };

  // Trả về true/false cho biết vừa THÊM hay vừa XOÁ — để nơi gọi hiển thị
  // đúng nội dung toast mà không phải tự kiểm tra lại state.
  const toggleWishlist = (product) => {
    const id = product._id || product.id;
    const alreadyIn = isInWishlist(id);
    if (alreadyIn) {
      removeFromWishlist(id);
      return false;
    }
    addToWishlist(product);
    return true;
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const wishlistCount = isMounted && loadedScope === STORAGE_KEY ? wishlistItems.length : 0;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: isMounted && loadedScope === STORAGE_KEY ? wishlistItems : [],
        wishlistCount,
        isMounted,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
