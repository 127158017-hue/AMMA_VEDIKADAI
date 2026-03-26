/**
 * Zustand store for shopping cart state management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Cart } from '@/types';

interface CartStore extends Cart {
  addItem: (item: Omit<CartItem, 'price'> & { price: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalAmount: 0,
      totalItems: 0,

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId
          );

          let newItems;
          if (existingItem) {
            newItems = state.items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
          } else {
            newItems = [...state.items, item];
          }

          const totalAmount = newItems.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
          );
          const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);

          return {
            items: newItems,
            totalAmount,
            totalItems,
          };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const newItems = state.items.filter(
            (i) => i.productId !== productId
          );
          const totalAmount = newItems.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
          );
          const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);

          return {
            items: newItems,
            totalAmount,
            totalItems,
          };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            get().removeItem(productId);
            return state;
          }

          const newItems = state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          );
          const totalAmount = newItems.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
          );
          const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);

          return {
            items: newItems,
            totalAmount,
            totalItems,
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          totalAmount: 0,
          totalItems: 0,
        });
      },

      getTotal: () => get().totalAmount,
    }),
    {
      name: 'cart-store',
    }
  )
);
