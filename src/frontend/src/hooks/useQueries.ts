import { createActor } from "@/backend";
import type {
  DeliveryDetails,
  Order,
  OrderId,
  OrderItemInput,
  Product,
  ProductId,
  ProductInput,
  ProductUpdate,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const productKeys = {
  all: ["products"] as const,
  list: () => [...productKeys.all, "list"] as const,
  detail: (id: string) => [...productKeys.all, "detail", id] as const,
  search: (name: string, category: string) =>
    [...productKeys.all, "search", name, category] as const,
  categories: ["categories"] as const,
};

export const orderKeys = {
  all: ["orders"] as const,
  mine: () => [...orderKeys.all, "mine"] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

/** Public: list every product. */
export function useProducts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: async (): Promise<Product[]> => {
      if (!actor) return [];
      return actor.listProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Public: fetch one product. */
export function useProduct(id: ProductId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: productKeys.detail(id?.toString() ?? ""),
    queryFn: async (): Promise<Product | null> => {
      if (!actor || id === undefined) return null;
      return actor.getProduct(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

/** Public: list distinct categories. */
export function useCategories() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: async (): Promise<string[]> => {
      if (!actor) return [];
      return actor.listCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Public: search products by name and/or category. */
export function useSearchProducts(nameQuery: string, category: string) {
  const { actor, isFetching } = useActor(createActor);
  const name = nameQuery.trim();
  return useQuery({
    queryKey: productKeys.search(name, category),
    queryFn: async (): Promise<Product[]> => {
      if (!actor) return [];
      return actor.searchProducts(
        name === "" ? null : name,
        category === "" ? null : category,
      );
    },
    enabled: !!actor && !isFetching,
  });
}

/** Any visitor may place an order. */
export function usePlaceOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      delivery: DeliveryDetails;
      items: OrderItemInput[];
    }): Promise<Order> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.placeOrder(args.delivery, args.items);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

/** Return only the caller's own orders. */
export function useMyOrders() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: orderKeys.mine(),
    queryFn: async (): Promise<Order[]> => {
      if (!actor) return [];
      return actor.listMyOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Return one of the caller's own orders. */
export function useMyOrder(id: OrderId | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: orderKeys.detail(id?.toString() ?? ""),
    queryFn: async (): Promise<Order | null> => {
      if (!actor || id === undefined) return null;
      return actor.getMyOrder(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

/** Admin: create a product. */
export function useCreateProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput): Promise<Product> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createProduct(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/** Admin: update a product. */
export function useUpdateProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: ProductId;
      input: ProductUpdate;
    }): Promise<Product | null> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateProduct(args.id, args.input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

/** Admin: delete a product. */
export function useDeleteProduct() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: ProductId): Promise<boolean> => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteProduct(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
