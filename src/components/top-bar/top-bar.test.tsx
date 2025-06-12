import { render, screen } from "@testing-library/react";
import { TopBar } from "./top-bar";
import { PowerZone, POWER_ZONE_LABELS } from "@/constants/power-zone";
import { vi } from "vitest";
import React from "react";

describe("TopBar", () => {
  const mockSession = {
    user: {
      email: "henrik@example.com",
    },
  } as any;

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
    const expected = "Torsdag 12. juni 21:00:45"; // 19:00 UTC +02:00 Europe/Oslo
    expect(screen.getByTestId("clock").textContent).toMatch("Torsdag 12. juni kl. 19:00:45");
  });
});
