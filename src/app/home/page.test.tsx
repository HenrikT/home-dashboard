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
