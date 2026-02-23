"use client";

import { useLoadMore } from "@flavor/core/lib/hooks/useLoadMore";
import { ProductCard } from "./ProductCard";
import { GET_PRODUCTS } from "../../lib/queries/products";
import type { ProductCard as ProductCardType } from "../../lib/types";
import type { ProductsResponse } from "../../lib/types";
import type { PageInfo } from "@flavor/core/lib/wordpress/types";

interface ProductListProps {
  initialProducts: ProductCardType[];
  initialPageInfo: PageInfo;
  productsPerPage: number;
  query?: string;
  queryVariables?: Record<string, unknown>;
}

const extractProducts = (data: ProductsResponse) => data.products.nodes;
const extractPageInfo = (data: ProductsResponse) => data.products.pageInfo;

export default function ProductList({
  initialProducts,
  initialPageInfo,
  productsPerPage,
  query = GET_PRODUCTS,
  queryVariables = {},
}: ProductListProps) {
  const {
    items: products,
    pageInfo,
    loading,
    loadMore,
  } = useLoadMore<ProductCardType, ProductsResponse>(
    initialProducts,
    initialPageInfo,
    query,
    queryVariables,
    productsPerPage,
    extractProducts,
    extractPageInfo,
  );

  if (products.length === 0) {
    return <p className="text-gray-500">No products found.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {pageInfo.hasNextPage && (
        <div className="mt-8 text-center" aria-live="polite">
          <button
            onClick={loadMore}
            disabled={loading}
            aria-busy={loading}
            className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading…" : "Load More"}
          </button>
        </div>
      )}
    </>
  );
}
