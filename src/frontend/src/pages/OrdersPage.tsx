import { RequireSignIn, SignInButton } from "@/components/InternetIdentity";
import { useMyOrders } from "@/hooks/useQueries";
import { formatSen } from "@/lib/currency";
import { formatOrderDate } from "@/lib/time";
import { Link } from "@tanstack/react-router";
import { PackageOpen, Receipt, ShoppingBag } from "lucide-react";

function OrdersSkeleton() {
  return (
    <ul
      data-ocid="orders.loading_state"
      className="flex flex-col gap-4"
      aria-hidden="true"
    >
      {Array.from({ length: 3 }, (_, i) => `orders-skeleton-${i}`).map((id) => (
        <li
          key={id}
          className="rounded-lg border border-border bg-card p-5 shadow-subtle"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="h-5 w-40 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="mt-4 h-4 w-56 animate-pulse rounded-full bg-muted" />
        </li>
      ))}
    </ul>
  );
}

function SignedOutPrompt() {
  return (
    <div
      data-ocid="orders.signin_prompt"
      className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-12 text-center shadow-subtle"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        <Receipt className="size-7" aria-hidden="true" />
      </span>
      <h2 className="font-display text-xl font-bold text-foreground">
        Sign in to see your orders
      </h2>
      <p className="text-sm text-muted-foreground">
        Your order history is private to your Internet Identity. Sign in to
        review past purchases and reorder your favourites.
      </p>
      <SignInButton className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60" />
    </div>
  );
}

function EmptyOrders() {
  return (
    <div
      data-ocid="orders.empty_state"
      className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-card px-6 py-12 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        <PackageOpen className="size-7" aria-hidden="true" />
      </span>
      <h2 className="font-display text-xl font-bold text-foreground">
        No orders yet
      </h2>
      <p className="text-sm text-muted-foreground">
        When you place your first order, it will appear here with its reference
        and total.
      </p>
      <Link
        to="/products"
        data-ocid="orders.browse_products_link"
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <ShoppingBag className="size-4" aria-hidden="true" />
        Browse products
      </Link>
    </div>
  );
}

function OrdersList() {
  const { data: orders, isLoading, isError, refetch } = useMyOrders();

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  if (isError) {
    return (
      <div
        data-ocid="orders.error_state"
        className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-10 text-center"
      >
        <h2 className="font-display text-lg font-bold text-foreground">
          We couldn&apos;t load your orders
        </h2>
        <p className="text-sm text-muted-foreground">
          Something went wrong while fetching your order history.
        </p>
        <button
          type="button"
          data-ocid="orders.retry_button"
          onClick={() => void refetch()}
          className="rounded-full border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-smooth hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Try again
        </button>
      </div>
    );
  }

  const list = orders ?? [];
  if (list.length === 0) {
    return <EmptyOrders />;
  }

  return (
    <ul data-ocid="orders.list" className="flex flex-col gap-4">
      {list.map((order, index) => {
        const itemCount = order.items.reduce(
          (sum, item) => sum + Number(item.quantity),
          0,
        );
        return (
          <li key={order.id.toString()}>
            <Link
              to="/orders/$orderId"
              params={{ orderId: order.id.toString() }}
              data-ocid={`orders.item.${index + 1}`}
              className="group flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5 shadow-subtle transition-smooth hover:border-primary hover:shadow-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <div className="min-w-0">
                <p className="font-mono text-sm font-semibold tracking-tight text-foreground">
                  {order.reference}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatOrderDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Items
                  </p>
                  <p className="font-mono text-sm text-foreground">
                    {itemCount}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Total
                  </p>
                  <p className="font-price text-lg font-bold text-foreground">
                    {formatSen(order.totalSen)}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function OrdersPage() {
  return (
    <section
      data-ocid="orders.page"
      className="mx-auto w-full max-w-4xl px-4 py-12"
    >
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Your account
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          My Orders
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Review your past purchases from Mr Kipmasai Mini Mart, with the order
          reference, date, item count and total in Ringgit.
        </p>
      </header>

      <RequireSignIn fallback={<SignedOutPrompt />}>
        <OrdersList />
      </RequireSignIn>
    </section>
  );
}
