"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  // Trạng thái mở/đóng Cart Drawer — nâng lên context để MỌI nơi trong app
  // (MainHeader, trang chi tiết sản phẩm, trang chi tiết box...) chia sẻ
  // chung một nguồn sự thật, thay vì mỗi page tự useState riêng rồi tự mount
  // một <CartDrawer> khác nhau (gây trùng lặp instance + gọi lại API gợi ý
  // sản phẩm mỗi lần mount).
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

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

  useEffect(() => {
    if (!isMounted) return;
    localStorage.setItem("totmart_cart", JSON.stringify(cartItems));
  }, [cartItems, isMounted]);

  // Thêm sản phẩm vào giỏ. `quantity` mặc định là 1 (giữ tương thích ngược
  // với mọi nơi đang gọi addToCart(product) không truyền số lượng), nhưng
  // giờ cho phép truyền thẳng số lượng thay vì phải gọi lặp addToCart()
  // nhiều lần liên tiếp như cách cũ ở useProductDetail/box detail.
  const addToCart = (product, quantity = 1) => {
    if (quantity < 1) return;
    setCartItems((prev) => {
      const id = product._id || product.id;
      const existing = prev.find((item) => (item._id || item.id) === id);
      if (existing) {
        return prev.map((item) =>
          (item._id || item.id) === id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { ...product, quantity }];
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

        // --- Trạng thái Cart Drawer dùng chung toàn app ---
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        toggleCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
