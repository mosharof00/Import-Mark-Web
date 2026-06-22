import { Suspense } from "react"

import { PageHeader } from "@/components/shared/page-header"
import { FadeIn } from "@/components/shared/fade-in"

import { ReportStats } from "./_components/report-stats"
import { ReportTabs } from "./_components/report-tabs"
import { ReportOverview } from "./_components/report-overview"
import { ProfitabilityReport } from "./_components/profitability-report"
import { ReceivablesReport } from "./_components/receivables-report"
import { PayablesReport } from "./_components/payables-report"
import type { ReportTab } from "./_components/report-filters"
import {
  ReportStatsSkeleton,
  ReportPanelSkeleton,
  ReportTableSkeleton,
} from "./_components/skeletons"

export const dynamic = "force-dynamic"

const TABS: ReportTab[] = [
  "overview",
  "profitability",
  "receivables",
  "payables",
]

function parseTab(value: string | undefined): ReportTab {
  if (value && TABS.includes(value as ReportTab)) {
    return value as ReportTab
  }
  return "overview"
}

function ReportPanel({ tab }: { tab: ReportTab }) {
  switch (tab) {
    case "profitability":
      return <ProfitabilityReport />
    case "receivables":
      return <ReceivablesReport />
    case "payables":
      return <PayablesReport />
    default:
      return <ReportOverview />
  }
}

function panelSkeleton(tab: ReportTab) {
  return tab === "overview" ? <ReportPanelSkeleton /> : <ReportTableSkeleton />
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab: tabParam } = await searchParams
  const tab = parseTab(tabParam)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Business intelligence — revenue trends, product margins, customer receivables, and supplier payables."
      />

      <FadeIn delay={0}>
        <Suspense fallback={<ReportStatsSkeleton />}>
          <ReportStats />
        </Suspense>
      </FadeIn>

      <ReportTabs active={tab} />

      <FadeIn key={tab}>
        <Suspense fallback={panelSkeleton(tab)}>
          <ReportPanel tab={tab} />
        </Suspense>
      </FadeIn>
    </div>
  )
}
