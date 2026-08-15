/**
 * Buyer branding — edit this file and replace the matching files in `public/`.
 * Name, tagline, contact, and asset paths are the only values most downloads
 * need to change. Do not scatter brand strings across pages.
 */
export const brand = {
  name: "ImportMark",
  shortName: "IMPORTMARK",
  tagline: "Wholesale Platform",
  description:
    "Construction chemicals import & wholesale management platform.",

  /** Square mark used in the sidebar, header, and favicon fallback. */
  logoIcon: "/logo-icon.png",
  /** Horizontal lockup used on auth pages. */
  logoFull: "/logo-full.png",
  favicon: "/favicon.ico",
  appleIcon: "/apple-touch-icon.png",

  contact: {
    email: "info@importmark.com",
    phone: "+880 1314-859997",
    location: "Dhaka, Bangladesh",
  },
} as const

export type BrandConfig = typeof brand
