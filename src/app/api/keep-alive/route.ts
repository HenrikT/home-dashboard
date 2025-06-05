import { createClient } from "@/lib/supabase/server";

/**
 * Keep-Alive API Endpoint
 *
 * Purpose:
 * Supabase free-tier projects are paused automatically after 7 days of inactivity.
 * To prevent this, we schedule a daily Vercel Cron job to "ping" Supabase.
 *
 * How:
 * This endpoint is called by the Vercel Cron job once per day.
 * It performs a simple SELECT query on the "keep_alive" table.
 * This ensures there is regular database activity to keep the project "active".
 *
 * Security:
 * No authentication is required — this endpoint is public.
 * The query does NOT expose or return any sensitive data.
 * Only basic metadata is returned for verification.
 *
 * Response:
 * - 200 OK if the query succeeds
 * - 500 if an error occurs
 */
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase.from("keep_alive").select("id").limit(1);

  if (error) {
    console.error("Keep-alive error:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }

  console.log("Keep-alive success:", data);

  return new Response("OK", { status: 200 });
}
