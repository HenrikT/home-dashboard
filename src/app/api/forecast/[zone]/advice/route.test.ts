import { GET } from "./route";
import { expect, test, vi } from "vitest";
import type { NextRequest } from "next/server";

// Mock global fetch
vi.stubGlobal("fetch", vi.fn());

function createRequest(): NextRequest {
  // Creating a minimal object that matches the expected shape of NextRequest
  const controller = new AbortController();
  return {
    method: "GET",
    headers: new Headers(),
    url: "http://localhost/api/forecast/NO1/advice",
    clone: () => createRequest(),
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    formData: () => Promise.resolve(new FormData()),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    bodyUsed: false,
    cache: "default",
    credentials: "same-origin",
    destination: "",
    integrity: "",
    keepalive: false,
    mode: "cors",
    redirect: "follow",
    referrer: "",
    referrerPolicy: "strict-origin-when-cross-origin",
    signal: controller.signal,
  } as unknown as NextRequest;
}

function createParams(zone: string): Promise<{ zone: string }> {
  return Promise.resolve({ zone });
}

test("returns 400 for invalid zone", async () => {
  const res = await GET(createRequest(), { params: createParams("NOX") });
  expect(res.status).toBe(400);
  const text = await res.text();
  expect(text).toContain("Invalid zone");
});

test("returns 502 if external fetch fails", async () => {
  (fetch as vi.Mock).mockResolvedValueOnce({
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
    json: vi.fn(),
  });

  const res = await GET(createRequest(), { params: createParams("NO1") });
  expect(res.status).toBe(502);
  const text = await res.text();
  expect(text).toContain("Failed to fetch forecast data");
});

test("returns 200 OK with modified forecast data", async () => {
  const mockForecast = {
    forecastAdvice: [
      {
        averagePrice: 0.45,
        from: "2025-06-08T00:00:00+02:00",
        to: "2025-06-08T06:00:00+02:00",
        type: "Good",
      },
    ],
  };

  (fetch as vi.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: vi.fn().mockResolvedValue(mockForecast),
  });

  const res = await GET(createRequest(), { params: createParams("NO1") });
  expect(res.status).toBe(200);
  const json = await res.json();
  expect(json.forecastAdvice[0].averagePrice).toBe(45);
});
