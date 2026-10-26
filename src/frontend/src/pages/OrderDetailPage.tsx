import type { Order, OrderItem } from "@/backend";
import { RequireSignIn, SignInButton } from "@/components/InternetIdentity";
import { useMyOrder } from "@/hooks/useQueries";
import { formatSen } from "@/lib/currency";
import { formatOrderDate } from "@/lib/time";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, PackageSearch, ReceiptText } from "lucide-react";

function parseOrderId(raw: string): bigint | undefined {
  if (!/^\d+$/.test(raw)) return undefined;
  try {
    return BigInt(raw);
  } catch {
    return undefined;
  }
}

function OrderLines({ items }: { items: OrderItem[] }) {
  return (
    <ul data-ocid="order_detail.list" className="divide-y divide-border">
      {items.map((item, index) => (
        <li
          key={`${item.productId.toString()}-${index}`}
          data-ocid={`order_detail.item.${index + 1}`}
          className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">
              {item.productName}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {item.quantity.toString()} ×{" "}
              <span className="font-price">{formatSen(item.unitPriceSen)}</span>
            </p>
          </div>
          <p className="font-price text-base font-semibold text-foreground">
            {formatSen(item.subtotalSen)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function DeliveryPanel({ order }: { order: Order }) {
  const { delivery } = order;
  return (
    <section
      data-ocid="order_detail.delivery_panel"
      className="rounded-lg border border-border bg-card p-6 shadow-subtle"
    >
      <h2 className="font-display text-lg font-bold text-foreground">
        Delivery details
      </h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Recipient
          </dt>
          <dd className="mt-0.5 text-foreground">{delivery.customerName}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Phone
          </dt>
          <dd className="mt-0.5 text-foreground">{delivery.phone}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Address
          </dt>
          <dd className="mt-0.5 whitespace-pre-line text-foreground">
            {delivery.address}
          </dd>
        </div>
        {delivery.notes && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Notes
            </dt>
            <dd className="mt-0.5 whitespace-pre-line text-foreground">
              {delivery.notes}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
}

function OrderDetailBody({ orderId }: { orderId: bigint | undefined }) {
  const { data: order, isLoading, isError, refetch } = useMyOrder(orderId);

  if (orderId === undefined) {
    return <NotFoundState />;
  }

  if (isLoading) {
    return (
      <div
        data-ocid="order_detail.loading_state"
        className="space-y-6"
        aria-busy="true"
      >
        <div className="h-8 w-56 animate-pulse rounded-md bg-muted" />
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-56 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-ocid="order_detail.error_state"
        className="rounded-lg border border-destructive/40 bg-card p-8 text-center shadow-subtle"
      >
        <h2 className="font-display text-xl font-bold text-foreground">
          We couldn&apos;t load this order
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong while fetching your order. Please try again.
        </p>
        <button
          type="button"
          data-ocid="order_detail.retry_button"
          onClick={() => void refetch()}
          className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!order) {
    return <NotFoundState />;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Order reference
          </p>
          <h1
            data-ocid="order_detail.reference"
            className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground"
          >
            {order.reference}
          </h1>
          <p
            data-ocid="order_detail.date"
            className="mt-1 text-sm text-muted-foreground"
          >
            Placed {formatOrderDate(order.createdAt)}
          </p>
        </div>
        <span
          data-ocid="order_detail.total_badge"
          className="rounded-full bg-accent px-4 py-2 font-price text-lg font-bold text-accent-foreground"
        >
          {formatSen(order.totalSen)}
        </span>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section
          data-ocid="order_detail.items_panel"
          className="rounded-lg border border-border bg-card p-6 shadow-subtle"
        >
          <h2 className="font-display text-lg font-bold text-foreground">
            Items
          </h2>
          <div className="mt-2">
            <OrderLines items={order.items} />
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-display text-base font-bold text-foreground">
              Total
            </span>
            <span
              data-ocid="order_detail.total"
              className="font-price text-xl font-bold text-foreground"
            >
              {formatSen(order.totalSen)}
            </span>
          </div>
        </section>

        <DeliveryPanel order={order} />
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div
      data-ocid="order_detail.not_found_state"
      className="rounded-lg border border-border bg-card p-10 text-center shadow-subtle"
    >
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <PackageSearch className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-xl font-bold text-foreground">
        Order not found
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        This order doesn&apos;t exist or isn&apos;t linked to your account.
      </p>
      <Link
        to="/orders"
        data-ocid="order_detail.back_to_orders_link"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to my orders
      </Link>
    </div>
  );
}

function SignInPrompt() {
  return (
    <div
      data-ocid="order_detail.sign_in_prompt"
      className="rounded-lg border border-border bg-card p-10 text-center shadow-subtle"
    >
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <ReceiptText className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-display text-xl font-bold text-foreground">
        Sign in to view this order
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Your order details are private to your Internet Identity.
      </p>
      <div className="mt-5 flex justify-center">
        <SignInButton className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:opacity-60" />
      </div>
    </div>
  );
}

export function OrderDetailPage() {
  const { orderId } = useParams({ from: "/orders/$orderId" });
  const parsedId = parseOrderId(orderId);

  return (
    <section
      data-ocid="order_detail.page"
      className="mx-auto w-full max-w-6xl px-4 py-12"
    >
      <Link
        to="/orders"
        data-ocid="order_detail.back_link"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-smooth hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to my orders
      </Link>

      <RequireSignIn fallback={<SignInPrompt />}>
        <OrderDetailBody orderId={parsedId} />
      </RequireSignIn>
    </section>
  );
}
