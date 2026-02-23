/**
 * Author archive queries
 */

import { POST_CARD_FIELDS } from "../fragments";

export const GET_AUTHOR_BY_SLUG = `
  query GetAuthorBySlug($slug: ID!) {
    user(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      avatar {
        url
      }
    }
  }
`;

export const GET_POSTS_BY_AUTHOR = `
  query GetPostsByAuthor($authorName: String!, $first: Int = 10, $after: String) {
    posts(first: $first, after: $after, where: { authorName: $authorName, status: PUBLISH }) {
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
