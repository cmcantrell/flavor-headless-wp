/**
 * Shared helper for product archive pages.
 *
 * Mirrors fetchArchiveData() from @flavor/core/lib/wordpress/archive.ts.
 * Fetches postsPerPage from site settings and the first page of products.
 */

import { wpFetch } from "@flavor/core/lib/wordpress/client";
import { GET_SITE_SETTINGS } from "@flavor/core/lib/wordpress/queries/site";
import type { PageInfo } from "@flavor/core/lib/wordpress/types";
import type { ProductCard, ProductsResponse } from "./types";

interface SiteSettingsResponse {
  readingSettings: {
    postsPerPage: number;
  };
}

export interface ProductArchiveData {
  products: ProductCard[];
  pageInfo: PageInfo;
  productsPerPage: number;
}

const emptyPageInfo: PageInfo = {
  hasNextPage: false,
  hasPreviousPage: false,
  startCursor: "",
  endCursor: "",
};

export async function fetchProductArchiveData(
  query: string,
  variables: Record<string, unknown>,
): Promise<ProductArchiveData> {
  let productsPerPage = 12;
  try {
    const settings = await wpFetch<SiteSettingsResponse>(GET_SITE_SETTINGS);
    productsPerPage = settings.readingSettings?.postsPerPage ?? 12;
  } catch {
    // fall back to default
  }

  try {
    const data = await wpFetch<ProductsResponse>(query, {
      ...variables,
      first: productsPerPage,
    });
    return {
      products: data.products.nodes,
      pageInfo: data.products.pageInfo,
      productsPerPage,
    };
  } catch {
    return { products: [], pageInfo: emptyPageInfo, productsPerPage };
  }
}
