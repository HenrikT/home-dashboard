import { GET } from "./route";
import { expect, test, vi } from "vitest";

global.fetch = vi.fn();

function createRequest() {
  return new Request("http://localhost/api/price/2025-06-08/NO1");
}

function createParams(date: string, zone: string) {
  return Promise.resolve({ date, zone });
}

test("returns 400 for invalid date format", async () => {
  const res = await GET(createRequest(), { params: createParams("2025/06/08", "NO1") });

  expect(res.status).toBe(400);
  const text = await res.text();
  expect(text).toContain("Invalid date format");
});

test("returns 400 for invalid zone", async () => {
  const res = await GET(createRequest(), { params: createParams("2025-06-08", "NOX") });

  expect(res.status).toBe(400);
  const text = await res.text();
  expect(text).toContain("Invalid zone");
});

test("returns 502 if external fetch fails", async () => {
  (fetch as unknown as vi.Mock).mockResolvedValueOnce({
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
    json: vi.fn(),
  });

  const res = await GET(createRequest(), { params: createParams("2025-06-08", "NO1") });

  expect(res.status).toBe(502);
  const text = await res.text();
  expect(text).toContain("Failed to fetch external data");
});

test("returns 200 OK with enriched price data", async () => {
  // Fake time to 2025-06-08T00:15:00+02:00 (Oslo time)
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2025-06-07T22:15:00Z")); // equivalent to 2025-06-08T00:15:00+02:00

  const mockData = [
    {
      NOK_per_kWh: 0.5,
      EUR_per_kWh: 0.04,
      time_start: "2025-06-08T00:00:00+02:00",
      time_end: "2025-06-08T01:00:00+02:00",
    },
  ];

  (fetch as unknown as vi.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(mockData),
  });

  const res = await GET(createRequest(), { params: createParams("2025-06-08", "NO1") });

  expect(res.status).toBe(200);
  const data = await res.json();

  expect(data).toMatchObject({
    date: "2025-06-08",
    zone: "NO1",
    min: 50,
    avg: 50,
    max: 50,
    now: 50,
    priceItems: [
      {
        time_start: "2025-06-08T00:00:00+02:00",
        time_end: "2025-06-08T01:00:00+02:00",
        øre_per_kWh: 50,
      },
    ],
  });

  vi.useRealTimers();
});

test("returns 400 if zone is missing", async () => {
  const res = await GET(createRequest(), { params: createParams("2025-06-08", "") });
  expect(res.status).toBe(400);
  const text = await res.text();
  expect(text).toContain("Missing date or zone");
});

test("returns 400 if zone format is invalid", async () => {
  const res = await GET(createRequest(), { params: createParams("2025-06-08", "NORWAY1") });
  expect(res.status).toBe(400);
  const text = await res.text();
  expect(text).toContain("Invalid zone");
});

test("returns 502 if external API call fails", async () => {
  vi.spyOn(global, "fetch").mockResolvedValueOnce({
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
    json: vi.fn(),
  } as unknown as Response);

  const res = await GET(createRequest(), { params: createParams("2025-06-08", "NO1") });
  expect(res.status).toBe(502);
  const text = await res.text();
  expect(text).toContain("Failed to fetch external data");
});

test("updates 'now' value correctly based on hour", async () => {
  const mockDataHour15 = [
    {
      NOK_per_kWh: 0.38,
      EUR_per_kWh: 0.03,
      time_start: "2025-06-08T15:00:00+02:00",
      time_end: "2025-06-08T16:00:00+02:00",
    },
    {
      NOK_per_kWh: 0.5,
      EUR_per_kWh: 0.04,
      time_start: "2025-06-08T16:00:00+02:00",
      time_end: "2025-06-08T17:00:00+02:00",
    },
  ];

  vi.useFakeTimers();

  // Simulate 15:49 Oslo time (13:49 UTC)
  vi.setSystemTime(new Date("2025-06-08T13:49:00Z"));

  (fetch as unknown as vi.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(mockDataHour15),
  });

  const res1 = await GET(createRequest(), { params: createParams("2025-06-08", "NO1") });
  const data1 = await res1.json();
  expect(data1.now).toBe(38);

  // Advance time to 16:20 Oslo time (14:20 UTC)
  vi.setSystemTime(new Date("2025-06-08T14:20:00Z"));

  (fetch as unknown as vi.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(mockDataHour15),
  });

  const res2 = await GET(createRequest(), { params: createParams("2025-06-08", "NO1") });
  const data2 = await res2.json();
  expect(data2.now).toBe(50);

  vi.useRealTimers();
});

test("caches result and does not update 'now' even if time changes (static behavior)", async () => {
  const mockData = [
    {
      NOK_per_kWh: 0.38,
      EUR_per_kWh: 0.03,
      time_start: "2025-06-08T15:00:00+02:00",
      time_end: "2025-06-08T16:00:00+02:00",
    },
    {
      NOK_per_kWh: 0.5,
      EUR_per_kWh: 0.04,
      time_start: "2025-06-08T16:00:00+02:00",
      time_end: "2025-06-08T17:00:00+02:00",
    },
  ];

  vi.useFakeTimers();

  // Simulate first request at 15:49 Oslo time (13:49 UTC)
  vi.setSystemTime(new Date("2025-06-08T13:49:00Z"));

  (fetch as unknown as vi.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(mockData),
  });

  const res1 = await GET(createRequest(), { params: createParams("2025-06-08", "NO1") });
  const data1 = await res1.json();
  expect(data1.now).toBe(38);

  // Simulate second request at 16:20 Oslo time (14:20 UTC)
  vi.setSystemTime(new Date("2025-06-08T14:20:00Z"));

  // Provide a new mock fetch response for the second request
  (fetch as unknown as vi.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(mockData),
  });

  // No new fetch — result should be cached
  const res2 = await GET(createRequest(), { params: createParams("2025-06-08", "NO1") });
  const data2 = await res2.json();

  // Expect same value due to static cache
  expect(data2.now).toBe(38);

  vi.useRealTimers();
});
