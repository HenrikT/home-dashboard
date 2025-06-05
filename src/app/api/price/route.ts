import { NextResponse } from "next/server";
import mockData from "@/data/mock-energy-prices.json";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  const response = await supabase.auth.getSession();
  const session = response.data.session;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(mockData);
}
