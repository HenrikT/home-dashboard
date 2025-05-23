import { NextResponse } from "next/server";
import mockData from "@/data/mock-energy-prices.json";

export function GET() {
  return NextResponse.json(mockData);
}
