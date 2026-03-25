import { create } from 'zustand';
import type { Cart } from '../types';
import * as cartApi from '../api/cart';

interface CartState {
  cart: Cart | null;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => void;
  itemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  loading: false,

  fetchCart: async () => {
    try {
      set({ loading: true });
      const cart = await cartApi.getCart();
      set({ cart });
    } finally {
      set({ loading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    const cart = await cartApi.addToCart(productId, quantity);
    set({ cart });
  },

  updateItem: async (itemId, quantity) => {
    const cart = await cartApi.updateCartItem(itemId, quantity);
    set({ cart });
  },

  removeItem: async (itemId) => {
    const cart = await cartApi.removeCartItem(itemId);
    set({ cart });
  },

  clearCart: () => set({ cart: null }),

  itemCount: () => {
    const { cart } = get();
    return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  },
}));
