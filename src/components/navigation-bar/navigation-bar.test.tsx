import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NavigationBar from "./navigation-bar";
import { expect, test } from "vitest";
import { vi, beforeEach } from "vitest";
import { describe } from "node:test";
import { supabase } from "@/lib/supabase/client";

const push = vi.fn();

// We must declare the mock for supabase first, before importing anything that uses it.
// This is because `vi.mock` calls are hoisted to the top of the file and run before imports,
// so if we import `supabase` before mocking it, the real module would be imported instead of the mock.
vi.mock("@/lib/supabase/client", () => {
  const signOut = vi.fn().mockResolvedValue({ error: null });
  return {
    supabase: {
      auth: {
        signOut,
        signInWithPassword: vi.fn(),
        getSession: vi.fn(),
      },
    },
  };
});

// Using `vi.mocked` unwraps the mocked function so we can refer to it in tests.
// This must come after `vi.mock()` to ensure we get the mocked version.
const signOut = vi.mocked(supabase.auth.signOut);

beforeEach(() => {
  push.mockClear();
  vi.clearAllMocks();
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: push,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

describe("NavigationBar", () => {
  test("renders nav buttons", () => {
    render(<NavigationBar />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  test("navigates to /home when Home is clicked", () => {
    const { getByRole } = render(<NavigationBar />);
    const homeButton = getByRole("button", { name: "Home" });
    fireEvent.click(homeButton);
    expect(push).toHaveBeenCalledWith("/home");
  });

  test("calls supabase signOut when Logout is clicked", async () => {
    const { getByRole } = render(<NavigationBar />);
    fireEvent.click(getByRole("button", { name: "Logout" }));
    expect(signOut).toHaveBeenCalled();
  });

  test("navigates to /login after successful logout", async () => {
    const { getByRole } = render(<NavigationBar />);
    fireEvent.click(getByRole("button", { name: "Logout" }));
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/login");
    });
  });
});
