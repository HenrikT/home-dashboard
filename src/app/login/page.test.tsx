import { vi, expect, test, beforeEach } from "vitest";
import { fireEvent, screen, render, waitFor } from "@testing-library/react";
import { supabase } from "@/lib/supabaseClient";
import React from "react";
import Login from "./page";

// Mock router navigation
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

// Clear the mock before each test
beforeEach(() => {
  push.mockClear();
});

// Mock supabase loging
vi.mock("@/lib/supabaseClient", () => {
  return {
    supabase: {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({
          data: {
            session: {
              access_token: "mock-token",
              refresh_token: "mock-refresh",
              expires_in: 3600,
              token_type: "bearer",
              user: {
                id: "mock-user-id",
                email: "h@h.h",
                user_metadata: { name: "Henrik" },
              },
            },
          },
          error: null,
        }),
      },
    },
  };
});

test("navigates to /home on valid login", async () => {
  // Arrange
  const { getByPlaceholderText, container } = render(<Login />);

  // Act
  fireEvent.change(getByPlaceholderText("Type your username"), { target: { value: "h@h.h" } });
  fireEvent.change(getByPlaceholderText("Type your password"), { target: { value: "secret" } });
  fireEvent.submit(container.querySelector("form")!);

  // Assert
  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/home");
  });
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

test("shows an error popup with HTTP code on failed login", async () => {
  // Arrange: mock signInWithPassword to return an error with status code
  (supabase.auth.signInWithPassword as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    data: { session: null, user: null },
    error: { status: 401, message: "Unauthorized" },
  });

  const { getByPlaceholderText, container } = render(<Login />);

  // Act
  fireEvent.change(getByPlaceholderText("Type your username"), { target: { value: "wrong@user" } });
  fireEvent.change(getByPlaceholderText("Type your password"), { target: { value: "wrongpass" } });
  fireEvent.submit(container.querySelector("form")!);

  // Assert: wait for error popup with "401"
  await waitFor(() => {
    expect(screen.getByText(/401/i)).toBeInTheDocument();
  });
});

test("auto-redirects from /login to /home if session exists", async () => {
  // Mock getSession to return a valid session
  const getSessionMock = vi.fn().mockResolvedValue({
    data: {
      session: {
        access_token: "mock-token",
        refresh_token: "mock-refresh",
        expires_in: 3600,
        token_type: "bearer",
        user: {
          id: "mock-user-id",
          email: "h@h.h",
          user_metadata: { name: "Henrik" },
        },
      },
    },
    error: null,
  });
  // Patch supabase.auth.getSession for this test
  supabase.auth.getSession = getSessionMock;

  render(<Login />);

  // Wait for redirect to /home
  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/home");
  });
});
