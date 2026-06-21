import { LoginForm } from "@/app/(auth)/login/login-form"

// Server page reads URL flags and passes them to the client form. Reading
// searchParams here avoids needing useSearchParams + Suspense in the client.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; error?: string }>
}) {
  const params = await searchParams

  return (
    <LoginForm
      justRegistered={params.registered === "1"}
      hadError={Boolean(params.error)}
    />
  )
}
