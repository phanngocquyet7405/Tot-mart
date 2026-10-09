"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { AppContext } from './AppContext';
import { axiosConfig } from '../services/api/axiosConfig';
import { normalizeCartProduct } from '@/app/util/cartItem';
const CartContext = createContext();
const identity = item => `${item.itemType || 'product'}:${item._id || item.id}`;
function read(key) { try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value && Array.isArray(value.items) ? value : { items: Array.isArray(value) ? value : [], version: 0 }; } catch { return { items: [], version: 0 }; } }
export const CartProvider = ({ children }) => {
  const { user, isLoading } = useContext(AppContext);
  const key = user ? `totmart_cart_user_${user._id}` : 'totmart_cart_guest';
  const [cartItems, setCartItems] = useState([]), [loadedScope, setLoadedScope] = useState(null), [cartVersion, setCartVersion] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  useEffect(() => {
    if (isLoading) return;
    let active = true;
    (async () => {
      const local = read(key);
      let items = local.items, version = local.version || 0;
      if (user) {
        try {
          const response = await axiosConfig.get(`/carts/get-cart/${user._id}`);
          const cart = response.data; version = cart?.__v || 0;
          const server = (cart?.items || []).map(line => {
            const entity = line.boxId || line.productId;
            return entity ? normalizeCartProduct({ ...entity, price: line.boxId ? entity.value : entity.price, itemType: line.boxId ? 'box' : 'product', quantity: line.quantity }) : null;
          }).filter(Boolean);
          // Local edits are usable only against the server version they were based on.
          if (cart && version !== local.version) items = server;
          else if (!items.length) items = server;
          const guest = read('totmart_cart_guest').items;
          const merged = new Map(items.map(item => [identity(item), item]));
          for (const item of guest) { const id = identity(item), previous = merged.get(id); merged.set(id, { ...item, quantity: Math.min(999, (previous?.quantity || 0) + item.quantity) }); }
          items = [...merged.values()];
          if (active) localStorage.removeItem('totmart_cart_guest');
        } catch { /* Keep scoped offline edits; checkout will validate the server version. */ }
      }
      if (active) { setCartItems(items.map(normalizeCartProduct)); setCartVersion(version); setLoadedScope(key); }
    })();
    return () => { active = false; };
  }, [key, user, isLoading]);
  useEffect(() => { if (loadedScope === key) localStorage.setItem(key, JSON.stringify({ items: cartItems, version: cartVersion })); }, [cartItems, cartVersion, key, loadedScope]);
  const isMounted = !isLoading && loadedScope === key;
  const addToCart = (product, quantity = 1) => {
    if (!isMounted || !Number.isInteger(quantity) || quantity < 1) return;
    const normalized = normalizeCartProduct({ ...product, itemType: product.itemType || 'product' });
    setCartItems(previous => { const existing = previous.find(item => identity(item) === identity(normalized)); return existing ? previous.map(item => identity(item) === identity(normalized) ? { ...item, quantity: Math.min(999, item.quantity + quantity) } : item) : [...previous, { ...normalized, quantity: Math.min(quantity, 999) }]; });
  };
  const updateQuantity = (id, amount) => setCartItems(items => items.map(item => (item._id || item.id) === id ? { ...item, quantity: Math.max(1, Math.min(999, item.quantity + amount)) } : item));
  const removeFromCart = id => setCartItems(items => items.filter(item => (item._id || item.id) !== id));
  const clearCart = () => { setCartItems([]); setCartVersion(0); localStorage.removeItem(key); };
  const visible = isMounted ? cartItems : [];
  return <CartContext.Provider value={{ cartItems: visible, cartVersion, setCartVersion, addToCart, updateQuantity, removeFromCart, clearCart, cartCount: visible.reduce((sum, item) => sum + item.quantity, 0), cartTotal: visible.reduce((sum, item) => sum + item.price * item.quantity, 0), isMounted, isCartOpen, openCart: () => setIsCartOpen(true), closeCart: () => setIsCartOpen(false), toggleCart: () => setIsCartOpen(value => !value), setIsCartOpen }}>{children}</CartContext.Provider>;
};
export const useCart = () => useContext(CartContext);
