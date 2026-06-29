"use client"

import { useState } from "react"
import { KeyRound, ShieldCheck, UserRound } from "lucide-react"

import { cn } from "@/lib/utils"

type ProfileTab = "profile" | "password"

export function ProfileTabs({
  defaultTab = "profile",
  profilePanel,
  passwordPanel,
}: {
  defaultTab?: ProfileTab
  profilePanel: React.ReactNode
  passwordPanel: React.ReactNode
}) {
  const [tab, setTab] = useState<ProfileTab>(defaultTab)

  return (
    <section className="border-border bg-card rounded-2xl border shadow-sm">
      <div className="border-border flex items-center gap-2 border-b px-6 py-4">
        <UserRound className="text-muted-foreground size-5" />
        <h2 className="text-base font-semibold">Account Settings</h2>
      </div>

      <div className="border-border flex gap-1 border-b px-6 pt-4">
        <TabButton
          active={tab === "profile"}
          onClick={() => setTab("profile")}
          icon={UserRound}
          label="Profile"
        />
        <TabButton
          active={tab === "password"}
          onClick={() => setTab("password")}
          icon={KeyRound}
          label="Password"
        />
      </div>

      <div className="p-6">
        {tab === "profile" ? profilePanel : passwordPanel}
      </div>
    </section>
  )
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ComponentType<{ className?: string }>
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-primary text-primary border-b-2 bg-primary/5"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="size-4" />
      {label}
    </button>
  )
}

export function SecurityStatusCard({
  lastLoginLabel = "Recently",
}: {
  lastLoginLabel?: string
}) {
  return (
    <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="text-muted-foreground size-5" />
        <h2 className="text-base font-semibold">Security Status</h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950/40">
          <div>
            <p className="text-sm font-medium">Last Login</p>
            <p className="text-muted-foreground text-xs">{lastLoginLabel}</p>
          </div>
          <ShieldCheck className="size-5 text-green-600 dark:text-green-400" />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/40">
          <div>
            <p className="text-sm font-medium">Account Protection</p>
            <p className="text-muted-foreground text-xs">
              Password authentication enabled
            </p>
          </div>
          <KeyRound className="size-5 text-amber-600 dark:text-amber-400" />
        </div>
      </div>
    </section>
  )
}
