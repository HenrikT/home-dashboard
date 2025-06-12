export const dynamic = "force-static";
import type { ExternalPriceItem, PriceData, PriceItem } from "@/types/price";

/**
 * Handles GET requests for power prices by date and zone.
 *
 * API Endpoint: GET /api/price/{date}/{zone}
 *
 * @param request - The incoming HTTP request (unused in this handler).
 * @param params - A Promise resolving to an object containing:
 *   - date: A string in 'YYYY-MM-DD' format.
 *   - zone: A string representing the Norwegian power zone (e.g. 'NO1', 'NO2', 'NO3', 'NO4', 'NO5').
 *
 * Behavior:
 * - Parses the date into year/month-day format required by the external API.
 * - Fetches power prices from https://www.hvakosterstrommen.no/api/v1/prices/{year}/{month-day}_{zone}.json
 * - Caches the response (force-cache).
 * - Calculates and returns statistics:
 *     - min, avg, and max price in øre/kWh.
 *     - Each price item includes derived `øre_per_kWh`.
 *     - Includes the current price (`now`) in øre/kWh for the current hour in Europe/Oslo timezone, or `null` if not found.
 * - Returns the enriched JSON data to the caller.
 *
 * Example request:
 *   GET /api/price/2025-06-08/NO1
 *
 * Example external fetch:
 *   https://www.hvakosterstrommen.no/api/v1/prices/2025/06-08_NO1.json
 *
 * Caching:
 * - The fetch uses 'force-cache', so results are cached indefinitely by Next.js unless redeployed or invalidated.
 *
 * Notes:
 * - Logs the request and external URL to server logs.
 * - Validates date and zone format.
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ date: string; zone: string }> }
) {
  const { date, zone } = await params;

  console.log(`Handling GET for date=${date}, zone=${zone}`);

  // Validate input
  if (!date || !zone) return new Response("Missing date or zone", { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    return new Response("Invalid date format", { status: 400 });
  if (!/^NO[1-5]$/.test(zone)) return new Response("Invalid zone", { status: 400 });

  const [year, month, day] = date.split("-");
  const externalUrl = `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${zone}.json`;

  console.log(`Fetching external URL: ${externalUrl}`);
  const response = await fetch(externalUrl, { cache: "force-cache" });

  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`No price data available yet for ${date} in zone ${zone}`);
      const emptyResult: PriceData = {
        date,
        zone,
        min: 0,
        avg: 0,
        max: 0,
        now: null,
        priceItems: [],
      };

      return new Response(JSON.stringify(emptyResult), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error(`External fetch failed: ${response.status}`);
    return new Response("Failed to fetch external data", { status: 502 });
  }

  const rawData = await response.json();

  const priceItems: PriceItem[] = (rawData as ExternalPriceItem[]).map((item) => ({
    time_start: item.time_start,
    time_end: item.time_end,
    øre_per_kWh: Math.round(item.NOK_per_kWh * 100),
  }));

  const values = priceItems.map((p) => p.øre_per_kWh);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = Math.round(values.reduce((sum, v) => sum + v, 0) / values.length);

  // Determine current hour in Europe/Oslo
  const osloTimeFormatter = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    hour12: false,
  });
  const currentHour = osloTimeFormatter.format(new Date());
  const timePrefix = `${date}T${currentHour}:00:00`;

  const now = priceItems.find((i) => i.time_start.startsWith(timePrefix))?.øre_per_kWh ?? null;

  const result: PriceData = {
    date,
    zone,
    min,
    avg,
    max,
    now,
    priceItems,
  };

  console.log("Returning enriched power price data");
  return Response.json(result);
}
