// src/app/api/price/[date]/[zone]/route.test.ts

import { GET } from "./route";
import { expect, test, vi } from "vitest";

// Mock fetch (global)
global.fetch = vi.fn();

// Helpers
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

test("returns 200 OK with valid data", async () => {
  const mockData = [{ time_start: "2025-06-08T00:00:00", NOK_per_kWh: 0.5 }];

  (fetch as unknown as vi.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(mockData),
  });

  const res = await GET(createRequest(), { params: createParams("2025-06-08", "NO1") });

  expect(res.status).toBe(200);
  const data = await res.json();
  expect(data).toEqual(mockData);
});

test("returns 400 if zone is missing", async () => {
  const res = await GET(createRequest(), { params: createParams("2025-06-08", "") });
  expect(res.status).toBe(400);
  const text = await res.text();
  expect(text).toContain("Missing zone");
});

test("returns 400 if zone format is invalid", async () => {
  const res = await GET(createRequest(), { params: createParams("2025-06-08", "NORWAY1") });
  expect(res.status).toBe(400);
  const text = await res.text();
  expect(text).toContain("Invalid zone. Expected NO1-NO5.");
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

test("returns 200 and external data for valid request", async () => {
  const mockData = [
    {
      NOK_per_kWh: 0.5,
      EUR_per_kWh: 0.04,
      time_start: "2025-06-08T00:00",
      time_end: "2025-06-08T01:00",
    },
  ];

  vi.spyOn(global, "fetch").mockResolvedValueOnce({
    ok: true,
    json: vi.fn().mockResolvedValue(mockData),
  } as unknown as Response);

  const res = await GET(createRequest(), { params: createParams("2025-06-08", "NO1") });
  expect(res.status).toBe(200);
  const json = await res.json();
  expect(json).toEqual(mockData);
});
