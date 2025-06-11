"use client";

import { useEffect, useState } from "react";
import styles from "./price-section.module.css";
import React from "react";
import type { PriceData } from "@/types/price";

export default function PriceSection() {
  const [data, setData] = useState<PriceData>();
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  };
  const date = getTodayDate();
  const zone = "NO1";

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/price/${date}/${zone}`);
      if (!res.ok) {
        console.error("Failed to fetch");
        return;
      }
      const json: PriceData = await res.json();
      setData(json);
    }
    fetchData();
  }, [date, zone]);

  if (!data) {
    return <p className={styles.loading}>Loading&nbsp;prices …</p>;
  }

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>
        Power prices for <span className={styles.accent}>{data.zone}</span> on{" "}
        <span className={styles.accent}>{data.date}</span>
      </h2>

      <div className={styles.statsGrid}>
        <div className={`${styles.statBox} ${styles.now}`}>
          <div className={styles.label}>Now</div>
          <div className={styles.value}>
            {data.now}
            <span className={styles.unit}>øre</span>
          </div>
        </div>

        <div className={`${styles.statBox} ${styles.avg}`}>
          <div className={styles.label}>Avg</div>
          <div className={styles.value}>
            {data.avg}
            <span className={styles.unit}>øre</span>
          </div>
        </div>

        <div className={`${styles.statBox} ${styles.min}`}>
          <div className={styles.label}>Min</div>
          <div className={styles.value}>
            {data.min}
            <span className={styles.unit}>øre</span>
          </div>
        </div>

        <div className={`${styles.statBox} ${styles.max}`}>
          <div className={styles.label}>Max</div>
          <div className={styles.value}>
            {data.max}
            <span className={styles.unit}>øre</span>
          </div>
        </div>
      </div>
    </section>
  );
}
