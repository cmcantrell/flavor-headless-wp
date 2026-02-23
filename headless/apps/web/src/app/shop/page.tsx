import type { Metadata } from "next";
import { fetchProductArchiveData } from "@flavor/woo/lib/helpers";
import { GET_PRODUCTS } from "@flavor/woo/lib/queries/products";
import ProductList from "@flavor/woo/components/product/ProductList";

export const metadata: Metadata = {
  title: "Shop",
};

export default async function ShopPage() {
  const { products, pageInfo, productsPerPage } =
    await fetchProductArchiveData(GET_PRODUCTS, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shop</h1>
      <ProductList
        initialProducts={products}
        initialPageInfo={pageInfo}
        productsPerPage={productsPerPage}
      />
    </div>
  );
}
