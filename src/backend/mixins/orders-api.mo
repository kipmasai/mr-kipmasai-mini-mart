import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import OrdersLib "../lib/orders";
import Types "../types/orders";
import CatalogTypes "../types/catalog";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  orders : Map.Map<Common.OrderId, Types.Order>,
  products : Map.Map<Common.ProductId, CatalogTypes.Product>,
  state : { var nextOrderId : Nat },
) {
  /// Any visitor may place an order; the caller identity is recorded when signed in.
  public shared ({ caller }) func placeOrder(delivery : Types.DeliveryDetails, items : [Types.OrderItemInput]) : async Types.Order {
    ignore accessControlState;
    OrdersLib.placeOrder(orders, products, state, caller, delivery, items);
  };

  /// Return only the caller's own orders.
  public query ({ caller }) func listMyOrders() : async [Types.Order] {
    ignore accessControlState;
    OrdersLib.listMyOrders(orders, caller);
  };

  /// Return one of the caller's own orders.
  public query ({ caller }) func getMyOrder(id : Common.OrderId) : async ?Types.Order {
    ignore accessControlState;
    OrdersLib.getMyOrder(orders, caller, id);
  };
};
