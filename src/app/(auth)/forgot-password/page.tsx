import { ForgotPasswordForm } from "@/app/(auth)/forgot-password/forgot-password-form"

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>
}) {
  const params = await searchParams
  return <ForgotPasswordForm sent={params.sent === "1"} />
}
