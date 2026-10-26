module {
  /// Signed nanosecond timestamp (Time.now()).
  public type Timestamp = Int;

  /// Monetary amount in Malaysian Ringgit sen (1 RM = 100 sen).
  public type Sen = Nat;

  /// Identifier for a product.
  public type ProductId = Nat;

  /// Identifier for an order.
  public type OrderId = Nat;

  /// Human-readable order reference shown to the shopper.
  public type OrderRef = Text;
};
