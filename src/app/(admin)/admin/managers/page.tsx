import { Suspense } from "react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"
import { AddAccountButton } from "@/components/shared/add-account-button"
import type { UserStatus } from "@/types"

import { ManagerList } from "./_components/manager-list"

export const dynamic = "force-dynamic"

const STATUSES: UserStatus[] = ["active", "pending", "inactive"]

function parseStatus(value: string | undefined): "all" | UserStatus {
  if (value && STATUSES.includes(value as UserStatus)) {
    return value as UserStatus
  }
  return "all"
}

export default async function AdminManagersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const status = parseStatus(statusParam)

  const supabase = await createClient()
  const countResults = await Promise.all([
    supabase.from("managers").select("id", { count: "exact", head: true }),
    ...STATUSES.map((s) =>
      supabase
        .from("managers")
        .select("id", { count: "exact", head: true })
        .eq("status", s)
    ),
  ])

  const counts = {
    all: countResults[0].count ?? 0,
    active: countResults[1].count ?? 0,
    pending: countResults[2].count ?? 0,
    inactive: countResults[3].count ?? 0,
  }

  const tabs: { key: "all" | UserStatus; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "active", label: `Active (${counts.active})` },
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "inactive", label: `Inactive (${counts.inactive})` },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Managers"
        description="Invite and manage staff manager accounts for the wholesale platform."
        action={
          <AddAccountButton href="/admin/managers/new" label="Add manager" />
        }
      />

      <div className="border-border flex flex-wrap gap-1 border-b">
        {tabs.map((tab) => {
          const active = status === tab.key
          const href =
            tab.key === "all"
              ? "/admin/managers"
              : `/admin/managers?status=${tab.key}`
          return (
            <a
              key={tab.key}
              href={href}
              className={
                active
                  ? "border-foreground text-foreground border-b-2 px-4 py-2.5 text-sm font-medium"
                  : "text-muted-foreground hover:text-foreground px-4 py-2.5 text-sm font-medium"
              }
            >
              {tab.label}
            </a>
          )
        })}
      </div>

      <FadeIn key={status}>
        <Suspense
          fallback={
            <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
              Loading…
            </div>
          }
        >
          <ManagerList status={status} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
