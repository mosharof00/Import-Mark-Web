import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/lib/supabase/server"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { formatDate } from "@/lib/format"
import type { UserStatus } from "@/types"

export const dynamic = "force-dynamic"

export default async function AdminManagerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: manager } = await supabase
    .from("managers")
    .select("id, full_name, email, phone, status, created_at, avatar_url")
    .eq("id", id)
    .maybeSingle()

  if (!manager) notFound()

  return (
    <div className="space-y-6">
      <Link
        href="/admin/managers"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeft className="size-4" />
        Back to managers
      </Link>

      <PageHeader
        title={manager.full_name}
        description={manager.email}
        action={
          <StatusBadge kind="user" value={manager.status as UserStatus} />
        }
      />

      <section className="border-border bg-card divide-border max-w-xl divide-y rounded-2xl border shadow-sm">
        <MetaRow label="Full name" value={manager.full_name} />
        <MetaRow label="Email" value={manager.email} />
        <MetaRow label="Phone" value={manager.phone ?? "—"} />
        <MetaRow label="Status" value={manager.status} />
        <MetaRow label="Created" value={formatDate(manager.created_at)} />
      </section>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground text-right font-medium">{value}</span>
    </div>
  )
}
