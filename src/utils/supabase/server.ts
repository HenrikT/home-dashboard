import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * This module exports a helper function for creating a Supabase client
 * configured for use in server-side environments (e.g., Route Handlers,
 * Server Components, Middleware).
 *
 * It uses cookies from the current request context to persist session state.
 */
export async function createClient() {
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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
