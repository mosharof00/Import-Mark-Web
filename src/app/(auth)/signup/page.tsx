import { redirect } from "next/navigation"

import { SignupForm } from "@/app/(auth)/signup/signup-form"
import { getPublicAppSettings } from "@/lib/settings/get-settings"

export default async function SignupPage() {
  const { public_customer_registration } = await getPublicAppSettings()
  if (!public_customer_registration) {
    redirect("/login")
  }

  return <SignupForm />
}
