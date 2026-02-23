/**
 * Taxonomy archive queries (category & tag)
 */

import { POST_CARD_FIELDS } from "../fragments";

export const GET_CATEGORY_BY_SLUG = `
  query GetCategoryBySlug($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      uri
      description
      count
    }
  }
`;

export const GET_TAG_BY_SLUG = `
  query GetTagBySlug($slug: ID!) {
    tag(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      uri
      description
      count
    }
  }
`;

export const GET_POSTS_BY_CATEGORY = `
  query GetPostsByCategory($categoryName: String!, $first: Int = 10, $after: String) {
    posts(first: $first, after: $after, where: { categoryName: $categoryName, status: PUBLISH }) {
      nodes {
        ...PostCardFields
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${POST_CARD_FIELDS}
`;

export const GET_POSTS_BY_TAG = `
  query GetPostsByTag($tag: String!, $first: Int = 10, $after: String) {
    posts(first: $first, after: $after, where: { tag: $tag, status: PUBLISH }) {
      nodes {
        ...PostCardFields
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${POST_CARD_FIELDS}
`;
