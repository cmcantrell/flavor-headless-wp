import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { wpFetch } from "@flavor/core/lib/wordpress/client";
import {
  GET_PRODUCT_CATEGORY_BY_SLUG,
  GET_PRODUCTS_BY_CATEGORY,
} from "@flavor/woo/lib/queries/products";
import { fetchProductArchiveData } from "@flavor/woo/lib/helpers";
import ProductList from "@flavor/woo/components/product/ProductList";
import type { ProductCategoryBySlugResponse } from "@flavor/woo/lib/types";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string) {
  try {
    const data = await wpFetch<ProductCategoryBySlugResponse>(
      GET_PRODUCT_CATEGORY_BY_SLUG,
      { slug },
    );
    return data.productCategory;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return { title: "Category Not Found" };
  return {
    title: category.name,
    description: category.description || undefined,
  };
}

export default async function ProductCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) notFound();

  const { products, pageInfo, productsPerPage } =
    await fetchProductArchiveData(GET_PRODUCTS_BY_CATEGORY, {
      categorySlug: slug,
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">
        {category.name}
      </h1>
      {category.description && (
        <p className="text-gray-600 mb-8">{category.description}</p>
      )}
      {!category.description && <div className="mb-8" />}
      <ProductList
        initialProducts={products}
        initialPageInfo={pageInfo}
        productsPerPage={productsPerPage}
        query={GET_PRODUCTS_BY_CATEGORY}
        queryVariables={{ categorySlug: slug }}
      />
    </div>
  );
}
