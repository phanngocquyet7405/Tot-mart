"use client";

import { AppContext } from "./AppContext";
import { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext(null);

const memoryFallback = new Map();

export function safeGetStorage() {
  try {
    if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
    if (typeof globalThis !== "undefined" && globalThis.localStorage) return globalThis.localStorage;
    return null;
  } catch {
    return null;
  }
}

export function readWishlistStorage(key) {
  try {
    const storage = safeGetStorage();
    if (!storage) return memoryFallback.get(key) || null;
    const value = storage.getItem(key);
    return value !== null ? value : (memoryFallback.get(key) || null);
  } catch {
    return memoryFallback.get(key) || null;
  }
}

export function writeWishlistStorage(key, value) {
  memoryFallback.set(key, value);
  try {
    const storage = safeGetStorage();
    if (storage) {
      storage.setItem(key, value);
    }
  } catch {
    // QuotaExceededError or SecurityError: keep in memory
  }
}

export function removeWishlistStorage(key) {
  memoryFallback.delete(key);
  try {
    const storage = safeGetStorage();
    if (storage) {
      storage.removeItem(key);
    }
  } catch {
    // SecurityError: best effort
  }
}

export const WishlistProvider = ({ children }) => {
  const appContext = useContext(AppContext);
  const user = appContext?.user;
  const isLoading = appContext?.isLoading ?? false;
  const STORAGE_KEY = user
    ? `totmart_wishlist_user_${user._id}`
    : "totmart_wishlist_guest";
  const [loadedScope, setLoadedScope] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    let items = [];
    try {
      const saved = readWishlistStorage(STORAGE_KEY);
      if (saved) {
        try {
          const value = JSON.parse(saved);
          items = Array.isArray(value) ? value : [];
        } catch {
          removeWishlistStorage(STORAGE_KEY);
          items = [];
        }
      } else {
        items = [];
      }
    } catch {
      items = [];
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWishlistItems(items);
    setLoadedScope(STORAGE_KEY);
    setIsMounted(true);
  }, [STORAGE_KEY, isLoading]);

  useEffect(() => {
    if (!isMounted || loadedScope !== STORAGE_KEY) return;
    writeWishlistStorage(STORAGE_KEY, JSON.stringify(wishlistItems));
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
    removeWishlistStorage(STORAGE_KEY);
  };

  const wishlistCount =
    isMounted && loadedScope === STORAGE_KEY ? wishlistItems.length : 0;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems:
          isMounted && loadedScope === STORAGE_KEY ? wishlistItems : [],
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
