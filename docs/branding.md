# Branding (logo, name, tagline)

Buyers should rebrand from **two places only**. Do not search the codebase for the product name.

## 1. Replace logo files

Drop replacements into `public/` using the **same filenames**:

| File | Purpose | Recommended size |
|------|---------|------------------|
| `public/logo-icon.png` | Sidebar / header mark | **512×512** PNG, transparent background |
| `public/logo-full.png` | Auth / login lockup | **~1200×400** (or SVG), transparent background |
| `public/favicon.ico` | Browser tab | 32×32 (multi-size ICO is fine) |
| `public/apple-touch-icon.png` | iOS home screen | **180×180** or **512×512** PNG |

Keep the filenames. Only swap the image contents.

## 2. Edit the config

Open `src/config/brand.ts` and change:

- `name` — product name shown in the browser title and copy
- `shortName` — header wordmark (often all-caps)
- `tagline` — subtitle under the wordmark
- `description` — SEO / meta description
- `contact.email`, `contact.phone`, `contact.location` — landing page contact block
- `assetVersion` — **bump this** (e.g. `"1"` → `"2"`) every time you replace logo files

Asset paths default to the files above. Change a path only if you rename a file.

Then:

1. Stop the dev server (`Ctrl+C`)
2. Run `npm run dev` again
3. Hard-refresh the browser (`Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows)

Restarting alone is not always enough — the browser and Next.js can keep the previous images for the same filename.

## Logo rules

- Prefer a **transparent PNG** (or SVG) so the sidebar color does not show a white/black box.
- Header uses **icon + text from config**, not the full stacked logo squeezed into 40px.
- `logo-full.png` is for login/signup. The **name is part of that image**, not `brand.name`. If login still shows the old wordmark, replace `logo-full.png` and bump `assetVersion`.
- Prefer a **transparent** (not black) background so the icon is visible on the beige header.

## Email templates

Auth emails (invite, OTP, reset) are pasted in the **Supabase Dashboard**, not this repo. After rebranding, replace the product name in those HTML templates with the new `brand.name`. See `docs/supabase-auth-email-templates.md`.
