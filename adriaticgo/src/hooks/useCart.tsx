"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, CartState } from "@/types";

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_KEY = "adriaticgo-cart";

function loadCart(): CartState {
  if (typeof window === "undefined")
    return { items: [], restaurantId: null, restaurantName: null };
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { items: [], restaurantId: null, restaurantName: null };
}

function saveCart(state: CartState) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(state));
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    items: [],
    restaurantId: null,
    restaurantName: null,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(cart);
  }, [cart, hydrated]);

  const addItem = useCallback((item: CartItem) => {
    setCart((prev) => {
      if (prev.restaurantId && prev.restaurantId !== item.restaurantId) {
        return {
          items: [{ ...item, quantity: item.quantity || 1 }],
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
        };
      }

      const idx = prev.items.findIndex(
        (i) => i.menuItemId === item.menuItemId
      );
      if (idx >= 0) {
        const updated = [...prev.items];
        updated[idx] = {
          ...updated[idx],
          quantity: updated[idx].quantity + (item.quantity || 1),
        };
        return { ...prev, items: updated };
      }

      return {
        items: [...prev.items, { ...item, quantity: item.quantity || 1 }],
        restaurantId: item.restaurantId,
        restaurantName: item.restaurantName,
      };
    });
  }, []);

  const removeItem = useCallback((menuItemId: string) => {
    setCart((prev) => {
      const filtered = prev.items.filter((i) => i.menuItemId !== menuItemId);
      if (filtered.length === 0)
        return { items: [], restaurantId: null, restaurantName: null };
      return { ...prev, items: filtered };
    });
  }, []);

  const updateQuantity = useCallback((menuItemId: string, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => {
        const filtered = prev.items.filter((i) => i.menuItemId !== menuItemId);
        if (filtered.length === 0)
          return { items: [], restaurantId: null, restaurantName: null };
        return { ...prev, items: filtered };
      });
      return;
    }
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity: qty } : i
      ),
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCart({ items: [], restaurantId: null, restaurantName: null });
  }, []);

  const totalItems = cart.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: cart.items,
        restaurantId: cart.restaurantId,
        restaurantName: cart.restaurantName,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
