import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PriceSection from "./price-section";
import React from "react";

// Required for DOM APIs (like fetch)
import "@testing-library/jest-dom";

// Mock global fetch
global.fetch = vi.fn();

const mockData = {
  date: "2025-06-11",
  zone: "NO1",
  min: 55,
  avg: 75,
  max: 90,
  now: 62,
  priceItems: [],
};

describe("<PriceSection />", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading text initially", () => {
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(<PriceSection />);
    expect(screen.getByText(/Loading prices/i)).toBeInTheDocument();
  });

  it("renders fetched power price data", async () => {
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    render(<PriceSection />);

    await waitFor(() => {
      expect(screen.getByText("Now")).toBeInTheDocument();
    });

    expect(screen.getByText("62")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("55")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
    expect(screen.getAllByText(/øre/).length).toBeGreaterThan(0);
  });

  it("handles fetch error gracefully", async () => {
    (fetch as unknown as vi.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<PriceSection />);
    await waitFor(() => {
      expect(screen.queryByText("Now")).not.toBeInTheDocument();
    });
  });
});
