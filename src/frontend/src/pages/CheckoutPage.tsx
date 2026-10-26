import type { DeliveryDetails, OrderItemInput } from "@/backend";
import { useCart } from "@/hooks/useCart";
import { usePlaceOrder } from "@/hooks/useQueries";
import { formatSen } from "@/lib/currency";
import { Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { type FormEvent, useState } from "react";

interface FormState {
  customerName: string;
  phone: string;
  address: string;
  notes: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

const EMPTY_FORM: FormState = {
  customerName: "",
  phone: "",
  address: "",
  notes: "",
};

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (form.customerName.trim() === "") {
    errors.customerName = "Please enter the name for this delivery.";
  }
  if (form.phone.trim() === "") {
    errors.phone = "Please enter a phone number we can reach you on.";
  } else if (!/^[0-9+\-\s()]{7,}$/.test(form.phone.trim())) {
    errors.phone = "Enter a valid phone number, e.g. 012-345 6789.";
  }
  if (form.address.trim() === "") {
    errors.address = "Please enter the delivery address.";
  }
  return errors;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { lines, totalSen, clearCart } = useCart();
  const placeOrder = usePlaceOrder();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (placeOrder.isPending) return;

    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const delivery: DeliveryDetails = {
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      notes: form.notes.trim() === "" ? undefined : form.notes.trim(),
    };
    const items: OrderItemInput[] = lines.map((line) => ({
      productId: BigInt(line.productId),
      quantity: BigInt(line.quantity),
    }));

    placeOrder.mutate(
      { delivery, items },
      {
        onSuccess: (order) => {
          clearCart();
          void navigate({
            to: "/order-confirmation/$orderId",
            params: { orderId: order.id.toString() },
          });
        },
      },
    );
  };

  if (lines.length === 0) {
    return (
      <section
        data-ocid="checkout.page"
        className="mx-auto w-full max-w-6xl px-4 py-16"
      >
        <div
          data-ocid="checkout.empty_state"
          className="mx-auto flex max-w-md flex-col items-center rounded-2xl border border-border bg-card px-6 py-14 text-center shadow-subtle"
        >
          <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-primary">
            <ShoppingBag className="size-8" aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-foreground">
            Your basket is empty
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Add a few fresh picks from the market before heading to checkout.
          </p>
          <Link
            to="/products"
            data-ocid="checkout.browse_button"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90"
          >
            Browse the catalogue
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      data-ocid="checkout.page"
      className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14"
    >
      <Link
        to="/cart"
        data-ocid="checkout.back_link"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-smooth hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to basket
      </Link>

      <header className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">
          Almost there
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Checkout
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Tell us where to deliver your order and we&apos;ll get it packed fresh
          from Mr Kipmasai Mini Mart.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <form
          onSubmit={handleSubmit}
          noValidate
          data-ocid="checkout.form"
          className="rounded-2xl border border-border bg-card p-6 shadow-subtle md:p-8"
        >
          <h2 className="font-display text-lg font-bold text-foreground">
            Delivery details
          </h2>

          <div className="mt-6 grid gap-5">
            <div className="grid gap-2">
              <label
                htmlFor="checkout-name"
                className="text-sm font-medium text-foreground"
              >
                Full name
              </label>
              <input
                id="checkout-name"
                data-ocid="checkout.name_input"
                type="text"
                autoComplete="name"
                value={form.customerName}
                onChange={(event) =>
                  updateField("customerName", event.target.value)
                }
                aria-invalid={errors.customerName ? true : undefined}
                aria-describedby={
                  errors.customerName ? "checkout-name-error" : undefined
                }
                placeholder="e.g. Aisyah Rahman"
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-smooth placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              {errors.customerName && (
                <p
                  id="checkout-name-error"
                  data-ocid="checkout.name_error"
                  className="flex items-center gap-1.5 text-sm text-destructive"
                >
                  <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                  {errors.customerName}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="checkout-phone"
                className="text-sm font-medium text-foreground"
              >
                Phone number
              </label>
              <input
                id="checkout-phone"
                data-ocid="checkout.phone_input"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                aria-invalid={errors.phone ? true : undefined}
                aria-describedby={
                  errors.phone ? "checkout-phone-error" : undefined
                }
                placeholder="e.g. 012-345 6789"
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none transition-smooth placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              {errors.phone && (
                <p
                  id="checkout-phone-error"
                  data-ocid="checkout.phone_error"
                  className="flex items-center gap-1.5 text-sm text-destructive"
                >
                  <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="checkout-address"
                className="text-sm font-medium text-foreground"
              >
                Delivery address
              </label>
              <textarea
                id="checkout-address"
                data-ocid="checkout.address_textarea"
                rows={3}
                autoComplete="street-address"
                value={form.address}
                onChange={(event) => updateField("address", event.target.value)}
                aria-invalid={errors.address ? true : undefined}
                aria-describedby={
                  errors.address ? "checkout-address-error" : undefined
                }
                placeholder="House number, street, area, postcode"
                className="w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-smooth placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
              />
              {errors.address && (
                <p
                  id="checkout-address-error"
                  data-ocid="checkout.address_error"
                  className="flex items-center gap-1.5 text-sm text-destructive"
                >
                  <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                  {errors.address}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <label
                htmlFor="checkout-notes"
                className="text-sm font-medium text-foreground"
              >
                Order notes{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <textarea
                id="checkout-notes"
                data-ocid="checkout.notes_textarea"
                rows={2}
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="Gate code, preferred delivery window, substitutions…"
                className="w-full resize-y rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none transition-smooth placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>
          </div>

          {placeOrder.isError && (
            <div
              data-ocid="checkout.error_state"
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>
                We couldn&apos;t place your order. Please check your details and
                try again.
              </span>
            </div>
          )}

          <button
            type="submit"
            data-ocid="checkout.submit_button"
            disabled={placeOrder.isPending}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-smooth hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {placeOrder.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Placing order…
              </>
            ) : (
              <>Place order · {formatSen(totalSen)}</>
            )}
          </button>
        </form>

        <aside
          data-ocid="checkout.summary_panel"
          className="h-fit rounded-2xl border border-border bg-card p-6 shadow-subtle lg:sticky lg:top-24"
        >
          <h2 className="font-display text-lg font-bold text-foreground">
            Order summary
          </h2>

          <ul
            data-ocid="checkout.summary_list"
            className="mt-4 divide-y divide-border"
          >
            {lines.map((line, index) => {
              const lineTotal = BigInt(line.priceSen) * BigInt(line.quantity);
              return (
                <li
                  key={line.productId}
                  data-ocid={`checkout.summary_item.${index + 1}`}
                  className="flex items-start justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {line.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatSen(BigInt(line.priceSen))} × {line.quantity}
                    </p>
                  </div>
                  <span className="shrink-0 font-price text-sm font-semibold text-foreground">
                    {formatSen(lineTotal)}
                  </span>
                </li>
              );
            })}
          </ul>

          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-price font-medium text-foreground">
                {formatSen(totalSen)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Delivery</dt>
              <dd className="text-muted-foreground">Free</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <dt className="font-display text-base font-bold text-foreground">
                Total
              </dt>
              <dd
                data-ocid="checkout.total"
                className="font-price text-lg font-bold text-primary"
              >
                {formatSen(totalSen)}
              </dd>
            </div>
          </dl>

          <p className="mt-4 text-xs text-muted-foreground">
            Pay in cash or by transfer on delivery. All prices in Malaysian
            Ringgit.
          </p>
        </aside>
      </div>
    </section>
  );
}
