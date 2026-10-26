import type { Product } from "@/backend";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useProducts } from "@/hooks/useQueries";
import { formatSen } from "@/lib/currency";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Leaf,
  PackageX,
  RefreshCw,
  ShoppingBasket,
  Sparkles,
  Truck,
} from "lucide-react";

const CATEGORY_ICONS = [ShoppingBasket, Leaf, Sparkles, Truck] as const;

const FEATURED_LIMIT = 8;

function ProductCard({ product }: { product: Product }) {
  const imageUrl = product.image?.getDirectURL();
  const inStock = product.stock > 0n;

  return (
    <Link
      to="/products/$productId"
      params={{ productId: product.id.toString() }}
      data-ocid={`home.product_card.${product.id.toString()}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-subtle transition-smooth hover:-translate-y-1 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-square overflow-hidden bg-secondary">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-smooth group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ShoppingBasket className="size-10" aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground backdrop-blur">
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-display text-base font-bold leading-snug text-foreground">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="rounded-full bg-accent px-3 py-1 font-price text-sm font-bold text-accent-foreground">
            {formatSen(product.priceSen)}
          </span>
          <span
            className={
              inStock
                ? "text-xs font-semibold text-success"
                : "text-xs font-semibold text-destructive"
            }
          >
            {inStock ? "In stock" : "Sold out"}
          </span>
        </div>
      </div>
    </Link>
  );
}

function ProductCardSkeleton({ id }: { id: string }) {
  return (
    <div
      data-ocid={id}
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-subtle"
    >
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  );
}

function CategoryTile({
  category,
  index,
}: {
  category: string;
  index: number;
}) {
  const Icon = CATEGORY_ICONS[index % CATEGORY_ICONS.length];
  return (
    <Link
      to="/products"
      search={{ category }}
      data-ocid={`home.category_tile.${index + 1}`}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:-translate-y-1 hover:border-primary/40 hover:shadow-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-smooth group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-sm font-bold text-foreground">
          {category}
        </span>
        <span className="block text-xs text-muted-foreground">Shop now</span>
      </span>
      <ArrowRight
        className="size-4 shrink-0 text-muted-foreground transition-smooth group-hover:translate-x-0.5 group-hover:text-primary"
        aria-hidden="true"
      />
    </Link>
  );
}

export function HomePage() {
  const productsQuery = useProducts();
  const categoriesQuery = useCategories();

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const featured = products.slice(0, FEATURED_LIMIT);
  const isLoading = productsQuery.isLoading || categoriesQuery.isLoading;
  const isError = productsQuery.isError || categoriesQuery.isError;

  return (
    <div data-ocid="home.page" className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-primary">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-accent/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-1/4 size-72 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
              <Leaf className="size-3.5" aria-hidden="true" />
              Fresh from the market
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-primary-foreground md:text-6xl">
              Mr Kipmasai
              <span className="block text-accent">Mini Mart</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-primary-foreground/85 md:text-lg">
              Your neighbourhood grocery, stocked daily with fresh produce and
              everyday essentials — delivered to your door at honest prices in
              Ringgit.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                asChild
                size="lg"
                data-ocid="home.shop_cta"
                className="rounded-full bg-accent px-6 font-semibold text-accent-foreground shadow-elevated transition-smooth hover:scale-[1.02] hover:bg-accent/90"
              >
                <Link to="/products" search={{}}>
                  Shop the catalogue
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                data-ocid="home.categories_cta"
                className="rounded-full border-primary-foreground/40 bg-transparent px-6 font-semibold text-primary-foreground transition-smooth hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <a href="#categories">Browse categories</a>
              </Button>
            </div>
          </div>

          <div className="hidden justify-center md:flex">
            <div className="relative flex size-64 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 backdrop-blur-sm lg:size-80">
              <div className="flex size-44 flex-col items-center justify-center rounded-full bg-card text-center shadow-lifted lg:size-56">
                <ShoppingBasket
                  className="size-10 text-primary lg:size-12"
                  aria-hidden="true"
                />
                <p className="mt-3 font-display text-lg font-bold text-foreground lg:text-xl">
                  Market fresh
                </p>
                <p className="px-6 text-xs text-muted-foreground lg:text-sm">
                  Picked today, priced fairly
                </p>
              </div>
              <span className="absolute -right-2 top-6 animate-float rounded-full bg-accent px-3 py-1 font-price text-sm font-bold text-accent-foreground shadow-elevated">
                RM 8.90
              </span>
              <span className="absolute -left-3 bottom-10 animate-float rounded-full bg-card px-3 py-1 text-xs font-semibold text-foreground shadow-elevated [animation-delay:1.2s]">
                Free delivery over RM 50
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        data-ocid="home.categories_section"
        className="border-b border-border bg-muted/40"
      >
        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Shop by category
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Jump straight to the aisle you need.
              </p>
            </div>
            <Link
              to="/products"
              search={{}}
              data-ocid="home.all_products_link"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-smooth hover:gap-2"
            >
              View all products
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {isLoading ? (
            <div
              data-ocid="home.categories_loading"
              className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {Array.from({ length: 4 }, (_, i) => `cat-skeleton-${i}`).map(
                (id) => (
                  <Skeleton key={id} className="h-[76px] w-full rounded-xl" />
                ),
              )}
            </div>
          ) : categories.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <CategoryTile
                  key={category}
                  category={category}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <p
              data-ocid="home.categories_empty"
              className="mt-8 rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground"
            >
              Categories will appear here once products are added.
            </p>
          )}
        </div>
      </section>

      {/* Featured products */}
      <section data-ocid="home.featured_section" className="bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                Today&apos;s picks
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground md:text-4xl">
                Featured at the mart
              </h2>
            </div>
            <Link
              to="/products"
              search={{}}
              data-ocid="home.featured_all_link"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-smooth hover:gap-2"
            >
              See everything
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {isLoading ? (
            <div
              data-ocid="home.featured_loading"
              className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            >
              {Array.from({ length: 4 }, (_, i) => `prod-skeleton-${i}`).map(
                (id) => (
                  <ProductCardSkeleton key={id} id={id} />
                ),
              )}
            </div>
          ) : isError ? (
            <div
              data-ocid="home.featured_error"
              className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center"
            >
              <PackageX
                className="size-10 text-destructive"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  We couldn&apos;t load the shelves
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Something went wrong fetching our products. Please try again.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                data-ocid="home.featured_retry_button"
                onClick={() => {
                  void productsQuery.refetch();
                  void categoriesQuery.refetch();
                }}
                className="rounded-full"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : featured.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id.toString()} product={product} />
              ))}
            </div>
          ) : (
            <div
              data-ocid="home.featured_empty"
              className="mt-8 flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center"
            >
              <ShoppingBasket
                className="size-10 text-muted-foreground"
                aria-hidden="true"
              />
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  The shelves are being stocked
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fresh products will appear here shortly. Check back soon.
                </p>
              </div>
              <Button
                asChild
                data-ocid="home.featured_empty_cta"
                className="rounded-full"
              >
                <Link to="/products" search={{}}>
                  Visit the catalogue
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-5 px-4 py-14 text-center md:py-20">
          <h2 className="max-w-2xl font-display text-2xl font-bold tracking-tight text-foreground md:text-4xl">
            Everything you need, one basket away
          </h2>
          <p className="max-w-xl text-sm text-muted-foreground md:text-base">
            Fill your basket with market-fresh groceries and everyday essentials
            — all priced in Ringgit, all delivered to your door.
          </p>
          <Button
            asChild
            size="lg"
            data-ocid="home.bottom_cta"
            className="rounded-full px-6 font-semibold transition-smooth hover:scale-[1.02]"
          >
            <Link to="/products" search={{}}>
              Start shopping
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
