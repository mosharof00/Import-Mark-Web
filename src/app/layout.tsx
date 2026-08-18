import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

import { brand } from "@/config/brand"
import { Toaster } from "@/components/ui/sonner"

// Geist is exposed as --font-sans so it maps to the theme token in globals.css.
const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: brand.name,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  icons: {
    icon: [
      { url: `${brand.logoIcon}?v=${brand.assetVersion}`, type: "image/png" },
    ],
    apple: `${brand.appleIcon}?v=${brand.assetVersion}`,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
