import { Suspense } from "react"
import Link from "next/link"

import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"
import { AddAccountButton } from "@/components/shared/add-account-button"
import { createClient } from "@/lib/supabase/server"
import type { UserStatus } from "@/types"
import { cn } from "@/lib/utils"

import { ManagerList } from "./_components/manager-list"

export const dynamic = "force-dynamic"

const STATUSES: UserStatus[] = ["active", "pending", "inactive"]

function parseStatus(value: string | undefined): "all" | UserStatus {
  if (value && STATUSES.includes(value as UserStatus)) {
    return value as UserStatus
  }
  return "all"
}

async function ManagerStatusTabs({
  status,
}: {
  status: "all" | UserStatus
}) {
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

  const tabs: { key: "all" | UserStatus; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "active", label: "Active", count: counts.active },
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "inactive", label: "Inactive", count: counts.inactive },
  ]

  return (
    <div className="border-border flex flex-wrap gap-1 border-b">
      {tabs.map((tab) => {
        const active = status === tab.key
        const href =
          tab.key === "all"
            ? "/admin/managers"
            : `/admin/managers?status=${tab.key}`
        return (
          <Link
            key={tab.key}
            href={href}
            prefetch
            className={cn(
              "relative -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-medium tabular-nums",
                active
                  ? "bg-muted text-foreground"
                  : "bg-muted/60 text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

function ManagerTabsFallback({ status }: { status: "all" | UserStatus }) {
  const tabs: { key: "all" | UserStatus; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "pending", label: "Pending" },
    { key: "inactive", label: "Inactive" },
  ]

  return (
    <div className="border-border flex flex-wrap gap-1 border-b">
      {tabs.map((tab) => {
        const active = status === tab.key
        const href =
          tab.key === "all"
            ? "/admin/managers"
            : `/admin/managers?status=${tab.key}`
        return (
          <Link
            key={tab.key}
            href={href}
            prefetch
            className={cn(
              "relative -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            <span className="bg-muted/40 inline-flex min-w-5 animate-pulse rounded-full px-1.5 py-0.5 text-xs text-transparent">
              0
            </span>
          </Link>
        )
      })}
    </div>
  )
}

export default async function AdminManagersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusParam } = await searchParams
  const status = parseStatus(statusParam)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Managers"
        description="Invite and manage staff manager accounts for the wholesale platform."
        action={
          <AddAccountButton href="/admin/managers/new" label="Add manager" />
        }
      />

      <Suspense fallback={<ManagerTabsFallback status={status} />}>
        <ManagerStatusTabs status={status} />
      </Suspense>

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
