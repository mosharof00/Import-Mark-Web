"use client"

import { useCallback, useRef, useState } from "react"
import { Copy, ImageIcon, Loader2, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  STORAGE_ACCEPT_ATTR,
  STORAGE_MAX_PRODUCT_IMAGES,
  uploadImageFile,
  removeImageAtUrl,
  type StoragePathInput,
} from "@/lib/storage"
import { cn } from "@/lib/utils"

type ImageUploadBaseProps = {
  kind: "user" | "product" | "brand" | "delivery" | "payment"
  label?: string
  description?: string
  className?: string
  disabled?: boolean
  /** Required for profile photos (`users/` folder). */
  userId?: string
  /** Required for delivery / payment proof photos. */
  orderId?: string
  /** Product or brand name — used for the storage filename. */
  preferredName?: string
  showUrlField?: boolean
  /** When false (default), removing an image only updates form state; the server deletes the file after a successful save. */
  deleteOnRemove?: boolean
}

type SingleImageUploadProps = ImageUploadBaseProps & {
  multiple?: false
  value?: string | null
  onChange?: (url: string) => void
}

type MultiImageUploadProps = ImageUploadBaseProps & {
  multiple: true
  value?: string[]
  onChange?: (urls: string[]) => void
  maxFiles?: number
}

export type ImageUploadProps = SingleImageUploadProps | MultiImageUploadProps

function buildPathInput(
  props: ImageUploadProps,
  filename: string,
  sequence: number
): StoragePathInput | null {
  const { kind, userId, preferredName, orderId } = props

  if (kind === "user") {
    if (!userId) return null
    return { kind: "user", userId, originalFilename: filename }
  }

  if (kind === "delivery") {
    if (!orderId) return null
    return { kind: "delivery", orderId, originalFilename: filename }
  }

  if (kind === "payment") {
    if (!orderId) return null
    return { kind: "payment", orderId, originalFilename: filename }
  }

  if (!preferredName?.trim()) {
    return null
  }

  if (kind === "product") {
    return {
      kind: "product",
      preferredName: preferredName.trim(),
      originalFilename: filename,
      sequence,
    }
  }

  return {
    kind: "brand",
    preferredName: preferredName.trim(),
    originalFilename: filename,
  }
}

function copyToClipboard(text: string) {
  void navigator.clipboard.writeText(text)
  toast.success("URL copied to clipboard")
}

