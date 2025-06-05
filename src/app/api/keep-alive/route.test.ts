import { GET } from "./route";
import { vi, test, expect, beforeEach } from "vitest";

// Mock createClient and its return value
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Import the mocked createClient
import { createClient } from "@/lib/supabase/server";

// Define a helper to create a mock Request with Authorization header
function createMockRequest(authValue: string | null) {
  return new Request("http://localhost/api/keep-alive", {
    headers: authValue ? { Authorization: authValue } : {},
  });
}

beforeEach(() => {
  // Reset env and mocks before each test
  process.env.CRON_SECRET = "test-secret";
  vi.clearAllMocks();
});

test("returns 200 OK when Supabase upsert succeeds", async () => {
  const mockUpsert = vi.fn().mockResolvedValue({
    data: [{ id: 1, name: "mock-timestamp" }],
    error: null,
  });

  const mockFrom = vi.fn().mockReturnValue({
    upsert: mockUpsert,
  });

  // Mock createClient to return supabase mock
  (createClient as unknown as vi.Mock).mockResolvedValue({
    from: mockFrom,
  });

  const req = createMockRequest(`Bearer ${process.env.CRON_SECRET}`);

  const res = await GET(req);

  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).toBe("OK");

  // Optional: Verify that upsert was called with correct payload
  expect(mockUpsert).toHaveBeenCalledWith([
    { id: 1, name: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/) }, // ISO timestamp prefix
  ]);
});

test("returns 500 if Supabase upsert fails", async () => {
  const mockUpsert = vi.fn().mockResolvedValue({
    data: null,
    error: { message: "Simulated DB error" },
  });

  const mockFrom = vi.fn().mockReturnValue({
    upsert: mockUpsert,
  });

  (createClient as unknown as vi.Mock).mockResolvedValue({
    from: mockFrom,
  });

  const req = createMockRequest(`Bearer ${process.env.CRON_SECRET}`);

  const res = await GET(req);

  expect(res.status).toBe(500);
  const text = await res.text();
  expect(text).toContain("Simulated DB error");
});

test("returns 401 Unauthorized if Authorization header is missing", async () => {
  const req = createMockRequest(null);

  const res = await GET(req);

  expect(res.status).toBe(401);
  const text = await res.text();
  expect(text).toBe("Unauthorized");
});

test("returns 401 Unauthorized if Authorization header is invalid", async () => {
  const req = createMockRequest("Bearer wrong-secret");

  const res = await GET(req);

  expect(res.status).toBe(401);
  const text = await res.text();
  expect(text).toBe("Unauthorized");
});
