"use client"

import { useTransition } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import {
  createBrand,
  deleteBrand,
  updateBrand,
} from "@/app/(admin)/admin/brands/actions"
import { ImageUpload } from "@/components/shared/image-upload"
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
import { brandFormSchema, type BrandFormInput } from "@/lib/validations/brand"
import { cn } from "@/lib/utils"

const selectClassName = cn(
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-lg border px-2.5 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
)

export function BrandForm({
  brandId,
  defaultValues,
}: {
  brandId?: string
  defaultValues: BrandFormInput
}) {
  const [isPending, startTransition] = useTransition()
  const isEdit = Boolean(brandId)

  const form = useForm<BrandFormInput>({
    resolver: zodResolver(brandFormSchema) as Resolver<BrandFormInput>,
    defaultValues,
  })

  const brandName = form.watch("name")
  const logoUrl = form.watch("logoUrl")

  function onSubmit(values: BrandFormInput) {
    startTransition(async () => {
      const result = isEdit
        ? await updateBrand(brandId!, values)
        : await createBrand(values)
      if (result?.error) toast.error(result.error)
    })
  }

  function onDelete() {
    if (!brandId) return
    if (!window.confirm("Delete this brand permanently?")) return
    startTransition(async () => {
      const result = await deleteBrand(brandId)
      if (result?.error) toast.error(result.error)
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Brand name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Sika" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="countryOfOrigin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country of origin</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Switzerland" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <select
                      className={selectClassName}
                      value={field.value ? "active" : "inactive"}
                      onChange={(event) =>
                        field.onChange(event.target.value === "active")
                      }
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <ImageUpload
            kind="brand"
            preferredName={brandName}
            label="Brand logo"
            description="Stored under brands/ in Supabase Storage. The previous logo is removed after you save."
            value={logoUrl || null}
            onChange={(url) =>
              form.setValue("logoUrl", url, { shouldDirty: true })
            }
            disabled={isPending}
          />
        </section>

        <div className="flex flex-wrap justify-between gap-3">
          {isEdit ? (
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={onDelete}
            >
              Delete brand
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Create brand"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
