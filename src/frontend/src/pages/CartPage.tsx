import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import type { CartLine } from "@/lib/cart";
import { formatSen } from "@/lib/currency";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

function CartItemRow({
  line,
  index,
  onUpdateQuantity,
  onRemove,
}: {
  line: CartLine;
  index: number;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  const unitSen = BigInt(line.priceSen);
  const lineSen = unitSen * BigInt(line.quantity);

  return (
    <li
      data-ocid={`cart.item.${index + 1}`}
      className="flex flex-col gap-4 border-b border-border py-5 last:border-b-0 sm:flex-row sm:items-center"
    >
      <Link
        to="/products/$productId"
        params={{ productId: line.productId }}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          {line.imageUrl ? (
            <img
              src={line.imageUrl}
              alt={line.name}
              loading="lazy"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <ShoppingBag className="size-7" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-base font-semibold text-foreground">
            {line.name}
          </p>
          <p className="mt-1 font-price text-sm text-muted-foreground">
            {formatSen(unitSen)} each
          </p>
        </div>
      </Link>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <fieldset
          className="flex items-center rounded-full border border-border bg-background"
          aria-label={`Quantity for ${line.name}`}
        >
          <button
            type="button"
            data-ocid={`cart.quantity_decrease.${index + 1}`}
            aria-label={`Decrease quantity of ${line.name}`}
            onClick={() => onUpdateQuantity(line.productId, line.quantity - 1)}
            className="flex size-9 items-center justify-center rounded-full text-foreground transition-smooth hover:bg-secondary disabled:opacity-40"
          >
            <Minus className="size-4" aria-hidden="true" />
          </button>
          <span
            data-ocid={`cart.quantity_value.${index + 1}`}
            className="w-8 text-center font-price text-sm font-semibold text-foreground"
          >
            {line.quantity}
          </span>
          <button
            type="button"
            data-ocid={`cart.quantity_increase.${index + 1}`}
            aria-label={`Increase quantity of ${line.name}`}
            onClick={() => onUpdateQuantity(line.productId, line.quantity + 1)}
            className="flex size-9 items-center justify-center rounded-full text-foreground transition-smooth hover:bg-secondary"
          >
            <Plus className="size-4" aria-hidden="true" />
          </button>
        </fieldset>

        <p
          data-ocid={`cart.line_total.${index + 1}`}
          className="w-24 text-right font-price text-base font-semibold text-foreground"
        >
          {formatSen(lineSen)}
        </p>

        <button
          type="button"
          data-ocid={`cart.remove_button.${index + 1}`}
          aria-label={`Remove ${line.name} from cart`}
          onClick={() => onRemove(line.productId)}
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}

export function CartPage() {
  const { lines, itemCount, totalSen, updateQuantity, removeItem } = useCart();

  if (lines.length === 0) {
    return (
      <section
        data-ocid="cart.page"
        className="mx-auto w-full max-w-6xl px-4 py-12"
      >
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Your Cart
        </h1>
        <div
          data-ocid="cart.empty_state"
          className="mt-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-subtle"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <ShoppingBag className="size-8" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-display text-xl font-bold text-foreground">
            Your cart is empty
          </h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Browse the aisles and add fresh produce and everyday essentials to
            get started.
          </p>
          <Button
            asChild
            data-ocid="cart.continue_shopping_button"
            className="mt-6 rounded-full"
          >
            <Link to="/products">Continue shopping</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      data-ocid="cart.page"
      className="mx-auto w-full max-w-6xl px-4 py-12"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Your Cart
        </h1>
        <p className="font-price text-sm text-muted-foreground">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <ul
          data-ocid="cart.list"
          className="rounded-xl border border-border bg-card px-5 shadow-subtle"
        >
          {lines.map((line, index) => (
            <CartItemRow
              key={line.productId}
              line={line}
              index={index}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </ul>

        <aside
          data-ocid="cart.summary"
          className="h-fit rounded-xl border border-border bg-card p-6 shadow-elevated lg:sticky lg:top-24"
        >
          <h2 className="font-display text-lg font-bold text-foreground">
            Order Summary
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-price text-foreground">
                {formatSen(totalSen)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Items</dt>
              <dd className="font-price text-foreground">{itemCount}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="font-display text-base font-bold text-foreground">
              Total
            </span>
            <span
              data-ocid="cart.total"
              className="font-price text-xl font-bold text-primary"
            >
              {formatSen(totalSen)}
            </span>
          </div>

          <Button
            asChild
            data-ocid="cart.checkout_button"
            className="mt-6 w-full rounded-full"
          >
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            data-ocid="cart.continue_shopping_button"
            className="mt-2 w-full rounded-full"
          >
            <Link to="/products">Continue shopping</Link>
          </Button>
        </aside>
      </div>
    </section>
  );
}
