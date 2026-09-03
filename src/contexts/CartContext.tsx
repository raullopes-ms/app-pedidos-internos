import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { Product } from "@/services/products";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  addItem: (product: Product, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  items: CartItem[];
  removeItem: (codProd: number) => void;
  total: number;
  updateQuantity: (codProd: number, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product, quantity: number) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.product.codProd === product.codProd,
      );

      if (!existingItem) {
        return [...currentItems, { product, quantity }];
      }

      return currentItems.map((item) =>
        item.product.codProd === product.codProd
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      );
    });
  }, []);

  const updateQuantity = useCallback((codProd: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((currentItems) =>
        currentItems.filter((item) => item.product.codProd !== codProd),
      );
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.codProd === codProd ? { ...item, quantity } : item,
      ),
    );
  }, []);

  const removeItem = useCallback((codProd: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.codProd !== codProd),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product.vlrVenda * item.quantity,
        0,
      ),
    [items],
  );

  const value = useMemo(
    () => ({
      addItem,
      clearCart,
      itemCount,
      items,
      removeItem,
      total,
      updateQuantity,
    }),
    [addItem, clearCart, itemCount, items, removeItem, total, updateQuantity],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
