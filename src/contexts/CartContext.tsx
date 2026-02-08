"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  addSubscriptionToCart as apiAddSubscriptionToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  applyCoupon as apiApplyCoupon,
  removeCoupon as apiRemoveCoupon,
  updateCart as apiUpdateCart,
  selectShippingRate as apiSelectShippingRate,
  clearStoredCartId,
  type Cart,
  type CartItem,
  type CartCoupon,
  type ShippingRate,
  type Address,
} from "@/lib/wc-cart";
import { trackAddToCart, trackRemoveFromCart, trackCartUpdate } from "@/lib/analytics";
import { trackGtagAddToCart, trackGtagRemoveFromCart } from "@/lib/gtag";
import { klaviyoAddedToCart } from "@/components/Klaviyo";
import { tracker } from "@/lib/tracker";

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  coupons: CartCoupon[];
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  availableShippingRates: ShippingRate[];
  hasCalculatedShipping: boolean;
  isLoading: boolean;
  isAddingToCart: boolean;
  error: string | null;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (variantId: string, quantity?: number, metadata?: Record<string, unknown>) => Promise<void>;
  addSubscription: (variantId: string, quantity: number, subscriptionOptionId: string) => Promise<void>;
  updateQuantity: (lineItemId: string, quantity: number) => Promise<void>;
  removeItem: (lineItemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: (code: string) => Promise<void>;
  updateShippingAddress: (address: Address) => Promise<void>;
  selectShippingRate: (rateId: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

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
      // Open drawer and show loading state immediately
      setIsAddingToCart(true);
      setIsDrawerOpen(true);
      
      const updatedCart = await apiAddToCart(variantId, quantity, metadata);
      setCart(updatedCart);

      // Track analytics — find added item, fall back to last item if variant_id doesn't match
      const addedItem = updatedCart.items.find(i => i.variant_id === variantId)
        || updatedCart.items[updatedCart.items.length - 1];
      if (addedItem) {
        trackAddToCart({
          productId: addedItem.variant?.product?.id || variantId,
          variantId: addedItem.variant_id,
          title: addedItem.title,
          quantity,
          price: addedItem.unit_price,
        });
        trackGtagAddToCart({
          item_id: addedItem.variant?.product?.id || variantId,
          item_name: addedItem.title,
          price: addedItem.unit_price,
          quantity,
          currency: 'USD',
        });
        // Klaviyo tracking
        klaviyoAddedToCart({
          ProductID: addedItem.variant?.product?.id || variantId,
          ProductName: addedItem.title,
          ProductURL: `https://www.drinkyum.com/products/${addedItem.variant?.product?.handle || variantId}`,
          ImageURL: addedItem.thumbnail || '',
          Price: addedItem.unit_price,
          Quantity: quantity,
          CartTotal: updatedCart.total,
        });
      }
      // First-party tracker (ad-blocker resistant) — always fire
      tracker.addToCart({
        id: addedItem?.variant?.product?.id || variantId,
        name: addedItem?.title || 'Unknown',
        price: addedItem?.unit_price || 0,
        quantity,
        currency: 'USD',
      });
    } catch (err) {
      console.error("Failed to add to cart:", err);
      setError("Failed to add item to cart");
      throw err;
    } finally {
      setIsAddingToCart(false);
    }
  }, []);

  const addSubscription = useCallback(async (
    variantId: string,
    quantity: number,
    subscriptionOptionId: string
  ) => {
    try {
      setError(null);
      // Parse subscription key format: "period-interval" (e.g., "month-1", "week-2")
      const [period, intervalStr] = subscriptionOptionId.split('-');
      const interval = parseInt(intervalStr, 10) || 1;
      const updatedCart = await apiAddSubscriptionToCart(variantId, quantity, period, interval);
      setCart(updatedCart);

      // Open cart drawer after adding item
      setIsDrawerOpen(true);

      // Track analytics — find added item, fall back to last item
      const addedItem = updatedCart.items.find(i => i.variant_id === variantId)
        || updatedCart.items[updatedCart.items.length - 1];
      if (addedItem) {
        trackAddToCart({
          productId: addedItem.variant?.product?.id || variantId,
          variantId: addedItem.variant_id,
          title: addedItem.title,
          quantity,
          price: addedItem.unit_price,
          isSubscription: true,
        });
        trackGtagAddToCart({
          item_id: addedItem.variant?.product?.id || variantId,
          item_name: addedItem.title,
          price: addedItem.unit_price,
          quantity,
          item_variant: 'subscription',
          currency: 'USD',
        });
        // Klaviyo tracking
        klaviyoAddedToCart({
          ProductID: addedItem.variant?.product?.id || variantId,
          ProductName: addedItem.title,
          ProductURL: `https://www.drinkyum.com/products/${addedItem.variant?.product?.handle || variantId}`,
          ImageURL: addedItem.thumbnail || '',
          Price: addedItem.unit_price,
          Quantity: quantity,
          CartTotal: updatedCart.total,
        });
      }
      // First-party tracker (ad-blocker resistant) — always fire
      tracker.addToCart({
        id: addedItem?.variant?.product?.id || variantId,
        name: addedItem?.title || 'Unknown',
        price: addedItem?.unit_price || 0,
        quantity,
        currency: 'USD',
      });
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
      
      // Optimistic update: update UI immediately
      const previousCart = cart;
      if (cart) {
        const optimisticCart = {
          ...cart,
          items: cart.items.map(item => 
            item.id === lineItemId 
              ? { ...item, quantity, total: item.unit_price * quantity, subtotal: item.unit_price * quantity }
              : item
          ),
        };
        // Recalculate totals
        optimisticCart.subtotal = optimisticCart.items.reduce((sum, item) => sum + item.subtotal, 0);
        optimisticCart.total = optimisticCart.subtotal - optimisticCart.discount_total + optimisticCart.shipping_total;
        setCart(optimisticCart);
      }
      
      // Then sync with server
      const updatedCart = await apiUpdateCartItem(lineItemId, quantity);
      setCart(updatedCart);
      trackCartUpdate(lineItemId, quantity);
    } catch (err) {
      console.error("Failed to update cart item:", err);
      setError("Failed to update quantity");
      // Revert on error - refresh from server
      refreshCart();
      throw err;
    }
  }, [cart, refreshCart]);

  const removeItem = useCallback(async (lineItemId: string) => {
    try {
      setError(null);
      // Find item before removing for analytics
      const removedItem = cart?.items.find(i => i.id === lineItemId);
      
      // Optimistic update: remove from UI immediately
      if (cart) {
        const optimisticCart = {
          ...cart,
          items: cart.items.filter(item => item.id !== lineItemId),
        };
        // Recalculate totals
        optimisticCart.subtotal = optimisticCart.items.reduce((sum, item) => sum + item.subtotal, 0);
        optimisticCart.total = optimisticCart.subtotal - optimisticCart.discount_total + optimisticCart.shipping_total;
        setCart(optimisticCart);
      }
      
      // Then sync with server
      const updatedCart = await apiRemoveCartItem(lineItemId);
      setCart(updatedCart);
      trackRemoveFromCart(lineItemId);
      if (removedItem) {
        trackGtagRemoveFromCart({
          item_id: removedItem.variant?.product?.id || removedItem.variant_id,
          item_name: removedItem.title,
          price: removedItem.unit_price,
          quantity: removedItem.quantity,
          currency: 'USD',
        });
      }
    } catch (err) {
      console.error("Failed to remove cart item:", err);
      setError("Failed to remove item");
      // Revert on error - refresh from server
      refreshCart();
      throw err;
    }
  }, [cart, refreshCart]);

  const applyCoupon = useCallback(async (code: string) => {
    try {
      setError(null);
      const updatedCart = await apiApplyCoupon(code);
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to apply coupon:", err);
      setError("Invalid or expired coupon code");
      throw err;
    }
  }, []);

  const removeCoupon = useCallback(async (code: string) => {
    try {
      setError(null);
      const updatedCart = await apiRemoveCoupon(code);
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to remove coupon:", err);
      setError("Failed to remove coupon");
      throw err;
    }
  }, []);

  const updateShippingAddress = useCallback(async (address: Address) => {
    try {
      setError(null);
      const updatedCart = await apiUpdateCart({ shipping_address: address });
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to update shipping address:", err);
      setError("Failed to update shipping address");
      throw err;
    }
  }, []);

  const selectShippingRate = useCallback(async (rateId: string) => {
    try {
      setError(null);
      const updatedCart = await apiSelectShippingRate(rateId);
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to select shipping rate:", err);
      setError("Failed to select shipping rate");
      throw err;
    }
  }, []);

  const clearCart = useCallback(() => {
    clearStoredCartId();
    setCart(null);
  }, []);

  const items = cart?.items || [];
  const coupons = cart?.coupons || [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart?.subtotal || 0;
  const discountTotal = cart?.discount_total || 0;
  const shippingTotal = cart?.shipping_total || 0;
  const availableShippingRates = cart?.available_shipping_rates || [];
  const hasCalculatedShipping = cart?.has_calculated_shipping || false;

  // Auto-select free shipping when available (e.g., from a free shipping coupon)
  useEffect(() => {
    if (!hasCalculatedShipping || availableShippingRates.length === 0) return;

    // Check if there's a free shipping rate that isn't currently selected
    const freeRate = availableShippingRates.find(rate => rate.price === 0);
    const selectedRate = availableShippingRates.find(rate => rate.selected);

    // If there's a free rate and it's not already selected, auto-select it
    if (freeRate && selectedRate && selectedRate.id !== freeRate.id) {
      apiSelectShippingRate(freeRate.id).then(setCart).catch(console.error);
    }
  }, [hasCalculatedShipping, availableShippingRates]);

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        coupons,
        itemCount,
        subtotal,
        discountTotal,
        shippingTotal,
        availableShippingRates,
        hasCalculatedShipping,
        isLoading,
        isAddingToCart,
        error,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addToCart,
        addSubscription,
        updateQuantity,
        removeItem,
        applyCoupon,
        removeCoupon,
        updateShippingAddress,
        selectShippingRate,
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
