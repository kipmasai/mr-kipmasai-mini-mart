import type { Order, Product, backendInterface } from "@/backend";
import { useCartStore } from "@/lib/cart";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSyncExternalStore } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setIdentityForTest } from "./setup";
import { renderWithActor } from "./test-utils";

import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { HomePage } from "@/pages/HomePage";
import { ProductsPage } from "@/pages/ProductsPage";

/**
 * The pages under test use `useSearch`/`useNavigate`/`useParams` from
 * @tanstack/react-router. Rendering them directly (outside a RouterProvider)
 * would throw, so the router hooks are stubbed with a minimal in-memory
 * implementation. This is a test-only seam; production routing is untouched.
 */
const routerState = vi.hoisted(() => {
  const listeners = new Set<() => void>();
  const state = {
    search: {} as Record<string, unknown>,
    params: {} as Record<string, string>,
    navigate: vi.fn(),
  };
  function emit() {
    for (const listener of listeners) listener();
  }
  function installNavigate() {
    state.navigate.mockImplementation(
      (options: {
        search?:
          | Record<string, unknown>
          | ((prev: Record<string, unknown>) => Record<string, unknown>);
      }) => {
        const next = options?.search;
        if (typeof next === "function") {
          state.search = next(state.search);
        } else if (next) {
          state.search = next;
        }
        emit();
        return Promise.resolve();
      },
    );
  }
  installNavigate();
  return {
    ...state,
    listeners,
    installNavigate,
    setSearch(next: Record<string, unknown>) {
      state.search = next;
      emit();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSearch() {
      return state.search;
    },
  };
});

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    useSearch: () =>
      useSyncExternalStore(
        routerState.subscribe,
        routerState.getSearch,
        routerState.getSearch,
      ),
    useParams: () => routerState.params,
    useNavigate: () => routerState.navigate,
    Link: ({
      children,
      to,
      params,
      ...rest
    }: {
      children?: React.ReactNode;
      to?: string;
      params?: Record<string, string>;
      [key: string]: unknown;
    }) => {
      let href = typeof to === "string" ? to : "#";
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          href = href.replace(`$${key}`, value);
        }
      }
      return (
        <a href={href} {...rest}>
          {children}
        </a>
      );
    },
  };
});

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 1n,
    name: "Red Apples",
    description: "Crisp fresh red apples, sold per pack of 4.",
    priceSen: 690n,
    category: "Fresh Produce",
    stock: 40n,
    ...overrides,
  };
}

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 1n,
    reference: "KM-1",
    delivery: {
      customerName: "Aisyah Rahman",
      phone: "012-345 6789",
      address: "12 Jalan Mawar, Kuala Lumpur",
      notes: undefined,
    },
    items: [
      {
        productId: 1n,
        productName: "Red Apples",
        quantity: 2n,
        unitPriceSen: 690n,
        subtotalSen: 1380n,
      },
    ],
    totalSen: 1380n,
    createdAt: 1_700_000_000_000_000_000n,
    owner: { toText: () => "aaaaa-aa" } as unknown as Order["owner"],
    ...overrides,
  };
}

type Actor = Pick<
  backendInterface,
  | "listProducts"
  | "listCategories"
  | "searchProducts"
  | "getProduct"
  | "placeOrder"
  | "isCallerAdmin"
>;

function makeActor(overrides: Partial<Actor> = {}): Actor {
  return {
    listProducts: vi.fn(async () => [makeProduct()]),
    listCategories: vi.fn(async () => ["Fresh Produce"]),
    searchProducts: vi.fn(async () => [makeProduct()]),
    getProduct: vi.fn(async () => makeProduct()),
    placeOrder: vi.fn(async () => makeOrder()),
    isCallerAdmin: vi.fn(async () => false),
    ...overrides,
  };
}

beforeEach(() => {
  routerState.setSearch({});
  routerState.params = {};
  routerState.navigate.mockReset();
  routerState.installNavigate();
  useCartStore.setState({ lines: [] });
  window.localStorage.clear();
});

