import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client (Server Components/Actions) — the only
 * place credentials are ever handled directly; everything else in the
 * app goes through our own AuthService/RoleResolver (SAD §8). Uses the
 * publishable/anon key, not the service role key: signUp/signInWithPassword
 * are designed to be called with the anon key, and this client is
 * subject to RLS like any other client, by design.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // A Server Component can't set cookies (only Server Actions
          // and Route Handlers can) — Supabase's own recommended
          // pattern is to swallow this here; the middleware/proxy path
          // is what refreshes session cookies during navigation.
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component — no-op, see above.
          }
        },
      },
    },
  );
}
