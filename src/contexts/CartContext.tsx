"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  addSubscriptionToCart as apiAddSubscriptionToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearStoredCartId,
  type Cart,
  type CartItem,
} from "@/lib/cart";
import { trackAddToCart, trackRemoveFromCart, trackCartUpdate } from "@/lib/analytics";

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  error: string | null;
  addToCart: (variantId: string, quantity?: number, metadata?: Record<string, unknown>) => Promise<void>;
  addSubscription: (variantId: string, quantity: number, subscriptionOptionId: string) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load cart on mount
  const refreshCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedCart = await getCart();
      setCart(loadedCart);
    } catch (err) {
      console.error("Failed to load cart:", err);
      setError("Failed to load cart");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(async (
    variantId: string,
    quantity: number = 1,
    metadata?: Record<string, unknown>
  ) => {
    try {
      setError(null);
      const updatedCart = await apiAddToCart(variantId, quantity, metadata);
      setCart(updatedCart);

      // Track analytics
      const addedItem = updatedCart.items.find(i => i.variant_id === variantId);
      if (addedItem) {
        trackAddToCart({
          productId: addedItem.variant.product.id,
          variantId: addedItem.variant_id,
          title: addedItem.title,
          quantity,
          price: addedItem.unit_price,
        });
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setError("Failed to add item to cart");
      throw err;
    }
  }, []);

  const addSubscription = useCallback(async (
    variantId: string,
    quantity: number,
    subscriptionOptionId: string
  ) => {
    try {
      setError(null);
      const updatedCart = await apiAddSubscriptionToCart(variantId, quantity, subscriptionOptionId);
      setCart(updatedCart);

      // Track analytics
      const addedItem = updatedCart.items.find(i => i.variant_id === variantId);
      if (addedItem) {
        trackAddToCart({
          productId: addedItem.variant.product.id,
          variantId: addedItem.variant_id,
          title: addedItem.title,
          quantity,
          price: addedItem.unit_price,
          isSubscription: true,
        });
      }
    } catch (err) {
      console.error("Failed to add subscription:", err);
      setError("Failed to add subscription to cart");
      throw err;
    }
  }, []);

  const updateQuantity = useCallback(async (lineItemId: string, quantity: number) => {
    try {
      setError(null);
      if (quantity <= 0) {
        await removeItem(lineItemId);
        return;
      }
      const updatedCart = await apiUpdateCartItem(lineItemId, quantity);
      setCart(updatedCart);
      trackCartUpdate(lineItemId, quantity);
    } catch (err) {
      console.error("Failed to update cart item:", err);
      setError("Failed to update quantity");
      throw err;
    }
  }, []);

  const removeItem = useCallback(async (lineItemId: string) => {
    try {
      setError(null);
      const updatedCart = await apiRemoveCartItem(lineItemId);
      setCart(updatedCart);
      trackRemoveFromCart(lineItemId);
    } catch (err) {
      console.error("Failed to remove cart item:", err);
      setError("Failed to remove item");
      throw err;
    }
  }, []);

  const clearCart = useCallback(() => {
    clearStoredCartId();
    setCart(null);
  }, []);

  const items = cart?.items || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart?.subtotal || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        isLoading,
        error,
        addToCart,
        addSubscription,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
