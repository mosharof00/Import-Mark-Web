export type ReportTab = "overview" | "profitability" | "receivables" | "payables"

export const REPORT_TAB_LABELS: Record<ReportTab, string> = {
  overview: "Overview",
  profitability: "Profitability",
  receivables: "Receivables",
  payables: "Payables",
}
