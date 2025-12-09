import { render, screen } from "@testing-library/react";
import { TopBar } from "./top-bar";
import { PowerZone, POWER_ZONE_LABELS } from "@/constants/power-zone";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import React from "react";
import { Session, User } from "@supabase/supabase-js";

describe("TopBar", () => {
  const mockSession: Session = {
    access_token: "",
    token_type: "bearer",
    user: {
      id: "mock-user-id",
      email: "henrik@example.com",
      aud: "authenticated",
      created_at: "",
      app_metadata: {},
      user_metadata: {},
      identities: [],
      last_sign_in_at: "",
      role: "",
      updated_at: "",
    } as User,
    expires_in: 3600,
    refresh_token: "",
    expires_at: Math.floor(Date.now() / 1000) + 3600,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-12T19:00:45"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders selected power zone", () => {
    render(<TopBar selectedZone={PowerZone.NO3} session={mockSession} />);
    expect(screen.getByText(POWER_ZONE_LABELS.NO3)).toBeInTheDocument();
  });

  it("renders user email", () => {
    render(<TopBar selectedZone={PowerZone.NO3} session={mockSession} />);
    expect(screen.getByText("henrik@example.com")).toBeInTheDocument();
  });

  it("renders the correct time in Norwegian locale", () => {
    render(<TopBar selectedZone={PowerZone.NO3} session={mockSession} />);
    expect(screen.getByTestId("clock").textContent).toMatch("Torsdag 12. juni kl. 19:00:45");
  });
});
