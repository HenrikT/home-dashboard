import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import mockData from "@/data/mock-energy-prices.json";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(mockData);
}
