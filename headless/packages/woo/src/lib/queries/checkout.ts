/**
 * WooCommerce Checkout Queries & Mutations
 *
 * Operation names: GetCheckoutCart, UpdateShippingMethod, Checkout
 * All are in the NEVER_CACHE set in redis/client.ts.
 */

import { IMAGE_FIELDS } from "@flavor/core/lib/wordpress/fragments";

// ---------------------------------------------------------------------------
// Fragments (extends cart with shipping method details)
// ---------------------------------------------------------------------------

const CART_ITEM_FIELDS = `
  fragment CheckoutCartItemFields on CartItem {
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

const CHECKOUT_CART_FIELDS = `
  fragment CheckoutCartFields on Cart {
    contents {
      nodes {
        ...CheckoutCartItemFields
      }
      itemCount
    }
    subtotal
    total
    needsShippingAddress
    shippingTotal
    chosenShippingMethods
    availableShippingMethods {
      packageDetails
      rates {
        id
        label
        cost
        methodId
      }
    }
    appliedCoupons {
      code
      discountAmount
    }
    discountTotal
  }
  ${CART_ITEM_FIELDS}
`;

// ---------------------------------------------------------------------------
// Query — full cart data for checkout page
// ---------------------------------------------------------------------------

export const GET_CHECKOUT_CART = `
  query GetCheckoutCart {
    cart {
      ...CheckoutCartFields
    }
    paymentGateways {
      nodes {
        id
        title
        description
        icon
      }
    }
  }
  ${CHECKOUT_CART_FIELDS}
`;

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const UPDATE_SHIPPING_METHOD = `
  mutation UpdateShippingMethod($shippingMethods: [String]) {
    updateShippingMethod(input: { shippingMethods: $shippingMethods }) {
      cart {
        ...CheckoutCartFields
      }
    }
  }
  ${CHECKOUT_CART_FIELDS}
`;

export const CHECKOUT = `
  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      order {
        databaseId
        orderNumber
        status
        total
        date
        subtotal
        shippingTotal
        billing {
          firstName
          lastName
          email
        }
        lineItems {
          nodes {
            quantity
            total
            product {
              node {
                id
                databaseId
                name
                slug
                type
              }
            }
          }
        }
      }
      result
      redirect
    }
  }
`;
