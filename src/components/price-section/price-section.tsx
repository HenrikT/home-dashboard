"use client";

import { useEffect, useState } from "react";
import styles from "./price-section.module.css";
import React from "react";
import type { PriceData, PriceItem } from "@/types/price";
import { DateAction, handleDateActionForDate, toSimpleDateString } from "@/utils/date-utils";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function PriceSection() {
  const [data, setData] = useState<PriceData>();
  const [date, setDate] = useState<string>(toSimpleDateString(new Date()));
  const [zone, setZone] = useState<string | null>(null);

  useEffect(() => {
    const loadZone = () => {
      const savedZone = localStorage.getItem("powerZone");
      setZone(savedZone || "NO1");
    };

    loadZone();

    window.addEventListener("powerZoneChanged", loadZone);
    return () => window.removeEventListener("powerZoneChanged", loadZone);
  }, []);

  useEffect(() => {
    if (!zone) return;

    async function fetchData() {
      try {
        const res = await fetch(`/api/price/${date}/${zone}`);
        if (!res.ok) {
          console.warn(`No data available for ${date} in ${zone}`);
          setData(undefined);
          return;
        }

        const json: PriceData = await res.json();
        setData(json);
      } catch (err) {
        console.error("Fetch failed:", err);
        setData(undefined);
      }
    }

    fetchData();
  }, [date, zone]);

  function onPriceButtonClicked(action: DateAction) {
    const newDate = handleDateActionForDate(action, date);
    setDate(newDate);
  }

  const isMissing = !data || data.priceItems.length === 0;

  const formattedDate = new Date(date)
    .toLocaleDateString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
    .replace(/^./, (m) => m.toUpperCase());

  return (
    <section className={styles.wrapper}>
      <div className={styles.dateTitleCard}>{formattedDate}</div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statBox} ${styles.now}`}>
          <div className={styles.label}>Now</div>
          <div className={styles.value}>
            {isMissing ? "X" : getCurrentPriceForNow(data.priceItems)}
            <span className={styles.unit}>øre</span>
          </div>
        </div>

        <div className={`${styles.statBox} ${styles.min}`}>
          <div className={styles.label}>Min</div>
          <div className={styles.value}>
            {isMissing ? "X" : data.min}
            <span className={styles.unit}>øre</span>
          </div>
        </div>

        <div className={`${styles.statBox} ${styles.avg}`}>
          <div className={styles.label}>Avg</div>
          <div className={styles.value}>
            {isMissing ? "X" : data.avg}
            <span className={styles.unit}>øre</span>
          </div>
        </div>

        <div className={`${styles.statBox} ${styles.max}`}>
          <div className={styles.label}>Max</div>
          <div className={styles.value}>
            {isMissing ? "X" : data.max}
            <span className={styles.unit}>øre</span>
          </div>
        </div>
      </div>

      <div className={styles.buttonSection}>
        <button
          className={styles.iconButton}
          onClick={() => onPriceButtonClicked(DateAction.Back)}
          aria-label="Previous day"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className={styles.todayButton}
          onClick={() => onPriceButtonClicked(DateAction.Reset)}
        >
          <Calendar size={18} style={{ marginRight: "0.5rem" }} />
          Today
        </button>
        <button
          className={styles.iconButton}
          onClick={() => onPriceButtonClicked(DateAction.Forward)}
          aria-label="Next day"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </section>
  );
}

function getCurrentPriceForNow(priceItems: PriceItem[]): number | string {
  const now = new Date();
  const osloHour = now.toLocaleTimeString("nb-NO", {
    timeZone: "Europe/Oslo",
    hour: "2-digit",
    hour12: false,
  });

  const date = toSimpleDateString(now);
  const prefix = `${date}T${osloHour}:00:00`;

  return priceItems.find((item) => item.time_start.startsWith(prefix))?.øre_per_kWh ?? "X";
}
