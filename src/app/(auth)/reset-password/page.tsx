import { updatePassword } from "@/app/(auth)/actions"
import { PasswordForm } from "@/components/auth/password-form"

// Reached from a password-recovery email (via /auth/confirm, which establishes
// the recovery session). The user picks a new password here.
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
