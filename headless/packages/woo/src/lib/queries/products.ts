/**
 * WooCommerce Product Queries
 *
 * Follows the pattern from @flavor/core/lib/wordpress/queries/posts.ts
 */

import { PRODUCT_CARD_FIELDS, PRODUCT_FIELDS } from "../fragments";

/**
 * Paginated product listing with relay cursor pagination.
 */
export const GET_PRODUCTS = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, where: { status: "publish" }) {
      nodes {
        ...ProductCardFields
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FIELDS}
`;

/**
 * Single product by slug with full fields.
 */
export const GET_PRODUCT_BY_SLUG = `
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      ...ProductFields
    }
  }
  ${PRODUCT_FIELDS}
`;

/**
 * Products filtered by category slug, paginated.
 */
export const GET_PRODUCTS_BY_CATEGORY = `
  query GetProductsByCategory($categorySlug: String!, $first: Int!, $after: String) {
    products(first: $first, after: $after, where: { category: $categorySlug, status: "publish" }) {
      nodes {
        ...ProductCardFields
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_CARD_FIELDS}
`;

/**
 * Product category metadata by slug.
 */
export const GET_PRODUCT_CATEGORY_BY_SLUG = `
  query GetProductCategoryBySlug($slug: ID!) {
    productCategory(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      count
      image {
        sourceUrl
        altText
      }
    }
  }
`;

/**
 * All product categories (for nav/sidebar).
 */
export const GET_PRODUCT_CATEGORIES = `
  query GetProductCategories {
    productCategories(first: 100, where: { hideEmpty: true }) {
      nodes {
        id
        databaseId
        name
        slug
        count
        parent {
          node {
            id
            slug
            name
          }
        }
      }
    }
  }
`;
