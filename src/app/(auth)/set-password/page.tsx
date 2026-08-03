import { setInvitedUserPassword } from "@/app/(auth)/actions"
import { PasswordForm } from "@/components/auth/password-form"

// After accepting an invite (link or OTP), the user chooses their password.
export default function SetPasswordPage() {
  return (
    <PasswordForm
      action={setInvitedUserPassword}
      title="Set your password"
      description="Choose a password to finish setting up your ImportMark account."
      submitLabel="Set password"
    />
  )
}
