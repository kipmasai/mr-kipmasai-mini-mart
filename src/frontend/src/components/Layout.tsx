import { SignInButton } from "@/components/InternetIdentity";
import { useCart } from "@/hooks/useCart";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingCart, X } from "lucide-react";
import { type ReactNode, useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/orders", label: "My Orders" },
] as const;

function NavLink({
  to,
  label,
  onClick,
}: {
  to: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      activeOptions={{ exact: to === "/" }}
      className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
      activeProps={{
        className:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
      }}
    >
      {label}
    </Link>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const { itemCount } = useCart();
  const { data: isAdmin } = useIsAdmin();
  const [menuOpen, setMenuOpen] = useState(false);
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-subtle">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 md:gap-6">
          <Link
            to="/"
            data-ocid="nav.home_link"
            className="flex shrink-0 items-center gap-2"
            onClick={() => setMenuOpen(false)}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
              K
            </span>
            <span className="font-display text-lg font-bold leading-tight tracking-tight text-foreground md:text-xl">
              Mr Kipmasai
              <span className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Mini Mart
              </span>
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden flex-1 items-center gap-1 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} label={link.label} />
            ))}
            {isAdmin && <NavLink to="/admin/products" label="Admin" />}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/cart"
              data-ocid="nav.cart_link"
              aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
              className="relative flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-smooth hover:bg-secondary"
            >
              <ShoppingCart className="size-5" aria-hidden="true" />
              {itemCount > 0 && (
                <span
                  data-ocid="nav.cart_badge"
                  className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 font-mono text-xs font-bold text-accent-foreground animate-pop"
                >
                  {itemCount}
                </span>
              )}
            </Link>

            <div className="hidden md:block">
              <SignInButton className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-secondary disabled:opacity-60" />
            </div>

            <button
              type="button"
              data-ocid="nav.menu_toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-smooth hover:bg-secondary md:hidden"
            >
              {menuOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            aria-label="Mobile"
            data-ocid="nav.mobile_menu"
            className="border-t border-border bg-card px-4 py-3 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  onClick={() => setMenuOpen(false)}
                />
              ))}
              {isAdmin && (
                <NavLink
                  to="/admin/products"
                  label="Admin"
                  onClick={() => setMenuOpen(false)}
                />
              )}
              <div className="mt-2 border-t border-border pt-3">
                <SignInButton className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-secondary disabled:opacity-60" />
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 bg-background">{children}</main>

      <footer className="border-t border-border bg-muted/60">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Mr Kipmasai
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A neighbourhood grocery store bringing fresh produce and everyday
              essentials to your door.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Store Information
            </h3>
            <address className="mt-3 space-y-1 text-sm not-italic text-foreground">
              <p>7A Mr Kipmasai</p>
              <p>Suite Stae B</p>
              <p>Malaysia, KA 78309</p>
            </address>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Shop
            </h3>
            <ul className="mt-3 space-y-1 text-sm">
              <li>
                <Link
                  to="/products"
                  className="text-foreground transition-smooth hover:text-primary"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-foreground transition-smooth hover:text-primary"
                >
                  Cart
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-foreground transition-smooth hover:text-primary"
                >
                  My Orders
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Contact
            </h3>
            <ul className="mt-3 space-y-1 text-sm text-foreground">
              <li>Contact us</li>
              <li>Chonatsan</li>
              <li>Open daily, 8am – 10pm</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
            <p>
              © {year} Mr Kipmasai Mini Mart. All prices in Malaysian Ringgit.
            </p>
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="transition-smooth hover:text-primary"
            >
              © {year}. Built with love using caffeine.ai
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
