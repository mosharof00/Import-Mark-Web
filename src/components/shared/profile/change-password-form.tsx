"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  changePassword,
  requestChangePasswordOtp,
} from "@/lib/profile/actions"
import {
  changePasswordWithOtpSchema,
  type ChangePasswordWithOtpInput,
} from "@/lib/validations/auth"

export function ChangePasswordForm({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition()
  const [codeSent, setCodeSent] = useState(false)

  const form = useForm<ChangePasswordWithOtpInput>({
    resolver: zodResolver(changePasswordWithOtpSchema),
    defaultValues: { password: "", confirmPassword: "", token: "" },
  })

  function onSendCode() {
    startTransition(async () => {
      const result = await requestChangePasswordOtp()
      if (result?.error) {
        toast.error(result.error)
        return
      }
      setCodeSent(true)
      toast.success(result?.success ?? "Verification code sent.")
    })
  }

  function onSubmit(values: ChangePasswordWithOtpInput) {
    startTransition(async () => {
      const result = await changePassword(values)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(result?.success ?? "Password updated.")
      form.reset()
      setCodeSent(false)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <p className="text-muted-foreground text-sm">
          We&apos;ll email a 6-digit code to{" "}
          <span className="text-foreground font-medium">
            {email || "your account email"}
          </span>{" "}
          to confirm it&apos;s you before updating your password.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onSendCode}
            disabled={isPending || !email}
          >
            {isPending && !codeSent
              ? "Sending..."
              : codeSent
                ? "Resend code"
                : "Send verification code"}
          </Button>
          {codeSent ? (
            <span className="text-muted-foreground text-sm">
              Code sent to {email}. Check your inbox.
            </span>
          ) : null}
        </div>

        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification code</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="123456"
                  autoComplete="one-time-code"
                  disabled={!codeSent && !field.value}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending || !codeSent}>
            {isPending ? "Updating..." : "Update password"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
