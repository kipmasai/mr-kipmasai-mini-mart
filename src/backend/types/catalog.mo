import Storage "mo:caffeineai-object-storage/Storage";
import Common "../types/common";

module {
  /// A product in the mini mart catalogue.
  public type Product = {
    id : Common.ProductId;
    name : Text;
    description : Text;
    /// Price in Malaysian Ringgit sen.
    priceSen : Common.Sen;
    category : Text;
    stock : Nat;
    /// Stored image reference; the frontend resolves a display URL from it.
    image : ?Storage.ExternalBlob;
  };

  /// Input for creating a product.
  public type ProductInput = {
    name : Text;
    description : Text;
    priceSen : Common.Sen;
    category : Text;
    stock : Nat;
    image : ?Storage.ExternalBlob;
  };

  /// Input for updating a product.
  public type ProductUpdate = {
    name : Text;
    description : Text;
    priceSen : Common.Sen;
    category : Text;
    stock : Nat;
    image : ?Storage.ExternalBlob;
  };
};
