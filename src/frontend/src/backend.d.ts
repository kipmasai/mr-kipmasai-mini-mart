import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
import type { ExternalBlob } from "@caffeineai/object-storage";
export type { ExternalBlob } from "@caffeineai/object-storage";
export interface Cell {
    value: Value;
    name: string;
}
export interface DeliveryDetails {
    customerName: string;
    address: string;
    notes?: string;
    phone: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Order {
    id: OrderId;
    owner: Principal;
    createdAt: Timestamp;
    reference: OrderRef;
    totalSen: Sen;
    delivery: DeliveryDetails;
    items: Array<OrderItem>;
}
export type OrderId = bigint;
export interface OrderItem {
    productId: ProductId;
    productName: string;
    unitPriceSen: Sen;
    quantity: bigint;
    subtotalSen: Sen;
}
export interface OrderItemInput {
    productId: ProductId;
    quantity: bigint;
}
export type OrderRef = string;
export interface Product {
    id: ProductId;
    name: string;
    description: string;
    stock: bigint;
    category: string;
    image?: ExternalBlob;
    priceSen: Sen;
}
export type ProductId = bigint;
export interface ProductInput {
    name: string;
    description: string;
    stock: bigint;
    category: string;
    image?: ExternalBlob;
    priceSen: Sen;
}
export interface ProductUpdate {
    name: string;
    description: string;
    stock: bigint;
    category: string;
    image?: ExternalBlob;
    priceSen: Sen;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Sen = bigint;
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Admin: create a product.
     */
    createProduct(input: ProductInput): Promise<Product>;
    /**
     * / Admin: delete a product.
     */
    deleteProduct(id: ProductId): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Return one of the caller's own orders.
     */
    getMyOrder(id: OrderId): Promise<Order | null>;
    /**
     * / Public: fetch one product.
     */
    getProduct(id: ProductId): Promise<Product | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Public: list distinct categories.
     */
    listCategories(): Promise<Array<string>>;
    /**
     * / Return only the caller's own orders.
     */
    listMyOrders(): Promise<Array<Order>>;
    /**
     * / Public: list every product.
     */
    listProducts(): Promise<Array<Product>>;
    /**
     * / Any visitor may place an order; the caller identity is recorded when signed in.
     */
    placeOrder(delivery: DeliveryDetails, items: Array<OrderItemInput>): Promise<Order>;
    schema(): Promise<string>;
    /**
     * / Public: search products by name and/or category.
     */
    searchProducts(nameQuery: string | null, category: string | null): Promise<Array<Product>>;
    /**
     * / Admin: update a product.
     */
    updateProduct(id: ProductId, input: ProductUpdate): Promise<Product | null>;
}
