"use client";

import { useState, type FormEvent } from "react";
import { useCart } from "../../context/CartContext";

export function CouponForm() {
  const { cart, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [removingCode, setRemovingCode] = useState<string | null>(null);

  const appliedCoupons = cart?.appliedCoupons ?? [];

  async function handleApply(e: FormEvent) {
    e.preventDefault();
    const trimmed = code.trim();
    if (!trimmed) return;

    setError(null);
    setApplying(true);
    try {
      await applyCoupon(trimmed);
      setCode("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not apply coupon.",
      );
    } finally {
      setApplying(false);
    }
  }

  async function handleRemove(couponCode: string) {
    setError(null);
    setRemovingCode(couponCode);
    try {
      await removeCoupon(couponCode);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not remove coupon.",
      );
    } finally {
      setRemovingCode(null);
    }
  }

  return (
    <div>
      <form onSubmit={handleApply} className="flex gap-2">
        <label htmlFor="coupon-code" className="sr-only">
          Coupon code
        </label>
        <input
          id="coupon-code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Coupon code"
          disabled={applying}
          className="flex-1 min-w-0 border border-gray-300 rounded-md px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={applying || !code.trim()}
          className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
        >
          {applying ? "Applying..." : "Apply"}
        </button>
      </form>

      {error && (
        <p role="alert" className="text-sm text-red-600 mt-2">
          {error}
        </p>
      )}

      {appliedCoupons.length > 0 && (
        <ul className="mt-3 space-y-2" role="list">
          {appliedCoupons.map((coupon) => (
            <li
              key={coupon.code}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-700">
                <span className="font-medium uppercase">{coupon.code}</span>
                {coupon.discountAmount && (
                  <span
                    className="text-green-600 ml-1"
                    dangerouslySetInnerHTML={{
                      __html: `(-${coupon.discountAmount})`,
                    }}
                  />
                )}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(coupon.code)}
                disabled={removingCode === coupon.code}
                aria-label={`Remove coupon ${coupon.code}`}
                className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
              >
                {removingCode === coupon.code ? "Removing..." : "Remove"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
