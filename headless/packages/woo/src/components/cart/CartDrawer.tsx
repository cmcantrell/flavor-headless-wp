"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "../../context/CartContext";

export function CartDrawer() {
  const {
    cart,
    loading,
    drawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeDrawer();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen, closeDrawer]);

  // Focus trap — focus the drawer when it opens
  useEffect(() => {
    if (drawerOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [drawerOpen]);

  const items = cart?.contents?.nodes ?? [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          drawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        tabIndex={-1}
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close cart"
            className="p-1 text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && items.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Loading cart...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Your cart is empty.</p>
          ) : (
            <ul className="space-y-4" role="list">
              {items.map((item) => {
                const product = item.product.node;
                const variation = item.variation?.node;
                const image = variation?.image ?? product.image;
                const displayName = product.name;
                const variationAttrs = variation?.attributes?.nodes ?? [];

                return (
                  <li
                    key={item.key}
                    className="flex gap-4 border-b border-gray-100 pb-4 last:border-0"
                  >
                    {/* Image */}
                    {image?.sourceUrl && (
                      <div className="w-16 h-16 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                        <Image
                          src={image.sourceUrl}
                          alt={image.altText || displayName}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {displayName}
                      </p>
                      {variationAttrs.length > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {variationAttrs.map((a) => `${a.name}: ${a.value}`).join(", ")}
                        </p>
                      )}

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-gray-200 rounded text-xs">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.key, Math.max(1, item.quantity - 1))
                            }
                            disabled={item.quantity <= 1}
                            aria-label={`Decrease quantity of ${displayName}`}
                            className="px-2 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-40"
                          >
                            -
                          </button>
                          <span className="px-2 py-1 min-w-[1.5rem] text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, item.quantity + 1)}
                            aria-label={`Increase quantity of ${displayName}`}
                            className="px-2 py-1 text-gray-600 hover:text-gray-900"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          aria-label={`Remove ${displayName} from cart`}
                          className="text-xs text-red-500 hover:text-red-700 ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div
                      className="text-sm font-medium text-gray-900 flex-shrink-0"
                      dangerouslySetInnerHTML={{ __html: item.total }}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-4 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span
                className="font-medium text-gray-900"
                dangerouslySetInnerHTML={{ __html: cart?.subtotal ?? "" }}
              />
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span className="text-gray-900">Total</span>
              <span
                className="text-gray-900"
                dangerouslySetInnerHTML={{ __html: cart?.total ?? "" }}
              />
            </div>

            <Link
              href="/shop/checkout"
              onClick={closeDrawer}
              className="block w-full text-center bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
