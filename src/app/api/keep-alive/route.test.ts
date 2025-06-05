import { GET } from "./route";
import { vi, test, expect } from "vitest";

// Mock createClient and its return value
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Import the mocked createClient
import { createClient } from "@/lib/supabase/server";

test("returns 200 OK when Supabase query succeeds", async () => {
  const mockSelect = vi.fn().mockResolvedValue({
    data: [{ id: 1 }],
    error: null,
  });

  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      limit: vi.fn().mockImplementation(() => mockSelect()),
    }),
  });

  // Mock createClient to return supabase mock
  (createClient as unknown as vi.Mock).mockResolvedValue({
    from: mockFrom,
  });

  const res = await GET();

  expect(res.status).toBe(200);
  const text = await res.text();
  expect(text).toBe("OK");
});

test("returns 500 if Supabase query fails", async () => {
  const mockSelect = vi.fn().mockResolvedValue({
    data: null,
    error: { message: "Simulated DB error" },
  });

  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      limit: vi.fn().mockImplementation(() => mockSelect()),
    }),
  });

  (createClient as unknown as vi.Mock).mockResolvedValue({
    from: mockFrom,
  });

  const res = await GET();

  expect(res.status).toBe(500);
  const text = await res.text();
  expect(text).toContain("Simulated DB error");
});
