import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Types "../types/orders";
import CatalogTypes "../types/catalog";
import Common "../types/common";

module {
  /// Place an order for the caller from the given line items.
  public func placeOrder(
    orders : Map.Map<Common.OrderId, Types.Order>,
    products : Map.Map<Common.ProductId, CatalogTypes.Product>,
    state : { var nextOrderId : Nat },
    caller : Principal,
    delivery : Types.DeliveryDetails,
    items : [Types.OrderItemInput],
  ) : Types.Order {
    if (items.size() == 0) {
      Runtime.trap("Order must contain at least one item");
    };

    let lineItems = List.empty<Types.OrderItem>();
    var totalSen : Common.Sen = 0;

    for (input in items.values()) {
      if (input.quantity == 0) {
        Runtime.trap("Order item quantity must be greater than zero");
      };
      let product = switch (products.get(input.productId)) {
        case (?p) { p };
        case null { Runtime.trap("Product not found: " # input.productId.toText()) };
      };
      if (product.stock < input.quantity) {
        Runtime.trap("Insufficient stock for product: " # product.name);
      };
      let subtotal = product.priceSen * input.quantity;
      lineItems.add({
        productId = product.id;
        productName = product.name;
        quantity = input.quantity;
        unitPriceSen = product.priceSen;
        subtotalSen = subtotal;
      });
      totalSen += subtotal;
    };

    // Decrement stock only after every line item validated.
    for (item in lineItems.values()) {
      switch (products.get(item.productId)) {
        case (?product) {
          var remaining = product.stock;
          var toRemove = item.quantity;
          while (toRemove > 0 and remaining > 0) {
            remaining -= 1;
            toRemove -= 1;
          };
          products.add(item.productId, { product with stock = remaining });
        };
        case null {};
      };
    };

    let id = state.nextOrderId;
    state.nextOrderId := id + 1;

    let order : Types.Order = {
      id;
      reference = "KM-" # id.toText();
      delivery;
      items = lineItems.toArray();
      totalSen;
      createdAt = Time.now();
      owner = caller;
    };
    orders.add(id, order);
    order;
  };

  /// List the caller's own orders, newest first.
  public func listMyOrders(orders : Map.Map<Common.OrderId, Types.Order>, caller : Principal) : [Types.Order] {
    let mine = orders.values().filter(
      func(order) { Principal.equal(order.owner, caller) }
    ).toArray();
    mine.sort(
      func(a, b) {
        if (a.createdAt > b.createdAt) { #less }
        else if (a.createdAt < b.createdAt) { #greater }
        else { #equal }
      }
    );
  };

  /// Fetch one of the caller's own orders; null when absent or not owned.
  public func getMyOrder(orders : Map.Map<Common.OrderId, Types.Order>, caller : Principal, id : Common.OrderId) : ?Types.Order {
    switch (orders.get(id)) {
      case (?order) {
        if (Principal.equal(order.owner, caller)) { ?order } else { null };
      };
      case null { null };
    };
  };
};
