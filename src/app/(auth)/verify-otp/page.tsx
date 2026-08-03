import {
  VerifyOtpForm,
  type OtpFlow,
} from "@/app/(auth)/verify-otp/verify-otp-form"

export default async function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; flow?: string }>
}) {
  const params = await searchParams
  const flow: OtpFlow =
    params.flow === "recovery"
      ? "recovery"
      : params.flow === "invite"
        ? "invite"
        : "signup"

  return <VerifyOtpForm email={params.email ?? ""} flow={flow} />
}
