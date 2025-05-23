// This file provides a singleton Supabase client for use in client-side components.
// It uses `createBrowserClient` from `@supabase/ssr`, which is optimized for use in the browser.
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
