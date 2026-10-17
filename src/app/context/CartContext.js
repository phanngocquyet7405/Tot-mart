"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { AppContext } from "./AppContext";
import { axiosConfig } from "../services/api/axiosConfig";
import { normalizeCartProduct } from "@/app/util/cartItem";
const CartContext = createContext();
import { cartLineKey, giftOptions, toCartPayload } from "@/app/util/cartLine.mjs";
const identity = cartLineKey;
function read(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    const stored =
      value && Array.isArray(value.items)
        ? value
        : { items: Array.isArray(value) ? value : [], version: 0 };
    return {
      ...stored,
      present: value !== null,
      items: stored.items.filter((item) => {
        try {
          identity(item);
          return (
            Number.isSafeInteger(item.quantity) &&
            item.quantity >= 1 &&
            item.quantity <= 999
          );
        } catch {
          return false;
        }
      }),
    };
  } catch {
    return { items: [], version: 0 };
  }
}
function store(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* Browser storage unavailable: keep current in-memory cart. */
  }
}

export const CartProvider = ({ children }) => {
  const { user, isLoading } = useContext(AppContext);
  const key = user ? `totmart_cart_user_${user._id}` : "totmart_cart_guest";
  const [cartItems, setCartItems] = useState([]),
    [loadedScope, setLoadedScope] = useState(null),
    [cartVersion, setCartVersion] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quoteResult, setQuoteResult] = useState(null);
  const signature = JSON.stringify(cartItems);
  useEffect(() => {
    if (isLoading || loadedScope !== key || !user || !cartItems.length) return;
    let active = true;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const result = await axiosConfig.post('/checkout/quote', { items: toCartPayload(cartItems) }, { signal: controller.signal });
        if (active) setQuoteResult({ scope: key, signature, data: result.data });
      } catch { if (active) setQuoteResult({ scope: key, signature, data: null }); }
    }, 250);
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [cartItems, signature, key, user, isLoading, loadedScope]);
  useEffect(() => {
    if (isLoading) return;
    let active = true;
    (async () => {
      const local = read(key);
      let items = local.items,
        version = local.version || 0;
      if (user) {
        try {
          const response = await axiosConfig.get(`/carts/get-cart/${user._id}`);
          const cart = response.data;
          version = cart?.__v || 0;
          const server = (cart?.items || [])
            .map((line) => {
              const entity = line.boxId || line.productId;
              return entity
                ? normalizeCartProduct({
                    ...entity,
                    price: line.boxId ? entity.value : entity.price,
                    itemType: line.boxId ? "box" : "product",
                    quantity: line.quantity,
                    gift: line.gift,
                    lineId: line.lineId,
                  })
                : null;
            })
            .filter(Boolean);
          // Local edits are usable only against the server version they were based on.
          if (cart && version !== local.version) items = server;
          else if (!local.present) items = server;
          const guest = read("totmart_cart_guest").items;
          const merged = new Map(items.map((item) => [identity(item), item]));
          for (const item of guest) {
            const id = identity(item),
              previous = merged.get(id);
            merged.set(id, {
              ...item,
              quantity: Math.min(
                999,
                (previous?.quantity || 0) + item.quantity,
              ),
            });
          }
          items = [...merged.values()];
          if (active) store("totmart_cart_guest", null);
        } catch {
          /* Keep scoped offline edits; checkout will validate the server version. */
        }
      }
      if (active) {
        setCartItems(
          items.map((item) =>
            normalizeCartProduct({ ...item, gift: giftOptions(item.gift) }),
          ),
        );
        setCartVersion(version);
        setLoadedScope(key);
      }
    })();
    return () => {
      active = false;
    };
  }, [key, user, isLoading]);
  useEffect(() => {
    if (loadedScope === key)
      store(key, JSON.stringify({ items: cartItems, version: cartVersion }));
  }, [cartItems, cartVersion, key, loadedScope]);
  const isMounted = !isLoading && loadedScope === key;
  const addToCart = (product, quantity = 1) => {
    if (!isMounted || !Number.isInteger(quantity) || quantity < 1) return;
    const normalized = normalizeCartProduct({
      ...product,
      itemType: product.itemType || "product",
    });
    setCartItems((previous) => {
      const existing = previous.find(
        (item) => identity(item) === identity(normalized),
      );
      return existing
        ? previous.map((item) =>
            identity(item) === identity(normalized)
              ? { ...item, quantity: Math.min(999, item.quantity + quantity) }
              : item,
          )
        : [...previous, { ...normalized, quantity: Math.min(quantity, 999) }];
    });
  };
  const updateQuantity = (id, amount) =>
    setCartItems((items) =>
      items.map((item) =>
        identity(item) === id
          ? {
              ...item,
              quantity: Math.max(1, Math.min(999, item.quantity + amount)),
            }
          : item,
      ),
    );
  const removeFromCart = (id) =>
    setCartItems((items) => items.filter((item) => identity(item) !== id));
  const clearCart = () => {
    setCartItems([]);
    setCartVersion(0);
    store(key, null);
  };
  const visible = isMounted ? cartItems : [];
  const cartQuote = isMounted && quoteResult?.scope === key && quoteResult.signature === signature ? quoteResult.data : null;
  return (
    <CartContext.Provider
      value={{
        cartItems: visible,
        cartVersion,
        setCartVersion,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount: visible.reduce((sum, item) => sum + item.quantity, 0),
        cartQuote,
        cartPriceConfirmed: Boolean(cartQuote),
        cartTotal: cartQuote?.totalAmount ?? visible.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        ),
        isMounted,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((value) => !value),
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
export const useCart = () => useContext(CartContext);