describe("HomePage", () => {
  it("renders the store name, tagline and featured products", async () => {
    const actor = makeActor({
      listProducts: vi.fn(async () => [
        makeProduct({ id: 1n, name: "Red Apples" }),
        makeProduct({ id: 2n, name: "Bananas", priceSen: 450n }),
      ]),
    });
    renderWithActor(<HomePage />, actor);

    expect(
      screen.getByRole("heading", { name: /Mr Kipmasai/i }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Red Apples")).toBeInTheDocument();
    expect(screen.getByText("Bananas")).toBeInTheDocument();
    // Price is rendered in Malaysian Ringgit.
    expect(screen.getByText("RM 6.90")).toBeInTheDocument();
    expect(screen.getByText("RM 4.50")).toBeInTheDocument();
  });

  it("shows an empty state when the catalogue has no products", async () => {
    const actor = makeActor({
      listProducts: vi.fn(async () => []),
      listCategories: vi.fn(async () => []),
    });
    renderWithActor(<HomePage />, actor);

    expect(
      await screen.findByTestId("home.featured_empty"),
    ).toBeInTheDocument();
  });
});

describe("ProductsPage", () => {
  it("lists products with name, RM price and category", async () => {
    const actor = makeActor({
      searchProducts: vi.fn(async () => [
        makeProduct({ id: 1n, name: "Red Apples", category: "Fresh Produce" }),
      ]),
    });
    renderWithActor(<ProductsPage />, actor);

    expect(await screen.findByText("Red Apples")).toBeInTheDocument();
    expect(screen.getByText("RM 6.90")).toBeInTheDocument();
    // Category appears both as a filter tab and on the product card.
    expect(screen.getAllByText("Fresh Produce").length).toBeGreaterThan(0);
  });

  it("filters by name as the shopper types and shows an empty state for no matches", async () => {
    const user = userEvent.setup();
    const searchProducts = vi.fn(async (name: string | null) =>
      name === null ? [makeProduct({ name: "Red Apples" })] : [],
    );
    const actor = makeActor({ searchProducts });
    renderWithActor(<ProductsPage />, actor);

    expect(await screen.findByText("Red Apples")).toBeInTheDocument();

    await user.type(screen.getByTestId("products.search_input"), "zzz");

    await waitFor(() => {
      expect(searchProducts).toHaveBeenCalledWith("zzz", null);
    });
    expect(
      await screen.findByTestId("products.empty_state"),
    ).toBeInTheDocument();
  });

  it("adds a product to the cart and shows a confirmation", async () => {
    const user = userEvent.setup();
    const actor = makeActor({
      searchProducts: vi.fn(async () => [
        makeProduct({ id: 7n, name: "Carrots" }),
      ]),
    });
    renderWithActor(<ProductsPage />, actor);

    const addButton = await screen.findByTestId("products.add_button.1");
    await user.click(addButton);

    expect(await screen.findByText("Added")).toBeInTheDocument();
    const lines = useCartStore.getState().lines;
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({
      productId: "7",
      name: "Carrots",
      quantity: 1,
    });
  });
});

describe("CartPage", () => {
  it("shows an empty state when there are no items", () => {
    renderWithActor(<CartPage />, makeActor());
    expect(screen.getByTestId("cart.empty_state")).toBeInTheDocument();
  });

  it("lists items and updates the total when quantity changes", async () => {
    const user = userEvent.setup();
    useCartStore.setState({
      lines: [
        {
          productId: "1",
          name: "Red Apples",
          priceSen: "690",
          quantity: 1,
        },
      ],
    });
    renderWithActor(<CartPage />, makeActor());

    expect(screen.getByTestId("cart.total")).toHaveTextContent("RM 6.90");

    await user.click(screen.getByTestId("cart.quantity_increase.1"));

    expect(screen.getByTestId("cart.quantity_value.1")).toHaveTextContent("2");
    expect(screen.getByTestId("cart.total")).toHaveTextContent("RM 13.80");
  });

  it("removes an item from the cart", async () => {
    const user = userEvent.setup();
    useCartStore.setState({
      lines: [
        { productId: "1", name: "Red Apples", priceSen: "690", quantity: 1 },
      ],
    });
    renderWithActor(<CartPage />, makeActor());

    await user.click(screen.getByTestId("cart.remove_button.1"));

    expect(screen.getByTestId("cart.empty_state")).toBeInTheDocument();
  });
});

describe("CheckoutPage", () => {
  it("shows a validation message and does not place the order when a required field is missing", async () => {
    const user = userEvent.setup();
    const placeOrder = vi.fn<backendInterface["placeOrder"]>(async () =>
      makeOrder(),
    );
    useCartStore.setState({
      lines: [
        { productId: "1", name: "Red Apples", priceSen: "690", quantity: 1 },
      ],
    });
    renderWithActor(<CheckoutPage />, makeActor({ placeOrder }));

    await user.click(screen.getByTestId("checkout.submit_button"));

    expect(
      await screen.findByTestId("checkout.name_error"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("checkout.phone_error")).toBeInTheDocument();
    expect(screen.getByTestId("checkout.address_error")).toBeInTheDocument();
    expect(placeOrder).not.toHaveBeenCalled();
  });

  it("places an order with valid details, clears the cart and navigates to confirmation", async () => {
    const user = userEvent.setup();
    const placeOrder = vi.fn<backendInterface["placeOrder"]>(async () =>
      makeOrder({ id: 42n, reference: "KM-42" }),
    );
    useCartStore.setState({
      lines: [
        { productId: "1", name: "Red Apples", priceSen: "690", quantity: 2 },
      ],
    });
    renderWithActor(<CheckoutPage />, makeActor({ placeOrder }));

    await user.type(screen.getByTestId("checkout.name_input"), "Aisyah Rahman");
    await user.type(screen.getByTestId("checkout.phone_input"), "012-345 6789");
    await user.type(
      screen.getByTestId("checkout.address_textarea"),
      "12 Jalan Mawar, Kuala Lumpur",
    );
    await user.click(screen.getByTestId("checkout.submit_button"));

    await waitFor(() => {
      expect(placeOrder).toHaveBeenCalledTimes(1);
    });
    const [delivery, items] = placeOrder.mock.calls[0];
    expect(delivery).toMatchObject({
      customerName: "Aisyah Rahman",
      phone: "012-345 6789",
      address: "12 Jalan Mawar, Kuala Lumpur",
    });
    expect(items).toEqual([{ productId: 1n, quantity: 2n }]);

    await waitFor(() => {
      expect(useCartStore.getState().lines).toHaveLength(0);
    });
    expect(routerState.navigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "/order-confirmation/$orderId",
        params: { orderId: "42" },
      }),
    );
  });
});

describe("AdminProductsPage access control", () => {
  it("denies a non-admin signed-in user", async () => {
    const { AdminProductsPage } = await import("@/pages/AdminProductsPage");
    setIdentityForTest({
      identity: {
        getPrincipal: () => ({
          isAnonymous: () => false,
          toText: () => "user-1",
        }),
      } as never,
    });
    renderWithActor(
      <AdminProductsPage />,
      makeActor({ isCallerAdmin: vi.fn(async () => false) }),
    );

    expect(
      await screen.findByTestId("admin_products.access_denied_state"),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("admin_products.add_button")).toBeNull();
  });

  it("shows the management list to an admin", async () => {
    const { AdminProductsPage } = await import("@/pages/AdminProductsPage");
    renderWithActor(
      <AdminProductsPage />,
      makeActor({
        isCallerAdmin: vi.fn(async () => true),
        listProducts: vi.fn(async () => [makeProduct({ name: "Red Apples" })]),
      }),
    );

    expect(
      await screen.findByTestId("admin_products.list"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("admin_products.add_button")).toBeInTheDocument();
    const list = screen.getByTestId("admin_products.list");
    expect(within(list).getByText("Red Apples")).toBeInTheDocument();
  });
});
