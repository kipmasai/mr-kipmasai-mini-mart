import {
  type CartLine,
  cartItemCount,
  cartTotalSen,
  useCartStore,
} from "@/lib/cart";
import { useMemo } from "react";

export interface CartApi {
  lines: CartLine[];
  itemCount: number;
  totalSen: bigint;
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

/** Convenience hook exposing cart lines plus derived count and total. */
export function useCart(): CartApi {
  const lines = useCartStore((state) => state.lines);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const itemCount = useMemo(() => cartItemCount(lines), [lines]);
  const totalSen = useMemo(() => cartTotalSen(lines), [lines]);

  return {
    lines,
    itemCount,
    totalSen,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  };
}
