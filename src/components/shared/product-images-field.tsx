"use client"

import type { FieldValues, Path, UseFormReturn } from "react-hook-form"

import { ImageUpload } from "@/components/shared/image-upload"
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

type ProductImagesForm = FieldValues & {
  name: string
  imageUrls?: string[]
}

export function ProductImagesField<T extends ProductImagesForm>({
  form,
  disabled,
}: {
  form: UseFormReturn<T>
  disabled?: boolean
}) {
  const productName = form.watch("name" as Path<T>)

  return (
    <FormField
      control={form.control}
      name={"imageUrls" as Path<T>}
      render={({ field }) => (
        <FormItem className="md:col-span-2">
          <FormControl>
            <ImageUpload
              kind="product"
              preferredName={String(productName ?? "")}
              multiple
              label="Product images"
              description="Images are stored under products/ in Supabase Storage. Removed images are deleted when you save."
              value={(field.value as string[] | undefined) ?? []}
              onChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
