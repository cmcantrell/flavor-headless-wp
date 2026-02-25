// @flavor/woo — barrel export

// Types
export type {
  Product,
  ProductCard as ProductCardType,
  ProductVariation,
  ProductAttribute,
  ProductCategory,
  ProductTag,
  ProductReview,
  ProductsResponse,
  ProductBySlugResponse,
  ProductCategoryBySlugResponse,
  ProductCategoriesResponse,
  ProductReviewsResponse,
  WriteReviewResponse,
  Cart,
  CartItem,
  GetCartResponse,
  AddToCartResponse,
  UpdateCartItemsResponse,
  RemoveCartItemsResponse,
  Order,
  ShippingRate,
  ShippingPackage,
  CustomerAddressInput,
  CheckoutInput,
  CheckoutResponse,
  UpdateShippingMethodResponse,
  PaymentGateway,
  PaymentGatewaysResponse,
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

export {
  GET_PRODUCT_REVIEWS,
  WRITE_REVIEW,
} from "./lib/queries/reviews";

export {
  GET_CART,
  ADD_TO_CART,
  UPDATE_CART_ITEM_QUANTITIES,
  REMOVE_CART_ITEMS,
} from "./lib/queries/cart";

export {
  GET_CHECKOUT_CART,
  UPDATE_SHIPPING_METHOD,
  CHECKOUT,
} from "./lib/queries/checkout";

export {
  GET_CUSTOMER_ADDRESSES,
  UPDATE_CUSTOMER_ADDRESSES,
} from "./lib/queries/customer";

export type {
  CustomerAddress,
  GetCustomerAddressesResponse,
  UpdateCustomerAddressesResponse,
} from "./lib/queries/customer";

// Helpers
export { fetchProductArchiveData } from "./lib/helpers";
export type { ProductArchiveData } from "./lib/helpers";

// Components
export { ProductCard } from "./components/product/ProductCard";
export { default as ProductList } from "./components/product/ProductList";
export { ProductGallery } from "./components/product/ProductGallery";
export { ProductDetails } from "./components/product/ProductDetails";
export { VariationSelector } from "./components/product/VariationSelector";
export { StarRating } from "./components/review/StarRating";
export { ReviewForm } from "./components/review/ReviewForm";
export { ReviewSection } from "./components/review/ReviewSection";

// Cart
export { CartProvider, useCart } from "./context/CartContext";
export { AddToCartButton } from "./components/cart/AddToCartButton";
export { CartDrawer } from "./components/cart/CartDrawer";
export { CartIcon } from "./components/cart/CartIcon";

// Shared
export { AddressFields, EMPTY_ADDRESS } from "./components/shared/AddressFields";

// Checkout
export { CheckoutForm } from "./components/checkout/CheckoutForm";
export { OrderSummary } from "./components/checkout/OrderSummary";

// Account
export { AddressForm } from "./components/account/AddressForm";
