"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Minus, Plus, X, ZoomIn } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const MIN_ZOOM = 1
const MAX_ZOOM = 5

function clampZoom(value: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
}

function touchDistance(touches: React.TouchList) {
  const [a, b] = [touches[0], touches[1]]
  const dx = a.clientX - b.clientX
  const dy = a.clientY - b.clientY
  return Math.hypot(dx, dy)
}

export function ProductImageGallery({
  imageUrls,
  alt,
}: {
  imageUrls: string[]
  alt: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const lastPointer = useRef({ x: 0, y: 0 })
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  const activeUrl = imageUrls[activeIndex] ?? null

  const resetZoom = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    if (!lightboxOpen) resetZoom()
  }, [lightboxOpen, resetZoom])

  useEffect(() => {
    resetZoom()
  }, [activeIndex, resetZoom])

  function adjustZoom(delta: number) {
    setZoom((current) => {
      const next = clampZoom(current + delta)
      if (next === 1) setPan({ x: 0, y: 0 })
      return next
    })
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault()
    const direction = event.deltaY < 0 ? 1 : -1
    const step = zoom < 2 ? 0.25 : 0.5
    adjustZoom(direction * step)
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (zoom <= 1) return
    setIsDragging(true)
    lastPointer.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || zoom <= 1) return
    const dx = event.clientX - lastPointer.current.x
    const dy = event.clientY - lastPointer.current.y
    lastPointer.current = { x: event.clientX, y: event.clientY }
    setPan((current) => ({ x: current.x + dx, y: current.y + dy }))
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    setIsDragging(false)
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (event.touches.length === 2) {
      pinchStart.current = {
        distance: touchDistance(event.touches),
        zoom,
      }
    }
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (event.touches.length !== 2 || !pinchStart.current) return
    event.preventDefault()
    const distance = touchDistance(event.touches)
    const ratio = distance / pinchStart.current.distance
    const next = clampZoom(pinchStart.current.zoom * ratio)
    setZoom(next)
    if (next === 1) setPan({ x: 0, y: 0 })
  }

  function handleTouchEnd() {
    pinchStart.current = null
  }

  function handleDoubleClick() {
    if (zoom > 1) {
      resetZoom()
      return
    }
    setZoom(2)
  }

  if (!imageUrls.length) {
    return (
      <div className="bg-muted overflow-hidden rounded-[2rem]">
        <div className="text-muted-foreground flex aspect-square items-center justify-center">
          No image
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-muted overflow-hidden rounded-[2rem]">
        <div className="grid gap-3 p-3">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group relative aspect-square w-full overflow-hidden rounded-[1.5rem] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={`View ${alt} full size`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeUrl!}
              alt={alt}
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <span className="pointer-events-none absolute inset-0 flex items-end justify-end bg-gradient-to-t from-black/25 via-transparent to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white">
                <ZoomIn className="size-3.5" />
                Click to zoom
              </span>
            </span>
          </button>

          {imageUrls.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {imageUrls.map((url, index) => {
                const selected = index === activeIndex
                return (
                  <button
                    key={`${url}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:w-24",
                      selected
                        ? "border-foreground"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                    aria-label={`Show image ${index + 1} of ${imageUrls.length}`}
                    aria-current={selected ? "true" : undefined}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="size-full object-cover"
                    />
                  </button>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="fixed inset-0 top-0 left-0 flex h-dvh w-dvw max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 bg-black/95 p-0 shadow-none ring-0"
        >
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <DialogDescription className="sr-only">
            Product image viewer. Scroll or pinch to zoom. Drag to pan when
            zoomed in.
          </DialogDescription>

          <div className="flex items-center justify-between gap-3 px-4 py-3 text-white">
            <p className="truncate text-sm font-medium">
              {activeIndex + 1} / {imageUrls.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => adjustZoom(-0.5)}
                aria-label="Zoom out"
              >
                <Minus className="size-4" />
              </Button>
              <span className="w-12 text-center text-xs tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => adjustZoom(0.5)}
                aria-label="Zoom in"
              >
                <Plus className="size-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => setLightboxOpen(false)}
                aria-label="Close image viewer"
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>

          <div
            ref={viewportRef}
            className={cn(
              "relative min-h-0 flex-1 touch-none select-none overflow-hidden",
              zoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
            )}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleDoubleClick}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeUrl!}
              alt={alt}
              draggable={false}
              className="pointer-events-none absolute top-1/2 left-1/2 max-h-full max-w-full object-contain"
              style={{
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${zoom})`,
                transition: isDragging ? "none" : "transform 120ms ease-out",
              }}
            />
          </div>

          {imageUrls.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto border-t border-white/10 px-4 py-3">
              {imageUrls.map((url, index) => {
                const selected = index === activeIndex
                return (
                  <button
                    key={`lightbox-${url}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "aspect-square w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                      selected
                        ? "border-white"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                    aria-label={`Show image ${index + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="size-full object-cover"
                    />
                  </button>
                )
              })}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
