import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(item => item.id === product.id);
        
        if (existingItem) {
          if (existingItem.quantity >= product.stockQuantity) return; // Cap at stock
          set({
            items: currentItems.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) });
      },
      
      updateQuantity: (productId, quantity, maxStock) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        if (maxStock !== undefined && quantity > maxStock) {
           quantity = maxStock;
        }
        set({
          items: get().items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      get total() {
        return get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      },
      
      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      }
    }),
    {
      name: 'sliit-cart',
    }
  )
);

export default useCartStore;
