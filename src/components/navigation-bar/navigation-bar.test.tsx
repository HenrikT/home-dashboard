import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import NavigationBar from "./navigation-bar";
import { expect, test } from "vitest";
import { vi, beforeEach } from "vitest";
import { describe } from "node:test";

const push = vi.fn();

beforeEach(() => {
  push.mockClear();
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

  test("navigates to /settings when Settings is clicked", () => {
    const { getByRole } = render(<NavigationBar />);
    fireEvent.click(getByRole("button", { name: "Settings" }));
    expect(push).toHaveBeenCalledWith("/settings");
  });

  test("navigates to /login when Logout is clicked", () => {
    const { getByRole } = render(<NavigationBar />);
    fireEvent.click(getByRole("button", { name: "Logout" }));
    expect(push).toHaveBeenCalledWith("/login");
  });
});
