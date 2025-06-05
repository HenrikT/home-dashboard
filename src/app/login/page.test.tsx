import { vi, expect, test, beforeEach } from "vitest";
import { fireEvent, screen, render, waitFor } from "@testing-library/react";
import React from "react";
import Login from "./page";
import { supabase } from "@/lib/supabase/client";
import { AuthError, User } from "@supabase/supabase-js";

// Mock router navigation
const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push,
  }),
}));

// Mock supabase client - match exact import path used in your app code
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

// Import the mocked functions after mocking the module
const signInMock = vi.mocked(supabase.auth.signInWithPassword);
const getSessionMock = vi.mocked(supabase.auth.getSession);

beforeEach(() => {
  push.mockClear();
  signInMock.mockClear();
  getSessionMock.mockClear();
});

test("navigates to /home on valid login", async () => {
  signInMock.mockResolvedValueOnce({
    data: {
      user: {
        id: "mock-user-id",
        email: "h@h.h",
      } as User,
      session: {
        access_token: "mock-token",
        refresh_token: "mock-refresh",
        expires_in: 3600,
        token_type: "bearer",
        user: {
          id: "mock-user-id",
          email: "h@h.h",
        } as User,
      },
    },
    error: null,
  });

  const { getByPlaceholderText, container } = render(<Login />);

  fireEvent.change(getByPlaceholderText("Type your username"), {
    target: { value: "h@h.h" },
  });
  fireEvent.change(getByPlaceholderText("Type your password"), {
    target: { value: "secret" },
  });
  fireEvent.submit(container.querySelector("form")!);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/home");
  });
});

test("does not navigate on invalid login", async () => {
  signInMock.mockResolvedValueOnce({
    data: { session: null, user: null },
    error: { status: 401, message: "Unauthorized" } as AuthError,
  });

  const { getByPlaceholderText, container } = render(<Login />);
  fireEvent.change(getByPlaceholderText("Type your username"), {
    target: { value: "wrong username" },
  });
  fireEvent.change(getByPlaceholderText("Type your password"), {
    target: { value: "wrong password" },
  });
  fireEvent.submit(container.querySelector("form")!);

  await waitFor(() => {
    expect(push).not.toHaveBeenCalledWith("/home");
  });
});

test("shows an error popup with HTTP code on failed login", async () => {
  signInMock.mockResolvedValueOnce({
    data: { session: null, user: null },
    error: { status: 401, message: "Unauthorized" } as AuthError,
  });

  const { getByPlaceholderText, container } = render(<Login />);
  fireEvent.change(getByPlaceholderText("Type your username"), {
    target: { value: "wrong@user" },
  });
  fireEvent.change(getByPlaceholderText("Type your password"), {
    target: { value: "wrongpass" },
  });
  fireEvent.submit(container.querySelector("form")!);

  await waitFor(() => {
    expect(screen.getByText(/401/i)).toBeInTheDocument();
  });
});

test("auto-redirects from /login to /home if session exists", async () => {
  getSessionMock.mockResolvedValueOnce({
    data: {
      session: {
        access_token: "mock-token",
        refresh_token: "mock-refresh",
        expires_in: 3600,
        token_type: "bearer",
        user: {
          id: "mock-user-id",
          email: "h@h.h",
        } as User,
      },
    },
    error: null,
  });

  render(<Login />);

  await waitFor(() => {
    expect(push).toHaveBeenCalledWith("/home");
  });
});

test("shows build info", () => {
  // Render Login page
  const { getByTestId } = render(<Login />);

  // Assert that build info is shown
  const buildInfo = getByTestId("build-info");

  // You can make this stricter if you want:
  expect(buildInfo).toBeInTheDocument();
  expect(buildInfo.textContent).toMatch(/Build:/i);
});
