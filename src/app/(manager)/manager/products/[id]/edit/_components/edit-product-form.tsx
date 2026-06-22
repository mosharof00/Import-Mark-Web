"use client"

import { useTransition } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { updateProduct } from "@/app/(manager)/manager/products/actions"
import {
  updateProductSchema,
  type UpdateProductInput,
} from "@/lib/validations/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { cn } from "@/lib/utils"

type Option = { id: string; name: string }

const selectClassName = cn(
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-2.5 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
)

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-foreground text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </section>
  )
}

export function EditProductForm({
  productId,
  categories,
  brands,
  defaultValues,
  stockQuantity,
}: {
  productId: string
  categories: Option[]
  brands: Option[]
  defaultValues: UpdateProductInput
  stockQuantity: number | null
}) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema) as Resolver<UpdateProductInput>,
    defaultValues,
  })

  function onSubmit(values: UpdateProductInput) {
    startTransition(async () => {
      const result = await updateProduct(productId, values)
      if (result?.error) {
        toast.error(result.error)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormSection
          title="Basic information"
          description="Update details before resubmitting for approval."
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Product name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Sika ViscoCrete-3110" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. SKA-VC3110" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="originCountry"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origin country</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Switzerland" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <select
                    className={selectClassName}
                    value={field.value}
                    onChange={field.onChange}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brandId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <select
                    className={selectClassName}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  >
                    <option value="">No brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title="Pricing & unit">
          <FormField
            control={form.control}
            name="sellPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sell price (৳)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={Number.isFinite(field.value) ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? Number.NaN
                          : e.target.valueAsNumber
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 20L pail, 25kg bag" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unitSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit size</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    placeholder="Optional numeric size"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title="Stock alert">
          <FormItem>
            <FormLabel>Current stock</FormLabel>
            <p className="text-foreground text-lg font-semibold tabular-nums">
              {stockQuantity ?? "—"}
            </p>
            <FormDescription>
              Stock quantity is managed by admin after approval.
            </FormDescription>
          </FormItem>
          <FormField
            control={form.control}
            name="lowStockThreshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Low-stock threshold</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    value={Number.isFinite(field.value) ? field.value : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? 0
                          : e.target.valueAsNumber
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title="Details">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <textarea
                    rows={4}
                    className={cn(
                      selectClassName,
                      "h-auto min-h-[100px] py-2"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="specifications"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Specifications</FormLabel>
                <FormControl>
                  <textarea
                    rows={4}
                    className={cn(
                      selectClassName,
                      "h-auto min-h-[100px] py-2"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full px-6"
            disabled={isPending}
            onClick={() => form.reset(defaultValues)}
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="rounded-full px-8"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Resubmit for approval"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
