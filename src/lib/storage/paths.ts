import { STORAGE_FOLDERS } from "./constants"
import { fileExtension, sanitizeFilename } from "./validate"

export interface BuildUserImagePathInput {
  kind: "user"
  userId: string
  originalFilename: string
}

export interface BuildProductImagePathInput {
  kind: "product"
  preferredName: string
  originalFilename: string
  sequence?: number
}

export interface BuildBrandImagePathInput {
  kind: "brand"
  preferredName: string
  originalFilename: string
}

export interface BuildDeliveryImagePathInput {
  kind: "delivery"
  orderId: string
  originalFilename: string
}

export interface BuildPaymentImagePathInput {
  kind: "payment"
  orderId: string
  originalFilename: string
}

export type StoragePathInput =
  | BuildUserImagePathInput
  | BuildProductImagePathInput
  | BuildBrandImagePathInput
  | BuildDeliveryImagePathInput
  | BuildPaymentImagePathInput

/** Builds the object path (key) inside the `platform-media` bucket. */
export function buildStoragePath(input: StoragePathInput): string {
  const ext = fileExtension(input.originalFilename)

  switch (input.kind) {
    case "user":
      return `${STORAGE_FOLDERS.users}/${input.userId}.${ext}`
    case "product": {
      const base = sanitizeFilename(input.preferredName) || "product"
      const suffix =
        input.sequence && input.sequence > 0 ? ` ${input.sequence + 1}` : ""
      return `${STORAGE_FOLDERS.products}/${base}${suffix}.${ext}`
    }
    case "brand": {
      const base = sanitizeFilename(input.preferredName) || "brand"
      return `${STORAGE_FOLDERS.brands}/${base}.${ext}`
    }
    case "delivery":
      return `${STORAGE_FOLDERS.deliveries}/${input.orderId}.${ext}`
    case "payment": {
      const stamp = Date.now()
      return `${STORAGE_FOLDERS.payments}/${input.orderId}-${stamp}.${ext}`
    }
  }
}

/** Extracts the storage object path from a full public URL, if it belongs to our bucket. */
export function parseStoragePathFromUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/platform-media/"
  const index = url.indexOf(marker)
  if (index === -1) return null
  return decodeURIComponent(url.slice(index + marker.length))
}
