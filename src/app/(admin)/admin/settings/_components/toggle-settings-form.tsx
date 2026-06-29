"use client"

import { SettingToggle } from "./setting-toggle"

export function ToggleSettingsForm({
  items,
  onChange,
}: {
  items: {
    key: string
    label: string
    description: string
    value: boolean
  }[]
  onChange: (key: string, value: boolean) => void
}) {
  return (
    <div className="divide-border divide-y">
      {items.map((item) => (
        <SettingToggle
          key={item.key}
          label={item.label}
          description={item.description}
          checked={item.value}
          onCheckedChange={(checked) => onChange(item.key, checked)}
        />
      ))}
    </div>
  )
}
