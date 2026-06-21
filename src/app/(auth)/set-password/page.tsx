import { setManagerPassword } from "@/app/(auth)/actions"
import { PasswordForm } from "@/components/auth/password-form"

// Manager first-time password (after verifying their invite email).
export default function SetPasswordPage() {
  return (
    <PasswordForm
      action={setManagerPassword}
      title="Set your password"
      description="Choose a password to finish setting up your account."
      submitLabel="Set password"
    />
  )
}
