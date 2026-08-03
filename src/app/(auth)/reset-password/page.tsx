import { updatePassword } from "@/app/(auth)/actions"
import { PasswordForm } from "@/components/auth/password-form"

// Reached after verifying the recovery OTP on /verify-otp (or via email link
// fallback through /auth/confirm). The user picks a new password here.
export default function ResetPasswordPage() {
  return (
    <PasswordForm
      action={updatePassword}
      title="Reset password"
      description="Enter a new password for your account."
      submitLabel="Update password"
    />
  )
}
