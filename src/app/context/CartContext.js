"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [subscribeItems, setSubscribeItems] = useState([]);
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

      try {
        const savedSub = localStorage.getItem("totmart_subscribe");
        if (savedSub) setSubscribeItems(JSON.parse(savedSub));
      } catch {
        localStorage.removeItem("totmart_subscribe");
      }
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("totmart_cart", JSON.stringify(cartItems));
  }, [cartItems, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("totmart_subscribe", JSON.stringify(subscribeItems));
  }, [subscribeItems, isMounted]);

  //after add quantity
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

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("totmart_cart");
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

  const subscribeCount = isMounted ? subscribeItems.length : 0;

  const subscribeTotal = isMounted
    ? subscribeItems.reduce((acc, item) => acc + (item.totalPrice || 0), 0)
    : 0;

  // ── Gói subscribe ────────────────────────────────────────────────────────
  /**
   * Thêm gói subscribe vào cart
   * @param {object} payload
   * @param payload.boxId        - ID của box
   * @param payload.boxName      - Tên box (hiển thị)
   * @param payload.boxImage     - Ảnh box (hiển thị)
   * @param payload.planType     - "1_month" | "3_month" | "6_month" | "12_month"
   * @param payload.planLabel    - "1 Tháng" | "6 Tháng" ... (hiển thị)
   * @param payload.totalDeliveries
   * @param payload.discountPercent
   * @param payload.monthlyPrice - Giá mỗi tháng sau giảm
   * @param payload.totalPrice   - Tổng tiền toàn gói
   * @param payload.months
   */

  const addSubscribeToCart = (payload) => {
    const key = `${payload.boxId}_${payload.planType}`; // unique key
    setSubscribeItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...payload, key } : item,
        );
      }
      return [...prev, { ...payload, key }];
    });
  };

  const removeSubscribeItem = (key) => {
    setSubscribeItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clearProductCart = () => {
    setCartItems([]);
    localStorage.removeItem("totmart_cart");
  };

  const clearSubscribeCart = () => {
    setSubscribeItems([]);
    localStorage.removeItem("totmart_subscribe");
  };

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
        clearCart,

        // --- BỔ SUNG CÁC HÀM & STATE CỦA SUBSCRIBE VÀO ĐÂY ---
        subscribeItems: isMounted ? subscribeItems : [],
        subscribeCount,
        subscribeTotal,
        addSubscribeToCart,
        removeSubscribeItem,
        clearProductCart,
        clearSubscribeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
