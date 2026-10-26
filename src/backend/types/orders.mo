import Common "../types/common";

module {
  /// A single line item in an order.
  public type OrderItem = {
    productId : Common.ProductId;
    productName : Text;
    quantity : Nat;
    /// Unit price captured at order time, in sen.
    unitPriceSen : Common.Sen;
    /// quantity * unitPriceSen, in sen.
    subtotalSen : Common.Sen;
  };

  /// Delivery details supplied by the shopper.
  public type DeliveryDetails = {
    customerName : Text;
    phone : Text;
    address : Text;
    notes : ?Text;
  };

  /// A line item as supplied by the shopper when placing an order.
  public type OrderItemInput = {
    productId : Common.ProductId;
    quantity : Nat;
  };

  /// A placed order.
  public type Order = {
    id : Common.OrderId;
    reference : Common.OrderRef;
    delivery : DeliveryDetails;
    items : [OrderItem];
    /// Sum of all item subtotals, in sen.
    totalSen : Common.Sen;
    createdAt : Common.Timestamp;
    /// Owning shopper identity.
    owner : Principal;
  };
};
