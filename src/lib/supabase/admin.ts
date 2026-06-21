import "server-only"

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/types/database.types"

/**
 * Privileged Supabase client using the SERVICE ROLE key.
 *
 * WARNING: This client BYPASSES Row Level Security. It must NEVER be imported
 * into Client Components or shipped to the browser. The `import "server-only"`
 * above makes the build fail if that ever happens.
 *
 * Use it ONLY inside Server Actions / Route Handlers for privileged tasks, e.g.:
 *  - creating manager auth accounts and setting `app_metadata.role`
 *  - activating customer accounts
 *  - any admin operation that legitimately needs to bypass RLS
 *
 * It does not persist or refresh sessions because it is not tied to a logged-in
 * user — it acts with full service-role authority on every call.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
