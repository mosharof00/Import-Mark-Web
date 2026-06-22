import Link from "next/link"

import { cn } from "@/lib/utils"

import { REPORT_TAB_LABELS, type ReportTab } from "./report-filters"

export function ReportTabs({ active }: { active: ReportTab }) {
  const tabs = Object.keys(REPORT_TAB_LABELS) as ReportTab[]

  return (
    <div className="border-border flex flex-wrap gap-1 border-b">
      {tabs.map((tab) => {
        const isActive = tab === active
        return (
          <Link
            key={tab}
            href={
              tab === "overview"
                ? "/admin/reports"
                : `/admin/reports?tab=${tab}`
            }
            className={cn(
              "relative -mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {REPORT_TAB_LABELS[tab]}
          </Link>
        )
      })}
    </div>
  )
}
