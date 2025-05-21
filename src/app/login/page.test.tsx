import { vi, expect, test, beforeEach } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import React from "react";
import Login from "./page";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

beforeEach(() => {
  push.mockClear();
});

test("login button navigates to /home", () => {
  // Arrange
  const { getByRole } = render(<Login />);

  // Act
  const loginButton = getByRole("button", { name: "Login" });
  fireEvent.click(loginButton);

  // Assert
  expect(push).toHaveBeenCalledWith("/home");
});

test("does not navigate on invalid login", () => {
  // Arrange
  const { getByPlaceholderText, container } = render(<Login />);
  const usernameInput = getByPlaceholderText("Type your username");
  const passwordInput = getByPlaceholderText("Type your password");

  // Act
  fireEvent.change(usernameInput, { target: { value: "wrong username" } });
  fireEvent.change(passwordInput, { target: { value: "wrong password" } });
  fireEvent.submit(container.querySelector("form")!);

  // Assert
  expect(push).not.toHaveBeenCalledWith("/home");
});
