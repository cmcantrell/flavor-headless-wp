/**
 * Search queries
 */

import { IMAGE_FIELDS } from "../fragments";

export const SEARCH_CONTENT = `
  query SearchContent($search: String!, $first: Int = 10, $after: String) {
    contentNodes(
      first: $first
      after: $after
      where: {
        search: $search
        contentTypes: [POST, PAGE]
      }
    ) {
      nodes {
        ... on Post {
          id
          databaseId
          title
          slug
          uri
          date
          excerpt
          featuredImage {
            node {
              ...ImageFields
            }
          }
          contentType {
            node {
              name
            }
          }
        }
        ... on Page {
          id
          databaseId
          title
          slug
          uri
          date
          contentType {
            node {
              name
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
  ${IMAGE_FIELDS}
`;
