import { PageHeader } from "@/components/shared/page-header"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of approvals, orders, stock, and reports."
      />
      <p className="text-muted-foreground text-sm">
        Admin dashboard widgets will be built here next.
      </p>
    </div>
  )
}
