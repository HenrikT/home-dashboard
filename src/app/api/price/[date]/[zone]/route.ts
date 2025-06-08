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
 * - Returns the JSON data from the external API to the caller.
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

  // Validate required params
  if (!date) {
    console.warn("Missing date");
    return new Response("Missing date", { status: 400 });
  }

  if (!zone) {
    console.warn("Missing zone");
    return new Response("Missing zone", { status: 400 });
  }

  // Validate date format YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.warn("Invalid date format:", date);
    return new Response("Invalid date format. Expected YYYY-MM-DD.", { status: 400 });
  }

  // Validate zone format NO1-NO5
  if (!/^NO[1-5]$/.test(zone)) {
    console.warn("Invalid zone:", zone);
    return new Response("Invalid zone. Expected NO1-NO5.", { status: 400 });
  }

  const [year, month, day] = date.split("-");
  const externalUrl = `https://www.hvakosterstrommen.no/api/v1/prices/${year}/${month}-${day}_${zone}.json`;

  console.log(`Fetching external URL: ${externalUrl}`);

  const response = await fetch(externalUrl, {
    cache: "force-cache",
  });

  // External fetch error handling
  if (!response.ok) {
    console.error(`External fetch failed: ${response.status} ${response.statusText}`);
    return new Response(`Failed to fetch external data`, { status: 502 });
  }

  const data = await response.json();

  console.log("Fetched power prices:", data.length, "entries");

  return Response.json(data);
}
