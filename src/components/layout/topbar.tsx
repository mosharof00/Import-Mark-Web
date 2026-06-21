import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Top bar shown above each role's content. Displays the signed-in user's name
 * and role, plus a sign-out button. Sign-out posts to the /auth/signout route
 * handler so it works without any client-side JavaScript.
 */
export function Topbar({
  displayName,
  roleLabel,
}: {
  displayName: string
  roleLabel: string
}) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium">{displayName}</span>
        <span className="text-muted-foreground text-xs">{roleLabel}</span>
      </div>

      <form action="/auth/signout" method="post">
        <Button type="submit" variant="ghost" size="sm">
          <LogOut className="size-4" />
          Sign out
        </Button>
      </form>
    </header>
  )
}
