/** Formats address fields as a single-line delivery string. */
export function formatCustomerAddress(
  address: {
    address_line_1?: string
    address_line_2?: string | null
    addressLine1?: string
    addressLine2?: string | null
    city: string
    state_province?: string | null
    stateProvince?: string | null
    postal_code?: string | null
    postalCode?: string | null
    country: string
  }
): string {
  const line1 = address.address_line_1 ?? address.addressLine1 ?? ""
  const line2 = address.address_line_2 ?? address.addressLine2 ?? null
  const state = address.state_province ?? address.stateProvince ?? null
  const postal = address.postal_code ?? address.postalCode ?? null
  const parts = [line1, line2, address.city, state, postal, address.country].filter(
    Boolean
  )
  return parts.join(", ")
}
