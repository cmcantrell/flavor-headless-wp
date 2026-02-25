import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { GET_PRODUCT_BY_SLUG } from "@flavor/woo/lib/queries/products";
import { GET_PRODUCT_REVIEWS } from "@flavor/woo/lib/queries/reviews";
import { ProductCard } from "@flavor/woo/components/product/ProductCard";
import { ProductDetails } from "@flavor/woo/components/product/ProductDetails";
import { ReviewSection } from "@flavor/woo/components/review/ReviewSection";
import type { ProductBySlugResponse, ProductReviewsResponse } from "@flavor/woo/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    const data = await wpFetch<ProductBySlugResponse>(GET_PRODUCT_BY_SLUG, {
      slug,
    });
    return data.product;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.name,
    description: product.shortDescription || undefined,
  };
}

async function getReviews(productDatabaseId: number) {
  try {
    const data = await wpFetch<ProductReviewsResponse>(GET_PRODUCT_REVIEWS, {
      productId: productDatabaseId,
    });
    return data.product;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  const reviewData = await getReviews(product.databaseId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ProductDetails product={product} />

      {/* Full description */}
      {product.description && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      {/* Reviews */}
      <ReviewSection
        productDatabaseId={product.databaseId}
        reviewsAllowed={product.reviewsAllowed ?? true}
        initialReviews={reviewData?.reviews?.edges ?? []}
        initialCount={reviewData?.reviewCount ?? 0}
        initialAverageRating={reviewData?.reviews?.averageRating ?? 0}
      />

      {/* Upsells */}
      {product.upsell && product.upsell.nodes.length > 0 && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.upsell.nodes.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Cross-sells */}
      {product.crossSell && product.crossSell.nodes.length > 0 && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Frequently Bought Together
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.crossSell.nodes.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Related products */}
      {product.related && product.related.nodes.length > 0 && (
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.related.nodes.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
