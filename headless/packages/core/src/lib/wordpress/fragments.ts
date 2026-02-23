/**
 * Reusable GraphQL Fragments for WPGraphQL
 */

export const IMAGE_FIELDS = `
  fragment ImageFields on MediaItem {
    sourceUrl
    altText
    mediaDetails {
      width
      height
    }
  }
`;

export const POST_CARD_FIELDS = `
  fragment PostCardFields on Post {
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
    author {
      node {
        name
      }
    }
    categories {
      nodes {
        id
        name
        slug
        uri
      }
    }
  }
  ${IMAGE_FIELDS}
`;

export const PAGE_FIELDS = `
  fragment PageFields on Page {
    id
    databaseId
    title
    slug
    uri
    content
    date
    modified
    featuredImage {
      node {
        ...ImageFields
      }
    }
  }
  ${IMAGE_FIELDS}
`;

export const COMMENT_FIELDS = `
  fragment CommentFields on Comment {
    id
    databaseId
    content
    date
    parentId
    author {
      node {
        ... on CommentAuthor {
          name
          avatar {
            url
          }
        }
        ... on User {
          name
          avatar {
            url
          }
        }
      }
    }
  }
`;

export const MENU_ITEM_FIELDS = `
  fragment MenuItemFields on MenuItem {
    id
    label
    uri
    path
    parentId
    cssClasses
  }
`;
