/**
 * WooCommerce Product Review Queries & Mutations
 *
 * Reviews use the Comment type with rating on the edge (not node).
 */

export const GET_PRODUCT_REVIEWS = `
  query GetProductReviews($productId: ID!) {
    product(id: $productId, idType: DATABASE_ID) {
      reviewCount
      reviewsAllowed
      reviews {
        averageRating
        edges {
          rating
          node {
            id
            databaseId
            content
            date
            author {
              node {
                name
                ... on CommentAuthor {
                  avatar {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const WRITE_REVIEW = `
  mutation WriteReview($input: WriteReviewInput!) {
    writeReview(input: $input) {
      rating
      clientMutationId
    }
  }
`;
