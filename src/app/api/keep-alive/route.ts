import { createClient } from "@/lib/supabase/server";

/**
 * Keep-Alive API Endpoint
 *
 * This endpoint is called by the Vercel Cron job daily.
 * It performs a simple UPSERT query on the "keep_alive" table to keep the Supabase project active.
 *
 * The table always contains exactly one row (id = 1).
 * On each call, the "name" column is updated with the current timestamp.
 * This allows you to easily verify the last successful keep-alive run.
 *
 * Authorization:
 * - Requires a valid Authorization header with CRON_SECRET.
 *
 * Response:
 * - 200 OK if successful
 * - 401 Unauthorized if header missing/invalid
 * - 500 if an error occurs
 */
export async function GET(req: Request) {
  // Validate Authorization header
  const authHeader = req.headers.get("Authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (authHeader !== expected) {
    console.warn("Unauthorized cron request:", authHeader);
    return new Response("Unauthorized", { status: 401 });
  }

  // Supabase query
  const supabase = await createClient();

  // Current timestamp
  const now = new Date().toISOString();

  // Perform UPSERT so the table keeps a single row (id = 1)
  const { error } = await supabase.from("keep_alive").upsert([{ id: 1, name: now }]);

  if (error) {
    console.error("Keep-alive error:", error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }

  console.log("Keep-alive updated:", now);

  return new Response("OK", { status: 200 });
}
