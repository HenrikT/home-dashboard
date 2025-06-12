"use client";

import { useEffect, useState } from "react";
import { POWER_ZONE_LABELS, PowerZone } from "@/constants/power-zone";
import styles from "./top-bar.module.css";
import { LuUser } from "react-icons/lu";
import { Session } from "@supabase/supabase-js";
import React from "react";

type Props = {
  selectedZone: PowerZone;
  session: Session;
};

export function TopBar({ selectedZone, session }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = now
    .toLocaleString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/^./, (m) => m.toUpperCase());

  return (
    <div className={styles.headerSection}>
      <div className={styles.regionInfo}>
        <span>{POWER_ZONE_LABELS[selectedZone]}</span>
      </div>
      <div className={styles.timeInfo}>
        <span data-testid="clock">{formattedTime}</span>
      </div>
      <div className={styles.userInfo}>
        <span>{session.user.email}</span>
        <LuUser size={18} />
      </div>
    </div>
  );
}
