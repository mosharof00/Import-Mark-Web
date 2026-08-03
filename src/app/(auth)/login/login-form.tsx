"use client"

import { useEffect, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { login } from "@/app/(auth)/actions"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"
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

export function LoginForm({
  justRegistered,
  errorCode,
  showRegistration = true,
  nextPath,
}: {
  justRegistered: boolean
  errorCode?: string | null
  showRegistration?: boolean
  nextPath?: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  // Surface one-off messages passed via the URL (after registration / errors).
  useEffect(() => {
    if (justRegistered) {
      toast.success("Email verified. Sign in with your password.")
    }
    if (errorCode === "invite_invalid") {
      toast.error(
        "This invite link is invalid or has expired. Ask your admin to send a new invite."
      )
    } else if (errorCode) {
      toast.error("Sign-in link was invalid or expired. Please try again.")
    }
  }, [justRegistered, errorCode])

  function onSubmit(values: LoginInput) {
    startTransition(async () => {
      const result = await login(values, nextPath)
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      router.push(result.redirectTo)
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Enter your email and password.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
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
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-muted-foreground text-xs hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>

        {showRegistration ? (
          <p className="text-muted-foreground mt-4 text-center text-sm">
            New customer?{" "}
            <Link
              href={
                nextPath
                  ? `/signup?next=${encodeURIComponent(nextPath)}`
                  : "/signup"
              }
              className="text-foreground hover:underline"
            >
              Create an account
            </Link>
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
