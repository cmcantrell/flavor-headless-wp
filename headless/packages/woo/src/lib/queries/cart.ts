/**
 * WooCommerce Cart Queries & Mutations
 *
 * Operation names must match the NEVER_CACHE set in redis/client.ts
 * so cart data is never Redis-cached.
 */

import { IMAGE_FIELDS } from "@flavor/core/lib/wordpress/fragments";

// ---------------------------------------------------------------------------
// Fragments
// ---------------------------------------------------------------------------

const CART_ITEM_FIELDS = `
  fragment CartItemFields on CartItem {
    key
    quantity
    total
    product {
      node {
        id
        databaseId
        name
        slug
        type
        image {
          ...ImageFields
        }
        ... on SimpleProduct {
          price
          stockStatus
        }
        ... on VariableProduct {
          price
          stockStatus
        }
      }
    }
    variation {
      node {
        id
        databaseId
        name
        price
        stockStatus
        attributes {
          nodes {
            name
            value
          }
        }
        image {
          ...ImageFields
        }
      }
    }
  }
  ${IMAGE_FIELDS}
`;

const CART_CONTENT_FIELDS = `
  fragment CartContentFields on Cart {
    contents {
      nodes {
        ...CartItemFields
      }
      itemCount
    }
    subtotal
    total
    needsShippingAddress
    shippingTotal
    chosenShippingMethods
    appliedCoupons {
      code
      discountAmount
    }
    discountTotal
  }
  ${CART_ITEM_FIELDS}
`;

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

export const GET_CART = `
  query GetCart {
    cart {
      ...CartContentFields
    }
  }
  ${CART_CONTENT_FIELDS}
`;

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const ADD_TO_CART = `
  mutation AddToCart($productId: Int!, $quantity: Int = 1, $variationId: Int) {
    addToCart(input: { productId: $productId, quantity: $quantity, variationId: $variationId }) {
      cart {
        ...CartContentFields
      }
    }
  }
  ${CART_CONTENT_FIELDS}
`;

export const UPDATE_CART_ITEM_QUANTITIES = `
  mutation UpdateCartItemQuantities($items: [CartItemQuantityInput]!) {
    updateItemQuantities(input: { items: $items }) {
      cart {
        ...CartContentFields
      }
    }
  }
  ${CART_CONTENT_FIELDS}
`;

export const REMOVE_CART_ITEMS = `
  mutation RemoveCartItems($keys: [ID]!) {
    removeItemsFromCart(input: { keys: $keys }) {
      cart {
        ...CartContentFields
      }
    }
  }
  ${CART_CONTENT_FIELDS}
`;

export const APPLY_COUPON = `
  mutation ApplyCoupon($code: String!) {
    applyCoupon(input: { code: $code }) {
      cart {
        ...CartContentFields
      }
    }
  }
  ${CART_CONTENT_FIELDS}
`;

export const REMOVE_COUPONS = `
  mutation RemoveCoupons($codes: [String!]) {
    removeCoupons(input: { codes: $codes }) {
      cart {
        ...CartContentFields
      }
    }
  }
  ${CART_CONTENT_FIELDS}
`;
