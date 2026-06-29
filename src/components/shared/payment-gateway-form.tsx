"use client"

import { useTransition } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import {
  paymentGatewaySchema,
  type CreatePaymentGatewayInput,
} from "@/lib/validations/payment-gateway"
import { PAYMENT_MODE_LABEL } from "@/lib/constants"
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
import { cn } from "@/lib/utils"
import type { PaymentGatewayStatus, PaymentMode } from "@/types"

const selectClassName = cn(
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-2.5 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
)

const PAYMENT_MODES = Object.keys(PAYMENT_MODE_LABEL) as PaymentMode[]
const GATEWAY_STATUSES: PaymentGatewayStatus[] = ["active", "inactive"]

type GatewayFormValues = CreatePaymentGatewayInput & { status?: PaymentGatewayStatus }

export function PaymentGatewayForm({
  defaultValues,
  showStatus = false,
  submitLabel,
  onSubmit,
}: {
  defaultValues?: Partial<GatewayFormValues>
  showStatus?: boolean
  submitLabel: string
  onSubmit: (values: GatewayFormValues) => Promise<{ error?: string } | void>
}) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<GatewayFormValues>({
    resolver: zodResolver(paymentGatewaySchema) as Resolver<GatewayFormValues>,
    defaultValues: {
      name: "",
      type: "bank_transfer",
      status: "active",
      accountName: "",
      accountNumber: "",
      bankName: "",
      branchName: "",
      routingNumber: "",
      instructions: "",
      sortOrder: 0,
      ...defaultValues,
    },
  })

  function handleSubmit(values: GatewayFormValues) {
    startTransition(async () => {
      const result = await onSubmit(values)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gateway name</FormLabel>
                  <FormControl>
                    <Input placeholder="bKash, DBBL Bank Transfer…" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment type</FormLabel>
                  <FormControl>
                    <select {...field} className={selectClassName}>
                      {PAYMENT_MODES.map((mode) => (
                        <option key={mode} value={mode}>
                          {PAYMENT_MODE_LABEL[mode]}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showStatus ? (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select {...field} className={selectClassName}>
                        {GATEWAY_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s === "active" ? "Active" : "Inactive"}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}
            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) =>
                        field.onChange(Number(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            Account details
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account / wallet number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="branchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="routingNumber"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Routing number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Instructions for staff</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={3}
                      className={cn(selectClassName, "h-auto resize-y py-2")}
                      placeholder="Payment reference format, branch hours, etc."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" className="rounded-full px-6" disabled={isPending}>
            {isPending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
