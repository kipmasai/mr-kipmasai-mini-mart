import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  productId: string;
  name: string;
  priceSen: string;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  lines: CartLine[];
  addItem: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

/**
 * Shared cart state persisted to localStorage so contents survive refresh and
 * navigation. Backend-owned catalog and order data never lives here.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addItem: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find(
            (l) => l.productId === line.productId,
          );
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === line.productId
                  ? { ...l, quantity: l.quantity + quantity }
                  : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity }] };
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.productId !== productId)
              : state.lines.map((l) =>
                  l.productId === productId ? { ...l, quantity } : l,
                ),
        })),
      removeItem: (productId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.productId !== productId),
        })),
      clearCart: () => set({ lines: [] }),
    }),
    { name: "kipmasai-cart" },
  ),
);

/** Total number of individual items in the cart. */
export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

/** Cart total in sen. */
export function cartTotalSen(lines: CartLine[]): bigint {
  return lines.reduce(
    (sum, line) => sum + BigInt(line.priceSen) * BigInt(line.quantity),
    0n,
  );
}
