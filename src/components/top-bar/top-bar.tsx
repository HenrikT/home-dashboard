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

  const getMobileFormat = () => {
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const weekday = now
      .toLocaleString("nb-NO", { weekday: "long" })
      .replace(/^./, (m) => m.toUpperCase());
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${weekday} ${day}.${month} kl. ${hours}:${minutes}:${seconds}`;
  };

  const getDesktopFormat = () => {
    return now
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
  };

  return (
    <div className={styles.headerSection}>
      <div className={styles.regionInfo}>
        <span>{POWER_ZONE_LABELS[selectedZone]}</span>
      </div>
      <div className={styles.timeInfo}>
        <span data-testid="clock" className={styles.desktopTime}>
          {getDesktopFormat()}
        </span>
        <span className={styles.mobileTime}>{getMobileFormat()}</span>
      </div>
      <div className={styles.userInfo}>
        <span>{session.user.email}</span>
        <LuUser size={18} />
      </div>
    </div>
  );
}
