import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import Runtime "mo:core/Runtime";
import CatalogLib "../lib/catalog";
import Types "../types/catalog";
import Common "../types/common";

mixin (
  accessControlState : AccessControl.AccessControlState,
  products : Map.Map<Common.ProductId, Types.Product>,
  state : { var nextProductId : Nat },
) {
  /// Public: list every product.
  public query func listProducts() : async [Types.Product] {
    CatalogLib.listProducts(products);
  };

  /// Public: fetch one product.
  public query func getProduct(id : Common.ProductId) : async ?Types.Product {
    CatalogLib.getProduct(products, id);
  };

  /// Public: list distinct categories.
  public query func listCategories() : async [Text] {
    CatalogLib.listCategories(products);
  };

  /// Public: search products by name and/or category.
  public query func searchProducts(nameQuery : ?Text, category : ?Text) : async [Types.Product] {
    CatalogLib.searchProducts(products, nameQuery, category);
  };

  /// Admin: create a product.
  public shared ({ caller }) func createProduct(input : Types.ProductInput) : async Types.Product {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only administrators can create products");
    };
    CatalogLib.createProduct(products, state, input);
  };

  /// Admin: update a product.
  public shared ({ caller }) func updateProduct(id : Common.ProductId, input : Types.ProductUpdate) : async ?Types.Product {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only administrators can update products");
    };
    CatalogLib.updateProduct(products, id, input);
  };

  /// Admin: delete a product.
  public shared ({ caller }) func deleteProduct(id : Common.ProductId) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: only administrators can delete products");
    };
    CatalogLib.deleteProduct(products, id);
  };
};
