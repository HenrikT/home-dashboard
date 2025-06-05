import { GET } from "./route";
import { NextRequest } from "next/server";
import { vi, test, expect } from "vitest";
import { supabase } from "@/lib/supabase/client";

// Mock Supabase session
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

function createMockRequest(url: string) {
  return new NextRequest(new Request(url));
}

test("returns 401 if no session exists", async () => {
  const getSessionMock = vi.mocked(supabase.auth.getSession);
  getSessionMock.mockResolvedValueOnce({
    data: { session: null },
    error: null,
  });

  const req = createMockRequest("http://localhost:3000/api/price?date=2025-05-25");
  const res = await GET(req);
  expect(res.status).toBe(401);
});

test("returns mock data when session exists and date is provided", async () => {
  const getSessionMock = vi.mocked(supabase.auth.getSession);
  getSessionMock.mockResolvedValueOnce({
    data: {
      session: {
        user: {
          id: "123",
          email: "user@example.com",
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        },
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        expires_in: 3600,
        token_type: "bearer",
      },
    },
    error: null,
  });

  const req = createMockRequest("http://localhost:3000/api/price?date=2025-05-25");
  const res = await GET(req);
  expect(res.status).toBe(200);
  const json = await res.json();
  expect(Array.isArray(json)).toBe(true);
});

test("returns 400 if no date is provided", async () => {
  const getSessionMock = vi.mocked(supabase.auth.getSession);
  getSessionMock.mockResolvedValueOnce({
    data: {
      session: {
        user: {
          id: "123",
          email: "user@example.com",
          app_metadata: {},
          user_metadata: {},
          aud: "authenticated",
          created_at: new Date().toISOString(),
        },
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        expires_in: 3600,
        token_type: "bearer",
      },
    },
    error: null,
  });

  const req = createMockRequest("http://localhost:3000/api/price");
  const res = await GET(req);
  expect(res.status).toBe(400); // Fails until route.ts enforces the date param
});
