import { render, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import React from "react";
import Home from "./page";
import { supabase } from "@/lib/supabase/client";

// Mock router.push
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

// Mock supabase auth.getSession
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

test("redirects to /login if no session is present", async () => {
  render(<Home />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/login");
  });
});

test("displays user email in header when session exists", async () => {
  const userEmail = "testuser@example.com";

  // Cast to mocked function so TypeScript recognizes mock methods
  const getSessionMock = vi.mocked(supabase.auth.getSession, { partial: true });
  const mockUser = {
    id: "123",
    email: userEmail,
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  };

  getSessionMock.mockResolvedValueOnce({
    data: {
      session: {
        user: mockUser,
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        expires_in: 3600,
        token_type: "bearer",
      },
    },
  });

  const { findByText } = render(<Home />);
  expect(await findByText(userEmail)).toBeInTheDocument();
});
