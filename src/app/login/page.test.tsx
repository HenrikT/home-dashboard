import { fireEvent, render } from "@testing-library/react";
import React from "react";
import { vi, expect, test } from "vitest";
import Login from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: push,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

test("login button navigates to /home", () => {
  const { getByRole } = render(<Login />);
  const loginButton = getByRole("button", { name: "Login" });
  fireEvent.click(loginButton);
  expect(push).toHaveBeenCalledWith("/home");
});
