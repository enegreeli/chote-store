'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  size: string;
  unitPrice: number;
  costPrice: number;
  quantity: number;
  maxStock: number;
}

export interface AppliedCoupon {
  code: string;
  discountType: string;
  discountValue: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  removeItem: (productId: string, size: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  setShippingCost: (cost: number) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => ({ success: false }),
  updateQuantity: () => {},
  removeItem: () => {},
  clearCart: () => {},
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  shipping: 0,
  total: 0,
  coupon: null,
  applyCoupon: async () => ({ success: false, message: '' }),
  removeCoupon: () => {},
  setShippingCost: () => {},
  isCartOpen: false,
  setIsCartOpen: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [shipping, setShipping] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('chote_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      const savedCoupon = localStorage.getItem('chote_coupon');
      if (savedCoupon) {
        setCoupon(JSON.parse(savedCoupon));
      }
    } catch {
      // ignore
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('chote_cart', JSON.stringify(items));
    }
  }, [items, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      if (coupon) {
        localStorage.setItem('chote_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('chote_coupon');
      }
    }
  }, [coupon, isInitialized]);

  const addItem = (newItem: Omit<CartItem, 'quantity'>, quantity = 1) => {
    if (newItem.maxStock <= 0) {
      return { success: false, message: 'Produto ou tamanho esgotado.' };
    }

    let success = true;
    let message = 'Produto adicionado ao carrinho!';

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === newItem.productId && i.size === newItem.size
      );

      if (existingIndex > -1) {
        const existing = prev[existingIndex];
        const newQty = existing.quantity + quantity;

        if (newQty > newItem.maxStock) {
          success = false;
          message = `Limite de estoque atingido (${newItem.maxStock} un. disponíveis para o tamanho ${newItem.size}).`;
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = { ...existing, quantity: newQty };
        return updated;
      } else {
        if (quantity > newItem.maxStock) {
          success = false;
          message = `Apenas ${newItem.maxStock} un. disponíveis para o tamanho ${newItem.size}.`;
          return prev;
        }
        return [...prev, { ...newItem, quantity }];
      }
    });

    if (success) {
      setIsCartOpen(true);
    }

    return { success, message };
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.size === size) {
          const finalQty = Math.min(quantity, item.maxStock);
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
    setShipping(0);
    localStorage.removeItem('chote_cart');
    localStorage.removeItem('chote_coupon');
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  // Calculate discount
  let discount = 0;
  if (coupon) {
    if (coupon.discountType === 'PERCENTAGE') {
      discount = (subtotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'FIXED') {
      discount = Math.min(coupon.discountValue, subtotal);
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      discount = shipping;
    }
  }

  // Free shipping threshold: >= R$ 399
  const effectiveShipping = subtotal >= 399 || (coupon && coupon.discountType === 'FREE_SHIPPING') ? 0 : shipping;
  const total = Math.max(0, subtotal - (coupon?.discountType !== 'FREE_SHIPPING' ? discount : 0) + effectiveShipping);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Cupom inválido' };
      }

      setCoupon(data.coupon);
      return { success: true, message: `Cupom ${data.coupon.code} aplicado com sucesso!` };
    } catch {
      return { success: false, message: 'Erro ao validar cupom.' };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        discount,
        shipping: effectiveShipping,
        total,
        coupon,
        applyCoupon,
        removeCoupon,
        setShippingCost: setShipping,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

