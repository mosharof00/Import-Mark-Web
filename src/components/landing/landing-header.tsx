"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, LogOut, User } from "lucide-react"
import { motion } from "framer-motion"

import { BrandLogo } from "@/components/layout/brand-logo"
import { Avatar } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { buttonVariants } from "@/components/ui/button"
import { dashboardPathForRole, ROLE_HOME, type UserRole } from "@/lib/auth/roles"
import { cn } from "@/lib/utils"

const NAV = [
  { label: "Products", href: "/products" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
]

export function LandingHeader({
  user,
  role,
  displayName,
  email,
  avatarUrl,
  showRegistration,
}: {
  user: { id: string } | null
  role: UserRole | null
  displayName: string | null
  email: string | null
  avatarUrl: string | null
  showRegistration: boolean
}) {
  const pathname = usePathname()
  const dashboardHref = role ? dashboardPathForRole(role) : "/login"

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="border-border/60 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLogo href="/" className="shrink-0" />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && role && displayName ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label="Open account menu"
              >
                <Avatar name={displayName} src={avatarUrl} size="md" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold">{displayName}</p>
                  {email ? (
                    <p className="text-muted-foreground truncate text-xs">
                      {email}
                    </p>
                  ) : null}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href={dashboardHref} />}>
                  <LayoutDashboard />
                  Go to dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href={`${ROLE_HOME[role]}/profile`} />}
                >
                  <User />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" className="p-0">
                  <form action="/auth/signout" method="post" className="w-full">
                    <button
                      type="submit"
                      className="flex w-full items-center gap-1.5 rounded-md px-1.5 py-1 text-sm"
                    >
                      <LogOut />
                      Log out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Sign in
              </Link>
              {showRegistration ? (
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: "sm" }), "rounded-full px-4")}
                >
                  Register
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}
