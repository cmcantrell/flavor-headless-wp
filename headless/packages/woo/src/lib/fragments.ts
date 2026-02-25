/**
 * Reusable GraphQL Fragments for WooGraphQL
 *
 * WooGraphQL uses union types — product fields must be accessed via
 * inline fragment spreads (... on SimpleProduct, ... on VariableProduct, etc.)
 */

import { IMAGE_FIELDS } from "@flavor/core/lib/wordpress/fragments";

/**
 * Lightweight product fields for listings / cards.
 * Covers SimpleProduct, VariableProduct, and ExternalProduct.
 */
export const PRODUCT_CARD_FIELDS = `
  fragment ProductCardFields on Product {
    id
    databaseId
    name
    slug
    type
    image {
      ...ImageFields
    }
    productCategories {
      nodes {
        id
        name
        slug
      }
    }
    ... on SimpleProduct {
      price
      regularPrice
      salePrice
      onSale
      stockStatus
      shortDescription
      averageRating
      reviewCount
    }
    ... on VariableProduct {
      price
      regularPrice
      salePrice
      onSale
      stockStatus
      shortDescription
      averageRating
      reviewCount
    }
    ... on ExternalProduct {
      price
      regularPrice
      salePrice
      onSale
      shortDescription
      averageRating
      reviewCount
    }
  }
  ${IMAGE_FIELDS}
`;

/**
 * Full product fields for single product pages.
 * Includes gallery, attributes, variations, and related products.
 */
export const PRODUCT_FIELDS = `
  fragment ProductFields on Product {
    id
    databaseId
    name
    slug
    type
    description
    reviewsAllowed
    image {
      ...ImageFields
    }
    galleryImages {
      nodes {
        ...ImageFields
      }
    }
    productCategories {
      nodes {
        id
        name
        slug
      }
    }
    productTags {
      nodes {
        id
        name
        slug
      }
    }
    ... on SimpleProduct {
      price
      regularPrice
      salePrice
      onSale
      stockStatus
      sku
      shortDescription
      averageRating
      reviewCount
      attributes {
        nodes {
          id
          name
          options
        }
      }
      related(first: 4) {
        nodes {
          ...ProductCardFields
        }
      }
      upsell(first: 4) {
        nodes {
          ...ProductCardFields
        }
      }
      crossSell(first: 4) {
        nodes {
          ...ProductCardFields
        }
      }
    }
    ... on VariableProduct {
      price
      regularPrice
      salePrice
      onSale
      stockStatus
      sku
      shortDescription
      averageRating
      reviewCount
      attributes {
        nodes {
          id
          name
          options
        }
      }
      variations(first: 100) {
        nodes {
          id
          databaseId
          name
          price
          regularPrice
          salePrice
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
      related(first: 4) {
        nodes {
          ...ProductCardFields
        }
      }
      upsell(first: 4) {
        nodes {
          ...ProductCardFields
        }
      }
      crossSell(first: 4) {
        nodes {
          ...ProductCardFields
        }
      }
    }
    ... on ExternalProduct {
      price
      regularPrice
      salePrice
      onSale
      externalUrl
      buttonText
      shortDescription
      averageRating
      reviewCount
      attributes {
        nodes {
          id
          name
          options
        }
      }
      related(first: 4) {
        nodes {
          ...ProductCardFields
        }
      }
      upsell(first: 4) {
        nodes {
          ...ProductCardFields
        }
      }
    }
  }
  ${PRODUCT_CARD_FIELDS}
`;
