"use client";
import { createContext, useContext, useState, useEffect, useReducer, useCallback } from "react";
import { AppContext } from "./AppContext";
import { axiosConfig } from "../services/api/axiosConfig";
import { normalizeCartProduct } from "@/app/util/cartItem";
import { readAttempt } from '@/app/util/purchaseAttempt.mjs';
import { toast } from 'sonner';
const CartContext = createContext();
import { cartLineKey, giftOptions, toCartPayload } from "@/app/util/cartLine.mjs";
const identity = cartLineKey;

export function safeGetLocalStorage() {
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
    if (typeof globalThis !== "undefined" && globalThis.localStorage) return globalThis.localStorage;
    return null;
  } catch {
    return null;
  }
}

export function read(key) {
  try {
    const storage = safeGetLocalStorage();
    const raw = storage ? storage.getItem(key) : null;
    const value = JSON.parse(raw || "null");
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
    return { items: [], version: 0, present: false };
  }
}

export function store(key, value) {
  try {
    const storage = safeGetLocalStorage();
    if (!storage) return;
    if (value === null) storage.removeItem(key);
    else storage.setItem(key, value);
  } catch {
    /* Browser storage unavailable: keep current in-memory cart. */
  }
}

export function cartReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return {
        items: action.items,
        version: action.version ?? 0,
      };
    case "SET_VERSION": {
      const nextVersion =
        typeof action.version === "function"
          ? action.version(state.version)
          : action.version;
      return {
        ...state,
        version: nextVersion,
      };
    }
    case "ADD_ITEM": {
      const { normalized, quantity } = action;
      const existing = state.items.find(
        (item) => identity(item) === identity(normalized),
      );
      const items = existing
        ? state.items.map((item) =>
            identity(item) === identity(normalized)
              ? { ...item, quantity: Math.min(999, item.quantity + quantity) }
              : item,
          )
        : [...state.items, { ...normalized, quantity: Math.min(quantity, 999) }];
      return { ...state, items };
    }
    case "UPDATE_QUANTITY": {
      const { id, amount } = action;
      const items = state.items.map((item) =>
        identity(item) === id
          ? {
              ...item,
              quantity: Math.max(1, Math.min(999, item.quantity + amount)),
            }
          : item,
      );
      return { ...state, items };
    }
    case "REMOVE_ITEM": {
      const items = state.items.filter((item) => identity(item) !== action.id);
      return { ...state, items };
    }
    case "CLEAR": {
      // Object identity fences even a new cart with identical products and quantities.
      // If draft has changed, keep both items and version untouched.
      if (action.expectedItems && state.items !== action.expectedItems) {
        return state;
      }
      return { items: [], version: 0 };
    }
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const appContext = useContext(AppContext);
  const user = appContext?.user;
  const isLoading = appContext?.isLoading ?? false;
  const key = user ? `totmart_cart_user_${user._id}` : "totmart_cart_guest";
  const [cartState, dispatch] = useReducer(cartReducer, { items: [], version: 0 });
  const [loadedScope, setLoadedScope] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quoteResult, setQuoteResult] = useState(null);

  const cartItems = cartState.items;
  const cartVersion = cartState.version;
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
        dispatch({
          type: "HYDRATE",
          items: items.map((item) =>
            normalizeCartProduct({ ...item, gift: giftOptions(item.gift) }),
          ),
          version,
        });
        setLoadedScope(key);
      }
    })();
    return () => {
      active = false;
    };
  }, [key, user, isLoading]);

  useEffect(() => {
    if (loadedScope === key)
      store(key, JSON.stringify({ items: cartState.items, version: cartState.version }));
  }, [cartState.items, cartState.version, key, loadedScope]);

  useEffect(() => {
    const changed = event => {
      if (event.key !== key || loadedScope !== key) return;
      const next = read(key);
      dispatch({ type: "HYDRATE", items: next.items, version: next.version || 0 });
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, [key, loadedScope]);

  const isMounted = !isLoading && loadedScope === key;
  const cartLocked = () => {
    const attempt = user && readAttempt(`totmart_checkout_attempt_${user._id}`);
    if (attempt && attempt.state !== 'created') {
      toast.error('Có lần thử thanh toán đang chờ. Kiểm tra hoặc kết thúc lần thử trước khi sửa giỏ.');
      return true;
    }
    return false;
  };

  const addToCart = (product, quantity = 1) => {
    if (cartLocked()) return;
    if (!isMounted || !Number.isInteger(quantity) || quantity < 1) return;
    const normalized = normalizeCartProduct({
      ...product,
      itemType: product.itemType || "product",
    });
    dispatch({ type: "ADD_ITEM", normalized, quantity });
  };

  const updateQuantity = (id, amount) => {
    if (cartLocked()) return;
    dispatch({ type: "UPDATE_QUANTITY", id, amount });
  };

  const removeFromCart = (id) => {
    if (cartLocked()) return;
    dispatch({ type: "REMOVE_ITEM", id });
  };

  const clearCart = (expectedItems) => {
    dispatch({ type: "CLEAR", expectedItems });
  };

  const setCartVersion = useCallback((version) => {
    dispatch({ type: "SET_VERSION", version });
  }, []);

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
