import { getAuthedUser } from "@/lib/auth/get-user"
import { getCurrentProfile } from "@/lib/auth/get-profile"
import { getLandingSettings } from "@/lib/landing/get-landing-settings"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [{ user, role }, settings] = await Promise.all([
    getAuthedUser(),
    getLandingSettings(),
  ])

  const profile =
    user && role ? await getCurrentProfile(user.id, role) : null

  return (
    <div className="bg-background text-foreground min-h-screen">
      <LandingHeader
        user={user ? { id: user.id } : null}
        role={role}
        displayName={profile?.fullName ?? null}
        email={profile?.email ?? user?.email ?? null}
        avatarUrl={profile?.avatarUrl ?? null}
        showRegistration={settings.publicRegistration}
      />
      <main>{children}</main>
      <LandingFooter />
    </div>
  )
}
