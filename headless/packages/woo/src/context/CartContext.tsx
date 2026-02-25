"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import useSWR from "swr";
import { graphqlFetcher, volatileSWRConfig } from "@flavor/core/lib/swr";
import { GET_CART, ADD_TO_CART, UPDATE_CART_ITEM_QUANTITIES, REMOVE_CART_ITEMS, APPLY_COUPON, REMOVE_COUPONS } from "../lib/queries/cart";
import { UPDATE_SHIPPING_METHOD, CHECKOUT } from "../lib/queries/checkout";
import type {
  Cart,
  GetCartResponse,
  AddToCartResponse,
  UpdateCartItemsResponse,
  RemoveCartItemsResponse,
  UpdateShippingMethodResponse,
  ApplyCouponResponse,
  RemoveCouponsResponse,
  CheckoutInput,
  CheckoutResponse,
  Order,
} from "../lib/types";

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  loading: boolean;
  isAdding: boolean;
  addToCart: (productId: number, quantity?: number, variationId?: number) => Promise<void>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: (code: string) => Promise<void>;
  updateShippingMethod: (rateId: string) => Promise<void>;
  checkout: (input: CheckoutInput) => Promise<Order>;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  itemCount: 0,
  loading: true,
  isAdding: false,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeItem: async () => {},
  clearCart: async () => {},
  applyCoupon: async () => {},
  removeCoupon: async () => {},
  updateShippingMethod: async () => {},
  checkout: async () => { throw new Error("CartProvider not mounted"); },
  drawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
  toggleDrawer: () => {},
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CartProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { data, isLoading, mutate } = useSWR<GetCartResponse>(
    [GET_CART],
    graphqlFetcher,
    volatileSWRConfig,
  );

  const cart = data?.cart ?? null;
  const itemCount = cart?.contents?.itemCount ?? 0;

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const toggleDrawer = useCallback(() => setDrawerOpen((prev) => !prev), []);

  const addToCart = useCallback(
    async (productId: number, quantity = 1, variationId?: number) => {
      setIsAdding(true);
      try {
        const result = await graphqlFetcher<AddToCartResponse>([
          ADD_TO_CART,
          { productId, quantity, variationId },
        ]);
        await mutate({ cart: result.addToCart.cart }, { revalidate: false });
        setDrawerOpen(true);
      } finally {
        setIsAdding(false);
      }
    },
    [mutate],
  );

  const updateQuantity = useCallback(
    async (key: string, quantity: number) => {
      const result = await graphqlFetcher<UpdateCartItemsResponse>([
        UPDATE_CART_ITEM_QUANTITIES,
        { items: [{ key, quantity }] },
      ]);
      await mutate(
        { cart: result.updateItemQuantities.cart },
        { revalidate: false },
      );
    },
    [mutate],
  );

  const removeItem = useCallback(
    async (key: string) => {
      // Optimistic update — remove item instantly
      const previousCart = cart;
      if (cart) {
        const optimistic: Cart = {
          ...cart,
          contents: {
            ...cart.contents,
            nodes: cart.contents.nodes.filter((item) => item.key !== key),
            itemCount: cart.contents.itemCount - (cart.contents.nodes.find((i) => i.key === key)?.quantity ?? 1),
          },
        };
        await mutate({ cart: optimistic }, { revalidate: false });
      }

      try {
        const result = await graphqlFetcher<RemoveCartItemsResponse>([
          REMOVE_CART_ITEMS,
          { keys: [key] },
        ]);
        await mutate(
          { cart: result.removeItemsFromCart.cart },
          { revalidate: false },
        );
      } catch {
        // Rollback on error
        if (previousCart) {
          await mutate({ cart: previousCart }, { revalidate: false });
        }
      }
    },
    [cart, mutate],
  );

  const applyCoupon = useCallback(
    async (code: string) => {
      const result = await graphqlFetcher<ApplyCouponResponse>([
        APPLY_COUPON,
        { code },
      ]);
      await mutate({ cart: result.applyCoupon.cart }, { revalidate: false });
    },
    [mutate],
  );

  const removeCoupon = useCallback(
    async (code: string) => {
      const result = await graphqlFetcher<RemoveCouponsResponse>([
        REMOVE_COUPONS,
        { codes: [code] },
      ]);
      await mutate({ cart: result.removeCoupons.cart }, { revalidate: false });
    },
    [mutate],
  );

  const updateShippingMethod = useCallback(
    async (rateId: string) => {
      const result = await graphqlFetcher<UpdateShippingMethodResponse>([
        UPDATE_SHIPPING_METHOD,
        { shippingMethods: [rateId] },
      ]);
      await mutate(
        { cart: result.updateShippingMethod.cart },
        { revalidate: false },
      );
    },
    [mutate],
  );

  const checkoutOrder = useCallback(
    async (input: CheckoutInput): Promise<Order> => {
      const result = await graphqlFetcher<CheckoutResponse>([
        CHECKOUT,
        { input },
      ]);
      const order = result.checkout.order;
      // Clear cart cache after successful checkout — don't let
      // revalidation errors bubble up (the order already succeeded)
      mutate(undefined, { revalidate: true }).catch(() => {});
      return order;
    },
    [mutate],
  );

  const clearCart = useCallback(async () => {
    if (!cart) return;
    const allKeys = cart.contents.nodes.map((item) => item.key);
    if (allKeys.length === 0) return;

    const result = await graphqlFetcher<RemoveCartItemsResponse>([
      REMOVE_CART_ITEMS,
      { keys: allKeys },
    ]);
    await mutate(
      { cart: result.removeItemsFromCart.cart },
      { revalidate: false },
    );
  }, [cart, mutate]);

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading: isLoading,
        isAdding,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        applyCoupon,
        removeCoupon,
        updateShippingMethod,
        checkout: checkoutOrder,
        drawerOpen,
        openDrawer,
        closeDrawer,
        toggleDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useCart() {
  return useContext(CartContext);
}
