"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  /**
   * Fix hydration mismatch:
   *
   * TRƯỚC: useState(() => { if (typeof window !== 'undefined') localStorage... })
   *   → Lazy initializer chạy ngay khi render, kể cả lần đầu (SSR).
   *   → Server thấy window = undefined → trả [].
   *   → Client thấy window có → đọc localStorage → trả [item1, item2].
   *   → React so sánh HTML server vs client → MISMATCH.
   *
   * SAU: Luôn khởi tạo [] (giống server), chỉ đọc localStorage trong useEffect
   *   → Server render [] → Client render [] → MATCH.
   *   → Sau khi mount xong, useEffect chạy → load từ localStorage → re-render đúng data.
   *
   * `isMounted` để tránh render cartCount/cartTotal sai trước khi load xong.
   */
  const [cartItems, setCartItems] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  // Load từ localStorage SAU khi component mount (chỉ chạy ở client)
  useEffect(() => {
    const savedCart = localStorage.getItem("totmart_cart");
    if (savedCart) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCartItems(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem("totmart_cart"); // Dữ liệu hỏng → xóa
      }
    }
    setIsMounted(true);
  }, []);

  // Đồng bộ vào localStorage mỗi khi cartItems thay đổi (chỉ sau khi đã mount)
  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("totmart_cart", JSON.stringify(cartItems));
  }, [cartItems, isMounted]);

  const addToCart = (product) => {
    setCartItems((prev) => {
      const id = product._id || product.id;
      const existing = prev.find((item) => (item._id || item.id) === id);
      if (existing) {
        return prev.map((item) =>
          (item._id || item.id) === id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, amount) => {
    setCartItems((prev) =>
      prev.map((item) =>
        (item._id || item.id) === id
          ? { ...item, quantity: Math.max(1, item.quantity + amount) }
          : item,
      ),
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => (item._id || item.id) !== id));
  };

  // Trả về 0 trước khi mount xong → khớp với server (tránh hydration mismatch)
  const cartCount = isMounted
    ? cartItems.reduce((acc, item) => acc + item.quantity, 0)
    : 0;

  const cartTotal = isMounted
    ? cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cartItems: isMounted ? cartItems : [],
        addToCart,
        updateQuantity,
        removeFromCart,
        cartCount,
        cartTotal,
        isMounted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
