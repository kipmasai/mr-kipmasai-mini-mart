import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import CatalogTypes "types/catalog";
import OrderTypes "types/orders";
import Common "types/common";
import CatalogLib "lib/catalog";
import CatalogApi "mixins/catalog-api";
import OrdersApi "mixins/orders-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);
  include MixinObjectStorage();

  let products : Map.Map<Common.ProductId, CatalogTypes.Product>;
  let orders : Map.Map<Common.OrderId, OrderTypes.Order>;
  let state : { var nextProductId : Nat; var nextOrderId : Nat };

  // Populate the storefront on first initialisation only.
  if (products.size() == 0) {
    CatalogLib.seedProducts(products, state);
  };

  include CatalogApi(accessControlState, products, state);
  include OrdersApi(accessControlState, orders, products, state);

  transient let samplePrincipal = Principal.fromText("aaaaa-aa");

  include Expose({
    entities = [
      products.toEntityManual("product", "Product", "id")
        .sample({
          id = 0;
          name = "";
          description = "";
          priceSen = 0;
          category = "";
          stock = 0;
          image = null;
        })
        .payload("name", func p = p.name)
        .payload("description", func p = p.description)
        .payload("priceSen", func p = p.priceSen)
        .payload("category", func p = p.category)
        .payload("stock", func p = p.stock)
        .payload("image", func p = switch (p.image) { case (?b) (b.decodeUtf8() ?? ""); case null "" })
        .public_()
        .build(),
      orders.toEntityManual("order", "Order", "id")
        .sample({
          id = 0;
          reference = "";
          delivery = { customerName = ""; phone = ""; address = ""; notes = ?"" };
          items = [];
          totalSen = 0;
          createdAt = 0;
          owner = samplePrincipal;
        })
        .payload("reference", func o = o.reference)
        .payload("customerName", func o = o.delivery.customerName)
        .payload("phone", func o = o.delivery.phone)
        .payload("address", func o = o.delivery.address)
        .payload("totalSen", func o = o.totalSen)
        .payload("createdAt", func o = o.createdAt)
        .payload("owner", func o = o.owner)
        .ownedBy("owner")
        .scopedPerUser()
        .build(),
    ];
  });

  include ApiDocMixin();
};