export function ImageUpload(props: ImageUploadProps) {
  const {
    kind,
    label,
    description,
    className,
    disabled = false,
    showUrlField = false,
    deleteOnRemove = false,
    preferredName,
    multiple = false,
  } = props

  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)

  const urls = multiple
    ? (props as MultiImageUploadProps).value ?? []
    : (props as SingleImageUploadProps).value
      ? [(props as SingleImageUploadProps).value!]
      : []

  const maxFiles = multiple
    ? ((props as MultiImageUploadProps).maxFiles ?? STORAGE_MAX_PRODUCT_IMAGES)
    : 1

  const canAddMore = urls.length < maxFiles

  const setUrls = useCallback(
    (next: string[]) => {
      if (multiple) {
        ;(props as MultiImageUploadProps).onChange?.(next)
      } else {
        ;(props as SingleImageUploadProps).onChange?.(next[0] ?? "")
      }
    },
    [multiple, props]
  )

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      if (disabled || uploading) return

      const list = Array.from(files).filter((f) => f.type.startsWith("image/"))
      if (!list.length) {
        toast.error("Please choose an image file.")
        return
      }

      const slotsLeft = maxFiles - urls.length
      if (slotsLeft <= 0) {
        toast.error(`Maximum ${maxFiles} image${maxFiles === 1 ? "" : "s"} allowed.`)
        return
      }

      const batch = list.slice(0, slotsLeft)
      setUploading(true)

      const uploaded: string[] = []

      for (let i = 0; i < batch.length; i++) {
        const file = batch[i]!
        const pathInput = buildPathInput(props, file.name, urls.length + i)
        if (!pathInput) {
          toast.error(
            kind === "user"
              ? "User id is required."
              : kind === "delivery" || kind === "payment"
                ? "Order id is required."
                : "Enter a name first — it is used for the image filename."
          )
          setUploading(false)
          return
        }

        const result = await uploadImageFile(file, pathInput)
        if ("error" in result) {
          toast.error(result.error)
          break
        }
        uploaded.push(result.publicUrl)
      }

      if (uploaded.length) {
        const next = multiple ? [...urls, ...uploaded] : [uploaded[uploaded.length - 1]!]
        setUrls(next)
        toast.success(
          uploaded.length === 1 ? "Image uploaded" : `${uploaded.length} images uploaded`
        )
      }

      setUploading(false)
    },
    [disabled, kind, maxFiles, multiple, props, setUrls, uploading, urls]
  )

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      setIsDragging(false)
      if (event.dataTransfer.files?.length) {
        void uploadFiles(event.dataTransfer.files)
      }
    },
    [uploadFiles]
  )

  const removeUrl = async (url: string) => {
    if (deleteOnRemove) {
      const error = await removeImageAtUrl(url)
      if (error) {
        toast.error(error)
        return
      }
      toast.success("Image removed from storage")
    }
    setUrls(urls.filter((item) => item !== url))
  }

  return (
    <div className={cn("space-y-3", className)}>
      {label ? <Label>{label}</Label> : null}
      {description ? (
        <p className="text-muted-foreground text-sm">{description}</p>
      ) : null}

      {canAddMore ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault()
            if (!disabled) setIsDragging(true)
          }}
          onDragOver={(event) => {
            event.preventDefault()
            if (!disabled) setIsDragging(true)
          }}
          onDragLeave={(event) => {
            event.preventDefault()
            setIsDragging(false)
          }}
          onDrop={onDrop}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "border-border bg-muted/30 flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-center transition-colors",
            isDragging && "border-primary bg-primary/5",
            disabled && "pointer-events-none opacity-50",
            uploading && "pointer-events-none opacity-70"
          )}
        >
          {uploading ? (
            <Loader2 className="text-muted-foreground size-8 animate-spin" />
          ) : (
            <Upload className="text-muted-foreground size-8" />
          )}
          <div>
            <p className="text-sm font-medium">
              {uploading ? "Uploading…" : "Drag & drop an image here"}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              or click to browse · JPEG, PNG, WebP, GIF
            </p>
            {!preferredName?.trim() &&
            kind !== "user" &&
            kind !== "delivery" &&
            kind !== "payment" ? (
              <p className="text-amber-600 mt-2 text-xs dark:text-amber-400">
                Enter the {kind} name above before uploading.
              </p>
            ) : null}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={STORAGE_ACCEPT_ATTR}
            multiple={multiple}
            className="hidden"
            disabled={disabled || uploading}
            onChange={(event) => {
              if (event.target.files?.length) {
                void uploadFiles(event.target.files)
              }
              event.target.value = ""
            }}
          />
        </div>
      ) : null}

      {urls.length > 0 ? (
        <ul className="max-w-full space-y-3 overflow-hidden">
          {urls.map((url) => (
            <li
              key={url}
              className="border-border bg-card flex max-w-full items-center gap-3 overflow-hidden rounded-2xl border p-3 shadow-sm"
            >
              <div className="bg-muted relative size-16 shrink-0 overflow-hidden rounded-xl sm:size-20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="size-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                {showUrlField ? (
                  <div className="flex min-w-0 gap-2">
                    <Input
                      value={url}
                      readOnly
                      className="min-w-0 flex-1 font-mono text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      onClick={() => copyToClipboard(url)}
                      aria-label="Copy image URL"
                    >
                      <Copy />
                    </Button>
                  </div>
                ) : (
                  <p
                    className="text-muted-foreground truncate text-xs"
                    title={url}
                  >
                    {url.split("/").pop() ?? url}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="shrink-0"
                onClick={() => void removeUrl(url)}
                disabled={disabled || uploading}
                aria-label="Remove image"
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <ImageIcon className="size-4" />
          No image uploaded yet
        </div>
      )}

      {!deleteOnRemove && urls.length > 0 ? (
        <p className="text-muted-foreground text-xs">
          Removed images are deleted from storage when you save.
        </p>
      ) : null}
    </div>
  )
}
