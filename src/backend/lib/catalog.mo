import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Types "../types/catalog";
import Common "../types/common";

module {
  /// List every product in the catalogue.
  public func listProducts(products : Map.Map<Common.ProductId, Types.Product>) : [Types.Product] {
    products.values().toArray();
  };

  /// Fetch a single product by id.
  public func getProduct(products : Map.Map<Common.ProductId, Types.Product>, id : Common.ProductId) : ?Types.Product {
    products.get(id);
  };

  /// List the distinct category names present in the catalogue.
  public func listCategories(products : Map.Map<Common.ProductId, Types.Product>) : [Text] {
    let seen = List.empty<Text>();
    for (product in products.values()) {
      if (not seen.contains(product.category)) {
        seen.add(product.category);
      };
    };
    seen.toArray();
  };

  /// Search products by optional name substring and optional category.
  public func searchProducts(products : Map.Map<Common.ProductId, Types.Product>, nameQuery : ?Text, category : ?Text) : [Types.Product] {
    let needle = switch (nameQuery) {
      case (?q) { ?q.toLower() };
      case null { null };
    };
    let wantedCategory = category;
    products.values().filter(
      func(product) {
        let nameMatches = switch (needle) {
          case (?n) { product.name.toLower().contains(#text n) };
          case null { true };
        };
        let categoryMatches = switch (wantedCategory) {
          case (?c) { product.category == c };
          case null { true };
        };
        nameMatches and categoryMatches;
      }
    ).toArray();
  };

  /// Create a product and return it.
  public func createProduct(products : Map.Map<Common.ProductId, Types.Product>, state : { var nextProductId : Nat }, input : Types.ProductInput) : Types.Product {
    let id = state.nextProductId;
    state.nextProductId := id + 1;
    let product : Types.Product = {
      id;
      name = input.name;
      description = input.description;
      priceSen = input.priceSen;
      category = input.category;
      stock = input.stock;
      image = input.image;
    };
    products.add(id, product);
    product;
  };

  /// Update an existing product; returns null when it does not exist.
  public func updateProduct(products : Map.Map<Common.ProductId, Types.Product>, id : Common.ProductId, input : Types.ProductUpdate) : ?Types.Product {
    switch (products.get(id)) {
      case (?existing) {
        let updated : Types.Product = {
          id = existing.id;
          name = input.name;
          description = input.description;
          priceSen = input.priceSen;
          category = input.category;
          stock = input.stock;
          image = input.image;
        };
        products.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };

  /// Delete a product; returns whether it existed.
  public func deleteProduct(products : Map.Map<Common.ProductId, Types.Product>, id : Common.ProductId) : Bool {
    switch (products.get(id)) {
      case (?_) {
        products.remove(id);
        true;
      };
      case null { false };
    };
  };

  /// Seed the catalogue with sample products across the standard categories.
  public func seedProducts(products : Map.Map<Common.ProductId, Types.Product>, state : { var nextProductId : Nat }) : () {
    let samples : [Types.ProductInput] = [
      { name = "Red Apples"; description = "Crisp fresh red apples, sold per pack of 4."; priceSen = 690; category = "Fresh Produce"; stock = 40; image = null },
      { name = "Bananas"; description = "Ripe local bananas, sold per bunch."; priceSen = 450; category = "Fresh Produce"; stock = 60; image = null },
      { name = "Carrots"; description = "Fresh carrots, sold per 500g pack."; priceSen = 380; category = "Fresh Produce"; stock = 35; image = null },
      { name = "White Rice 5kg"; description = "Premium local white rice, 5kg bag."; priceSen = 2650; category = "Groceries"; stock = 25; image = null },
      { name = "Cooking Oil 1kg"; description = "Refined palm cooking oil, 1kg bottle."; priceSen = 890; category = "Groceries"; stock = 30; image = null },
      { name = "Eggs (Grade A)"; description = "Fresh grade A chicken eggs, tray of 10."; priceSen = 720; category = "Groceries"; stock = 50; image = null },
      { name = "Instant Noodles"; description = "Chicken flavoured instant noodles, pack of 5."; priceSen = 560; category = "Groceries"; stock = 80; image = null },
      { name = "Dishwashing Liquid"; description = "Lemon scented dishwashing liquid, 1L."; priceSen = 750; category = "Household"; stock = 30; image = null },
      { name = "Laundry Detergent 2kg"; description = "Concentrated powder detergent, 2kg."; priceSen = 1890; category = "Household"; stock = 20; image = null },
      { name = "Toilet Tissue 10s"; description = "Soft 2-ply toilet tissue, pack of 10 rolls."; priceSen = 1290; category = "Household"; stock = 45; image = null },
      { name = "Bottled Water 1.5L"; description = "Purified drinking water, 1.5L bottle."; priceSen = 250; category = "Beverages"; stock = 100; image = null },
      { name = "Orange Juice 1L"; description = "100% orange juice, 1L carton."; priceSen = 890; category = "Beverages"; stock = 40; image = null },
      { name = "Teh Tarik Sachets"; description = "Malaysian teh tarik instant sachets, pack of 15."; priceSen = 1150; category = "Beverages"; stock = 35; image = null },
      { name = "Potato Chips"; description = "Salted potato chips, 100g bag."; priceSen = 420; category = "Snacks"; stock = 70; image = null },
      { name = "Chocolate Biscuits"; description = "Chocolate cream biscuits, 300g pack."; priceSen = 680; category = "Snacks"; stock = 55; image = null },
      { name = "Peanuts (Roasted)"; description = "Roasted salted peanuts, 200g pack."; priceSen = 590; category = "Snacks"; stock = 40; image = null },
      { name = "Toothpaste 150g"; description = "Fluoride toothpaste, 150g tube."; priceSen = 850; category = "Personal Care"; stock = 30; image = null },
      { name = "Shampoo 340ml"; description = "Anti-dandruff shampoo, 340ml bottle."; priceSen = 1590; category = "Personal Care"; stock = 25; image = null },
      { name = "Bath Soap"; description = "Moisturising bath soap bar, 100g."; priceSen = 390; category = "Personal Care"; stock = 60; image = null },
    ];
    for (sample in samples.values()) {
      ignore createProduct(products, state, sample);
    };
  };
};
