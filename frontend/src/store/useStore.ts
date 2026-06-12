import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem, Restaurant } from "@/lib/api";

export interface CartItem extends MenuItem {
  qty: number;
}

interface AppState {
  // Active session
  userId: string;
  activeRestaurant: Restaurant | null;

  // Cart
  cart: CartItem[];

  // Actions
  setUserId: (id: string) => void;
  setRestaurant: (r: Restaurant | null) => void;

  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;

  // Derived
  cartCount: () => number;
  cartSubtotal: () => number;
  cartItemIds: () => string[];
  getItemQty: (itemId: string) => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      userId: "U0001",
      activeRestaurant: null,
      cart: [],

      setUserId: (id) => set({ userId: id }),

      setRestaurant: (r) =>
        set({ activeRestaurant: r, cart: [] }),

      addToCart: (item) => {
        const cart = get().cart;
        const existing = cart.find((c) => c.id === item.id);
        if (existing) {
          set({
            cart: cart.map((c) =>
              c.id === item.id ? { ...c, qty: c.qty + 1 } : c
            ),
          });
        } else {
          set({ cart: [...cart, { ...item, qty: 1 }] });
        }
      },

      removeFromCart: (itemId) => {
        const cart = get().cart;
        const existing = cart.find((c) => c.id === itemId);
        if (!existing) return;
        if (existing.qty <= 1) {
          set({ cart: cart.filter((c) => c.id !== itemId) });
        } else {
          set({
            cart: cart.map((c) =>
              c.id === itemId ? { ...c, qty: c.qty - 1 } : c
            ),
          });
        }
      },

      clearCart: () => set({ cart: [] }),

      cartCount: () => get().cart.reduce((s, i) => s + i.qty, 0),

      cartSubtotal: () =>
        get().cart.reduce((s, i) => s + i.price * i.qty, 0),

      cartItemIds: () => get().cart.map((i) => i.id),

      getItemQty: (itemId) =>
        get().cart.find((c) => c.id === itemId)?.qty ?? 0,
    }),
    {
      name: "nibble-cart",
      partialize: (s) => ({ userId: s.userId }),
    }
  )
);
