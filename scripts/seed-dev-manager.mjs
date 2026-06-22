/**
 * Creates a dev manager account for local testing:
 *   Email:    manager@example.com
 *   Password: 12345678  (or Demo@1234 if set via Claude's demo migration)
 *
 * Run: npm run seed:manager
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import fs from "fs"
import { createClient } from "@supabase/supabase-js"

const EMAIL = "manager@example.com"
const PASSWORD = "12345678"
const FULL_NAME = "Dev Manager"

function loadEnv() {
  const path = ".env.local"
  if (!fs.existsSync(path)) {
    throw new Error("Missing .env.local")
  }
  return Object.fromEntries(
    fs
      .readFileSync(path, "utf8")
      .split("\n")
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const i = line.indexOf("=")
        return [line.slice(0, i).trim(), line.slice(i + 1).trim()]
      })
  )
}

const env = loadEnv()
const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const { data: list } = await admin.auth.admin.listUsers()
const existing = list?.users?.find((u) => u.email === EMAIL)

let userId = existing?.id

if (!existing) {
  const { data, error } = await admin.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    app_metadata: { role: "manager" },
    user_metadata: { full_name: FULL_NAME },
  })
  if (error) throw error
  userId = data.user.id
  console.log("Created auth user:", EMAIL)
} else {
  await admin.auth.admin.updateUserById(existing.id, {
    password: PASSWORD,
    app_metadata: { role: "manager" },
    user_metadata: { full_name: FULL_NAME },
  })
  console.log("Updated existing auth user:", EMAIL)
}

const { error: managerError } = await admin.from("managers").upsert(
  {
    id: userId,
    email: EMAIL,
    full_name: FULL_NAME,
    status: "active",
  },
  { onConflict: "id" }
)

if (managerError) throw managerError

console.log("Manager row ready.")
console.log("")
console.log("Sign in at /login with:")
console.log(`  Email:    ${EMAIL}`)
console.log(`  Password: ${PASSWORD}`)
