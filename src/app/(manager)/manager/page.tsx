import { PageHeader } from "@/components/shared/page-header"

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Create orders, manage stock, and record payments."
      />
      <p className="text-muted-foreground text-sm">
        Manager dashboard widgets will be built here next.
      </p>
    </div>
  )
}
