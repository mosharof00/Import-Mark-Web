"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
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
  createCustomerAccountSchema,
  type CreateCustomerAccountInput,
} from "@/lib/validations/staff-user"

export function CreateAccountForm({
  action,
  cancelHref,
  showCompany = false,
  submitLabel = "Create & send invite",
}: {
  action: (
    values: CreateCustomerAccountInput
  ) => Promise<{ error?: string; userId?: string } | void>
  cancelHref: string
  showCompany?: boolean
  submitLabel?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<CreateCustomerAccountInput>({
    resolver: zodResolver(createCustomerAccountSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      companyName: "",
    },
  })

  function onSubmit(values: CreateCustomerAccountInput) {
    startTransition(async () => {
      const result = await action(values)
      if (result && "error" in result && result.error) {
        toast.error(result.error)
        return
      }

      toast.success(
        "Invite sent. They must verify their email, then set a password."
      )
      router.push(cancelHref)
      router.refresh()
    })
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="border-border bg-card max-w-xl space-y-5 rounded-2xl border p-6 shadow-sm"
      >
        <p className="text-muted-foreground text-sm">
          We&apos;ll send an invite email with an{" "}
          <span className="text-foreground">Accept invite</span> button. The
          account is created as <span className="text-foreground">active</span>.
          They click the button to verify, then set a password. The invite
          expires in 1 hour.
        </p>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone (optional)</FormLabel>
              <FormControl>
                <Input type="tel" autoComplete="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showCompany ? (
          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company (optional)</FormLabel>
                <FormControl>
                  <Input autoComplete="organization" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-full px-5"
            disabled={isPending}
            onClick={() => router.push(cancelHref)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-full px-5"
            disabled={isPending}
          >
            {isPending ? "Sending invite..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
