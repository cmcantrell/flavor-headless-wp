/**
 * Post / Blog queries
 */

import { POST_CARD_FIELDS, IMAGE_FIELDS, COMMENT_FIELDS } from "../fragments";

export const GET_POSTS = `
  query GetPosts($first: Int = 10, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
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

export const GET_POST_BY_SLUG = `
  query GetPostBySlug($slug: String!) {
    postBy(slug: $slug) {
      id
      databaseId
      title
      slug
      uri
      date
      modified
      content
      excerpt
      commentCount
      commentStatus
      featuredImage {
        node {
          ...ImageFields
        }
      }
      author {
        node {
          name
          slug
          avatar {
            url
          }
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
      tags {
        nodes {
          id
          name
          slug
        }
      }
      comments(first: 100, where: { parent: null, orderby: COMMENT_DATE }) {
        nodes {
          ...CommentFields
          replies(first: 100, where: { orderby: COMMENT_DATE }) {
            nodes {
              ...CommentFields
              replies(first: 100, where: { orderby: COMMENT_DATE }) {
                nodes {
                  ...CommentFields
                  replies(first: 100, where: { orderby: COMMENT_DATE }) {
                    nodes {
                      ...CommentFields
                      replies(first: 100, where: { orderby: COMMENT_DATE }) {
                        nodes {
                          ...CommentFields
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  ${IMAGE_FIELDS}
  ${COMMENT_FIELDS}
`;
