import { BrandLogo } from "@/components/layout/brand-logo"

/**
 * Presentational layout for all auth pages (login, signup, OTP, password reset).
 *
 * It intentionally does NOT redirect authenticated users — some auth pages
 * (reset-password, set-password) require an active recovery/invite session.
 * The middleware is responsible for bouncing already-signed-in users away from
 * /login and /signup.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-muted/30 flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <BrandLogo href="/" variant="full" className="mx-auto" />
        </div>
        {children}
      </div>
    </div>
  )
}
