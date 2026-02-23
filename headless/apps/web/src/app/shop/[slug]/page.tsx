import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { GET_PRODUCT_BY_SLUG } from "@flavor/woo/lib/queries/products";
import { ProductGallery } from "@flavor/woo/components/product/ProductGallery";
import { ProductCard } from "@flavor/woo/components/product/ProductCard";
import type { ProductBySlugResponse } from "@flavor/woo/lib/types";
import Link from "next/link";

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

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery */}
        <ProductGallery
          mainImage={product.image}
          galleryImages={product.galleryImages?.nodes}
        />

        {/* Product Info */}
        <div>
          {product.productCategories &&
            product.productCategories.nodes.length > 0 && (
              <nav className="mb-2 flex gap-2" aria-label="Product categories">
                {product.productCategories.nodes.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop/category/${cat.slug}`}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {cat.name}
                  </Link>
                ))}
              </nav>
            )}

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {product.price && (
            <div className="mb-4">
              <span
                className="text-2xl font-semibold text-gray-900"
                dangerouslySetInnerHTML={{ __html: product.price }}
              />
              {product.onSale && product.regularPrice && (
                <span
                  className="ml-2 text-lg text-gray-500 line-through"
                  dangerouslySetInnerHTML={{ __html: product.regularPrice }}
                />
              )}
            </div>
          )}

          {product.stockStatus && (
            <p
              className={`text-sm mb-4 ${
                product.stockStatus === "IN_STOCK"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {product.stockStatus === "IN_STOCK"
                ? "In Stock"
                : product.stockStatus === "ON_BACKORDER"
                  ? "On Backorder"
                  : "Out of Stock"}
            </p>
          )}

          {product.shortDescription && (
            <div
              className="prose prose-sm text-gray-600 mb-6"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          )}

          {product.sku && (
            <p className="text-sm text-gray-500 mb-4">
              SKU: {product.sku}
            </p>
          )}

          {product.attributes && product.attributes.nodes.length > 0 && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Details
              </h2>
              <dl className="space-y-2">
                {product.attributes.nodes.map((attr) => (
                  <div key={attr.id} className="flex text-sm">
                    <dt className="font-medium text-gray-600 w-32">
                      {attr.name}
                    </dt>
                    <dd className="text-gray-900">{attr.options.join(", ")}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {product.productTags && product.productTags.nodes.length > 0 && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex gap-2 flex-wrap">
                {product.productTags.nodes.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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
