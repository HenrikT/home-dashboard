"use client";

import React, { useEffect, useState } from "react";
import styles from "./forecast-section.module.css";
import { PowerZone } from "@/constants/power-zone";
import type { ForecastApiResponse, ForecastItem, Segment } from "@/types/forecast";

export default function ForecastSection() {
  const [forecast, setForecast] = useState<{
    data: ForecastItem[];
    min: number;
    max: number;
  } | null>(null);
  const [zone, setZone] = useState<PowerZone>(PowerZone.NO1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("powerZone") as PowerZone;
    if (stored) setZone(stored);

    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    async function fetchForecast() {
      const res = await fetch(`/api/forecast/${zone}/advice`);
      if (!res.ok) {
        console.error("Failed to fetch forecast data");
        return;
      }

      const raw: ForecastApiResponse = await res.json();

      const formatter = new Intl.DateTimeFormat("nb-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "Europe/Oslo",
      });

      const compactFormatter = new Intl.DateTimeFormat("nb-NO", {
        weekday: "long",
        day: "numeric",
        month: "2-digit",
        timeZone: "Europe/Oslo",
      });

      const grouped: Record<string, Segment[]> = {};

      raw.forecastAdvice.forEach((entry: ForecastApiResponse["forecastAdvice"][number]) => {
        const entryDate = new Date(entry.from);
        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);

        const isToday = entryDate.toDateString() === now.toDateString();
        const isTomorrow = entryDate.toDateString() === tomorrow.toDateString();

        const day = isToday
          ? "I dag"
          : isTomorrow
          ? "I morgen"
          : (isMobile ? compactFormatter : formatter)
              .format(entryDate)
              .replace(/^./, (m) => m.toUpperCase());
        if (!grouped[day]) grouped[day] = [];

        grouped[day].push({
          averagePrice: entry.averagePrice,
          isGoodTime: entry.type === "Good",
          isBadTime: entry.type === "Avoid",
        });
      });

      const formatted: ForecastItem[] = Object.entries(grouped).map(([dayOfWeek, segments]) => ({
        dayOfWeek,
        segments,
      }));

      const allPrices = raw.forecastAdvice.map(
        (entry: ForecastApiResponse["forecastAdvice"][number]) => entry.averagePrice
      );
      const minPrice = Math.min(...allPrices);
      const maxPrice = Math.max(...allPrices);
      setForecast({ data: formatted, min: minPrice, max: maxPrice });
    }

    fetchForecast();
  }, [zone, isMobile]);

  if (!forecast) return <p className={styles.loading}>Laster estimerte priser…</p>;

  const headers = ["00 - 06", "06 - 12", "12 - 18", "18 - 00"];

  return (
    <div className={styles.container}>
      <div className={styles.dateTitleCard}>Prisprognose</div>
      <div className={styles.table}>
        <div className={styles.row}>
          <div className={styles.cell}></div>
          {headers.map((h) => (
            <div key={h} className={styles.cell + " " + styles.headerCell}>
              {h}
            </div>
          ))}
        </div>
        {forecast.data.map((item) => (
          <div className={styles.row} key={item.dayOfWeek}>
            <div className={styles.cell + " " + styles.dayLabel}>{item.dayOfWeek}</div>
            {item.segments.map((seg, i) => {
              const saturation =
                ((seg.averagePrice - forecast.min) / (forecast.max - forecast.min)) * 100;
              const fontWeight =
                saturation < 10 || saturation > 90
                  ? "900"
                  : saturation < 25 || saturation > 75
                  ? "700"
                  : "400";
              let backgroundColor = "transparent";
              let border = "1px solid #666";
              if (saturation < 40 || saturation > 60) {
                const hue = 120 - saturation * 1.2;
                const saturationFactor = 1 - Math.abs(saturation - 50) / 50;

                let adjustedSaturation = 30 + saturationFactor * 50;
                let lightness = 40;

                if (saturation < 10 || saturation > 90) {
                  adjustedSaturation = 90;
                  lightness = 32;
                }

                backgroundColor = `hsl(${hue}, ${adjustedSaturation}%, ${lightness}%)`;
                border = "none";
              }
              return (
                <div
                  key={i}
                  className={styles.cell}
                  style={{ backgroundColor, color: "white", border, fontWeight }}
                >
                  {seg.averagePrice}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
