import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import NavigationBar from "./navigation-bar";
import { expect, test } from "vitest";
import { vi, beforeEach } from "vitest";
import { describe } from "node:test";
import { supabase } from "../../lib/supabaseClient";

const push = vi.fn();

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

vi.mock("../../lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signOut: vi.fn(),
    },
  },
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
    const signOutMock = supabase.auth.signOut as ReturnType<typeof vi.fn>;
    signOutMock.mockResolvedValueOnce({ error: null });
    const { getByRole } = render(<NavigationBar />);
    fireEvent.click(getByRole("button", { name: "Logout" }));
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });

  test("navigates to /login after successful logout", async () => {
    const signOutMock = supabase.auth.signOut as ReturnType<typeof vi.fn>;
    signOutMock.mockResolvedValueOnce({ error: null });
    const { getByRole } = render(<NavigationBar />);
    fireEvent.click(getByRole("button", { name: "Logout" }));
    expect(push).toHaveBeenCalledWith("/login");
  });
});
