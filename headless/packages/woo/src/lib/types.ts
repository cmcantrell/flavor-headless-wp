/**
 * WooCommerce Types for WooGraphQL
 *
 * Follows the Data + Response wrapper pattern from @flavor/core.
 * WooGraphQL uses union types for products (SimpleProduct, VariableProduct, etc.)
 * so many fields are shared across inline fragment spreads.
 */

import type { WPImage, PageInfo } from "@flavor/core/lib/wordpress/types";

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export interface ProductCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  image?: WPImage | null;
  parent?: {
    node: {
      id: string;
      slug: string;
      name: string;
    };
  } | null;
}

export interface ProductTag {
  id: string;
  name: string;
  slug: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  options: string[];
}

export interface ProductVariation {
  id: string;
  databaseId: number;
  name: string;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  stockStatus?: string;
  attributes?: {
    nodes: {
      name: string;
      value: string;
    }[];
  };
  image?: WPImage | null;
}

/** Lightweight product for listings (card view) */
export interface ProductCard {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  type: string;
  image?: WPImage | null;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  onSale?: boolean;
  stockStatus?: string;
  shortDescription?: string;
  averageRating?: number;
  reviewCount?: number;
  productCategories?: {
    nodes: ProductCategory[];
  };
}

/** Full product for single product pages */
export interface Product extends ProductCard {
  description?: string;
  sku?: string;
  reviewsAllowed?: boolean;
  galleryImages?: {
    nodes: WPImage[];
  };
  attributes?: {
    nodes: ProductAttribute[];
  };
  variations?: {
    nodes: ProductVariation[];
  };
  related?: {
    nodes: ProductCard[];
  };
  upsell?: {
    nodes: ProductCard[];
  };
  crossSell?: {
    nodes: ProductCard[];
  };
  productTags?: {
    nodes: ProductTag[];
  };
}

// ---------------------------------------------------------------------------
// Response wrappers (match WPGraphQL response shapes)
// ---------------------------------------------------------------------------

export interface ProductsResponse {
  products: {
    nodes: ProductCard[];
    pageInfo: PageInfo;
  };
}

export interface ProductBySlugResponse {
  product: Product | null;
}

export interface ProductCategoryBySlugResponse {
  productCategory: ProductCategory | null;
}

export interface ProductCategoriesResponse {
  productCategories: {
    nodes: ProductCategory[];
  };
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export interface ProductReview {
  rating: number;
  node: {
    id: string;
    databaseId: number;
    content: string;
    date: string;
    author: {
      node: {
        name: string;
        avatar?: {
          url: string;
        };
      };
    };
  };
}

export interface ProductReviewsResponse {
  product: {
    reviewCount: number;
    reviewsAllowed: boolean;
    reviews: {
      averageRating: number;
      edges: ProductReview[];
    };
  } | null;
}

export interface WriteReviewResponse {
  writeReview: {
    rating: number;
    clientMutationId: string | null;
  };
}

// ---------------------------------------------------------------------------
// Cart / Checkout
// ---------------------------------------------------------------------------

export interface CartItem {
  key: string;
  quantity: number;
  total: string;
  product: {
    node: ProductCard;
  };
  variation?: {
    node: ProductVariation;
  } | null;
}

export interface ShippingRate {
  id: string;
  label: string;
  cost: string;
  methodId: string;
}

export interface ShippingPackage {
  packageDetails: string;
  rates: ShippingRate[];
}

export interface Cart {
  contents: {
    nodes: CartItem[];
    itemCount: number;
  };
  subtotal: string;
  total: string;
  needsShippingAddress: boolean;
  availableShippingMethods: ShippingPackage[];
  chosenShippingMethods: string[];
  shippingTotal: string;
}

export interface GetCartResponse {
  cart: Cart;
}

export interface AddToCartResponse {
  addToCart: {
    cart: Cart;
  };
}

export interface UpdateCartItemsResponse {
  updateItemQuantities: {
    cart: Cart;
  };
}

export interface RemoveCartItemsResponse {
  removeItemsFromCart: {
    cart: Cart;
  };
}

// ---------------------------------------------------------------------------
// Order (Phase 2+)
// ---------------------------------------------------------------------------

export interface Order {
  id: string;
  databaseId: number;
  orderNumber: string;
  status: string;
  total: string;
  date: string;
  lineItems: {
    nodes: {
      quantity: number;
      total: string;
      product: {
        node: ProductCard;
      };
    }[];
  };
  billing: {
    firstName: string;
    lastName: string;
    email: string;
  };
  shippingTotal?: string;
  subtotal?: string;
}

// ---------------------------------------------------------------------------
// Payment Gateways
// ---------------------------------------------------------------------------

export interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  icon: string | null;
}

export interface PaymentGatewaysResponse {
  paymentGateways: {
    nodes: PaymentGateway[];
  };
}

// ---------------------------------------------------------------------------
// Checkout Input Types
// ---------------------------------------------------------------------------

export interface CustomerAddressInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  overwrite?: boolean;
}

export interface CheckoutInput {
  billing: CustomerAddressInput;
  shipping?: CustomerAddressInput;
  paymentMethod: string;
  shippingMethod?: string[];
  shipToDifferentAddress?: boolean;
  customerNote?: string;
}

export interface CheckoutResponse {
  checkout: {
    order: Order;
    result: string;
    redirect: string;
  };
}

export interface UpdateShippingMethodResponse {
  updateShippingMethod: {
    cart: Cart;
  };
}
