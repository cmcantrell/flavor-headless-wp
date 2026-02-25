"use client";

import { useCallback } from "react";
import useSWR from "swr";
import { graphqlFetcher } from "@flavor/core/lib/swr";
import { GET_PRODUCT_REVIEWS } from "../../lib/queries/reviews";
import type { ProductReview, ProductReviewsResponse } from "../../lib/types";
import { StarRating } from "./StarRating";
import { ReviewForm } from "./ReviewForm";

interface ReviewSectionProps {
  productDatabaseId: number;
  reviewsAllowed: boolean;
  initialReviews: ProductReview[];
  initialCount: number;
  initialAverageRating: number;
}

export function ReviewSection({
  productDatabaseId,
  reviewsAllowed,
  initialReviews,
  initialCount,
  initialAverageRating,
}: ReviewSectionProps) {
  const { data, mutate } = useSWR<ProductReviewsResponse>(
    [GET_PRODUCT_REVIEWS, { productId: productDatabaseId }],
    graphqlFetcher,
    {
      fallbackData: {
        product: {
          reviewCount: initialCount,
          reviewsAllowed,
          reviews: {
            averageRating: initialAverageRating,
            edges: initialReviews,
          },
        },
      },
      revalidateOnMount: false,
      dedupingInterval: 2000,
    },
  );

  const reviews = data?.product?.reviews?.edges ?? initialReviews;
  const reviewCount = data?.product?.reviewCount ?? initialCount;
  const averageRating =
    data?.product?.reviews?.averageRating ?? initialAverageRating;

  const handleReviewSuccess = useCallback(async () => {
    await mutate();
  }, [mutate]);

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {reviewCount > 0
            ? `${reviewCount} Review${reviewCount !== 1 ? "s" : ""}`
            : "Reviews"}
        </h2>
        {averageRating > 0 && (
          <StarRating
            rating={averageRating}
            size="md"
            showValue
            count={reviewCount}
          />
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="divide-y divide-gray-100 mb-8">
          {reviews.map((edge) => (
            <div key={edge.node.id} className="py-4">
              <div className="flex items-start gap-3">
                {edge.node.author?.node?.avatar?.url && (
                  <img
                    src={edge.node.author.node.avatar.url}
                    alt={edge.node.author.node.name}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm">
                      {edge.node.author?.node?.name || "Anonymous"}
                    </span>
                    <time className="text-xs text-gray-500">
                      {new Date(edge.node.date).toLocaleDateString()}
                    </time>
                  </div>
                  <StarRating rating={edge.rating} size="sm" />
                  <div
                    className="prose prose-sm max-w-none text-gray-700 mt-2"
                    dangerouslySetInnerHTML={{ __html: edge.node.content }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        reviewsAllowed && (
          <p className="text-gray-500 text-sm mb-6">
            No reviews yet. Be the first to review this product!
          </p>
        )
      )}

      {reviewsAllowed ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Write a Review
          </h3>
          <ReviewForm
            productDatabaseId={productDatabaseId}
            onSuccess={handleReviewSuccess}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Reviews are closed for this product.
        </p>
      )}
    </section>
  );
}
