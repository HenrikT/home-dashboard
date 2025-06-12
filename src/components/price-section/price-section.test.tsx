import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PriceSection from "./price-section";
import React from "react";
import "@testing-library/jest-dom";

global.fetch = vi.fn();

const mockData = {
  date: "2025-06-11",
  zone: "NO1",
  min: 55,
  avg: 75,
  max: 90,
  now: 62,
  priceItems: [
    {
      time_start: "2025-06-11T13:00:00",
      time_end: "2025-06-11T14:00:00",
      øre_per_kWh: 62,
    },
  ],
};

describe("<PriceSection />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading and then stat labels", async () => {
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(<PriceSection />);

    await waitFor(() => {
      expect(screen.getByText("Now")).toBeInTheDocument();
      expect(screen.getByText("Min")).toBeInTheDocument();
      expect(screen.getByText("Avg")).toBeInTheDocument();
      expect(screen.getByText("Max")).toBeInTheDocument();
    });
  });

  it("renders placeholder values when no data is available", async () => {
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockData, priceItems: [] }),
    });

    render(<PriceSection />);

    await waitFor(() => {
      const xPlaceholders = screen.getAllByText("X");
      expect(xPlaceholders).toHaveLength(4);
    });
  });

  it("handles fetch error gracefully", async () => {
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({ ok: false });

    render(<PriceSection />);

    await waitFor(() => {
      const xPlaceholders = screen.getAllByText("X");
      expect(xPlaceholders).toHaveLength(4);
    });
  });
});
