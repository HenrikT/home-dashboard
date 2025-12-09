export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server";
import type { ForecastAdvice } from "@/types/forecast";

/**
 * Handles GET requests for power price forecasts by zone.
 *
 * API Endpoint: GET /api/forecast/{zone}/advice
 *
 * @param request - The incoming HTTP request (unused in this handler).
 * @param params - A Promise resolving to an object containing:
 *   - zone: A string representing the Norwegian power zone (e.g. 'NO1', 'NO2', 'NO3', 'NO4', 'NO5').
 *
 * Behavior:
 * - Sends a POST request to Ladeassistenten’s public forecast API with a fixed segment size (6 hours).
 * - The request payload includes currency (NOK), energy unit (kWh), and VAT rate (1).
 * - The external API returns an array of forecastAdvice entries, each including price and timing metadata.
 * - The returned `averagePrice` values are multiplied by 100 and rounded to represent øre/kWh.
 * - The modified forecastAdvice is returned as JSON.
 *
 * Example request:
 *   GET /api/forecast/NO1/advice
 *
 * Example external fetch:
 *   POST https://www.ladeassistent.no/api/forecast/NO1/advice
 *
 * Caching:
 * - Caching is disabled (force-dynamic, cache: 'no-store').
 *
 * Notes:
 * - Validates the zone string format.
 * - Returns a 400 status for invalid zone input.
 * - Returns a 502 status if the external API fetch fails.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ zone: string }> }) {
  const { zone } = await params;

  if (!/^NO[1-5]$/.test(zone)) {
    return new Response("Invalid zone", { status: 400 });
  }

  const payload = {
    priceUnitsParameters: {
      currency: "NOK",
      energyUnit: "kWh",
      vatRate: 1,
    },
    segmentOptionsParameters: {
      segmentSize: 6,
    },
  };

  const res = await fetch(`https://www.ladeassistent.no/api/forecast/${zone}/advice`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
      Origin: "https://www.ladeassistent.no",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    return new Response("Failed to fetch forecast data", { status: 502 });
  }

  const data = await res.json();
  data.forecastAdvice = (data.forecastAdvice as ForecastAdvice[]).map((entry) => ({
    ...entry,
    averagePrice: Math.round(entry.averagePrice * 100),
  }));
  return Response.json(data);
}
