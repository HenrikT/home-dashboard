import { GET } from "./route";
import { NextRequest } from "next/server";
import { vi, test, expect } from "vitest";
import { supabase } from "@/lib/supabase/client";
import { AuthError } from "@supabase/supabase-js";

// Mock Supabase getUser
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

function createMockRequest() {
  return new NextRequest(new Request("http://localhost:3000/api/keep-alive"));
}

test("returns 200 OK when Supabase returns user", async () => {
  const getUserMock = vi.mocked(supabase.auth.getUser);
  getUserMock.mockResolvedValueOnce({
    data: {
      user: {
        id: "123",
        email: "testuser@example.com",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      },
    },
    error: null,
  });

  const res = await GET();

  expect(res.status).toBe(200);

  const json = await res.json();
  expect(json).toEqual({
    message: "Keep-alive success",
    email: "testuser@example.com",
  });
});

test("returns 500 if Supabase returns error", async () => {
  const getUserMock = vi.mocked(supabase.auth.getUser);

  const error = new AuthError("Mock auth error", 500);

  getUserMock.mockResolvedValueOnce({
    data: { user: null },
    error: error,
  });

  const res = await GET();

  expect(res.status).toBe(500);

  const json = await res.json();
  expect(json.message).toBe("Supabase error");
});
