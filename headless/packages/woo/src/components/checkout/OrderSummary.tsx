"use client";

import Image from "next/image";
import type { Cart } from "../../lib/types";

interface OrderSummaryProps {
  cart: Cart;
}

export function OrderSummary({ cart }: OrderSummaryProps) {
  const items = cart.contents.nodes;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

      <ul className="divide-y divide-gray-200" role="list">
        {items.map((item) => {
          const product = item.product.node;
          const variation = item.variation?.node;
          const image = variation?.image ?? product.image;
          const variationAttrs = variation?.attributes?.nodes ?? [];

          return (
            <li key={item.key} className="flex gap-3 py-3">
              {image?.sourceUrl && (
                <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                  <Image
                    src={image.sourceUrl}
                    alt={image.altText || product.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {product.name}
                </p>
                {variationAttrs.length > 0 && (
                  <p className="text-xs text-gray-500">
                    {variationAttrs.map((a) => `${a.name}: ${a.value}`).join(", ")}
                  </p>
                )}
                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
              </div>

              <div
                className="text-sm font-medium text-gray-900 flex-shrink-0"
                dangerouslySetInnerHTML={{ __html: item.total }}
              />
            </li>
          );
        })}
      </ul>

      <div className="border-t border-gray-200 mt-3 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span
            className="font-medium text-gray-900"
            dangerouslySetInnerHTML={{ __html: cart.subtotal }}
          />
        </div>

        {cart.needsShippingAddress && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span
              className="font-medium text-gray-900"
              dangerouslySetInnerHTML={{ __html: cart.shippingTotal }}
            />
          </div>
        )}

        <div className="flex justify-between text-base font-semibold border-t border-gray-200 pt-2">
          <span className="text-gray-900">Total</span>
          <span
            className="text-gray-900"
            dangerouslySetInnerHTML={{ __html: cart.total }}
          />
        </div>
      </div>
    </div>
  );
}
