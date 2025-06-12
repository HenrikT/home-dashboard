import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import SettingsOverlay from "./settings-overlay";
import { PowerZone } from "@/constants/power-zone";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("SettingsOverlay", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
  });

  it("renders the modal with default zone", () => {
    render(<SettingsOverlay onClose={mockOnClose} />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByLabelText("Power Zone")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Østlandet (NO1)")).toBeInTheDocument();
  });

  it("loads saved zone from localStorage", () => {
    localStorage.setItem("powerZone", PowerZone.NO3);
    render(<SettingsOverlay onClose={mockOnClose} />);
    expect(screen.getByDisplayValue("Midt-Norge (NO3)")).toBeInTheDocument();
  });

  it("updates localStorage and closes on zone change", () => {
    render(<SettingsOverlay onClose={mockOnClose} />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: PowerZone.NO2 } });

    expect(localStorage.getItem("powerZone")).toBe(PowerZone.NO2);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("dispatches 'powerZoneChanged' event on change", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    render(<SettingsOverlay onClose={mockOnClose} />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: PowerZone.NO4 } });

    expect(dispatchSpy).toHaveBeenCalledWith(new Event("powerZoneChanged"));
  });

  it("closes the overlay when background is clicked", () => {
    render(<SettingsOverlay onClose={mockOnClose} />);
    const overlay = screen.getByRole("dialog");
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
