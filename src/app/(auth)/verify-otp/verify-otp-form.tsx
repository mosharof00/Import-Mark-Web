"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import {
  verifyCustomerOtp,
  verifyRecoveryOtp,
  verifyInviteOtp,
  resendRecoveryOtp,
  resendSignupOtp,
} from "@/app/(auth)/actions"
import { otpSchema, type OtpInput } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

export type OtpFlow = "signup" | "recovery" | "invite"

export function VerifyOtpForm({
  email,
  flow = "signup",
}: {
  email: string
  flow?: OtpFlow
}) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email, token: "" },
  })

  const title =
    flow === "recovery"
      ? "Enter reset code"
      : flow === "invite"
        ? "Accept your invite"
        : "Verify your email"

  const description =
    flow === "invite"
      ? `Enter the 6-digit invite code we sent to ${email || "your email"}.`
      : `Enter the 6-digit code we sent to ${email || "your email"}.`

  function onSubmit(values: OtpInput) {
    startTransition(async () => {
      const payload = {
        ...values,
        token: values.token.replace(/\s+/g, "").trim(),
      }
      const result =
        flow === "recovery"
          ? await verifyRecoveryOtp(payload)
          : flow === "invite"
            ? await verifyInviteOtp(payload)
            : await verifyCustomerOtp(payload)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  function onResend() {
    if (!email || flow === "invite") return
    startTransition(async () => {
      const result =
        flow === "recovery"
          ? await resendRecoveryOtp({ email })
          : await resendSignupOtp({ email })
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("A new code was sent. Check your inbox.")
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.replace(/\s+/g, ""))
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending
                ? "Verifying..."
                : flow === "recovery"
                  ? "Continue"
                  : flow === "invite"
                    ? "Accept invite"
                    : "Verify"}
            </Button>
          </form>
        </Form>

        <div className="mt-4 space-y-2 text-center text-sm">
          {flow !== "invite" ? (
            <button
              type="button"
              onClick={onResend}
              disabled={isPending || !email}
              className="text-foreground hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
            >
              Resend code
            </button>
          ) : (
            <p className="text-muted-foreground">
              Prefer the email button? Open your invite and click{" "}
              <span className="text-foreground">Accept invite</span>.
            </p>
          )}
          {flow === "recovery" ? (
            <p className="text-muted-foreground">
              <Link href="/forgot-password" className="hover:underline">
                Use a different email
              </Link>
            </p>
          ) : flow === "signup" ? (
            <p className="text-muted-foreground">
              Already verified?{" "}
              <Link href="/login" className="text-foreground hover:underline">
                Sign in
              </Link>
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
