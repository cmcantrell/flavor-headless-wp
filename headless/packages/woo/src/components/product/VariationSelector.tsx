"use client";

import type { ProductAttribute, ProductVariation } from "../../lib/types";

interface VariationSelectorProps {
  attributes: ProductAttribute[];
  variations: ProductVariation[];
  selectedAttributes: Record<string, string>;
  onAttributeChange: (name: string, value: string) => void;
}

/**
 * Normalize attribute names for comparison.
 * WooGraphQL can return "Color" at the product level but "pa_color" at the
 * variation level (taxonomy slug vs label). This normalizes both to a
 * comparable form.
 */
function normalizeAttrName(name: string): string {
  return name.toLowerCase().replace(/^pa_/, "").replace(/[-_]/g, " ").trim();
}

/**
 * Finds the variation matching all selected attributes.
 * Returns null if not all attributes are selected yet.
 *
 * WooGraphQL uses empty string for "any" (wildcard) attribute values.
 */
export function findMatchingVariation(
  variations: ProductVariation[],
  selectedAttributes: Record<string, string>,
  attributeCount: number,
): ProductVariation | null {
  const selectedCount = Object.values(selectedAttributes).filter(Boolean).length;
  if (selectedCount < attributeCount) return null;

  // Build a normalized lookup so "Color" matches "pa_color"
  const normalizedSelected: Record<string, string> = {};
  for (const [key, value] of Object.entries(selectedAttributes)) {
    normalizedSelected[normalizeAttrName(key)] = value;
  }

  return (
    variations.find((variation) => {
      const nodes = variation.attributes?.nodes ?? [];
      return nodes.every((node) => {
        const selected = normalizedSelected[normalizeAttrName(node.name)];
        if (!selected) return false;
        // Empty value in WooGraphQL = "any" (wildcard)
        if (node.value === "") return true;
        return node.value.toLowerCase() === selected.toLowerCase();
      });
    }) ?? null
  );
}

/**
 * Checks whether a specific option value for an attribute leads to any
 * available (not out-of-stock) variation, given the current selections.
 */
function isOptionAvailable(
  optionName: string,
  optionValue: string,
  selectedAttributes: Record<string, string>,
  variations: ProductVariation[],
): boolean {
  const hypothetical = { ...selectedAttributes, [optionName]: optionValue };

  const normalizedHypothetical: Record<string, string> = {};
  for (const [key, value] of Object.entries(hypothetical)) {
    normalizedHypothetical[normalizeAttrName(key)] = value;
  }

  return variations.some((variation) => {
    const nodes = variation.attributes?.nodes ?? [];
    const matches = nodes.every((node) => {
      const selected = normalizedHypothetical[normalizeAttrName(node.name)];
      if (!selected) return true; // unselected attribute — don't filter
      if (node.value === "") return true; // wildcard
      return node.value.toLowerCase() === selected.toLowerCase();
    });
    return matches && variation.stockStatus !== "OUT_OF_STOCK";
  });
}

export function VariationSelector({
  attributes,
  variations,
  selectedAttributes,
  onAttributeChange,
}: VariationSelectorProps) {
  return (
    <div className="space-y-4">
      {attributes.map((attr) => (
        <div key={attr.id}>
          <label
            htmlFor={`attr-${attr.name}`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {attr.name}
          </label>
          <select
            id={`attr-${attr.name}`}
            value={selectedAttributes[attr.name] ?? ""}
            onChange={(e) => onAttributeChange(attr.name, e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Choose an option</option>
            {attr.options.map((option) => {
              const available = isOptionAvailable(
                attr.name,
                option,
                selectedAttributes,
                variations,
              );
              return (
                <option key={option} value={option} disabled={!available}>
                  {option}
                  {!available ? " (Out of stock)" : ""}
                </option>
              );
            })}
          </select>
        </div>
      ))}
    </div>
  );
}
