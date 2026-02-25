"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { graphqlFetcher } from "@flavor/core/lib/swr";
import type { Order } from "@flavor/woo/lib/types";

const GET_ORDER = `
  query GetOrder($id: ID!) {
    order(id: $id, idType: DATABASE_ID) {
      databaseId
      orderNumber
      status
      total
      subtotal
      shippingTotal
      date
      billing {
        firstName
        lastName
        email
      }
      lineItems {
        nodes {
          quantity
          total
          product {
            node {
              id
              databaseId
              name
              slug
              type
            }
          }
        }
      }
    }
  }
`;

interface GetOrderResponse {
  order: Order | null;
}

function getSessionOrder(id: string): Order | null {
  try {
    const raw = sessionStorage.getItem(`order_${id}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // SSR or malformed JSON
  }
  return null;
}

export default function OrderConfirmationPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  // Read sessionStorage synchronously during initial render — avoids
  // React Strict Mode double-effect issues
  const cachedOrder = useRef(id ? getSessionOrder(id) : null);

  const [order, setOrder] = useState<Order | null>(cachedOrder.current);
  const [loading, setLoading] = useState(!cachedOrder.current);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Already have order data from sessionStorage — nothing to fetch
    if (cachedOrder.current) return;
    if (!id) return;

    // Fallback: fetch from GraphQL (works for logged-in users)
    graphqlFetcher<GetOrderResponse>([GET_ORDER, { id }])
      .then((data) => {
        setOrder(data.order);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load order.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-center text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-600 mb-4">
          {error ?? "Order not found. If you just placed an order, check your email for confirmation."}
        </p>
        <Link
          href="/shop"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-12 h-12 text-green-600 mx-auto mb-3"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Order Confirmed</h1>
        <p className="text-gray-600">
          Thank you for your order, {order.billing.firstName}!
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* Order details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Order number</p>
            <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-semibold text-gray-900 capitalize">{order.status?.replace(/_/g, " ") ?? "Pending"}</p>
          </div>
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-semibold text-gray-900">
              {new Date(order.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Total</p>
            <p
              className="font-semibold text-gray-900"
              dangerouslySetInnerHTML={{ __html: order.total }}
            />
          </div>
        </div>

        {/* Line items */}
        <div>
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Items</h2>
          <ul className="divide-y divide-gray-100" role="list">
            {order.lineItems.nodes.map((item, idx) => (
              <li key={idx} className="flex justify-between py-2 text-sm">
                <span className="text-gray-700">
                  {item.product.node.name} &times; {item.quantity}
                </span>
                <span
                  className="font-medium text-gray-900"
                  dangerouslySetInnerHTML={{ __html: item.total }}
                />
              </li>
            ))}
          </ul>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 pt-3 space-y-1 text-sm">
          {order.subtotal && (
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: order.subtotal }} />
            </div>
          )}
          {order.shippingTotal && (
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium text-gray-900" dangerouslySetInnerHTML={{ __html: order.shippingTotal }} />
            </div>
          )}
          <div className="flex justify-between font-semibold text-base border-t border-gray-200 pt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900" dangerouslySetInnerHTML={{ __html: order.total }} />
          </div>
        </div>

        {/* Billing info */}
        <div className="text-sm">
          <h2 className="font-semibold text-gray-900 mb-1">Billing Details</h2>
          <p className="text-gray-700">{order.billing.firstName} {order.billing.lastName}</p>
          <p className="text-gray-700">{order.billing.email}</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
