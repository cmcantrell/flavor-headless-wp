// @flavor/woo — barrel export

// Types
export type {
  Product,
  ProductCard,
  ProductVariation,
  ProductAttribute,
  ProductCategory,
  ProductTag,
  ProductsResponse,
  ProductBySlugResponse,
  ProductCategoryBySlugResponse,
  ProductCategoriesResponse,
  Cart,
  CartItem,
  Order,
} from "./lib/types";

// Fragments
export { PRODUCT_CARD_FIELDS, PRODUCT_FIELDS } from "./lib/fragments";

// Queries
export {
  GET_PRODUCTS,
  GET_PRODUCT_BY_SLUG,
  GET_PRODUCTS_BY_CATEGORY,
  GET_PRODUCT_CATEGORY_BY_SLUG,
  GET_PRODUCT_CATEGORIES,
} from "./lib/queries/products";

// Helpers
export { fetchProductArchiveData } from "./lib/helpers";
export type { ProductArchiveData } from "./lib/helpers";

// Components
export { ProductCard } from "./components/product/ProductCard";
export { default as ProductList } from "./components/product/ProductList";
export { ProductGallery } from "./components/product/ProductGallery";
