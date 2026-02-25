"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { graphqlFetcher, volatileSWRConfig } from "@flavor/core/lib/swr";
import { useAuth } from "@flavor/core/context/AuthContext";
import { useCart } from "../../context/CartContext";
import { OrderSummary } from "./OrderSummary";
import { CouponForm } from "../cart/CouponForm";
import { GET_CHECKOUT_CART } from "../../lib/queries/checkout";
import {
  GET_CUSTOMER_ADDRESSES,
  type GetCustomerAddressesResponse,
} from "../../lib/queries/customer";
import { AddressFields, EMPTY_ADDRESS } from "../shared/AddressFields";
import type { CustomerAddressInput, PaymentGateway, Cart } from "../../lib/types";

// ---------------------------------------------------------------------------
// CheckoutForm
// ---------------------------------------------------------------------------

interface CheckoutCartResponse {
  cart: Cart;
  paymentGateways: {
    nodes: PaymentGateway[];
  };
}

export function CheckoutForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, loading, updateShippingMethod, checkout } = useCart();

  // Fetch checkout-specific data (payment gateways + extended cart)
  const { data: checkoutData } = useSWR<CheckoutCartResponse>(
    [GET_CHECKOUT_CART],
    graphqlFetcher,
    volatileSWRConfig,
  );

  // Fetch saved customer addresses (logged-in users only)
  const { data: customerData } = useSWR<GetCustomerAddressesResponse>(
    user ? [GET_CUSTOMER_ADDRESSES] : null,
    graphqlFetcher,
    volatileSWRConfig,
  );

  const paymentGateways = checkoutData?.paymentGateways?.nodes ?? [];

  // Billing address (start with WP user name/email fallback)
  const [billing, setBilling] = useState<CustomerAddressInput>(() => ({
    ...EMPTY_ADDRESS,
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    email: user?.email ?? "",
  }));

  // Shipping address
  const [shipToBilling, setShipToBilling] = useState(true);
  const [shipping, setShipping] = useState<CustomerAddressInput>({ ...EMPTY_ADDRESS });

  // Pre-fill from saved WooCommerce addresses (once)
  const billingInitialized = useRef(false);
  useEffect(() => {
    if (billingInitialized.current || !customerData?.customer) return;

    const saved = customerData.customer.billing;
    if (saved?.address1) {
      billingInitialized.current = true;
      setBilling({
        firstName: saved.firstName || user?.firstName || "",
        lastName: saved.lastName || user?.lastName || "",
        email: saved.email || user?.email || "",
        phone: saved.phone ?? "",
        address1: saved.address1 ?? "",
        address2: saved.address2 ?? "",
        city: saved.city ?? "",
        state: saved.state ?? "",
        postcode: saved.postcode ?? "",
        country: saved.country || "US",
      });
    }

    const savedShipping = customerData.customer.shipping;
    if (savedShipping?.address1) {
      setShipping({
        firstName: savedShipping.firstName ?? "",
        lastName: savedShipping.lastName ?? "",
        email: savedShipping.email ?? "",
        phone: savedShipping.phone ?? "",
        address1: savedShipping.address1 ?? "",
        address2: savedShipping.address2 ?? "",
        city: savedShipping.city ?? "",
        state: savedShipping.state ?? "",
        postcode: savedShipping.postcode ?? "",
        country: savedShipping.country || "US",
      });

      // If saved shipping differs from billing, uncheck "ship to billing"
      if (saved?.address1 && (
        savedShipping.address1 !== saved.address1 ||
        savedShipping.city !== saved.city ||
        savedShipping.state !== saved.state
      )) {
        setShipToBilling(false);
      }
    }
  }, [customerData, user]);

  // Form state
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [shippingUpdating, setShippingUpdating] = useState(false);

  // Auto-select first gateway when data arrives
  if (paymentGateways.length > 0 && !paymentMethod) {
    setPaymentMethod(paymentGateways[0].id);
  }

  const needsShipping = cart?.needsShippingAddress ?? false;
  const shippingRates = cart?.availableShippingMethods?.[0]?.rates ?? [];
  const chosenMethod = cart?.chosenShippingMethods?.[0] ?? "";

  // Helpers for address updates
  const updateBilling = (field: keyof CustomerAddressInput, value: string) => {
    setBilling((prev) => ({ ...prev, [field]: value }));
  };

  const updateShipping = (field: keyof CustomerAddressInput, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  // Shipping method change
  async function handleShippingMethodChange(rateId: string) {
    setShippingUpdating(true);
    try {
      await updateShippingMethod(rateId);
    } catch {
      // Shipping method update failed silently — totals will remain as-is
    } finally {
      setShippingUpdating(false);
    }
  }

  // Validate required fields
  function validateForm(): string | null {
    if (!billing.firstName.trim()) return "Billing first name is required.";
    if (!billing.lastName.trim()) return "Billing last name is required.";
    if (!billing.email?.trim()) return "Email is required.";
    if (!billing.address1.trim()) return "Billing address is required.";
    if (!billing.city.trim()) return "Billing city is required.";
    if (!billing.state.trim()) return "Billing state is required.";
    if (!billing.postcode.trim()) return "Billing postal code is required.";
    if (!billing.country.trim()) return "Billing country is required.";

    if (needsShipping && !shipToBilling) {
      if (!shipping.firstName.trim()) return "Shipping first name is required.";
      if (!shipping.lastName.trim()) return "Shipping last name is required.";
      if (!shipping.address1.trim()) return "Shipping address is required.";
      if (!shipping.city.trim()) return "Shipping city is required.";
      if (!shipping.state.trim()) return "Shipping state is required.";
      if (!shipping.postcode.trim()) return "Shipping postal code is required.";
      if (!shipping.country.trim()) return "Shipping country is required.";
    }

    if (!paymentMethod) return "Please select a payment method.";

    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const order = await checkout({
        billing,
        shipping: needsShipping && !shipToBilling ? shipping : undefined,
        shipToDifferentAddress: needsShipping && !shipToBilling,
        paymentMethod,
        shippingMethod: chosenMethod ? [chosenMethod] : undefined,
      });

      // Stash order data so confirmation page doesn't need to re-fetch
      // (guest users can't query orders via GraphQL)
      sessionStorage.setItem(
        `order_${order.databaseId}`,
        JSON.stringify(order),
      );
      router.push(`/shop/order/${order.databaseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Loading / empty cart states
  if (loading) {
    return <p className="text-center text-gray-500 py-12">Loading checkout...</p>;
  }

  if (!cart || cart.contents.itemCount === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Your cart is empty.</p>
        <a
          href="/shop"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Continue Shopping
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column — form fields */}
        <div className="lg:col-span-2 space-y-8">
          {/* Billing Address */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Address</h2>
            <AddressFields
              prefix="billing"
              values={billing}
              onChange={updateBilling}
              showEmailPhone
            />
          </section>

          {/* Shipping Address (conditional) */}
          {needsShipping && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>

              <label className="flex items-center gap-2 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shipToBilling}
                  onChange={(e) => setShipToBilling(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Ship to billing address</span>
              </label>

              {!shipToBilling && (
                <AddressFields
                  prefix="shipping"
                  values={shipping}
                  onChange={updateShipping}
                />
              )}
            </section>
          )}

          {/* Shipping Method (conditional) */}
          {needsShipping && shippingRates.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Method</h2>

              <fieldset disabled={shippingUpdating}>
                <legend className="sr-only">Select a shipping method</legend>
                <div className="space-y-2">
                  {shippingRates.map((rate) => (
                    <label
                      key={rate.id}
                      className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                        chosenMethod === rate.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping_method"
                        value={rate.id}
                        checked={chosenMethod === rate.id}
                        onChange={() => handleShippingMethodChange(rate.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="flex-1 text-sm text-gray-900">{rate.label}</span>
                      <span
                        className="text-sm font-medium text-gray-900"
                        dangerouslySetInnerHTML={{
                          __html: parseFloat(rate.cost) === 0 ? "Free" : `$${rate.cost}`,
                        }}
                      />
                    </label>
                  ))}
                </div>
              </fieldset>

              {shippingUpdating && (
                <p className="text-xs text-gray-500 mt-2">Updating totals...</p>
              )}
            </section>
          )}

          {/* Payment */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
            {paymentGateways.length === 0 ? (
              <p className="text-sm text-gray-500">Loading payment methods...</p>
            ) : (
              <fieldset>
                <legend className="sr-only">Select a payment method</legend>
                <div className="space-y-2">
                  {paymentGateways.map((gw) => (
                    <label
                      key={gw.id}
                      className={`flex items-center gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
                        paymentMethod === gw.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={gw.id}
                        checked={paymentMethod === gw.id}
                        onChange={() => setPaymentMethod(gw.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-900">{gw.title}</span>
                        {gw.description && (
                          <p className="text-xs text-gray-500 mt-0.5">{gw.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </section>
        </div>

        {/* Right column — order summary + place order */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6 bg-gray-50 p-6 rounded-lg">
            <CouponForm />
            <OrderSummary cart={cart} />

            {error && (
              <div role="alert" className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || shippingUpdating}
              className="w-full bg-blue-600 text-white py-3 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
            >
              {submitting ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
