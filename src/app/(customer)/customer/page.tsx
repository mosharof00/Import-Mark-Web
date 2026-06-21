import { PageHeader } from "@/components/shared/page-header"

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome"
        description="Browse products, place order requests, and track your dues."
      />
      <p className="text-muted-foreground text-sm">
        Your order history and ledger will appear here.
      </p>
    </div>
  )
}
