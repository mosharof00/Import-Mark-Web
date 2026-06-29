import { Mail, Phone, Shield } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { EditProfileForm } from "@/components/shared/profile/edit-profile-form"
import { SecurityStatusCard } from "@/components/shared/profile/profile-tabs"
import { getCurrentProfile } from "@/lib/auth/get-profile"
import { requireRole } from "@/lib/auth/get-user"
import type { UserRole } from "@/lib/auth/roles"
import { formatDate } from "@/lib/format"
import type { UserStatus } from "@/types"

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Administrator",
  manager: "Manager",
  customer: "Customer",
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 text-sm">
      <Icon className="text-muted-foreground size-4 shrink-0" />
      <span className="text-muted-foreground w-28 shrink-0">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export async function ProfilePageContent({ role }: { role: UserRole }) {
  const { user } = await requireRole(role)
  const profile = await getCurrentProfile(user.id, role)
  if (!profile) return null

  const roleLabel = ROLE_LABEL[profile.role]
  const isActive =
    profile.role === "admin"
      ? profile.isActive
      : profile.status === "active"

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${roleLabel} Profile`}
        description="Update your personal information."
      />

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="border-border bg-card rounded-2xl border p-6 text-center shadow-sm">
            <div className="flex flex-col items-center">
              <Avatar
                name={profile.fullName}
                src={profile.avatarUrl}
                size="xl"
                className="mb-4"
              />
              <h2 className="text-xl font-semibold">{profile.fullName}</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                {profile.email}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {isActive ? (
                  <Badge>Active</Badge>
                ) : profile.status ? (
                  <StatusBadge kind="user" value={profile.status as UserStatus} />
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-1 border-t pt-4 text-left">
              <MetaRow icon={Shield} label="Role" value={roleLabel} />
              <MetaRow
                icon={Phone}
                label="Phone"
                value={profile.phone ?? "—"}
              />
              <MetaRow
                icon={Mail}
                label="Member since"
                value={formatDate(profile.createdAt)}
              />
              {profile.role === "customer" && profile.companyName ? (
                <MetaRow
                  icon={Shield}
                  label="Company"
                  value={profile.companyName}
                />
              ) : null}
            </div>
          </section>

          <SecurityStatusCard />
        </div>

        <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">Profile details</h2>
          <EditProfileForm profile={profile} />
        </section>
      </div>
    </div>
  )
}
