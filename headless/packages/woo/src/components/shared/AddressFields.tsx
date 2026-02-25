/**
 * Shared Address Fields Component
 *
 * Extracted from CheckoutForm for reuse in checkout + account address management.
 * All exports are named — consumers pick what they need.
 */

import type { CustomerAddressInput } from "../../lib/types";

// ---------------------------------------------------------------------------
// Country & state data (WooGraphQL CountriesEnum uses ISO 3166 codes)
// ---------------------------------------------------------------------------

export const COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "CA", name: "Canada" },
  { code: "GB", name: "United Kingdom" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "AT", name: "Austria" },
  { code: "CH", name: "Switzerland" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "IE", name: "Ireland" },
  { code: "PT", name: "Portugal" },
  { code: "NZ", name: "New Zealand" },
  { code: "JP", name: "Japan" },
  { code: "SG", name: "Singapore" },
  { code: "HK", name: "Hong Kong" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "RO", name: "Romania" },
  { code: "HU", name: "Hungary" },
  { code: "GR", name: "Greece" },
];

const US_STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];

const CA_PROVINCES: { code: string; name: string }[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

function getStatesForCountry(countryCode: string): { code: string; name: string }[] | null {
  if (countryCode === "US") return US_STATES;
  if (countryCode === "CA") return CA_PROVINCES;
  return null;
}

// ---------------------------------------------------------------------------
// Empty address template
// ---------------------------------------------------------------------------

export const EMPTY_ADDRESS: CustomerAddressInput = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  postcode: "",
  country: "US",
};

// ---------------------------------------------------------------------------
// AddressFields component
// ---------------------------------------------------------------------------

export function AddressFields({
  prefix,
  values,
  onChange,
  showEmailPhone,
}: {
  prefix: string;
  values: CustomerAddressInput;
  onChange: (field: keyof CustomerAddressInput, value: string) => void;
  showEmailPhone?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor={`${prefix}-firstName`} className="block text-sm font-medium text-gray-700 mb-1">
          First name <span className="text-red-500">*</span>
        </label>
        <input
          id={`${prefix}-firstName`}
          type="text"
          required
          value={values.firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor={`${prefix}-lastName`} className="block text-sm font-medium text-gray-700 mb-1">
          Last name <span className="text-red-500">*</span>
        </label>
        <input
          id={`${prefix}-lastName`}
          type="text"
          required
          value={values.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {showEmailPhone && (
        <>
          <div>
            <label htmlFor={`${prefix}-email`} className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id={`${prefix}-email`}
              type="email"
              required
              value={values.email ?? ""}
              onChange={(e) => onChange("email", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor={`${prefix}-phone`} className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              id={`${prefix}-phone`}
              type="tel"
              value={values.phone ?? ""}
              onChange={(e) => onChange("phone", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </>
      )}

      <div className="sm:col-span-2">
        <label htmlFor={`${prefix}-address1`} className="block text-sm font-medium text-gray-700 mb-1">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          id={`${prefix}-address1`}
          type="text"
          required
          value={values.address1}
          onChange={(e) => onChange("address1", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${prefix}-address2`} className="block text-sm font-medium text-gray-700 mb-1">
          Address line 2
        </label>
        <input
          id={`${prefix}-address2`}
          type="text"
          value={values.address2 ?? ""}
          onChange={(e) => onChange("address2", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor={`${prefix}-city`} className="block text-sm font-medium text-gray-700 mb-1">
          City <span className="text-red-500">*</span>
        </label>
        <input
          id={`${prefix}-city`}
          type="text"
          required
          value={values.city}
          onChange={(e) => onChange("city", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {(() => {
        const states = getStatesForCountry(values.country);
        if (states) {
          return (
            <div>
              <label htmlFor={`${prefix}-state`} className="block text-sm font-medium text-gray-700 mb-1">
                State / Province <span className="text-red-500">*</span>
              </label>
              <select
                id={`${prefix}-state`}
                required
                value={values.state}
                onChange={(e) => onChange("state", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">Select...</option>
                {states.map((s) => (
                  <option key={s.code} value={s.code}>{s.name}</option>
                ))}
              </select>
            </div>
          );
        }
        return (
          <div>
            <label htmlFor={`${prefix}-state`} className="block text-sm font-medium text-gray-700 mb-1">
              State / Province <span className="text-red-500">*</span>
            </label>
            <input
              id={`${prefix}-state`}
              type="text"
              required
              value={values.state}
              onChange={(e) => onChange("state", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );
      })()}

      <div>
        <label htmlFor={`${prefix}-postcode`} className="block text-sm font-medium text-gray-700 mb-1">
          Postal code <span className="text-red-500">*</span>
        </label>
        <input
          id={`${prefix}-postcode`}
          type="text"
          required
          value={values.postcode}
          onChange={(e) => onChange("postcode", e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor={`${prefix}-country`} className="block text-sm font-medium text-gray-700 mb-1">
          Country <span className="text-red-500">*</span>
        </label>
        <select
          id={`${prefix}-country`}
          required
          value={values.country}
          onChange={(e) => {
            onChange("country", e.target.value);
            // Reset state when country changes (state codes differ per country)
            onChange("state", "");
          }}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
