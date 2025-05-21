import React from "react";
import { render, screen } from "@testing-library/react";
import NavigationBar from "./navigation-bar";
import { expect, test } from "vitest";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

test("renders nav buttons", () => {
  render(<NavigationBar />);
  expect(screen.getByText("Home")).toBeInTheDocument();
  expect(screen.getByText("Settings")).toBeInTheDocument();
  expect(screen.getByText("Logout")).toBeInTheDocument();
});
