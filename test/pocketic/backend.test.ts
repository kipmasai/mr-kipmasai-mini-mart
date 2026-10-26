import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { createIdentity } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BACKEND_WASM,
    }));
    return;
  }
  const installed = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BASELINE_WASM,
  });
  await pic.upgradeCanister({
    canisterId: installed.canisterId,
    wasm: BACKEND_WASM,
    arg: new Uint8Array(),
  });
  ({ actor, canisterId } = installed);
});

afterAll(async () => {
  await pic?.tearDown();
});

it("seeds the catalogue with sample products on first load", async () => {
  const products = await actor.listProducts();
  expect(products.length).toBeGreaterThan(0);
  const apples = products.find((p) => p.name === "Red Apples");
  expect(apples).toBeDefined();
  expect(apples?.priceSen).toBe(690n);
  expect(apples?.category).toBe("Fresh Produce");
});

it("lists distinct categories", async () => {
  const categories = await actor.listCategories();
  expect(categories).toContain("Fresh Produce");
  expect(categories).toContain("Groceries");
});

it("fetches a single product and returns empty for an unknown id", async () => {
  const products = await actor.listProducts();
  const first = products[0];
  const fetched = await actor.getProduct(first.id);
  expect(fetched).toHaveLength(1);
  expect(fetched[0].name).toBe(first.name);

  const missing = await actor.getProduct(999_999n);
  expect(missing).toEqual([]);
});

it("searches products by name and category", async () => {
  const byName = await actor.searchProducts(["apple"], []);
  expect(byName.length).toBeGreaterThan(0);
  expect(byName.every((p) => p.name.toLowerCase().includes("apple"))).toBe(true);

  const byCategory = await actor.searchProducts([], ["Beverages"]);
  expect(byCategory.length).toBeGreaterThan(0);
  expect(byCategory.every((p) => p.category === "Beverages")).toBe(true);

  const noMatch = await actor.searchProducts(["zzzzz"], []);
  expect(noMatch).toEqual([]);
});

it("places an order and returns it through the caller's own history", async () => {
  const products = await actor.listProducts();
  const target = products.find((p) => p.name === "Red Apples");
  expect(target).toBeDefined();
  if (!target) return;

  const order = await actor.placeOrder(
    {
      customerName: "Aisyah Rahman",
      phone: "012-345 6789",
      address: "12 Jalan Mawar, Kuala Lumpur",
      notes: ["Leave at the gate"],
    },
    [{ productId: target.id, quantity: 2n }],
  );

  expect(order.reference).toMatch(/^KM-\d+$/);
  expect(order.totalSen).toBe(target.priceSen * 2n);
  expect(order.items).toHaveLength(1);
  expect(order.items[0].productName).toBe("Red Apples");

  const mine = await actor.listMyOrders();
  expect(mine.some((o) => o.id === order.id)).toBe(true);

  const fetched = await actor.getMyOrder(order.id);
  expect(fetched).toHaveLength(1);
  expect(fetched[0].reference).toBe(order.reference);
});

it("rejects an order with no items", async () => {
  await expect(
    actor.placeOrder(
      {
        customerName: "Aisyah Rahman",
        phone: "012-345 6789",
        address: "12 Jalan Mawar, Kuala Lumpur",
        notes: [],
      },
      [],
    ),
  ).rejects.toThrow();
});

it("keeps one caller's orders private from another", async () => {
  const alice = createIdentity("alice");
  const bob = createIdentity("bob");

  const aliceActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  aliceActor.setIdentity(alice);
  const products = await aliceActor.listProducts();
  const target = products[0];
  const aliceOrder = await aliceActor.placeOrder(
    {
      customerName: "Alice",
      phone: "011-111 1111",
      address: "1 Alice Street",
      notes: [],
    },
    [{ productId: target.id, quantity: 1n }],
  );

  const bobActor = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  bobActor.setIdentity(bob);
  const bobOrders = await bobActor.listMyOrders();
  expect(bobOrders.some((o) => o.id === aliceOrder.id)).toBe(false);

  const bobRead = await bobActor.getMyOrder(aliceOrder.id);
  expect(bobRead).toEqual([]);
});

it("rejects a non-admin caller from creating a product", async () => {
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  await expect(
    guest.createProduct({
      name: "Unauthorized Item",
      description: "Should not be created",
      priceSen: 100n,
      category: "Test",
      stock: 1n,
      image: [],
    }),
  ).rejects.toThrow();
});
