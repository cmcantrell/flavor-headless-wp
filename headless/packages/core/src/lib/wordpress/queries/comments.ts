/**
 * Comment queries and mutations
 */

import { COMMENT_FIELDS } from "../fragments";

export const GET_COMMENTS_BY_POST = `
  query GetCommentsByPost($postId: ID!) {
    post(id: $postId, idType: DATABASE_ID) {
      commentCount
      commentStatus
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
  ${COMMENT_FIELDS}
`;

export const CREATE_COMMENT = `
  mutation CreateComment(
    $commentOn: Int!
    $content: String!
    $author: String
    $authorEmail: String
    $parent: ID
  ) {
    createComment(
      input: {
        commentOn: $commentOn
        content: $content
        author: $author
        authorEmail: $authorEmail
        parent: $parent
      }
    ) {
      success
      comment {
        ...CommentFields
      }
    }
  }
  ${COMMENT_FIELDS}
`;
