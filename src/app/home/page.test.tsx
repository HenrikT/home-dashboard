import { render, waitFor } from "@testing-library/react";
import { expect, test, vi } from "vitest";
import React from "react";
import Home from "./page";

// Mock router.push
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

// Mock supabase
vi.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
      }),
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
  const { supabase } = await import("@/lib/supabase-browser");
  const userEmail = "testuser@example.com";

  // Cast to mocked function so TypeScript recognizes mock methods
  const getSessionMock = supabase.auth.getSession as unknown as ReturnType<typeof vi.fn>;
  getSessionMock.mockResolvedValueOnce({
    data: {
      session: {
        user: { email: userEmail },
      },
    },
  });

  const { findByText } = render(<Home />);
  expect(await findByText(userEmail)).toBeInTheDocument();
});
