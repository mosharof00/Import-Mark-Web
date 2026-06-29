import { LoginForm } from "@/app/(auth)/login/login-form"
import { getPublicAppSettings } from "@/lib/settings/get-settings"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string }>
}) {
  const params = await searchParams
  const { public_customer_registration } = await getPublicAppSettings()

  return (
    <LoginForm
      justRegistered={params.registered === "1"}
      hadError={Boolean(params.error)}
      showRegistration={public_customer_registration}
    />
  )
}
