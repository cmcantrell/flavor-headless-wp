import Link from "next/link";
import Image from "next/image";
import type { ProductCard as ProductCardType } from "../../lib/types";
import { StarRating } from "../review/StarRating";

interface ProductCardProps {
  product: ProductCardType;
}

export function ProductCard({ product }: ProductCardProps) {
  const hasImage = product.image?.sourceUrl;

  return (
    <article className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gray-100">
          {hasImage ? (
            <Image
              src={product.image!.sourceUrl}
              alt={product.image!.altText || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          {product.onSale && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
              Sale
            </span>
          )}
          {product.stockStatus === "OUT_OF_STOCK" && (
            <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded">
              Sold Out
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        {product.productCategories &&
          product.productCategories.nodes.length > 0 && (
            <div className="mb-1">
              <Link
                href={`/shop/category/${product.productCategories.nodes[0].slug}`}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                {product.productCategories.nodes[0].name}
              </Link>
            </div>
          )}

        <h2 className="text-sm font-medium text-gray-900 mb-1">
          <Link
            href={`/shop/${product.slug}`}
            className="hover:text-blue-600"
          >
            {product.name}
          </Link>
        </h2>

        {product.averageRating !== undefined && product.averageRating > 0 && (
          <div className="mb-1">
            <StarRating
              rating={product.averageRating}
              size="sm"
              count={product.reviewCount}
            />
          </div>
        )}

        {product.price && (
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-semibold text-gray-900"
              dangerouslySetInnerHTML={{ __html: product.price }}
            />
          </div>
        )}
      </div>
    </article>
  );
}
