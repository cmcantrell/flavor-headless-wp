/**
 * Page queries
 */

import { PAGE_FIELDS } from "../fragments";

export const GET_PAGE_BY_URI = `
  query GetPageByUri($uri: String!) {
    pageBy(uri: $uri) {
      ...PageFields
    }
  }
  ${PAGE_FIELDS}
`;

export const GET_FRONT_PAGE = `
  query GetFrontPage {
    nodeByUri(uri: "/") {
      ... on Page {
        ...PageFields
      }
    }
  }
  ${PAGE_FIELDS}
`;
