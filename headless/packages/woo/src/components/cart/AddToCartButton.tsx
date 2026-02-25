"use client";

import { useState } from "react";
import { useCart } from "../../context/CartContext";

interface AddToCartButtonProps {
  productId: number;
  variationId?: number;
  stockStatus?: string;
  variationRequired?: boolean;
}

export function AddToCartButton({
  productId,
  variationId,
  stockStatus,
  variationRequired,
}: AddToCartButtonProps) {
  const { addToCart, isAdding } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const outOfStock = stockStatus === "OUT_OF_STOCK";
  const needsVariation = variationRequired && !variationId;
  const disabled = outOfStock || needsVariation || isAdding;

  const label = outOfStock
    ? "Out of Stock"
    : needsVariation
      ? "Select Options"
      : isAdding
        ? "Adding..."
        : "Add to Cart";

  async function handleAdd() {
    if (disabled) return;
    setError(null);
    try {
      await addToCart(productId, quantity, variationId);
      setQuantity(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add to cart.");
    }
  }

  return (
    <div className="flex items-center gap-3 mt-6">
      {!outOfStock && !needsVariation && (
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-40"
          >
            -
          </button>
          <span className="px-3 py-2 text-sm font-medium min-w-[2rem] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            aria-label="Increase quantity"
            className="px-3 py-2 text-gray-600 hover:text-gray-900"
          >
            +
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        className="flex-1 bg-blue-600 text-white px-6 py-2.5 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
      >
        {label}
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-600 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
