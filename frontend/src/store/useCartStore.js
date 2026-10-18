import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            
            addItem: (product) => {
                const items = get().items;
                const existingItem = items.find(item => item.product === product.product);
                
                if (existingItem) {
                    set({
                        items: items.map(item =>
                            item.product === product.product
                                ? { ...item, qty: item.qty + product.qty }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...items, product] });
                }
            },
            
            removeItem: (productId) => {
                set({ items: get().items.filter(item => item.product !== productId) });
            },
            
            updateQuantity: (productId, quantity) => {
                if (quantity < 1) return;
                set({
                    items: get().items.map(item =>
                        item.product === productId ? { ...item, qty: quantity } : item
                    ),
                });
            },
            
            clearCart: () => set({ items: [] }),
            
            getTotalItems: () => get().items.reduce((sum, item) => sum + item.qty, 0),
            
            getTotalPrice: () => get().items.reduce((sum, item) => sum + item.price * item.qty, 0),
            
            getItemCount: (productId) => {
                const item = get().items.find(item => item.product === productId);
                return item?.qty || 0;
            },
        }),
        {
            name: 'cart-storage',
            getStorage: () => localStorage,
        }
    )
);