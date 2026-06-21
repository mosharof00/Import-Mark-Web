import { VerifyOtpForm } from "@/app/(auth)/verify-otp/verify-otp-form"

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; flow?: string }>
}) {
  const params = await searchParams
  return <VerifyOtpForm email={params.email ?? ""} />
}
