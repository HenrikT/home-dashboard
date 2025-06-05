import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

/**
 * GET /api/keep-alive
 *
 * This route is triggered daily by a Vercel Cron job.
 * It performs a trivial call to Supabase (auth.getUser) to ensure activity is logged,
 * preventing the Supabase project from being paused due to inactivity.
 *
 * This endpoint returns a 200 OK response with basic info about the request.
 *
 * No authentication is required, as this is an internal scheduled ping.
 */
export async function GET() {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Keep-alive Supabase error:", error);
      return NextResponse.json({ message: "Supabase error", error }, { status: 500 });
    }

    console.log("Keep-alive ping successful:", data?.user?.email ?? "no user");

    return NextResponse.json({ message: "Keep-alive success", email: data?.user?.email ?? null });
  } catch (err) {
    console.error("Unexpected keep-alive error:", err);
    return NextResponse.json({ message: "Unexpected error", err }, { status: 500 });
  }
}
