/**
 * WooCommerce Types for WooGraphQL
 *
 * Follows the Data + Response wrapper pattern from @flavor/core.
 * WooGraphQL uses union types for products (SimpleProduct, VariableProduct, etc.)
 * so many fields are shared across inline fragment spreads.
 */

import type { WPImage, PageInfo } from "@flavor/core/lib/wordpress/types";

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export interface ProductCategory {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
  image?: WPImage | null;
  parent?: {
    node: {
      id: string;
      slug: string;
      name: string;
    };
  } | null;
}

export interface ProductTag {
  id: string;
  name: string;
  slug: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  options: string[];
}

export interface ProductVariation {
  id: string;
  databaseId: number;
  name: string;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  stockStatus?: string;
  attributes?: {
    nodes: {
      name: string;
      value: string;
    }[];
  };
  image?: WPImage | null;
}

/** Lightweight product for listings (card view) */
export interface ProductCard {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  type: string;
  image?: WPImage | null;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  onSale?: boolean;
  stockStatus?: string;
  shortDescription?: string;
  averageRating?: number;
  reviewCount?: number;
  productCategories?: {
    nodes: ProductCategory[];
  };
}

/** Full product for single product pages */
export interface Product extends ProductCard {
  description?: string;
  sku?: string;
  galleryImages?: {
    nodes: WPImage[];
  };
  attributes?: {
    nodes: ProductAttribute[];
  };
  variations?: {
    nodes: ProductVariation[];
  };
  related?: {
    nodes: ProductCard[];
  };
  productTags?: {
    nodes: ProductTag[];
  };
}

// ---------------------------------------------------------------------------
// Response wrappers (match WPGraphQL response shapes)
// ---------------------------------------------------------------------------

export interface ProductsResponse {
  products: {
    nodes: ProductCard[];
    pageInfo: PageInfo;
  };
}

export interface ProductBySlugResponse {
  product: Product | null;
}

export interface ProductCategoryBySlugResponse {
  productCategory: ProductCategory | null;
}

export interface ProductCategoriesResponse {
  productCategories: {
    nodes: ProductCategory[];
  };
}

// ---------------------------------------------------------------------------
// Cart / Checkout stubs (Phase 2+)
// ---------------------------------------------------------------------------

export interface CartItem {
  key: string;
  quantity: number;
  total: string;
  product: {
    node: ProductCard;
  };
  variation?: {
    node: ProductVariation;
  } | null;
}

export interface Cart {
  contents: {
    nodes: CartItem[];
    itemCount: number;
  };
  subtotal: string;
  total: string;
}

export interface Order {
  id: string;
  databaseId: number;
  orderNumber: string;
  status: string;
  total: string;
  date: string;
  lineItems: {
    nodes: {
      quantity: number;
      total: string;
      product: {
        node: ProductCard;
      };
    }[];
  };
}
