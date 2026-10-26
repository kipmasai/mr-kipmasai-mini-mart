import type { Product } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/useCart";
import { useCategories, useSearchProducts } from "@/hooks/useQueries";
import { formatSen } from "@/lib/currency";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
  AlertCircle,
  Check,
  PackageOpen,
  Search,
  ShoppingBasket,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const ALL_CATEGORY = "";

function productImageUrl(product: Product): string | undefined {
  return product.image?.getDirectURL();
}

function ProductCard({
  product,
  index,
  onAdd,
  justAdded,
}: {
  product: Product;
  index: number;
  onAdd: (product: Product) => void;
  justAdded: boolean;
}) {
  const imageUrl = productImageUrl(product);
  const outOfStock = product.stock <= 0n;

  return (
    <article
      data-ocid={`products.item.${index + 1}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
    >
      <Link
        to="/products/$productId"
        params={{ productId: product.id.toString() }}
        data-ocid={`products.link.${index + 1}`}
        className="relative block aspect-[4/3] overflow-hidden bg-secondary"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-smooth group-hover:scale-105"
          />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <ShoppingBasket className="size-10" aria-hidden="true" />
          </span>
        )}
        <Badge
          variant="secondary"
          className="absolute left-3 top-3 rounded-full border border-border bg-card/90 font-body text-xs font-semibold text-secondary-foreground backdrop-blur"
        >
          {product.category}
        </Badge>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold leading-snug text-foreground">
            <Link
              to="/products/$productId"
              params={{ productId: product.id.toString() }}
              className="line-clamp-2 transition-smooth hover:text-primary"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="font-price rounded-full bg-accent/15 px-3 py-1 text-sm font-bold text-accent">
            {formatSen(product.priceSen)}
          </span>
          <Button
            type="button"
            size="sm"
            disabled={outOfStock}
            onClick={() => onAdd(product)}
            data-ocid={`products.add_button.${index + 1}`}
            className="rounded-full bg-primary text-primary-foreground transition-smooth hover:bg-primary/90"
          >
            {justAdded ? (
              <>
                <Check className="size-4" aria-hidden="true" />
                Added
              </>
            ) : outOfStock ? (
              "Sold out"
            ) : (
              <>
                <ShoppingBasket className="size-4" aria-hidden="true" />
                Add
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}

function ProductGridSkeleton() {
  const ids = Array.from({ length: 8 }, (_, i) => `products-skeleton-${i}`);
  return (
    <div
      data-ocid="products.loading_state"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {ids.map((id) => (
        <div
          key={id}
          className="overflow-hidden rounded-lg border border-border bg-card shadow-subtle"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductsPage() {
  const search = useSearch({ strict: false }) as {
    category?: string;
    q?: string;
  };
  const navigate = useNavigate();

  const activeCategory = search.category ?? ALL_CATEGORY;
  const urlQuery = search.q ?? "";

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [addedId, setAddedId] = useState<string | null>(null);

  const { addItem } = useCart();
  const categoriesQuery = useCategories();
  const productsQuery = useSearchProducts(urlQuery, activeCategory);

  // Keep the input in sync when the URL changes from outside (e.g. a category tile).
  useEffect(() => {
    setSearchInput(urlQuery);
  }, [urlQuery]);

  // Debounce typing into the URL so results update as the shopper types.
  useEffect(() => {
    if (searchInput === urlQuery) return;
    const handle = window.setTimeout(() => {
      void navigate({
        to: "/products",
        search: (prev: Record<string, unknown>) => ({
          ...prev,
          q: searchInput.trim() === "" ? undefined : searchInput,
        }),
        replace: true,
      });
    }, 250);
    return () => window.clearTimeout(handle);
  }, [searchInput, urlQuery, navigate]);

  useEffect(() => {
    if (addedId === null) return;
    const handle = window.setTimeout(() => setAddedId(null), 2000);
    return () => window.clearTimeout(handle);
  }, [addedId]);

  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const products = productsQuery.data ?? [];

  function selectCategory(category: string) {
    void navigate({
      to: "/products",
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        category: category === ALL_CATEGORY ? undefined : category,
      }),
      replace: true,
    });
  }

  function handleAdd(product: Product) {
    addItem({
      productId: product.id.toString(),
      name: product.name,
      priceSen: product.priceSen.toString(),
      imageUrl: productImageUrl(product),
    });
    setAddedId(product.id.toString());
  }

  const hasFilters = activeCategory !== ALL_CATEGORY || urlQuery.trim() !== "";

  return (
    <section
      data-ocid="products.page"
      className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14"
    >
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Fresh Market
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Shop the aisles
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
          Everyday essentials and fresh picks from Mr Kipmasai Mini Mart, priced
          in Malaysian Ringgit.
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-4">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
            data-ocid="products.search_input"
            className="rounded-full border-input bg-card pl-9"
          />
        </div>

        <div
          data-ocid="products.filter.tabs"
          className="flex flex-wrap items-center gap-2"
        >
          <button
            type="button"
            onClick={() => selectCategory(ALL_CATEGORY)}
            aria-pressed={activeCategory === ALL_CATEGORY}
            data-ocid="products.filter.all"
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-smooth ${
              activeCategory === ALL_CATEGORY
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => selectCategory(category)}
              aria-pressed={activeCategory === category}
              data-ocid={`products.filter.${category
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}`}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-smooth ${
                activeCategory === category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {productsQuery.isLoading ? (
        <ProductGridSkeleton />
      ) : productsQuery.isError ? (
        <div
          data-ocid="products.error_state"
          className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-16 text-center"
        >
          <AlertCircle className="size-8 text-destructive" aria-hidden="true" />
          <h2 className="font-display text-lg font-bold text-foreground">
            We couldn't load the products
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Something went wrong while fetching the catalogue. Please try again.
          </p>
          <Button
            type="button"
            onClick={() => void productsQuery.refetch()}
            data-ocid="products.retry_button"
            className="rounded-full bg-primary text-primary-foreground transition-smooth hover:bg-primary/90"
          >
            Try again
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div
          data-ocid="products.empty_state"
          className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card px-6 py-16 text-center shadow-subtle"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <PackageOpen className="size-7" aria-hidden="true" />
          </span>
          <h2 className="font-display text-lg font-bold text-foreground">
            No products found
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {hasFilters
              ? "Nothing matches your search or category filter. Try a different term or browse everything."
              : "The shelves are being restocked. Check back soon for fresh arrivals."}
          </p>
          {hasFilters && (
            <Button
              type="button"
              onClick={() => {
                setSearchInput("");
                void navigate({
                  to: "/products",
                  search: {},
                  replace: true,
                });
              }}
              data-ocid="products.clear_filters_button"
              className="rounded-full bg-primary text-primary-foreground transition-smooth hover:bg-primary/90"
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product, index) => (
            <ProductCard
              key={product.id.toString()}
              product={product}
              index={index}
              onAdd={handleAdd}
              justAdded={addedId === product.id.toString()}
            />
          ))}
        </div>
      )}
    </section>
  );
}
