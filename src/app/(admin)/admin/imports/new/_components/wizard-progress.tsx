const STEPS = [
  { number: 1, label: "Supplier & docs" },
  { number: 2, label: "Add products" },
  { number: 3, label: "Landed costs" },
  { number: 4, label: "Review & confirm" },
] as const

export function ImportWizardProgress({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm font-medium">
        Step {step} of {STEPS.length}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STEPS.map((s) => {
          const isActive = s.number === step
          const isComplete = s.number < step
          return (
            <div key={s.number} className="flex min-w-0 items-center gap-2">
              <span
                className={
                  isActive
                    ? "bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                    : isComplete
                      ? "bg-primary/15 text-primary flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                      : "bg-muted text-muted-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                }
              >
                {s.number}
              </span>
              <span
                className={
                  isActive
                    ? "text-foreground truncate text-sm font-medium"
                    : "text-muted-foreground truncate text-sm"
                }
              >
                {s.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
