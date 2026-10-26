import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyOrder } from "@/hooks/useQueries";
import { formatSen } from "@/lib/currency";
import { formatOrderDate } from "@/lib/time";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  MapPin,
  PackageSearch,
  Phone,
  ShoppingBag,
  StickyNote,
  User,
} from "lucide-react";

function parseOrderId(raw: string | undefined): bigint | undefined {
  if (!raw || !/^\d+$/.test(raw)) return undefined;
  try {
    return BigInt(raw);
  } catch {
    return undefined;
  }
}

function ConfirmationSkeleton() {
  const rows = Array.from({ length: 3 }, (_, i) => `confirmation-row-${i}`);
  return (
    <div
      data-ocid="order_confirmation.loading_state"
      className="mx-auto w-full max-w-3xl px-4 py-12"
    >
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-40" />
      <Skeleton className="mt-8 h-40 w-full rounded-lg" />
      <div className="mt-6 space-y-3">
        {rows.map((id) => (
          <Skeleton key={id} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function ConfirmationMessage({
  icon,
  title,
  description,
  ocid,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  ocid: string;
}) {
  return (
    <div
      data-ocid={ocid}
      className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-20 text-center"
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        {icon}
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-full">
          <Link
            to="/products"
            data-ocid="order_confirmation.continue_shopping_link"
          >
            Continue shopping
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/orders" data-ocid="order_confirmation.view_orders_link">
            View order history
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function OrderConfirmationPage() {
  const { orderId } = useParams({ from: "/order-confirmation/$orderId" });
  const parsedId = parseOrderId(orderId);
  const { data: order, isLoading, isError } = useMyOrder(parsedId);

  if (isLoading) return <ConfirmationSkeleton />;

  if (isError) {
    return (
      <ConfirmationMessage
        ocid="order_confirmation.error_state"
        icon={<AlertCircle className="size-7" aria-hidden="true" />}
        title="We couldn't load this order"
        description="Something went wrong while fetching your order. Please try again from your order history."
      />
    );
  }

  if (!order) {
    return (
      <ConfirmationMessage
        ocid="order_confirmation.not_found_state"
        icon={<PackageSearch className="size-7" aria-hidden="true" />}
        title="Order not found"
        description="We couldn't find this order. It may belong to a different account or the link may be incorrect."
      />
    );
  }

  const { delivery } = order;

  return (
    <section
      data-ocid="order_confirmation.page"
      className="mx-auto w-full max-w-3xl px-4 py-12"
    >
      <div className="flex flex-col items-center text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-foreground">
          Thank you for your order!
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Your order has been placed successfully. We'll have it packed and on
          its way from the market soon.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Badge
            data-ocid="order_confirmation.reference_badge"
            variant="secondary"
            className="rounded-full px-3 py-1 font-mono text-sm"
          >
            {order.reference}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Placed {formatOrderDate(order.createdAt)}
          </span>
        </div>
      </div>

      <Card className="mt-8 rounded-lg shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <ShoppingBag className="size-5 text-primary" aria-hidden="true" />
            Order summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul
            data-ocid="order_confirmation.items_list"
            className="divide-y divide-border"
          >
            {order.items.map((item, index) => (
              <li
                key={`${item.productId.toString()}-${index}`}
                data-ocid={`order_confirmation.item.${index + 1}`}
                className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {item.productName}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {formatSen(item.unitPriceSen)} × {item.quantity.toString()}
                  </p>
                </div>
                <span className="shrink-0 font-price text-sm font-semibold text-foreground">
                  {formatSen(item.subtotalSen)}
                </span>
              </li>
            ))}
          </ul>

          <Separator className="my-4" />

          <div className="flex items-center justify-between">
            <span className="font-display text-base font-semibold text-foreground">
              Total
            </span>
            <span
              data-ocid="order_confirmation.total"
              className="font-price text-xl font-bold text-primary"
            >
              {formatSen(order.totalSen)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-lg shadow-subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-lg">
            <MapPin className="size-5 text-primary" aria-hidden="true" />
            Delivery details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <User
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Customer
              </p>
              <p className="text-foreground">{delivery.customerName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Phone
              </p>
              <p className="text-foreground">{delivery.phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MapPin
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Address
              </p>
              <p className="whitespace-pre-line text-foreground">
                {delivery.address}
              </p>
            </div>
          </div>
          {delivery.notes && (
            <div className="flex items-start gap-3">
              <StickyNote
                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Notes
                </p>
                <p className="whitespace-pre-line text-foreground">
                  {delivery.notes}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="rounded-full">
          <Link
            to="/products"
            data-ocid="order_confirmation.continue_shopping_link"
          >
            Continue shopping
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link to="/orders" data-ocid="order_confirmation.view_orders_link">
            View order history
          </Link>
        </Button>
      </div>
    </section>
  );
}
