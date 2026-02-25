"use client";

import { useState, useEffect, type FormEvent } from "react";
import useSWR from "swr";
import { graphqlFetcher, volatileSWRConfig } from "@flavor/core/lib/swr";
import { useAuth } from "@flavor/core/context/AuthContext";
import {
  GET_CUSTOMER_ADDRESSES,
  UPDATE_CUSTOMER_ADDRESSES,
  type GetCustomerAddressesResponse,
  type UpdateCustomerAddressesResponse,
} from "../../lib/queries/customer";
import { AddressFields, EMPTY_ADDRESS } from "../shared/AddressFields";
import type { CustomerAddressInput } from "../../lib/types";

export function AddressForm() {
  const { user } = useAuth();

  // Fetch saved addresses
  const { data, isLoading } = useSWR<GetCustomerAddressesResponse>(
    user ? [GET_CUSTOMER_ADDRESSES] : null,
    graphqlFetcher,
    volatileSWRConfig,
  );

  // Form state
  const [billing, setBilling] = useState<CustomerAddressInput>({ ...EMPTY_ADDRESS });
  const [shipping, setShipping] = useState<CustomerAddressInput>({ ...EMPTY_ADDRESS });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Sync form from fetched data
  useEffect(() => {
    if (!data?.customer) return;

    const { billing: b, shipping: s } = data.customer;
    if (b) {
      setBilling({
        firstName: b.firstName ?? "",
        lastName: b.lastName ?? "",
        email: b.email ?? "",
        phone: b.phone ?? "",
        address1: b.address1 ?? "",
        address2: b.address2 ?? "",
        city: b.city ?? "",
        state: b.state ?? "",
        postcode: b.postcode ?? "",
        country: b.country || "US",
      });
    }
    if (s) {
      setShipping({
        firstName: s.firstName ?? "",
        lastName: s.lastName ?? "",
        email: s.email ?? "",
        phone: s.phone ?? "",
        address1: s.address1 ?? "",
        address2: s.address2 ?? "",
        city: s.city ?? "",
        state: s.state ?? "",
        postcode: s.postcode ?? "",
        country: s.country || "US",
      });

      // Determine if shipping matches billing
      const hasDifferentShipping = s.address1 && b &&
        (s.address1 !== b.address1 || s.city !== b.city || s.state !== b.state);
      if (hasDifferentShipping) {
        setSameAsBilling(false);
      }
    }
  }, [data]);

  const updateBilling = (field: keyof CustomerAddressInput, value: string) => {
    setBilling((prev) => ({ ...prev, [field]: value }));
  };

  const updateShipping = (field: keyof CustomerAddressInput, value: string) => {
    setShipping((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      await graphqlFetcher<UpdateCustomerAddressesResponse>([
        UPDATE_CUSTOMER_ADDRESSES,
        {
          input: {
            billing,
            shipping: sameAsBilling ? billing : shipping,
            shippingSameAsBilling: sameAsBilling,
          },
        },
      ]);

      setMessage({ type: "success", text: "Addresses saved successfully." });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save addresses.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-5 bg-gray-200 rounded w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Billing */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
        <AddressFields
          prefix="account-billing"
          values={billing}
          onChange={updateBilling}
          showEmailPhone
        />
      </div>

      {/* Shipping */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>

        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={sameAsBilling}
            onChange={(e) => setSameAsBilling(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Same as billing address</span>
        </label>

        {!sameAsBilling && (
          <AddressFields
            prefix="account-shipping"
            values={shipping}
            onChange={updateShipping}
          />
        )}
      </div>

      {/* Message */}
      {message && (
        <div
          role="alert"
          className={`text-sm p-3 rounded-md mb-4 ${
            message.type === "success"
              ? "text-green-700 bg-green-50"
              : "text-red-600 bg-red-50"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors"
      >
        {saving ? "Saving..." : "Save Addresses"}
      </button>
    </form>
  );
}
