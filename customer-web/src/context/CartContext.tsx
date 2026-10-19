'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { CartItem, MenuItem } from '@/types/dining';

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, quantity?: number, specialInstructions?: string) => void;
  updateQuantity: (menu_item_id: string, delta: number) => void;
  setQuantity: (menu_item_id: string, quantity: number) => void;
  updateInstructions: (menu_item_id: string, instructions: string) => void;
  removeItem: (menu_item_id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotalPaise: number;
  taxPaise: number; // 5% GST
  totalPaise: number;
  formatRupees: (paise: number) => string;
  getItemQuantity: (menu_item_id: string) => number;
  getItemInstructions: (menu_item_id: string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'restro_customer_cart_v2';

export const formatRupees = (paise: number): string => {
  const rupees = (paise || 0) / 100;
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Safe load from local storage on mount with malformed data filtering
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const validItems = parsed.filter(
            (i): i is CartItem =>
              Boolean(i && i.menu_item_id && i.item && typeof i.item.price_paise === 'number' && typeof i.quantity === 'number')
          );
          setItems(validItems);
        }
      }
    } catch {
      // Clear corrupted storage gracefully
      try {
        localStorage.removeItem(CART_STORAGE_KEY);
      } catch {
        // ignore
      }
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Safe sync to local storage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // quota exceeded or private mode
      }
    }
  }, [items, isLoaded]);

  const addItem = (item: MenuItem, quantity: number = 1, specialInstructions?: string) => {
    if (!item || !item._id || quantity <= 0) return;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.menu_item_id === item._id);
      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
          special_instructions: specialInstructions ?? next[existingIndex].special_instructions,
        };
        return next;
      }
      return [
        ...prev,
        {
          menu_item_id: item._id,
          item, // Contains authoritative item details including price_paise
          quantity,
          special_instructions: specialInstructions || '',
        },
      ];
    });
  };

  const updateQuantity = (menu_item_id: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((cartItem) => {
          if (cartItem.menu_item_id === menu_item_id) {
            const nextQty = (cartItem.quantity || 0) + delta;
            return nextQty > 0 ? { ...cartItem, quantity: nextQty } : null;
          }
          return cartItem;
        })
        .filter((i): i is CartItem => i !== null);
    });
  };

  const setQuantity = (menu_item_id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(menu_item_id);
      return;
    }
    setItems((prev) =>
      prev.map((cartItem) =>
        cartItem.menu_item_id === menu_item_id ? { ...cartItem, quantity } : cartItem
      )
    );
  };

  const updateInstructions = (menu_item_id: string, instructions: string) => {
    setItems((prev) =>
      prev.map((cartItem) =>
        cartItem.menu_item_id === menu_item_id
          ? { ...cartItem, special_instructions: instructions }
          : cartItem
      )
    );
  };

  const removeItem = (menu_item_id: string) => {
    setItems((prev) => prev.filter((i) => i.menu_item_id !== menu_item_id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (menu_item_id: string): number => {
    const found = items.find((i) => i.menu_item_id === menu_item_id);
    return found ? found.quantity : 0;
  };

  const getItemInstructions = (menu_item_id: string): string => {
    const found = items.find((i) => i.menu_item_id === menu_item_id);
    return found?.special_instructions || '';
  };

  // Safe reduction with fallback
  const totalItems = useMemo(() => {
    return items.reduce((sum, i) => sum + (i?.quantity || 0), 0);
  }, [items]);

  // Authoritative calculations: strictly defensive against nullish fields
  const subtotalPaise = useMemo(() => {
    return items.reduce((sum, i) => {
      const price = i?.item?.price_paise ?? 0;
      const qty = i?.quantity ?? 0;
      return sum + price * qty;
    }, 0);
  }, [items]);

  // 5% GST (standard Indian restaurant dine-in tax)
  const taxPaise = useMemo(() => {
    return Math.round(subtotalPaise * 0.05);
  }, [subtotalPaise]);

  const totalPaise = useMemo(() => {
    return subtotalPaise + taxPaise;
  }, [subtotalPaise, taxPaise]);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        setQuantity,
        updateInstructions,
        removeItem,
        clearCart,
        totalItems,
        subtotalPaise,
        taxPaise,
        totalPaise,
        formatRupees,
        getItemQuantity,
        getItemInstructions,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
