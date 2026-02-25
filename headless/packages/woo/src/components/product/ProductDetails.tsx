"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Product } from "../../lib/types";
import { ProductGallery } from "./ProductGallery";
import { StarRating } from "../review/StarRating";
import { VariationSelector, findMatchingVariation } from "./VariationSelector";
import { AddToCartButton } from "../cart/AddToCartButton";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const attributes = product.attributes?.nodes ?? [];
  const variations = product.variations?.nodes ?? [];
  const isVariable = product.type === "VARIABLE" && variations.length > 0;

  // Auto-select attributes that only have one option
  const initialAttributes: Record<string, string> = {};
  if (isVariable) {
    for (const attr of attributes) {
      if (attr.options.length === 1) {
        initialAttributes[attr.name] = attr.options[0];
      }
    }
  }

  const [selectedAttributes, setSelectedAttributes] =
    useState<Record<string, string>>(initialAttributes);

  const selectedVariation = useMemo(
    () =>
      isVariable
        ? findMatchingVariation(variations, selectedAttributes, attributes.length)
        : null,
    [isVariable, variations, selectedAttributes, attributes.length],
  );

  // Derive display values — fall back to product-level when no variation selected
  const displayPrice = selectedVariation?.price ?? product.price;
  const displayRegularPrice =
    selectedVariation?.regularPrice ?? product.regularPrice;
  const displayStockStatus =
    selectedVariation?.stockStatus ?? product.stockStatus;
  const displayOnSale = selectedVariation
    ? !!(selectedVariation.salePrice && selectedVariation.regularPrice)
    : product.onSale;

  // Gallery image: use variation image if it exists
  const galleryMainImage = selectedVariation?.image ?? product.image;

  function handleAttributeChange(name: string, value: string) {
    setSelectedAttributes((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Gallery — key forces remount to reset selectedIndex on image swap */}
      <ProductGallery
        key={galleryMainImage?.sourceUrl ?? "default"}
        mainImage={galleryMainImage}
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {product.name}
        </h1>

        {product.averageRating !== undefined && product.averageRating > 0 && (
          <div className="mb-4">
            <StarRating
              rating={product.averageRating}
              size="md"
              showValue
              count={product.reviewCount}
            />
          </div>
        )}

        {displayPrice && (
          <div className="mb-4">
            <span
              className="text-2xl font-semibold text-gray-900"
              dangerouslySetInnerHTML={{ __html: displayPrice }}
            />
            {displayOnSale && displayRegularPrice && (
              <span
                className="ml-2 text-lg text-gray-500 line-through"
                dangerouslySetInnerHTML={{ __html: displayRegularPrice }}
              />
            )}
          </div>
        )}

        {displayStockStatus && (
          <p
            className={`text-sm mb-4 ${
              displayStockStatus === "IN_STOCK"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {displayStockStatus === "IN_STOCK"
              ? "In Stock"
              : displayStockStatus === "ON_BACKORDER"
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

        {/* Variation selectors for variable products, static table otherwise */}
        {isVariable ? (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <VariationSelector
              attributes={attributes}
              variations={variations}
              selectedAttributes={selectedAttributes}
              onAttributeChange={handleAttributeChange}
            />
          </div>
        ) : (
          attributes.length > 0 && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Details
              </h2>
              <dl className="space-y-2">
                {attributes.map((attr) => (
                  <div key={attr.id} className="flex text-sm">
                    <dt className="font-medium text-gray-600 w-32">
                      {attr.name}
                    </dt>
                    <dd className="text-gray-900">{attr.options.join(", ")}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        )}

        <AddToCartButton
          productId={product.databaseId}
          variationId={selectedVariation?.databaseId}
          stockStatus={displayStockStatus}
          variationRequired={isVariable && !selectedVariation}
        />

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
  );
}
