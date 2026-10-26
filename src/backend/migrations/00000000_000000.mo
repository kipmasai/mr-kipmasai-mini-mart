import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";

module {
  // Self-contained copies of the persisted record shapes (no project imports).
  type ProductId = Nat;
  type OrderId = Nat;
  type Sen = Nat;
  type Timestamp = Int;

  type Product = {
    id : ProductId;
    name : Text;
    description : Text;
    priceSen : Sen;
    category : Text;
    stock : Nat;
    image : ?Blob;
  };

  type OrderItem = {
    productId : ProductId;
    productName : Text;
    quantity : Nat;
    unitPriceSen : Sen;
    subtotalSen : Sen;
  };

  type DeliveryDetails = {
    customerName : Text;
    phone : Text;
    address : Text;
    notes : ?Text;
  };

  type Order = {
    id : OrderId;
    reference : Text;
    delivery : DeliveryDetails;
    items : [OrderItem];
    totalSen : Sen;
    createdAt : Timestamp;
    owner : Principal;
  };

  public type OldActor = {};

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    products : Map.Map<ProductId, Product>;
    orders : Map.Map<OrderId, Order>;
    state : { var nextProductId : Nat; var nextOrderId : Nat };
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      products = Map.empty();
      orders = Map.empty();
      state = { var nextProductId = 0; var nextOrderId = 0 };
    };
  };
};
