import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/useCart";
import { useProduct } from "@/hooks/useQueries";
import { formatSen } from "@/lib/currency";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Minus,
  PackageX,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";

/** Parse the route's string id into the backend's bigint ProductId. */
function parseProductId(raw: string): bigint | undefined {
  if (!/^\d+$/.test(raw)) return undefined;
  try {
    return BigInt(raw);
  } catch {
    return undefined;
  }
}

function DetailSkeleton() {
  return (
    <div
      data-ocid="product_detail.loading_state"
      className="grid gap-8 lg:grid-cols-2 lg:gap-12"
    >
      <Skeleton className="aspect-square w-full rounded-lg" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-48 rounded-full" />
      </div>
    </div>
  );
}

export function ProductDetailPage() {
  const { productId } = useParams({ from: "/products/$productId" });
  const id = parseProductId(productId);
  const { data: product, isLoading, isError, refetch } = useProduct(id);
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [confirmed, setConfirmed] = useState(false);

  // Reset the selector and confirmation whenever a different product loads.
  // biome-ignore lint/correctness/useExhaustiveDependencies: productId intentionally retriggers the reset when the route param changes.
  useEffect(() => {
    setQuantity(1);
    setConfirmed(false);
  }, [productId]);

  // Auto-dismiss the add-to-cart confirmation.
  useEffect(() => {
    if (!confirmed) return;
    const timer = window.setTimeout(() => setConfirmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmed]);

  const stock = product ? Number(product.stock) : 0;
  const inStock = stock > 0;
  const maxQuantity = Math.max(1, stock);

  function handleAddToCart() {
    if (!product || !inStock) return;
    addItem(
      {
        productId: product.id.toString(),
        name: product.name,
        priceSen: product.priceSen.toString(),
        imageUrl: product.image?.getDirectURL(),
      },
      quantity,
    );
    setConfirmed(true);
  }

  return (
    <section
      data-ocid="product_detail.page"
      className="mx-auto w-full max-w-6xl px-4 py-8 md:py-12"
    >
      <Link
        to="/products"
        data-ocid="product_detail.back_link"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-smooth hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to products
      </Link>

      {isLoading && <DetailSkeleton />}

      {!isLoading && isError && (
        <div
          data-ocid="product_detail.error_state"
          className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-16 text-center shadow-subtle"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="size-7" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              We couldn&apos;t load this product
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Something went wrong while fetching the details. Please try again.
            </p>
          </div>
          <Button
            type="button"
            data-ocid="product_detail.retry_button"
            onClick={() => void refetch()}
            className="rounded-full"
          >
            Try again
          </Button>
        </div>
      )}

      {!isLoading && !isError && !product && (
        <div
          data-ocid="product_detail.not_found_state"
          className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-16 text-center shadow-subtle"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <PackageX className="size-7" aria-hidden="true" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Product not found
            </h1>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              This item may have been removed or the link is incorrect.
            </p>
          </div>
          <Button
            asChild
            data-ocid="product_detail.browse_button"
            className="rounded-full"
          >
            <Link to="/products">Browse all products</Link>
          </Button>
        </div>
      )}

      {!isLoading && !isError && product && (
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle">
            {product.image ? (
              <img
                src={product.image.getDirectURL()}
                alt={product.name}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-gradient-subtle">
                <span className="font-display text-6xl font-bold text-muted-foreground/40">
                  {product.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                data-ocid="product_detail.category_badge"
                className="rounded-full uppercase tracking-wider"
              >
                {product.category}
              </Badge>
              {inStock ? (
                <Badge
                  data-ocid="product_detail.stock_badge"
                  className="rounded-full bg-success text-success-foreground"
                >
                  In stock
                </Badge>
              ) : (
                <Badge
                  variant="destructive"
                  data-ocid="product_detail.stock_badge"
                  className="rounded-full"
                >
                  Out of stock
                </Badge>
              )}
            </div>

            <h1
              data-ocid="product_detail.name"
              className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl"
            >
              {product.name}
            </h1>

            <p
              data-ocid="product_detail.price"
              className="font-price text-3xl font-bold text-primary"
            >
              {formatSen(product.priceSen)}
            </p>

            <p
              data-ocid="product_detail.description"
              className="text-base leading-relaxed text-muted-foreground"
            >
              {product.description}
            </p>

            <p className="text-sm text-muted-foreground">
              {inStock
                ? `${stock} ${stock === 1 ? "unit" : "units"} available`
                : "Currently unavailable — check back soon."}
            </p>

            <div className="mt-2 flex flex-col gap-4 border-t border-border pt-5">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">
                  Quantity
                </span>
                <div className="flex items-center rounded-full border border-border bg-background">
                  <button
                    type="button"
                    data-ocid="product_detail.quantity_decrease"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={!inStock || quantity <= 1}
                    className="flex size-10 items-center justify-center rounded-full text-foreground transition-smooth hover:bg-secondary disabled:opacity-40"
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <span
                    data-ocid="product_detail.quantity_value"
                    aria-live="polite"
                    className="w-10 text-center font-mono text-base font-semibold text-foreground"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    data-ocid="product_detail.quantity_increase"
                    aria-label="Increase quantity"
                    onClick={() =>
                      setQuantity((q) => Math.min(maxQuantity, q + 1))
                    }
                    disabled={!inStock || quantity >= maxQuantity}
                    className="flex size-10 items-center justify-center rounded-full text-foreground transition-smooth hover:bg-secondary disabled:opacity-40"
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <Button
                type="button"
                data-ocid="product_detail.add_to_cart_button"
                onClick={handleAddToCart}
                disabled={!inStock}
                size="lg"
                className="w-full rounded-full sm:w-auto"
              >
                <ShoppingCart className="size-5" aria-hidden="true" />
                {inStock ? "Add to cart" : "Out of stock"}
              </Button>

              {confirmed && (
                <output
                  data-ocid="product_detail.success_state"
                  className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-foreground animate-fade-up"
                >
                  <Check className="size-4 text-success" aria-hidden="true" />
                  Added {quantity} × {product.name} to your cart.
                  <Link
                    to="/cart"
                    data-ocid="product_detail.view_cart_link"
                    className="ml-auto font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    View cart
                  </Link>
                </output>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
