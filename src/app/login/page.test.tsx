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

test("navigates on valid login", () => {
  // Arrange
  const { getByPlaceholderText, container } = render(<Login />);

  // Act
  fireEvent.change(getByPlaceholderText("Type your username"), { target: { value: "h@h.h" } });
  fireEvent.change(getByPlaceholderText("Type your password"), { target: { value: "secret" } });
  fireEvent.submit(container.querySelector("form")!);

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
