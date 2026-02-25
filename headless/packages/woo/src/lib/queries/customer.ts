/**
 * WooCommerce Customer Address Queries & Mutations
 *
 * Operation names: GetCustomerAddresses, UpdateCustomerAddresses
 * Both are in the NEVER_CACHE set in redis/client.ts.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CustomerAddress {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface GetCustomerAddressesResponse {
  customer: {
    billing: CustomerAddress | null;
    shipping: CustomerAddress | null;
  };
}

export interface UpdateCustomerAddressesResponse {
  updateCustomer: {
    customer: {
      billing: CustomerAddress | null;
      shipping: CustomerAddress | null;
    };
  };
}

// ---------------------------------------------------------------------------
// Fragment
// ---------------------------------------------------------------------------

const CUSTOMER_ADDRESS_FIELDS = `
  fragment CustomerAddressFields on CustomerAddress {
    firstName
    lastName
    email
    phone
    address1
    address2
    city
    state
    postcode
    country
  }
`;

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

export const GET_CUSTOMER_ADDRESSES = `
  query GetCustomerAddresses {
    customer {
      billing {
        ...CustomerAddressFields
      }
      shipping {
        ...CustomerAddressFields
      }
    }
  }
  ${CUSTOMER_ADDRESS_FIELDS}
`;

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

export const UPDATE_CUSTOMER_ADDRESSES = `
  mutation UpdateCustomerAddresses($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      customer {
        billing {
          ...CustomerAddressFields
        }
        shipping {
          ...CustomerAddressFields
        }
      }
    }
  }
  ${CUSTOMER_ADDRESS_FIELDS}
`;
